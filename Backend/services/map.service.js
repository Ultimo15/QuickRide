const axios = require("axios");
const captainModel = require("../models/captain.model");

// --- FUNCIÓN MATEMÁTICA PARA CALCULAR DISTANCIA (Fórmula de Haversine) ---
// Esto calcula la distancia real en KM entre dos coordenadas sin depender de MongoDB
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la tierra en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distancia en km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
// ------------------------------------------------------------------------

module.exports.getAddressCoordinate = async (address) => {
  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;
      return {
        ltd: location.lat,
        lng: location.lng,
      };
    } else {
      throw new Error("Unable to fetch coordinates");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

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
        throw new Error("No routes found");
      }

      return response.data.rows[0].elements[0];
    } else {
      throw new Error("Unable to fetch distance and time");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input) {
    throw new Error("query is required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      return response.data.predictions
        .map((prediction) => prediction.description)
        .filter((value) => value);
    } else {
      throw new Error("Unable to fetch suggestions");
    }
  } catch (err) {
    console.log(err.message);
    throw err;
  }
};

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius, vehicleType) => {
  try {
    console.log(`Buscando conductores. Origen: ${ltd}, ${lng}. Radio: ${radius}km. Tipo: ${vehicleType}`);

    // 1. PASO CLAVE: Buscamos TODOS los conductores activos con ese vehículo
    // (Quitamos el filtro de ubicación de la query de MongoDB para evitar errores de formato)
    const captains = await captainModel.find({
      status: "active",
      "vehicle.type": vehicleType,
    });

    console.log(`Conductores encontrados en DB (sin filtrar distancia): ${captains.length}`);

    // 2. Filtramos manualmente usando JavaScript y la fórmula matemática
    const captainsInRadius = captains.filter((captain) => {
      // Verificamos que el conductor tenga coordenadas válidas
      if (!captain.location || !captain.location.ltd || !captain.location.lng) {
        console.log(`Conductor ${captain.fullname.firstname} ignorado: Sin ubicación válida`);
        return false;
      }

      // Calculamos distancia
      const distance = getDistanceFromLatLonInKm(
        ltd,
        lng,
        captain.location.ltd,
        captain.location.lng
      );

      console.log(`Conductor: ${captain.fullname.firstname} | Distancia: ${distance.toFixed(2)} km`);

      // Retornamos true si la distancia es menor o igual al radio
      return distance <= radius;
    });

    return captainsInRadius;

  } catch (error) {
    console.error("Error buscando conductores:", error);
    throw new Error("Error in getting captain in radius: " + error.message);
  }
};

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius, vehicleType) => {
  try {
    console.log(`Buscando conductores. Origen: ${ltd}, ${lng}. Radio: ${radius}km. Tipo: ${vehicleType}`);

    const captains = await captainModel.find({
      status: "active",
      "vehicle.type": vehicleType,
    });

    console.log(`Conductores encontrados en DB: ${captains.length}`);

    const captainsInRadius = captains.filter((captain) => {
      // VALIDACIÓN ROBUSTA:
      // Convertimos a número usando parseFloat por si en la DB están como String
      const latDriver = parseFloat(captain.location?.ltd);
      const lngDriver = parseFloat(captain.location?.lng);

      // Si no son números válidos (NaN), ignoramos al conductor
      if (isNaN(latDriver) || isNaN(lngDriver)) {
        console.log(`Conductor ${captain.fullname.firstname} ignorado: Coordenadas inválidas`);
        return false;
      }

      // Calculamos distancia usando los números limpios
      const distance = getDistanceFromLatLonInKm(ltd, lng, latDriver, lngDriver);

      console.log(`Conductor: ${captain.fullname.firstname} | Distancia: ${distance.toFixed(2)} km`);

      return distance <= radius;
    });

    return captainsInRadius;

  } catch (error) {
    console.error("Error buscando conductores:", error);
    throw new Error("Error in getting captain in radius: " + error.message);
  }
};

