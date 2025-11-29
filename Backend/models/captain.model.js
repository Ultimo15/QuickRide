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
      trim: true, // ¡IMPORTANTE! Esto evita el error de login si se cuela un espacio
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
      // maxlength: 10, // Comentado por si acaso usas códigos de país (+58, +57) que alargan el string
    },
    socketId: {
      type: String,
    },
    rides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride",
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    vehicle: {
      color: {
        type: String,
        required: true,
        minlength: [3, "Color must be at least 3 characters long"],
      },
      number: { // Nota: En tu DB vi que usas 'number' para la placa, así que lo dejé así.
        type: String,
        required: true,
        minlength: [3, "Plate must be at least 3 characters long"],
      },
      capacity: {
        type: Number,
        required: true,
      },
      type: {
        type: String,
        required: true,
        // Agregamos 'moto' y 'motorcycle' para compatibilidad total
        enum: ["car", "bike", "auto", "moto", "motorcycle"],
      },
    },

    // --- CORRECCIÓN CRÍTICA ---
    // Esto permite que Mongoose lea las coordenadas que guardaste manualmente
    location: {
      ltd: {
        type: Number,
      },
      lng: {
        type: Number,
      }
    },
    // --------------------------

    emailVerified: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model("Captain", captainSchema);
