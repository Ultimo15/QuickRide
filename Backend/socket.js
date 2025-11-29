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
    // 🔥 CRÍTICO PARA RENDER - Permite WebSocket y fallback a polling
    transports: ['websocket', 'polling']
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // ============================================
    // LOGS EN PRODUCCIÓN
    // ============================================
    if (process.env.ENVIRONMENT == "production") {
      socket.on("log", async (log) => {
        try {
          await frontendLogModel.create(log);
        } catch (e) {
          console.error("Error saving log:", e.message);
        }
      });
    }

    // ============================================
    // AL UNIRSE (LOGIN/HOME)
    // ============================================
    socket.on("join", async (data) => {
      const { userId, userType } = data;
      console.log(`👤 ${userType} joining: ${userId} - Socket: ${socket.id}`);

      try {
        if (userType === "user") {
          await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
          console.log(`✅ User ${userId} socketId updated to ${socket.id}`);
        } else if (userType === "captain") {
          // Actualizamos socket y forzamos estado ACTIVE
          await captainModel.findByIdAndUpdate(userId, {
            socketId: socket.id,
            status: 'active'
          });
          console.log(`✅ Captain ${userId} set to ACTIVE with socket ${socket.id}`);
        }
      } catch (error) {
        console.error("Socket join error:", error.message);
      }
    });

    // ============================================
    // ACTUALIZACIÓN DE UBICACIÓN DEL CONDUCTOR
    // ============================================
    socket.on("update-location-captain", async (data) => {
      const { userId, location } = data;
      
      if (!location || !location.ltd || !location.lng) {
        console.warn(`⚠️ Invalid location data from captain ${userId}`);
        return;
      }

      try {
        await captainModel.findByIdAndUpdate(userId, {
          location: {
            ltd: location.ltd,
            lng: location.lng
          }
        });
        // console.log(`📍 Captain ${userId} location updated`);
      } catch (error) {
        console.error("Location update error:", error.message);
      }
    });

    // ============================================
    // UNIRSE A SALA DE VIAJE (CHAT)
    // ============================================
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`🚪 Socket ${socket.id} joined room: ${roomId}`);
    });

    // ============================================
    // MENSAJES DE CHAT
    // ============================================
    socket.on("message", async ({ rideId, msg, userType, time }) => {
      const date = moment().tz("Asia/Kolkata").format("MMM DD");
      
      // Enviar mensaje a todos en la sala excepto al emisor
      socket.to(rideId).emit("receiveMessage", { msg, by: userType, time });

      try {
        const ride = await rideModel.findOne({ _id: rideId });
        if (ride) {
          ride.messages.push({ 
            msg, 
            by: userType, 
            time, 
            date, 
            timestamp: new Date() 
          });
          await ride.save();
        }
      } catch (error) {
        console.error("Error saving message:", error.message);
      }
    });

    // ============================================
    // DESCONEXIÓN
    // ============================================
    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

// ============================================
// FUNCIÓN HELPER PARA ENVIAR MENSAJES
// ============================================
const sendMessageToSocketId = (socketId, messageObject) => {
  if (!io) {
    console.error("❌ Socket.io not initialized.");
    return;
  }

  if (!socketId) {
    console.error("❌ No socketId provided to sendMessageToSocketId");
    return;
  }

  console.log(`📤 Sending event [${messageObject.event}] to socket: ${socketId}`);
  
  io.to(socketId).emit(messageObject.event, messageObject.data);
};

module.exports = { initializeSocket, sendMessageToSocketId };