require("dotenv").config();
const socket = require("./socket");
const express = require("express");
const { createServer } = require("http");
const app = express();
const server = createServer(app);

// Inicializamos el socket
socket.initializeSocket(server);

const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const userRoutes = require("./routes/user.routes");
const captainRoutes = require("./routes/captain.routes");
const mapsRoutes = require("./routes/maps.routes");
const rideRoutes = require("./routes/ride.routes");
const mailRoutes = require("./routes/mail.routes");
const keepServerRunning = require("./services/active.service");
const dbStream = require("./services/logging.service");
require("./config/db");
const PORT = process.env.PORT || 4000;

if (process.env.ENVIRONMENT == "production") {
  app.use(
    morgan(":method :url :status :response-time ms - :res[content-length]", {
      stream: dbStream,
    })
  );
} else {
  app.use(morgan("dev"));
}

// Configuración CORS mejorada con seguridad
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: process.env.ENVIRONMENT === 'production' ? allowedOrigins : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de compatibilidad para rutas con prefijo /api/
// El frontend usa /api/users, /api/captains, /api/rides
// Redirigimos a las rutas correctas sin el prefijo /api/
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    // Normalizar: /api/users → /user, /api/captains → /captain, /api/rides → /ride
    const normalizedPath = req.path
      .replace('/api/users', '/user')
      .replace('/api/captains', '/captain')
      .replace('/api/rides', '/ride')
      .replace('/api/maps', '/map')
      .replace('/api/mail', '/mail');

    req.url = normalizedPath + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');
  }
  next();
});

if (process.env.ENVIRONMENT == "production") {
  // --- SOLUCIÓN APLICADA AQUÍ ---
  // keepServerRunning(); // COMENTADO: Esto causaba el bucle de "Error reloading server"
  console.log("Sistema de auto-recarga desactivado para estabilidad en Render.");
}

app.get("/", (req, res) => {
  res.json("Hello, World!");
});

app.get("/reload", (req, res) => {
  res.json("Server Reloaded");
});

app.use("/user", userRoutes);
app.use("/captain", captainRoutes);
app.use("/map", mapsRoutes);
app.use("/ride", rideRoutes);
app.use("/mail", mailRoutes);

server.listen(PORT, () => {
  console.log("Server is listening on port", PORT);
});
