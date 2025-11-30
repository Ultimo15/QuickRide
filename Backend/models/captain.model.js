const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const captainSchema = new mongoose.Schema(
  {
    fullname: {
      firstname: {
        type: String,
        required: true,
        minlength: 3,
      },
      lastname: {
        type: String,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    phone: {
      type: String,
      minlength: 10,
    },
    socketId: {
      type: String,
    },
    // ✅ NUEVO: Foto de perfil del capitán
    profilePhoto: {
      type: String,
      default: null, // URL de la imagen o null si no tiene
    },
    rides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride",
      },
    ],
    // ✅ ACTUALIZADO: Estado con online/offline/busy
    status: {
      type: String,
      enum: ["online", "offline", "busy"],
      default: "offline",
    },
    vehicle: {
      color: {
        type: String,
        required: true,
        minlength: [3, "Color must be at least 3 characters long"],
      },
      // ✅ ACTUALIZADO: "plate" en lugar de "number"
      plate: {
        type: String,
        required: true,
        minlength: [6, "Plate must be at least 6 characters long"],
        maxlength: [10, "Plate must not exceed 10 characters"],
        uppercase: true,
      },
      // ✅ NUEVO: Marca del vehículo
      brand: {
        type: String,
        default: "No especificado",
      },
      // ✅ NUEVO: Modelo del vehículo
      model: {
        type: String,
        default: "No especificado",
      },
      capacity: {
        type: Number,
        required: true,
      },
      type: {
        type: String,
        required: true,
        // ✅ ACTUALIZADO: Solo "car" y "bike" (sin "auto")
        enum: ["car", "bike"],
      },
    },
    location: {
      ltd: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    completedRides: {
      type: Number,
      default: 0,
    },
    cancelledRides: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    // ✅ ACTUALIZADO: Sistema de calificaciones mejorado
    rating: {
      average: {
        type: Number,
        default: 5,
        min: 1,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    // ✅ NUEVO: Última vez que estuvo online
    lastOnline: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

captainSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

captainSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, userType: "captain" },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );
};

captainSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// ✅ NUEVO: Método para actualizar calificación promedio
captainSchema.methods.updateRating = function (newRating) {
  const totalRatings = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (totalRatings + newRating) / this.rating.count;
  return this.save();
};

// ✅ NUEVO: Método para cambiar estado online/offline
captainSchema.methods.toggleOnlineStatus = function () {
  if (this.status === "online") {
    this.status = "offline";
    this.lastOnline = new Date();
  } else if (this.status === "offline") {
    this.status = "online";
  }
  // Si está "busy", no se puede cambiar manualmente
  return this.save();
};

module.exports = mongoose.model("Captain", captainSchema);