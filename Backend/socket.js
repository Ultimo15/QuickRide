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
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    if (process.env.ENVIRONMENT == "production") {
      socket.on("log", async (log) => {
        log.formattedTimestamp = moment().tz("Asia/Kolkata").format("MMM DD hh:mm:ss A");
        try {
          await frontendLogModel.create(log);
        } catch (error) {
          console.log("Error sending logs...");
        }
      });
    }

    socket.on("join", async (data) => {
      const { userId, userType } = data;
      console.log(userType + " attempting to join: " + userId);
      
      try {
        if (userType === "user") {
          await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
          console.log(`User ${userId} joined and socket updated.`);
        } else if (userType === "captain") {
          // --- AQUÍ ESTÁ EL CAMBIO CLAVE ---
          // Actualizamos socketId Y forzamos el estado a 'active'
          await captainModel.findByIdAndUpdate(userId, { 
            socketId: socket.id,
            status: 'active' 
          });
          console.log(`Captain ${userId} joined, socket updated and set to ACTIVE.`);
        }
      } catch (error) {
        console.error("Error joining socket:", error.message);
      }
    });

    socket.on("update-location-captain", async (data) => {
      const { userId, location } = data;

      if (!location || !location.ltd || !location.lng) {
        return socket.emit("error", { message: "Invalid location data" });
      }

      try {
        await captainModel.findByIdAndUpdate(userId, {
          location: {
            ltd: location.ltd,     // Guardamos formato simple por si acaso
            lng: location.lng      // (Algunos mapas usan esto)
          }
        });
        // Si tu esquema usa GeoJSON estricto, descomenta la versión de abajo y comenta la de arriba.
        // Pero para la mayoría de estos proyectos, guardar ltd/lng directos es más seguro.
        /*
        await captainModel.findByIdAndUpdate(userId, {
           location: {
             type: "Point",
             coordinates: [location.lng, location.ltd],
           },
        });
        */
        // console.log(`Location updated for captain ${userId}`);
      } catch (error) {
        console.error("Error updating location:", error.message);
      }
    });

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`${socket.id} joined room: ${roomId}`);
    });

    socket.on("message", async ({ rideId, msg, userType, time }) => {
      const date = moment().tz("Asia/Kolkata").format("MMM DD");
      socket.to(rideId).emit("receiveMessage", { msg, by: userType, time });
      try {
        const ride = await rideModel.findOne({ _id: rideId });
        ride.messages.push({
          msg: msg,
          by: userType,
          time: time,
          date: date,
          timestamp: new Date(),
        });
        await ride.save();
      } catch (error) {
        console.log("Error saving message: ", error);
      }
    });
    
    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

const sendMessageToSocketId = (socketId, messageObject) => {
  if (io) {
    console.log(`Sending event [${messageObject.event}] to: ${socketId}`);
    io.to(socketId).emit(messageObject.event, messageObject.data);
  } else {
    console.log("Socket.io not initialized.");
  }
};

module.exports = { initializeSocket, sendMessageToSocketId };
