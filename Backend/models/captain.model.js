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
      number: {
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
        // ✅ SIN "AUTO" - Solo car y bike (moto/motorcycle son alias)
        enum: ["car", "bike", "moto", "motorcycle"],
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
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
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