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
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
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
    // ACTUALIZACIÓN DE UBICACIÓN DEL CONDUCTOR (ORIGINAL)
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
      } catch (error) {
        console.error("Location update error:", error.message);
      }
    });

    // 🆕 ============================================
    // TRACKING EN TIEMPO REAL - UBICACIÓN DEL CONDUCTOR
    // ============================================
    socket.on("captain-location-update", async (data) => {
      const { rideId, location, vehicleType } = data;

      if (!rideId || !location || !location.ltd || !location.lng) {
        console.warn("⚠️ Datos incompletos en captain-location-update");
        return;
      }

      try {
        // Buscar el viaje para obtener el socketId del usuario
        const ride = await rideModel.findById(rideId).populate('user');
        
        if (!ride) {
          console.warn(`⚠️ Viaje ${rideId} no encontrado`);
          return;
        }

        if (!ride.user) {
          console.warn(`⚠️ Viaje ${rideId} sin usuario asignado`);
          return;
        }

        // Actualizar ubicación del conductor en la base de datos
        if (ride.captain) {
          await captainModel.findByIdAndUpdate(ride.captain, {
            location: {
              ltd: location.ltd,
              lng: location.lng
            }
          });
        }

        // Enviar ubicación al usuario específico
        if (ride.user.socketId) {
          io.to(ride.user.socketId).emit("captain-location-update", {
            rideId,
            location,
            vehicleType: vehicleType || "car"
          });
          
          console.log(`📍 Ubicación del conductor enviada al usuario ${ride.user._id}`);
        } else {
          console.warn(`⚠️ Usuario ${ride.user._id} no tiene socketId activo`);
        }
      } catch (error) {
        console.error("Error en captain-location-update:", error.message);
      }
    });

    // 🆕 ============================================
    // ACTUALIZACIÓN DE ETA EN TIEMPO REAL
    // ============================================
    socket.on("ride-eta-update", async (data) => {
      const { rideId, eta } = data;

      if (!rideId || eta === undefined) {
        console.warn("⚠️ Datos incompletos en ride-eta-update");
        return;
      }

      try {
        const ride = await rideModel.findById(rideId).populate('user');
        
        if (!ride) {
          console.warn(`⚠️ Viaje ${rideId} no encontrado`);
          return;
        }

        if (!ride.user) {
          console.warn(`⚠️ Viaje ${rideId} sin usuario asignado`);
          return;
        }

        // Enviar ETA al usuario
        if (ride.user.socketId) {
          io.to(ride.user.socketId).emit("ride-eta-update", {
            rideId,
            eta
          });
          
          console.log(`⏱️ ETA ${eta} min enviado al usuario ${ride.user._id}`);
        } else {
          console.warn(`⚠️ Usuario ${ride.user._id} no tiene socketId activo`);
        }
      } catch (error) {
        console.error("Error en ride-eta-update:", error.message);
      }
    });

    // 🆕 ============================================
    // ACTUALIZACIÓN DE ESTADO DEL VIAJE
    // ============================================
    socket.on("ride-status-update", async (data) => {
      const { rideId, status } = data;

      if (!rideId || !status) {
        console.warn("⚠️ Datos incompletos en ride-status-update");
        return;
      }

      try {
        const ride = await rideModel.findById(rideId).populate('user captain');
        
        if (!ride) {
          console.warn(`⚠️ Viaje ${rideId} no encontrado`);
          return;
        }

        // Actualizar estado en la base de datos
        ride.status = status;
        await ride.save();

        // Notificar al usuario (si está conectado)
        if (ride.user && ride.user.socketId) {
          io.to(ride.user.socketId).emit("ride-status-update", {
            rideId,
            status
          });
          console.log(`🔄 Estado enviado al usuario ${ride.user._id}: ${status}`);
        }

        // Notificar al conductor (si está conectado)
        if (ride.captain && ride.captain.socketId) {
          io.to(ride.captain.socketId).emit("ride-status-update", {
            rideId,
            status
          });
          console.log(`🔄 Estado enviado al conductor ${ride.captain._id}: ${status}`);
        }

        console.log(`🔄 Estado del viaje ${rideId} actualizado a: ${status}`);
      } catch (error) {
        console.error("Error en ride-status-update:", error.message);
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
    socket.on("disconnect", async () => {
      console.log(`❌ Client disconnected: ${socket.id}`);

      // 🔄 OPCIONAL: Actualizar estado del conductor a 'inactive' al desconectarse
      try {
        const captain = await captainModel.findOne({ socketId: socket.id });
        if (captain) {
          await captainModel.findByIdAndUpdate(captain._id, {
            status: 'inactive',
            socketId: null
          });
          console.log(`🔴 Captain ${captain._id} set to INACTIVE on disconnect`);
        }

        const user = await userModel.findOne({ socketId: socket.id });
        if (user) {
          await userModel.findByIdAndUpdate(user._id, {
            socketId: null
          });
          console.log(`🔴 User ${user._id} socketId cleared on disconnect`);
        }
      } catch (error) {
        console.error("Error handling disconnect:", error.message);
      }
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