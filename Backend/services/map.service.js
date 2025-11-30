const axios = require("axios");
const captainModel = require("../models/captain.model");

// ============================================
// ZONA DE OPERACIÓN: SAN ANTONIO DEL TÁCHIRA Y ALREDEDORES
// ============================================
const OPERATION_ZONE = {
  // ✅ Zona centrada en San Antonio del Táchira, Venezuela
  minLat: 7.7,    // Sur
  maxLat: 7.9,    // Norte
  minLng: -72.5,  // Oeste
  maxLng: -72.4,  // Este
};

// ✅ Coordenadas por defecto (San Antonio del Táchira)
const DEFAULT_LOCATION = {
  lat: 7.8144,
  lng: -72.4431,
};

// Ciudades permitidas para el filtro de sugerencias
const ALLOWED_CITIES = [
  "san antonio",
  "san antonio del táchira",
  "ureña",
  "capacho",
  "la fría",
  "rubio",
  "san cristóbal",
  "táchira",
  "venezuela",
  "cúcuta", // Cerca de la frontera
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

// Fórmula matemática para calcular distancia (Haversine)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
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
  
  // ✅ Bias hacia San Antonio del Táchira
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&components=country:VE&region=ve&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;

      // ✅ VALIDAR QUE ESTÉ EN LA ZONA DE OPERACIÓN
      if (!isInOperationZone(location.lat, location.lng)) {
        console.warn(
          `⚠️ Ubicación fuera de zona: ${location.lat}, ${location.lng}`
        );
        // Permitir pero mostrar advertencia
        console.log("📍 Permitiendo ubicación fuera de zona de operación principal");
      } else {
        console.log(`✅ Ubicación válida en zona: ${location.lat}, ${location.lng}`);
      }

      return { ltd: location.lat, lng: location.lng };
    } else {
      throw new Error("No se pudieron obtener las coordenadas de esta dirección");
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
  )}&destinations=${encodeURIComponent(destination)}&mode=driving&language=es&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      if (response.data.rows[0].elements[0].status === "ZERO_RESULTS") {
        throw new Error("No se encontraron rutas entre estas ubicaciones");
      }

      const element = response.data.rows[0].elements[0];
      
      console.log(`📏 Distancia: ${element.distance.text} | Tiempo: ${element.duration.text}`);
      
      return element;
    } else {
      throw new Error("Unable to fetch distance and time");
    }
  } catch (err) {
    console.error("Error en getDistanceTime:", err.message);
    throw err;
  }
};

// ✅ NUEVO: CALCULAR TIEMPO ESTIMADO DE LLEGADA DEL CONDUCTOR
module.exports.getEstimatedArrival = async (captainLocation, pickupLocation) => {
  if (!captainLocation || !pickupLocation) {
    throw new Error("Captain location and pickup location are required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  
  // Convertir coordenadas a string
  const origin = `${captainLocation.lat},${captainLocation.lng}`;
  const destination = `${pickupLocation.lat},${pickupLocation.lng}`;
  
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&mode=driving&language=es&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const element = response.data.rows[0].elements[0];
      
      if (element.status === "ZERO_RESULTS") {
        // Si no hay ruta, calcular distancia en línea recta
        const distance = getDistanceFromLatLonInKm(
          captainLocation.lat,
          captainLocation.lng,
          pickupLocation.lat,
          pickupLocation.lng
        );
        
        // Estimar tiempo: 30 km/h promedio en ciudad
        const estimatedMinutes = Math.ceil((distance / 30) * 60);
        
        return {
          distance: { value: distance * 1000, text: `${distance.toFixed(1)} km` },
          duration: { value: estimatedMinutes * 60, text: `${estimatedMinutes} min` },
          estimated: true
        };
      }
      
      return {
        distance: element.distance,
        duration: element.duration,
        estimated: false
      };
    } else {
      throw new Error("No se pudo calcular el tiempo de llegada");
    }
  } catch (err) {
    console.error("Error en getEstimatedArrival:", err.message);
    
    // Fallback: cálculo manual
    const distance = getDistanceFromLatLonInKm(
      captainLocation.lat,
      captainLocation.lng,
      pickupLocation.lat,
      pickupLocation.lng
    );
    
    const estimatedMinutes = Math.ceil((distance / 30) * 60);
    
    return {
      distance: { value: distance * 1000, text: `${distance.toFixed(1)} km` },
      duration: { value: estimatedMinutes * 60, text: `${estimatedMinutes} min` },
      estimated: true
    };
  }
};

// ✅ SUGERENCIAS DE AUTOCOMPLETADO CON FILTRO GEOGRÁFICO
module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input) {
    throw new Error("query is required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  
  // ✅ Centrado en San Antonio del Táchira con radio de 30km
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${apiKey}&components=country:ve&location=${DEFAULT_LOCATION.lat},${DEFAULT_LOCATION.lng}&radius=30000&language=es`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      // ✅ FILTRAR SOLO CIUDADES PERMITIDAS (más permisivo)
      const filteredSuggestions = response.data.predictions.filter(
        (prediction) => {
          const description = prediction.description.toLowerCase();

          // Verificar si contiene alguna ciudad permitida o si menciona Táchira/Venezuela
          return ALLOWED_CITIES.some((city) => description.includes(city)) ||
                 description.includes("táchira") ||
                 description.includes("venezuela");
        }
      );

      console.log(
        `🔍 Sugerencias encontradas: ${response.data.predictions.length} | Filtradas: ${filteredSuggestions.length}`
      );

      if (filteredSuggestions.length === 0) {
        // Si no hay resultados filtrados, devolver todos (más permisivo)
        return response.data.predictions
          .map((prediction) => prediction.description)
          .filter((value) => value);
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

// ✅ OBTENER CONDUCTORES EN RADIO (ACTUALIZADO)
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

    // Normalizar tipo de vehículo
    const normalizedType = vehicleType === "bike" || vehicleType === "moto" || vehicleType === "motorcycle"
      ? "bike"
      : "car";

    // ✅ Buscar conductores ONLINE (no "active", sino "online")
    const captains = await captainModel
      .find({
        status: "online", // ✅ Cambio importante: buscar por "online"
        "vehicle.type": normalizedType,
      })
      .lean();

    console.log(`👥 Conductores online encontrados: ${captains.length}`);

    if (captains.length === 0) {
      console.warn(
        `⚠️ No hay conductores online de tipo "${vehicleType}"`
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

// ✅ EXPORTAR CONSTANTES
module.exports.DEFAULT_LOCATION = DEFAULT_LOCATION;
module.exports.OPERATION_ZONE = OPERATION_ZONE;