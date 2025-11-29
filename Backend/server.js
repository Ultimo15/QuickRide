require("dotenv").config();
const http = require("http");
const app = require("./app"); // Asumo que tienes la configuración de express en app.js, si no, usa express directo como tenías
// SI NO TIENES app.js y todo está aquí, usa tu estructura anterior pero con este ajuste de CORS:

/* --- INICIO DE TU SERVER.JS AJUSTADO --- */
const express = require("express");
const { createServer } = require("http");
const socket = require("./socket");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

// Importación de rutas
const userRoutes = require("./routes/user.routes");
const captainRoutes = require("./routes/captain.routes");
const mapsRoutes = require("./routes/maps.routes");
const rideRoutes = require("./routes/ride.routes");
const mailRoutes = require("./routes/mail.routes");
require("./config/db");

const app = express();
const server = createServer(app);

// Inicializamos socket con el servidor HTTP
socket.initializeSocket(server);

const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: '*', // Permite todo para pruebas. En producción idealmente pones tu dominio.
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.ENVIRONMENT == "production") {
  app.use(morgan("tiny")); // Simplificado para evitar errores de stream
} else {
  app.use(morgan("dev"));
}

// Rutas
app.get("/", (req, res) => res.json("QuickRide API Running 🚀"));
app.use("/user", userRoutes);
app.use("/captain", captainRoutes);
app.use("/map", mapsRoutes);
app.use("/ride", rideRoutes);
app.use("/mail", mailRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
