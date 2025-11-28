const axios = require("axios");
const captainModel = require("../models/captain.model");

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

module.exports.getAddressCoordinate = async (address) => {
  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;
      return { ltd: location.lat, lng: location.lng };
    } else {
      throw new Error("Unable to fetch coordinates");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) throw new Error("Origin and destination are required");
  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      if (response.data.rows[0].elements[0].status === "ZERO_RESULTS") throw new Error("No routes found");
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
    // (Tu código de autocomplete igual que antes...)
    if (!input) throw new Error("query is required");
    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;
    try {
        const response = await axios.get(url);
        if (response.data.status === "OK") {
            return response.data.predictions.map((prediction) => prediction.description).filter((value) => value);
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
    console.log(`📍 Buscando: ${ltd}, ${lng} | Radio: ${radius}km | Tipo: ${vehicleType}`);

    // --- CAMBIO IMPORTANTE: Agregamos .lean() al final ---
    // Esto hace que traiga los datos crudos aunque el Schema esté incompleto
    const captains = await captainModel.find({
      status: "active",
      "vehicle.type": vehicleType,
    }).lean(); 

    console.log(`👥 Conductores en DB (crudo): ${captains.length}`);

    const captainsInRadius = captains.filter((captain) => {
      // LOG DE DEPURACIÓN PARA VER QUÉ LLEGA EXACTAMENTE
      console.log(`🔍 Revisando a ${captain.fullname?.firstname}:`, JSON.stringify(captain.location));

      // Intentamos convertir a número (incluso si viene como texto "7.8")
      const latDriver = parseFloat(captain.location?.ltd);
      const lngDriver = parseFloat(captain.location?.lng);

      if (isNaN(latDriver) || isNaN(lngDriver)) {
        console.log(`❌ Ignorado: Coordenadas inválidas (NaN)`);
        return false;
      }

      const distance = getDistanceFromLatLonInKm(ltd, lng, latDriver, lngDriver);
      console.log(`✅ Distancia: ${distance.toFixed(2)} km`);

      return distance <= radius;
    });

    return captainsInRadius;

  } catch (error) {
    console.error("Error filtered captains:", error);
    throw new Error("Error in getting captain in radius: " + error.message);
  }
};
