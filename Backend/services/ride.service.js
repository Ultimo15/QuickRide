const captainModel = require("../models/captain.model");
const userModel = require("../models/user.model");
const rideModel = require("../models/ride.model");
const mapService = require("./map.service");
const crypto = require("crypto");

// ✅ FUNCIÓN PARA DETECTAR HORARIO NOCTURNO
const isNightTime = () => {
  // Hora actual en Venezuela (UTC-4)
  const now = new Date();
  const venezuelaTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Caracas" })
  );
  const hour = venezuelaTime.getHours();

  // Horario nocturno: 7:00 PM (19:00) a 5:00 AM (5:00)
  const isNight = hour >= 19 || hour < 5;

  return isNight;
};

// ✅ CALCULAR TARIFA CON CONFIGURACIÓN DESDE .env
const getFare = async (pickup, destination) => {
  if (!pickup || !destination) {
    throw new Error("Pickup and destination are required");
  }

  const distanceTime = await mapService.getDistanceTime(pickup, destination);
  const isNight = isNightTime();

  const now = new Date();
  const venezuelaTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Caracas" })
  );

  console.log(
    `🕐 Hora Venezuela: ${venezuelaTime.toLocaleTimeString()} | Nocturno: ${
      isNight ? "SÍ ⭐" : "NO ☀️"
    }`
  );

  // ✅ Tarifas base desde .env o valores por defecto
  const baseFare = {
    car: parseFloat(process.env.BASE_FARE_CAR) || 5000,
    bike: parseFloat(process.env.BASE_FARE_BIKE) || 3000,
  };

  // ✅ Tarifa por kilómetro desde .env
  const perKmRate = {
    car: parseFloat(process.env.FARE_PER_KM_CAR) || 2000,
    bike: parseFloat(process.env.FARE_PER_KM_BIKE) || 1500,
  };

  // ✅ Tarifa por minuto desde .env
  const perMinuteRate = {
    car: parseFloat(process.env.FARE_PER_MIN_CAR) || 300,
    bike: parseFloat(process.env.FARE_PER_MIN_BIKE) || 200,
  };

  // ✅ Recargo nocturno (20% adicional)
  const nightSurcharge = isNight ? 1.2 : 1.0;

  const fare = {
    car: Math.round(
      (baseFare.car +
        (distanceTime.distance.value / 1000) * perKmRate.car +
        (distanceTime.duration.value / 60) * perMinuteRate.car) *
        nightSurcharge
    ),
    bike: Math.round(
      (baseFare.bike +
        (distanceTime.distance.value / 1000) * perKmRate.bike +
        (distanceTime.duration.value / 60) * perMinuteRate.bike) *
        nightSurcharge
    ),
  };

  console.log(
    `💰 Tarifa calculada (${isNight ? "NOCTURNA" : "DIURNA"}) - Car: $${
      fare.car
    } | Bike: $${fare.bike}`
  );

  return { fare, distanceTime, isNightTime: isNight };
};

module.exports.getFare = getFare;

// ✅ Generar OTP
function getOtp(num) {
  function generateOtp(num) {
    const otp = crypto
      .randomInt(Math.pow(10, num - 1), Math.pow(10, num))
      .toString();
    return otp;
  }
  return generateOtp(num);
}

// ✅ CREAR VIAJE CON MEJORAS
module.exports.createRide = async ({
  user,
  pickup,
  destination,
  vehicleType,
  pickupCoordinates,
  destinationCoordinates,
  offeredPrice = null,
  paymentMethod = "cash",
}) => {
  if (!user || !pickup || !destination || !vehicleType) {
    throw new Error("All fields are required");
  }

  if (!pickupCoordinates || !destinationCoordinates) {
    throw new Error("Coordinates are required");
  }

  try {
    const { fare, distanceTime } = await getFare(pickup, destination);

    // ✅ Calcular tiempo estimado del viaje en minutos
    const estimatedTripTime = Math.ceil(distanceTime.duration.value / 60);

    // ✅ Determinar precio final
    let finalPrice = fare[vehicleType];
    if (offeredPrice && offeredPrice > finalPrice) {
      finalPrice = offeredPrice;
    }

    const ride = await rideModel.create({
      user,
      pickup,
      destination,
      pickupCoordinates,
      destinationCoordinates,
      otp: getOtp(6),
      fare: fare[vehicleType],
      offeredPrice: offeredPrice,
      finalPrice: finalPrice,
      vehicle: vehicleType,
      distance: distanceTime.distance.value,
      duration: distanceTime.duration.value,
      estimatedTripTime: estimatedTripTime,
      paymentMethod: paymentMethod,
    });

    console.log(`✅ Viaje creado: ${ride._id} | Precio: $${finalPrice}`);

    return ride;
  } catch (error) {
    console.error("Error en createRide:", error.message);
    throw new Error("Error occured while creating ride.");
  }
};

// ✅ CONFIRMAR VIAJE (cuando el capitán acepta)
module.exports.confirmRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  try {
    const ride = await rideModel.findById(rideId);
    
    if (!ride) {
      throw new Error("Ride not found");
    }

    if (ride.status !== "pending") {
      throw new Error("Ride already accepted by another captain");
    }

    // ✅ Calcular tiempo estimado de llegada del conductor
    let estimatedArrival = null;
    if (captain.location && captain.location.ltd && captain.location.lng) {
      try {
        const arrivalData = await mapService.getEstimatedArrival(
          { lat: captain.location.ltd, lng: captain.location.lng },
          { lat: ride.pickupCoordinates.lat, lng: ride.pickupCoordinates.lng }
        );
        estimatedArrival = Math.ceil(arrivalData.duration.value / 60); // En minutos
      } catch (error) {
        console.warn("No se pudo calcular tiempo de llegada:", error.message);
        estimatedArrival = 5; // Valor por defecto: 5 minutos
      }
    }

    await rideModel.findOneAndUpdate(
      { _id: rideId },
      {
        status: "accepted",
        captain: captain._id,
        estimatedArrivalTime: estimatedArrival,
      }
    );

    const captainData = await captainModel.findOne({ _id: captain._id });
    captainData.rides.push(rideId);
    captainData.status = "busy"; // ✅ Marcar como ocupado
    await captainData.save();

    const updatedRide = await rideModel
      .findOne({ _id: rideId })
      .populate("user")
      .populate("captain")
      .select("+otp");

    console.log(`✅ Viaje ${rideId} aceptado por ${captain.fullname.firstname}`);

    return updatedRide;
  } catch (error) {
    console.error("Error en confirmRide:", error.message);
    throw new Error("Error occured while confirming ride.");
  }
};

// ✅ INICIAR VIAJE (cuando el conductor ingresa OTP)
module.exports.startRide = async ({ rideId, otp, captain }) => {
  if (!rideId || !otp) {
    throw new Error("Ride id and OTP are required");
  }

  const ride = await rideModel
    .findOne({ _id: rideId })
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "accepted") {
    throw new Error("Ride not accepted");
  }

  if (ride.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  await rideModel.findOneAndUpdate(
    { _id: rideId },
    { status: "ongoing" }
  );

  console.log(`✅ Viaje ${rideId} iniciado`);

  return ride;
};

// ✅ FINALIZAR VIAJE
module.exports.endRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  const ride = await rideModel
    .findOne({
      _id: rideId,
      captain: captain._id,
    })
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "ongoing") {
    throw new Error("Ride not ongoing");
  }

  // Actualizar estado del viaje a completado
  await rideModel.findOneAndUpdate(
    { _id: rideId },
    { status: "completed" }
  );

  // ✅ ACTUALIZAR ESTADÍSTICAS DEL CONDUCTOR
  try {
    const captainData = await captainModel.findById(captain._id);

    if (captainData) {
      captainData.completedRides = (captainData.completedRides || 0) + 1;
      captainData.totalEarnings = (captainData.totalEarnings || 0) + (ride.finalPrice || ride.fare);
      captainData.status = "online"; // ✅ Volver a disponible
      await captainData.save();

      console.log(`✅ Estadísticas del capitán actualizadas:`);
      console.log(`   - Viajes completados: ${captainData.completedRides}`);
      console.log(`   - Ganancias totales: $${captainData.totalEarnings}`);
    }
  } catch (error) {
    console.error("Error actualizando estadísticas del capitán:", error.message);
  }

  // ✅ ACTUALIZAR ESTADÍSTICAS DEL USUARIO
  try {
    const userData = await userModel.findById(ride.user._id);

    if (userData) {
      userData.completedRides = (userData.completedRides || 0) + 1;
      await userData.save();

      console.log(`✅ Estadísticas del usuario actualizadas`);
    }
  } catch (error) {
    console.error("Error actualizando estadísticas del usuario:", error.message);
  }

  return ride;
};

// ✅ CANCELAR VIAJE
module.exports.cancelRide = async ({ rideId, cancelledBy, reason = null }) => {
  if (!rideId || !cancelledBy) {
    throw new Error("Ride id and cancelledBy are required");
  }

  try {
    const ride = await rideModel
      .findById(rideId)
      .populate("user")
      .populate("captain");

    if (!ride) {
      throw new Error("Ride not found");
    }

    if (ride.status === "completed" || ride.status === "cancelled") {
      throw new Error("Cannot cancel this ride");
    }

    // Actualizar estado del viaje
    await rideModel.findOneAndUpdate(
      { _id: rideId },
      {
        status: "cancelled",
        cancelledBy: cancelledBy,
        cancellationReason: reason,
      }
    );

    // ✅ Actualizar contador de cancelaciones
    if (cancelledBy === "captain" && ride.captain) {
      const captainData = await captainModel.findById(ride.captain._id);
      if (captainData) {
        captainData.cancelledRides = (captainData.cancelledRides || 0) + 1;
        captainData.status = "online"; // ✅ Volver a disponible
        await captainData.save();
        console.log(`✅ Cancelaciones del capitán actualizadas: ${captainData.cancelledRides}`);
      }
    } else if (cancelledBy === "user") {
      const userData = await userModel.findById(ride.user._id);
      if (userData) {
        userData.cancelledRides = (userData.cancelledRides || 0) + 1;
        await userData.save();
        console.log(`✅ Cancelaciones del usuario actualizadas: ${userData.cancelledRides}`);
      }
    }

    // Si había capitán asignado, liberarlo
    if (ride.captain && ride.status === "accepted") {
      const captainData = await captainModel.findById(ride.captain._id);
      if (captainData) {
        captainData.status = "online";
        await captainData.save();
      }
    }

    console.log(`✅ Viaje ${rideId} cancelado por ${cancelledBy}`);

    return ride;
  } catch (error) {
    console.error("Error en cancelRide:", error.message);
    throw new Error("Error occurred while cancelling ride.");
  }
};

// ✅ CALIFICAR VIAJE
module.exports.rateRide = async ({
  rideId,
  ratedBy,
  stars,
  comment = null,
}) => {
  if (!rideId || !ratedBy || !stars) {
    throw new Error("Ride id, ratedBy, and stars are required");
  }

  if (stars < 1 || stars > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  try {
    const ride = await rideModel
      .findById(rideId)
      .populate("user")
      .populate("captain");

    if (!ride) {
      throw new Error("Ride not found");
    }

    if (ride.status !== "completed") {
      throw new Error("Can only rate completed rides");
    }

    // Actualizar calificación en el modelo de viaje
    if (ratedBy === "user") {
      ride.rating.userToCaptain = {
        stars: stars,
        comment: comment,
        timestamp: new Date(),
      };

      // Actualizar calificación del capitán
      if (ride.captain) {
        const captain = await captainModel.findById(ride.captain._id);
        if (captain) {
          await captain.updateRating(stars);
        }
      }
    } else if (ratedBy === "captain") {
      ride.rating.captainToUser = {
        stars: stars,
        comment: comment,
        timestamp: new Date(),
      };

      // Actualizar calificación del usuario
      if (ride.user) {
        const user = await userModel.findById(ride.user._id);
        if (user) {
          await user.updateRating(stars);
        }
      }
    }

    await ride.save();

    console.log(`✅ Viaje ${rideId} calificado por ${ratedBy}: ${stars} estrellas`);

    return ride;
  } catch (error) {
    console.error("Error en rateRide:", error.message);
    throw new Error("Error occurred while rating ride.");
  }
};