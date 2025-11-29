const axios = require("axios");
const captainModel = require("../models/captain.model");

// ============================================
// ZONA DE OPERACIÓN: FRONTERA COLOMBO-VENEZOLANA
// ============================================
const OPERATION_ZONE = {
  // Coordenadas aproximadas de la zona fronteriza
  // Ajusta estos valores según tu área exacta
  minLat: 7.6,    // Sur (cerca de Cúcuta sur)
  maxLat: 8.0,    // Norte (hasta San Antonio/San Cristóbal)
  minLng: -72.7,  // Oeste
  maxLng: -72.2,  // Este
};

// Ciudades permitidas para el filtro de sugerencias
const ALLOWED_CITIES = [
  "cúcuta",
  "villa del rosario",
  "los patios",
  "la parada",
  "san antonio",
  "san antonio del táchira",
  "ureña",
  "san cristóbal",
  "rubio",
  "peracal",
  "tienditas",
  "palotal",
  "táchira",
  "llano de jorge",
  "brisas de llano jorge",
  "la sabana",
];

// ✅ Función para verificar si una coordenada está en la zona
const isInOperationZone = (lat, lng) => {
  return (
    lat >= OPERATION_ZONE.minLat &&
    lat <= OPERATION_ZONE.maxLat &&
    lng >= OPERATION_ZONE.minLng &&
    lng <= OPERATION_ZONE.maxLng
  );
};

// Fórmula matemática para calcular distancia
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// ✅ OBTENER COORDENADAS CON VALIDACIÓN DE ZONA
module.exports.getAddressCoordinate = async (address) => {
  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;

      // ✅ VALIDAR QUE ESTÉ EN LA ZONA DE OPERACIÓN
      if (!isInOperationZone(location.lat, location.lng)) {
        console.error(
          `❌ Ubicación fuera de zona: ${location.lat}, ${location.lng}`
        );
        throw new Error(
          "Esta ubicación está fuera de nuestra zona de operación. Solo operamos en la frontera colombo-venezolana (Cúcuta, Villa del Rosario, Los Patios, San Antonio, Ureña, San Cristóbal, etc.)"
        );
      }

      console.log(`✅ Ubicación válida: ${location.lat}, ${location.lng}`);
      return { ltd: location.lat, lng: location.lng };
    } else {
      throw new Error("Unable to fetch coordinates");
    }
  } catch (error) {
    console.error("Error en getAddressCoordinate:", error.message);
    throw error;
  }
};

// ✅ CALCULAR DISTANCIA Y TIEMPO
module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      if (response.data.rows[0].elements[0].status === "ZERO_RESULTS") {
        throw new Error("No se encontraron rutas entre estas ubicaciones");
      }
      return response.data.rows[0].elements[0];
    } else {
      throw new Error("Unable to fetch distance and time");
    }
  } catch (err) {
    console.error("Error en getDistanceTime:", err.message);
    throw err;
  }
};

// ✅ SUGERENCIAS DE AUTOCOMPLETADO CON FILTRO GEOGRÁFICO
module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input) {
    throw new Error("query is required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  
  // ✅ Centrado en Cúcuta con radio de 50km y limitado a Colombia/Venezuela
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${apiKey}&components=country:co|country:ve&location=7.889391,-72.508450&radius=50000&language=es`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      // ✅ FILTRAR SOLO CIUDADES PERMITIDAS
      const filteredSuggestions = response.data.predictions.filter(
        (prediction) => {
          const description = prediction.description.toLowerCase();

          // Verificar si contiene alguna ciudad permitida
          return ALLOWED_CITIES.some((city) => description.includes(city));
        }
      );

      console.log(
        `🔍 Sugerencias encontradas: ${response.data.predictions.length} | Filtradas: ${filteredSuggestions.length}`
      );

      if (filteredSuggestions.length === 0) {
        // Retornar array vacío en lugar de error para mejor UX
        return [];
      }

      return filteredSuggestions
        .map((prediction) => prediction.description)
        .filter((value) => value);
    } else {
      console.warn("⚠️ Google Maps API status:", response.data.status);
      return [];
    }
  } catch (err) {
    console.error("Error en getAutoCompleteSuggestions:", err.message);
    // Retornar array vacío en lugar de lanzar error
    return [];
  }
};

// ✅ OBTENER CONDUCTORES EN RADIO
module.exports.getCaptainsInTheRadius = async (
  ltd,
  lng,
  radius,
  vehicleType
) => {
  try {
    console.log(
      `📍 Buscando conductores: ${ltd}, ${lng} | Radio: ${radius}km | Tipo: ${vehicleType}`
    );

    // Normalizar tipo de vehículo (moto/motorcycle -> bike)
    const normalizedType =
      vehicleType === "moto" || vehicleType === "motorcycle"
        ? "bike"
        : vehicleType;

    // Buscar conductores activos con el tipo de vehículo correcto
    const captains = await captainModel
      .find({
        status: "active",
        "vehicle.type": { $in: [normalizedType, vehicleType] }, // Buscar por ambos
      })
      .lean();

    console.log(`👥 Conductores activos encontrados: ${captains.length}`);

    if (captains.length === 0) {
      console.warn(
        `⚠️ No hay conductores activos de tipo "${vehicleType}" en la base de datos`
      );
      return [];
    }

    // Filtrar por distancia
    const captainsInRadius = captains.filter((captain) => {
      // Validar que tenga coordenadas
      if (!captain.location || !captain.location.ltd || !captain.location.lng) {
        console.log(
          `⚠️ ${captain.fullname?.firstname || "Conductor"} sin coordenadas`
        );
        return false;
      }

      const latDriver = parseFloat(captain.location.ltd);
      const lngDriver = parseFloat(captain.location.lng);

      if (isNaN(latDriver) || isNaN(lngDriver)) {
        console.log(
          `❌ ${captain.fullname?.firstname || "Conductor"}: Coordenadas inválidas`
        );
        return false;
      }

      const distance = getDistanceFromLatLonInKm(
        ltd,
        lng,
        latDriver,
        lngDriver
      );

      if (distance <= radius) {
        console.log(
          `✅ ${captain.fullname?.firstname} ${captain.fullname?.lastname}: ${distance.toFixed(2)} km`
        );
        return true;
      } else {
        console.log(
          `❌ ${captain.fullname?.firstname}: ${distance.toFixed(2)} km (fuera de radio)`
        );
        return false;
      }
    });

    console.log(
      `🎯 Conductores en radio de ${radius}km: ${captainsInRadius.length}`
    );
    return captainsInRadius;
  } catch (error) {
    console.error("Error en getCaptainsInTheRadius:", error.message);
    throw new Error("Error finding captains in radius: " + error.message);
  }
};