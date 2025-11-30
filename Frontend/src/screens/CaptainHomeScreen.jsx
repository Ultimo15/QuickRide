import { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { useCaptain } from "../contexts/CaptainContext";
import { Phone, User, Volume2, VolumeX, MapPin } from "lucide-react";
import { SocketDataContext } from "../contexts/SocketContext";
import { NewRide, Sidebar, CaptainToggleButton } from "../components";
import Console from "../utils/console";
import { useAlert } from "../hooks/useAlert";
import { Alert } from "../components";
import { DEFAULT_LOCATION } from "../utils/constants";

/**
 * 🚖 PANTALLA PRINCIPAL DEL CONDUCTOR - REMODELADA
 * Ubicación: Frontend/src/screens/CaptainHomeScreen.jsx
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
  const { alert, showAlert, hideAlert } = useAlert();

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
    } catch (error) {
      Console.error("❌ Error cambiando estado:", error);
      showAlert("Error", "No se pudo cambiar el estado", "failure");
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

        Console.log(response);
      }
    } catch (error) {
      setLoading(false);
      showAlert("Error", error.response?.data?.message || "Error aceptando viaje", "failure");
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

        Console.log(response);
      }
    } catch (err) {
      setLoading(false);
      setError("Código OTP inválido");
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
      }
    } catch (err) {
      setLoading(false);
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
          // Fallback a San Antonio del Táchira
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
    });

    socket.on("ride-cancelled", (data) => {
      Console.log("❌ Viaje cancelado", data);

      stopNotificationLoop();
      stopLocationTracking();

      updateLocation();
      clearRideData();
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
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
      <Alert
        heading={alert.heading}
        text={alert.text}
        isVisible={alert.isVisible}
        onClose={hideAlert}
        type={alert.type}
      />

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* BOTÓN DE SONIDO */}
      {!sidebarOpen && (
        <button
          onClick={toggleSound}
          className="absolute top-20 right-4 z-50 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all active:scale-95"
          title={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
        >
          {soundEnabled ? (
            <Volume2 className="w-6 h-6 text-green-600" />
          ) : (
            <VolumeX className="w-6 h-6 text-gray-400" />
          )}
        </button>
      )}

      {/* MAPA */}
      <iframe
        src={mapLocation}
        className="absolute inset-0 w-full h-full z-0"
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* PANEL DE DETALLES DEL CONDUCTOR */}
      {showCaptainDetailsPanel && !sidebarOpen && (
        <div className="absolute bottom-0 w-full z-10 p-4 bg-white rounded-t-3xl shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
          {/* BOTÓN TOGGLE ONLINE/OFFLINE */}
          <CaptainToggleButton
            isOnline={captain?.status === "online"}
            earnings={earnings}
            ridesCompleted={rides.accepted}
            onToggle={handleToggleOnline}
            loading={loading}
          />

          {/* ESTADÍSTICAS */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-2xl p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{rides.accepted}</p>
              <p className="text-xs text-gray-500 mt-1">Viajes Aceptados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{rides.distanceTravelled}</p>
              <p className="text-xs text-gray-500 mt-1">Km Recorridos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{rides.cancelled}</p>
              <p className="text-xs text-gray-500 mt-1">Cancelados</p>
            </div>
          </div>

          {/* INFO DEL VEHÍCULO */}
          <div className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {captain?.vehicle?.plate || captain?.vehicle?.number || "N/A"}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span className="capitalize">{captain?.vehicle?.color || "Color"}</span>
                <span>•</span>
                <User size={14} />
                <span>{captain?.vehicle?.capacity || 0} personas</span>
              </p>
            </div>

            <img
              className="h-16 w-16 object-contain"
              src={
                captain?.vehicle?.type === "car"
                  ? "/car.png"
                  : `/${captain?.vehicle?.type || "car"}.webp`
              }
              alt="Vehículo"
            />
          </div>
        </div>
      )}

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