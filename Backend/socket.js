const moment = require("moment-timezone");
const { Server } = require("socket.io");
const userModel = require("./models/user.model");
const rideModel = require("./models/ride.model");
const captainModel = require("./models/captain.model");
const frontendLogModel = require("./models/frontend-log.model");

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*", // Permite conexiones desde cualquier frontend (Localhost, Vercel, Celular)
      methods: ["GET", "POST"],
      credentials: true
    },
    // ESTA LÍNEA ES CRÍTICA PARA RENDER:
    transports: ['websocket', 'polling'] 
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // LOGS EN PRODUCCIÓN
    if (process.env.ENVIRONMENT == "production") {
      socket.on("log", async (log) => {
        // Tu lógica de logs existente
        try { await frontendLogModel.create(log); } catch (e) {}
      });
    }

    // AL UNIRSE (LOGIN/HOME)
    socket.on("join", async (data) => {
      const { userId, userType } = data;
      console.log(`👤 ${userType} joining: ${userId}`);
      
      try {
        if (userType === "user") {
          await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
        } else if (userType === "captain") {
          // Actualizamos socket y forzamos estado ACTIVE
          await captainModel.findByIdAndUpdate(userId, { 
            socketId: socket.id,
            status: 'active' 
          });
          console.log(`✅ Captain ${userId} set to ACTIVE.`);
        }
      } catch (error) {
        console.error("Socket join error:", error.message);
      }
    });

    // ACTUALIZACIÓN DE UBICACIÓN
    socket.on("update-location-captain", async (data) => {
      const { userId, location } = data;
      if (!location || !location.ltd || !location.lng) return;

      try {
        // Guardamos las coordenadas simples
        await captainModel.findByIdAndUpdate(userId, {
          location: {
            ltd: location.ltd,
            lng: location.lng
          }
        });
      } catch (error) {
        console.error("Loc update error:", error.message);
      }
    });

    // UNIRSE A SALA DE VIAJE
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
    });

    // MENSAJES DE CHAT
    socket.on("message", async ({ rideId, msg, userType, time }) => {
      const date = moment().tz("Asia/Kolkata").format("MMM DD"); // Puedes cambiar la zona horaria si quieres
      socket.to(rideId).emit("receiveMessage", { msg, by: userType, time });
      try {
        const ride = await rideModel.findOne({ _id: rideId });
        if(ride){
            ride.messages.push({ msg, by: userType, time, date, timestamp: new Date() });
            await ride.save();
        }
      } catch (error) {
        console.log("Error saving message: ", error);
      }
    });
    
    socket.on("disconnect", () => {
        console.log(`❌ Disconnected: ${socket.id}`);
    });
  });
}

const sendMessageToSocketId = (socketId, messageObject) => {
  if (io) {
    console.log(`📤 Sending event [${messageObject.event}] to: ${socketId}`);
    io.to(socketId).emit(messageObject.event, messageObject.data);
  } else {
    console.log("Socket.io not initialized.");
  }
};

module.exports = { initializeSocket, sendMessageToSocketId };
