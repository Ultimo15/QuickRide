// Archivo: config/db.js mejorado
const mongoose = require("mongoose");

let MONGO_DB = {
  production: { url: process.env.MONGODB_PROD_URL, type: "Atlas" },
  development: { url: process.env.MONGODB_DEV_URL, type: "Compass" },
};

let environment = process.env.ENVIRONMENT;

// Validación extra para asegurar que la URL existe
if (!MONGO_DB[environment] || !MONGO_DB[environment].url) {
  console.error("❌ ERROR CRÍTICO: No hay URL de Mongo definida para el entorno:", environment);
  console.error("Verifica tus Variables de Entorno en Render (MONGODB_PROD_URL)");
} else {
  mongoose
    .connect(MONGO_DB[environment].url)
    .then(() => {
      console.log("✅ Connected to Mongo DB", MONGO_DB[environment].type);
    })
    .catch((err) => {
      // AQUÍ ESTÁ LA CLAVE: Imprimimos el error 'err'
      console.error("❌ Failed to connect to MongoDB. Razón exacta:");
      console.error(err); 
    });
}

module.exports = mongoose.connection;
