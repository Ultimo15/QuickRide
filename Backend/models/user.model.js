const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      firstname: {
        type: String,
        required: true,
        minlength: 3,
      },
      lastname: {
        type: String,
        minlength: 3,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
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
      maxlength: 10,
    },
    socketId: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // ✅ NUEVO: Foto de perfil del usuario
    profilePhoto: {
      type: String,
      default: null, // URL de la imagen o null si no tiene
    },
    // ✅ NUEVO: Sistema de calificaciones
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
    // ✅ NUEVO: Contador de viajes
    completedRides: {
      type: Number,
      default: 0,
    },
    cancelledRides: {
      type: Number,
      default: 0,
    },
    rides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride",
      },
    ],
  },
  { timestamps: true }
);

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id, userType: "user" }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// ✅ NUEVO: Método para actualizar calificación promedio
userSchema.methods.updateRating = function (newRating) {
  const totalRatings = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (totalRatings + newRating) / this.rating.count;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);