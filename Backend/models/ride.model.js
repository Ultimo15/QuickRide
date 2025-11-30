const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Captain",
    },
    pickup: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    // ✅ NUEVO: Coordenadas de pickup y destino
    pickupCoordinates: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    destinationCoordinates: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    fare: {
      type: Number,
      required: true,
    },
    // ✅ NUEVO: Precio ofertado por el cliente (opcional)
    offeredPrice: {
      type: Number,
      default: null,
    },
    // ✅ NUEVO: Precio final aceptado
    finalPrice: {
      type: Number,
      default: null,
    },
    vehicle: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "ongoing", "completed", "cancelled"],
      default: "pending",
    },
    duration: {
      type: Number,
    }, // in seconds
    distance: {
      type: Number,
    }, // in meters
    // ✅ NUEVO: Tiempo estimado de llegada del conductor (en minutos)
    estimatedArrivalTime: {
      type: Number,
      default: null,
    },
    // ✅ NUEVO: Tiempo estimado del viaje (en minutos)
    estimatedTripTime: {
      type: Number,
      default: null,
    },
    // ✅ NUEVO: Método de pago
    paymentMethod: {
      type: String,
      enum: ["cash", "nequi"],
      default: "cash",
    },
    paymentID: {
      type: String,
    },
    orderId: {
      type: String,
    },
    signature: {
      type: String,
    },
    otp: {
      type: String,
      select: false,
      required: true,
    },
    // ✅ NUEVO: Sistema de calificaciones y comentarios
    rating: {
      // Calificación del usuario al capitán
      userToCaptain: {
        stars: {
          type: Number,
          min: 1,
          max: 5,
          default: null,
        },
        comment: {
          type: String,
          maxlength: 500,
          default: null,
        },
        timestamp: {
          type: Date,
          default: null,
        },
      },
      // Calificación del capitán al usuario
      captainToUser: {
        stars: {
          type: Number,
          min: 1,
          max: 5,
          default: null,
        },
        comment: {
          type: String,
          maxlength: 500,
          default: null,
        },
        timestamp: {
          type: Date,
          default: null,
        },
      },
    },
    // ✅ NUEVO: Razón de cancelación
    cancellationReason: {
      type: String,
      default: null,
    },
    cancelledBy: {
      type: String,
      enum: ["user", "captain", "system"],
      default: null,
    },
    messages: [
      {
        msg: String,
        by: {
          type: String,
          enum: ["user", "captain"],
        },
        time: String,
        date: String,
        timestamp: Date,
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

// ✅ NUEVO: Índice para mejorar búsquedas por usuario y capitán
rideSchema.index({ user: 1, createdAt: -1 });
rideSchema.index({ captain: 1, createdAt: -1 });
rideSchema.index({ status: 1, createdAt: -1 });

// ✅ NUEVO: Método para calcular el precio final
rideSchema.methods.calculateFinalPrice = function () {
  if (this.offeredPrice && this.offeredPrice > this.fare) {
    this.finalPrice = this.offeredPrice;
  } else {
    this.finalPrice = this.fare;
  }
  return this.finalPrice;
};

module.exports = mongoose.model("Ride", rideSchema);