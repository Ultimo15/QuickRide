import { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useCaptain } from "../contexts/CaptainContext";
import {
  Volume2,
  VolumeX,
  TrendingUp,
  Navigation,
  CheckCircle,
  DollarSign,
  MapPin,
  Clock,
} from "lucide-react";
import { SocketDataContext } from "../contexts/SocketContext";
import { NewRide, Sidebar, CaptainToggleButton, Avatar } from "../components";
import Console from "../utils/console";
import showToast from "../utils/toast";
import { DEFAULT_LOCATION } from "../utils/constants";

/**
 * 🚖 PANTALLA PRINCIPAL DEL CONDUCTOR - PROFESIONAL ESTILO UBER
 * Dashboard de ganancias, estadísticas y gestión de viajes en tiempo real
 */

const defaultRideData = {
  user: {
    fullname: {
      firstname: "Sin",
      lastname: "Usuario",
    },
    _id: "",
    email: "ejemplo@gmail.com",
    rides: [],
  },
  pickup: "Lugar, Ciudad, Departamento, País",
  destination: "Lugar, Ciudad, Departamento, País",
  fare: 0,
  vehicle: "car",
  status: "pending",
  duration: 0,
  distance: 0,
  _id: "123456789012345678901234",
};

function CaptainHomeScreen() {
  const token = localStorage.getItem("token");
  const { captain, setCaptain } = useCaptain();
  const { socket } = useContext(SocketDataContext);
  const [loading, setLoading] = useState(false);

  // Estados de ubicación
  const [riderLocation, setRiderLocation] = useState({
    ltd: null,
    lng: null,
  });
  const [mapLocation, setMapLocation] = useState(
    `https://www.google.com/maps?q=${DEFAULT_LOCATION.lat},${DEFAULT_LOCATION.lng}&output=embed`
  );

  // Estados de ganancias y viajes
  const [earnings, setEarnings] = useState({
    total: 0,
    today: 0,
  });
  const [rides, setRides] = useState({
    accepted: 0,
    cancelled: 0,
    distanceTravelled: 0,
  });

  // Estados de viaje actual
  const [newRide, setNewRide] = useState(
    JSON.parse(localStorage.getItem("rideDetails")) || defaultRideData
  );
  const [otp, setOtp] = useState("");
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("messages")) || []
  );
  const [error, setError] = useState("");

  // Estados de UI
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCaptainDetailsPanel, setShowCaptainDetailsPanel] = useState(true);
  const [showNewRidePanel, setShowNewRidePanel] = useState(
    JSON.parse(localStorage.getItem("showPanel")) || false
  );
  const [showBtn, setShowBtn] = useState(
    JSON.parse(localStorage.getItem("showBtn")) || "accept"
  );

  // Estados de notificaciones
  const notificationSound = useRef(null);
  const notificationInterval = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("soundEnabled") !== "false"
  );
  const [audioReady, setAudioReady] = useState(false);

  // Refs para tracking
  const locationIntervalRef = useRef(null);

  // ==========================================
  // SONIDO: Inicializar
  // ==========================================
  useEffect(() => {
    notificationSound.current = new Audio("/Sounds/new-ride.mp3");
    notificationSound.current.volume = 0.7;

    const enableAudio = () => {
      if (notificationSound.current && !audioReady) {
        notificationSound.current.load();
        setAudioReady(true);
        Console.log("✅ Audio cargado y listo");
        document.removeEventListener("click", enableAudio);
        document.removeEventListener("touchstart", enableAudio);
      }
    };

    document.addEventListener("click", enableAudio);
    document.addEventListener("touchstart", enableAudio);

    return () => {
      document.removeEventListener("click", enableAudio);
      document.removeEventListener("touchstart", enableAudio);
      if (notificationSound.current) {
        notificationSound.current.pause();
        notificationSound.current = null;
      }
      if (notificationInterval.current) {
        clearInterval(notificationInterval.current);
      }
    };
  }, [audioReady]);

  // ==========================================
  // SONIDO: Reproducir una vez
  // ==========================================
  const playSoundOnce = () => {
    if (soundEnabled && notificationSound.current) {
      notificationSound.current.currentTime = 0;
      notificationSound.current
        .play()
        .then(() => Console.log("🔊 Sonido reproducido"))
        .catch((err) => Console.log("⚠️ Error reproduciendo sonido:", err));
    }

    if ("vibrate" in navigator) {
      try {
        navigator.vibrate([300, 100, 300]);
        Console.log("📳 Vibración activada");
      } catch (err) {
        Console.log("⚠️ Error con vibración:", err);
      }
    }
  };

  // ==========================================
  // SONIDO: Iniciar bucle
  // ==========================================
  const startNotificationLoop = () => {
    if (notificationInterval.current) {
      clearInterval(notificationInterval.current);
    }

    playSoundOnce();

    notificationInterval.current = setInterval(() => {
      playSoundOnce();
    }, 3000);

    Console.log("🔁 Bucle de notificación iniciado");
  };

  // ==========================================
  // SONIDO: Detener bucle
  // ==========================================
  const stopNotificationLoop = () => {
    if (notificationInterval.current) {
      clearInterval(notificationInterval.current);
      notificationInterval.current = null;
      Console.log("⏹️ Bucle de notificación detenido");
    }
  };

  // ==========================================
  // SONIDO: Toggle
  // ==========================================
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("soundEnabled", String(newValue));
    showToast.success(
      newValue ? "🔊 Sonido activado" : "🔇 Sonido desactivado"
    );
    Console.log(`🔊 Sonido ${newValue ? "activado" : "desactivado"}`);
  };

  // ==========================================
  // TOGGLE: Cambiar estado online/offline
  // ==========================================
  const handleToggleOnline = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/captain/toggle-status`,
        {},
        {
          headers: { token },
        }
      );

      Console.log("✅ Estado cambiado:", response.data);

      // Actualizar estado del capitán
      setCaptain({
        ...captain,
        status: response.data.captain.status,
      });

      // Actualizar localStorage
      const userData = JSON.parse(localStorage.getItem("userData"));
      userData.data.status = response.data.captain.status;
      localStorage.setItem("userData", JSON.stringify(userData));

      showToast.success(
        response.data.captain.status === "online"
          ? "✅ Ahora estás disponible para recibir viajes"
          : "⏸️ Ya no recibirás nuevos viajes"
      );
    } catch (error) {
      Console.error("❌ Error cambiando estado:", error);
      showToast.error("Error al cambiar el estado");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VIAJE: Aceptar
  // ==========================================
  const acceptRide = async () => {
    stopNotificationLoop();

    try {
      if (newRide._id !== "") {
        setLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/ride/confirm`,
          { rideId: newRide._id },
          {
            headers: { token },
          }
        );
        setLoading(false);
        setShowBtn("otp");
        setMapLocation(
          `https://www.google.com/maps?q=${riderLocation.ltd},${riderLocation.lng} to ${newRide.pickup}&output=embed`
        );

        startLocationTracking();

        showToast.success("✅ Viaje aceptado! Dirígete al punto de recogida");
        Console.log(response);
      }
    } catch (error) {
      setLoading(false);
      showToast.error(
        error.response?.data?.message || "Error aceptando viaje"
      );
      Console.log(error.response);
      setTimeout(() => {
        clearRideData();
      }, 1000);
    }
  };

  // ==========================================
  // VIAJE: Verificar OTP
  // ==========================================
  const verifyOTP = async () => {
    try {
      if (newRide._id !== "" && otp.length === 6) {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/ride/start-ride?rideId=${newRide._id}&otp=${otp}`,
          {
            headers: { token },
          }
        );
        setMapLocation(
          `https://www.google.com/maps?q=${riderLocation.ltd},${riderLocation.lng} to ${newRide.destination}&output=embed`
        );
        setShowBtn("end-ride");
        setLoading(false);

        socket.emit("ride-status-update", {
          rideId: newRide._id,
          status: "ongoing",
        });

        showToast.success("🚗 Viaje iniciado! Dirígete al destino");
        Console.log(response);
      }
    } catch (err) {
      setLoading(false);
      setError("Código OTP inválido");
      showToast.error("❌ Código OTP inválido");
      Console.log(err);
    }
  };

  // ==========================================
  // VIAJE: Finalizar
  // ==========================================
  const endRide = async () => {
    try {
      if (newRide._id !== "") {
        setLoading(true);
        await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/ride/end-ride`,
          {
            rideId: newRide._id,
          },
          {
            headers: { token },
          }
        );

        stopLocationTracking();

        setMapLocation(
          `https://www.google.com/maps?q=${riderLocation.ltd},${riderLocation.lng}&output=embed`
        );
        setShowBtn("accept");
        setLoading(false);
        setShowCaptainDetailsPanel(true);
        setShowNewRidePanel(false);
        setNewRide(defaultRideData);
        localStorage.removeItem("rideDetails");
        localStorage.removeItem("showPanel");
        localStorage.removeItem("messages");

        calculateEarnings();

        showToast.success("🎉 ¡Viaje finalizado! Buen trabajo");
      }
    } catch (err) {
      setLoading(false);
      showToast.error("Error finalizando el viaje");
      Console.log(err);
    }
  };

  // ==========================================
  // UBICACIÓN: Actualizar
  // ==========================================
  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setRiderLocation({
            ltd: position.coords.latitude,
            lng: position.coords.longitude,
          });

          setMapLocation(
            `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}&output=embed`
          );

          socket.emit("update-location-captain", {
            userId: captain._id,
            location: {
              ltd: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          setMapLocation(
            `https://www.google.com/maps?q=${DEFAULT_LOCATION.lat},${DEFAULT_LOCATION.lng}&output=embed`
          );
        }
      );
    }
  };

  // ==========================================
  // TRACKING: Enviar ubicación al usuario
  // ==========================================
  const sendLocationToUser = () => {
    if (
      navigator.geolocation &&
      newRide._id &&
      newRide._id !== defaultRideData._id
    ) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            rideId: newRide._id,
            location: {
              ltd: position.coords.latitude,
              lng: position.coords.longitude,
            },
            vehicleType: captain?.vehicle?.type || "car",
          };

          socket.emit("captain-location-update", locationData);

          Console.log("📍 Ubicación enviada al usuario:", locationData);
        },
        (error) => {
          Console.error("Error obteniendo ubicación para tracking:", error);
        }
      );
    }
  };

  // ==========================================
  // TRACKING: Iniciar
  // ==========================================
  const startLocationTracking = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
    }

    sendLocationToUser();

    locationIntervalRef.current = setInterval(() => {
      sendLocationToUser();
    }, 5000);

    Console.log("🎯 Tracking de ubicación iniciado (cada 5 segundos)");
  };

  // ==========================================
  // TRACKING: Detener
  // ==========================================
  const stopLocationTracking = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
      Console.log("⏹️ Tracking de ubicación detenido");
    }
  };

  // ==========================================
  // LIMPIAR: Datos del viaje
  // ==========================================
  const clearRideData = () => {
    stopNotificationLoop();
    stopLocationTracking();

    setShowBtn("accept");
    setLoading(false);
    setShowCaptainDetailsPanel(true);
    setShowNewRidePanel(false);
    setNewRide(defaultRideData);
    localStorage.removeItem("rideDetails");
    localStorage.removeItem("showPanel");
    localStorage.removeItem("messages");
  };

  // ==========================================
  // CALCULAR: Ganancias
  // ==========================================
  const calculateEarnings = () => {
    let Totalearnings = 0;
    let Todaysearning = 0;
    let acceptedRides = 0;
    let cancelledRides = 0;
    let distanceTravelled = 0;

    const today = new Date();
    const todayWithoutTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    captain.rides?.forEach((ride) => {
      if (ride.status === "completed") {
        acceptedRides++;
        distanceTravelled += ride.distance || 0;
      }
      if (ride.status === "cancelled") cancelledRides++;

      Totalearnings += ride.fare || 0;
      const rideDate = new Date(ride.updatedAt);

      const rideDateWithoutTime = new Date(
        rideDate.getFullYear(),
        rideDate.getMonth(),
        rideDate.getDate()
      );

      if (
        rideDateWithoutTime.getTime() === todayWithoutTime.getTime() &&
        ride.status === "completed"
      ) {
        Todaysearning += ride.fare || 0;
      }
    });

    setEarnings({ total: Totalearnings, today: Todaysearning });
    setRides({
      accepted: acceptedRides,
      cancelled: cancelledRides,
      distanceTravelled: Math.round(distanceTravelled / 1000),
    });
  };

  // ==========================================
  // EFECTOS
  // ==========================================

  useEffect(() => {
    if (captain._id) {
      socket.emit("join", {
        userId: captain._id,
        userType: "captain",
      });

      updateLocation();
    }

    socket.on("new-ride", (data) => {
      Console.log("🚗 Nuevo viaje disponible:", data);

      startNotificationLoop();

      setShowBtn("accept");
      setNewRide(data);
      setShowNewRidePanel(true);

      showToast.success("🚗 ¡Nuevo viaje disponible!");
    });

    socket.on("ride-cancelled", (data) => {
      Console.log("❌ Viaje cancelado", data);

      stopNotificationLoop();
      stopLocationTracking();

      updateLocation();
      clearRideData();

      showToast.error("❌ El pasajero canceló el viaje");
    });

    return () => {
      stopNotificationLoop();
      stopLocationTracking();
    };
  }, [captain]);

  useEffect(() => {
    if (!showNewRidePanel) {
      stopNotificationLoop();
    }
  }, [showNewRidePanel]);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    socket.emit("join-room", newRide._id);

    socket.on("receiveMessage", async (msg) => {
      setMessages((prev) => [...prev, { msg, by: "other" }]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [newRide]);

  useEffect(() => {
    localStorage.setItem("rideDetails", JSON.stringify(newRide));
  }, [newRide]);

  useEffect(() => {
    localStorage.setItem("showPanel", JSON.stringify(showNewRidePanel));
    localStorage.setItem("showBtn", JSON.stringify(showBtn));
  }, [showNewRidePanel, showBtn]);

  useEffect(() => {
    calculateEarnings();
  }, [captain]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="relative w-full h-screen bg-uber-extra-light-gray overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* BOTÓN DE SONIDO */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.button
            onClick={toggleSound}
            className={`absolute top-20 right-4 z-50 rounded-uber-lg p-3.5 shadow-uber-lg transition-all ${
              soundEnabled
                ? "bg-uber-green text-white"
                : "bg-white text-uber-medium-gray"
            }`}
            title={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {soundEnabled ? (
              <Volume2 className="w-6 h-6" />
            ) : (
              <VolumeX className="w-6 h-6" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* MAPA */}
      <iframe
        src={mapLocation}
        className="absolute inset-0 w-full h-full z-0"
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Mapa de ubicación del conductor"
      />

      {/* PANEL DE DASHBOARD DEL CONDUCTOR */}
      <AnimatePresence>
        {showCaptainDetailsPanel && !sidebarOpen && (
          <motion.div
            className="absolute bottom-0 w-full z-10 bg-white rounded-t-uber-3xl shadow-uber-xl p-6 space-y-5 max-h-[85vh] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* HEADER CON AVATAR */}
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Avatar
                src={captain?.profilePhoto}
                name={`${captain?.fullname?.firstname || ""} ${captain?.fullname?.lastname || ""}`}
                size="lg"
                showStatus={true}
                isOnline={captain?.status === "online"}
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-black">
                  {captain?.fullname?.firstname}{" "}
                  {captain?.fullname?.lastname}
                </h2>
                <p className="text-sm text-uber-medium-gray flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-uber-green" />
                  {captain?.status === "online"
                    ? "Disponible para viajes"
                    : "Fuera de línea"}
                </p>
              </div>
            </motion.div>

            {/* BOTÓN TOGGLE ONLINE/OFFLINE */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CaptainToggleButton
                isOnline={captain?.status === "online"}
                earnings={earnings}
                ridesCompleted={rides.accepted}
                onToggle={handleToggleOnline}
                loading={loading}
              />
            </motion.div>

            {/* TARJETAS DE GANANCIAS */}
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* GANANCIAS DE HOY */}
              <motion.div
                className="bg-gradient-to-br from-uber-green to-green-600 rounded-uber-xl p-4 shadow-uber"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-white/90 font-semibold uppercase">
                    Hoy
                  </p>
                </div>
                <motion.p
                  className="text-3xl font-bold text-white"
                  key={earnings.today}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  ${earnings.today.toLocaleString("es-CO")}
                </motion.p>
                <p className="text-xs text-white/80 mt-1">COP ganados hoy</p>
              </motion.div>

              {/* GANANCIAS TOTALES */}
              <motion.div
                className="bg-gradient-to-br from-black to-uber-dark-gray rounded-uber-xl p-4 shadow-uber"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-uber-green" />
                  </div>
                  <p className="text-xs text-white/90 font-semibold uppercase">
                    Total
                  </p>
                </div>
                <motion.p
                  className="text-3xl font-bold text-white"
                  key={earnings.total}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  ${earnings.total.toLocaleString("es-CO")}
                </motion.p>
                <p className="text-xs text-uber-light-gray mt-1">
                  COP acumulados
                </p>
              </motion.div>
            </motion.div>

            {/* ESTADÍSTICAS */}
            <motion.div
              className="grid grid-cols-3 gap-3 bg-uber-extra-light-gray rounded-uber-xl p-4 border-2 border-uber-light-gray"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 rounded-full bg-uber-green/10 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-uber-green" />
                </div>
                <motion.p
                  className="text-2xl font-bold text-black"
                  key={rides.accepted}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {rides.accepted}
                </motion.p>
                <p className="text-xs text-uber-medium-gray mt-1 font-medium">
                  Completados
                </p>
              </motion.div>

              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                  <Navigation className="w-6 h-6 text-blue-600" />
                </div>
                <motion.p
                  className="text-2xl font-bold text-black"
                  key={rides.distanceTravelled}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {rides.distanceTravelled}
                </motion.p>
                <p className="text-xs text-uber-medium-gray mt-1 font-medium">
                  Km recorridos
                </p>
              </motion.div>

              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-uber-red" />
                </div>
                <motion.p
                  className="text-2xl font-bold text-black"
                  key={rides.cancelled}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {rides.cancelled}
                </motion.p>
                <p className="text-xs text-uber-medium-gray mt-1 font-medium">
                  Cancelados
                </p>
              </motion.div>
            </motion.div>

            {/* INFO DEL VEHÍCULO */}
            <motion.div
              className="bg-gradient-to-r from-black to-uber-dark-gray rounded-uber-xl p-5 flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.01 }}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-uber-green" />
                  <p className="text-xs text-white/80 font-semibold uppercase">
                    Mi Vehículo
                  </p>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {captain?.vehicle?.plate ||
                    captain?.vehicle?.number ||
                    "N/A"}
                </h3>
                {captain?.vehicle?.model && (
                  <p className="text-sm text-uber-light-gray mb-2">
                    {captain.vehicle.model}
                  </p>
                )}
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <span className="capitalize">
                    {captain?.vehicle?.color || "Color"}
                  </span>
                  <span>•</span>
                  <span>
                    {captain?.vehicle?.capacity || 0}{" "}
                    {captain?.vehicle?.capacity === 1 ? "persona" : "personas"}
                  </span>
                </div>
              </div>

              <motion.img
                className="h-20 w-20 object-contain brightness-0 invert"
                src={
                  captain?.vehicle?.type === "car"
                    ? "/car.png"
                    : `/${captain?.vehicle?.type || "car"}.webp`
                }
                alt="Vehículo"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PANEL DE NUEVA OFERTA */}
      {!sidebarOpen && (
        <NewRide
          rideData={newRide}
          otp={otp}
          setOtp={setOtp}
          showBtn={showBtn}
          showPanel={showNewRidePanel}
          setShowPanel={setShowNewRidePanel}
          showPreviousPanel={setShowCaptainDetailsPanel}
          loading={loading}
          acceptRide={acceptRide}
          verifyOTP={verifyOTP}
          endRide={endRide}
          error={error}
        />
      )}
    </div>
  );
}

export default CaptainHomeScreen;
