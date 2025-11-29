import { useContext, useEffect, useState, useRef } from "react";
import map from "/map.png";
import axios from "axios";
import { useCaptain } from "../contexts/CaptainContext";
import { Phone, User, Volume2, VolumeX } from "lucide-react";
import { SocketDataContext } from "../contexts/SocketContext";
import { NewRide, Sidebar } from "../components";
import Console from "../utils/console";
import { useAlert } from "../hooks/useAlert";
import { Alert } from "../components";

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

  const { captain } = useCaptain();
  const { socket } = useContext(SocketDataContext);
  const [loading, setLoading] = useState(false);
  const { alert, showAlert, hideAlert } = useAlert();

  const [riderLocation, setRiderLocation] = useState({
    ltd: null,
    lng: null,
  });
  const [mapLocation, setMapLocation] = useState(
    `https://www.google.com/maps?q=${riderLocation.ltd},${riderLocation.lng}&output=embed`
  );
  const [earnings, setEarnings] = useState({
    total: 0,
    today: 0,
  });

  const [rides, setRides] = useState({
    accepted: 0,
    cancelled: 0,
    distanceTravelled: 0,
  });
  const [newRide, setNewRide] = useState(
    JSON.parse(localStorage.getItem("rideDetails")) || defaultRideData
  );

  const [otp, setOtp] = useState("");
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("messages")) || []
  );
  const [error, setError] = useState("");

  // 🆕 REF PARA CONTROLAR EL INTERVALO DE UBICACIÓN
  const locationIntervalRef = useRef(null);

  // Paneles
  const [showCaptainDetailsPanel, setShowCaptainDetailsPanel] = useState(true);
  const [showNewRidePanel, setShowNewRidePanel] = useState(
    JSON.parse(localStorage.getItem("showPanel")) || false
  );
  const [showBtn, setShowBtn] = useState(
    JSON.parse(localStorage.getItem("showBtn")) || "accept"
  );

  // 🆕 Estado para controlar visibilidad del sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔊 Estados para sonido y vibración
  const notificationSound = useRef(null);
  const notificationInterval = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("soundEnabled") !== "false"
  );
  const [audioReady, setAudioReady] = useState(false);

  // 🔊 Inicializar sonido
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

  // 🔊 Función para reproducir sonido una vez
  const playSoundOnce = () => {
    if (soundEnabled && notificationSound.current) {
      notificationSound.current.currentTime = 0;
      notificationSound.current
        .play()
        .then(() => {
          Console.log("🔊 Sonido reproducido");
        })
        .catch((err) => {
          Console.log("⚠️ Error reproduciendo sonido:", err);
        });
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

  // 🔊 Iniciar bucle de notificación
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

  // 🔊 Detener bucle de notificación
  const stopNotificationLoop = () => {
    if (notificationInterval.current) {
      clearInterval(notificationInterval.current);
      notificationInterval.current = null;
      Console.log("⏹️ Bucle de notificación detenido");
    }
  };

  // 🔊 Toggle para activar/desactivar sonido
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("soundEnabled", String(newValue));
    Console.log(`🔊 Sonido ${newValue ? "activado" : "desactivado"}`);

    if (newValue && notificationSound.current) {
      notificationSound.current.play().catch((err) => {
        Console.log("Error probando sonido:", err);
      });
    }
  };

  const acceptRide = async () => {
    stopNotificationLoop();

    try {
      if (newRide._id != "") {
        setLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/ride/confirm`,
          { rideId: newRide._id },
          {
            headers: {
              token: token,
            },
          }
        );
        setLoading(false);
        setShowBtn("otp");
        setMapLocation(
          `https://www.google.com/maps?q=${riderLocation.ltd},${riderLocation.lng} to ${newRide.pickup}&output=embed`
        );
        
        // 🆕 INICIAR ENVÍO DE UBICACIÓN PERIÓDICA
        startLocationTracking();
        
        Console.log(response);
      }
    } catch (error) {
      setLoading(false);
      showAlert("Error", error.response.data.message, "failure");
      Console.log(error.response);
      setTimeout(() => {
        clearRideData();
      }, 1000);
    }
  };

  const verifyOTP = async () => {
    try {
      if (newRide._id != "" && otp.length == 6) {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/ride/start-ride?rideId=${newRide._id}&otp=${otp}`,
          {
            headers: {
              token: token,
            },
          }
        );
        setMapLocation(
          `https://www.google.com/maps?q=${riderLocation.ltd},${riderLocation.lng} to ${newRide.destination}&output=embed`
        );
        setShowBtn("end-ride");
        setLoading(false);
        
        // 🆕 NOTIFICAR CAMBIO DE ESTADO A "ongoing"
        socket.emit("ride-status-update", {
          rideId: newRide._id,
          status: "ongoing"
        });
        
        Console.log(response);
      }
    } catch (err) {
      setLoading(false);
      setError("Código OTP inválido");
      Console.log(err);
    }
  };

  const endRide = async () => {
    try {
      if (newRide._id != "") {
        setLoading(true);
        await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/ride/end-ride`,
          {
            rideId: newRide._id,
          },
          {
            headers: {
              token: token,
            },
          }
        );
        
        // 🆕 DETENER ENVÍO DE UBICACIÓN
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
        
        // 🆕 Recalcular ganancias después de finalizar viaje
        calculateEarnings();
      }
    } catch (err) {
      setLoading(false);
      Console.log(err);
    }
  };

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
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error("El usuario denegó el permiso de geolocalización.");
              break;
            case error.POSITION_UNAVAILABLE:
              console.error("La información de ubicación no está disponible.");
              break;
            case error.TIMEOUT:
              console.error("Se agotó el tiempo para obtener la ubicación.");
              break;
            default:
              console.error("Ocurrió un error desconocido.");
          }
        }
      );
    }
  };

  // 🆕 FUNCIÓN PARA ENVIAR UBICACIÓN EN TIEMPO REAL AL USUARIO
  const sendLocationToUser = () => {
    if (navigator.geolocation && newRide._id && newRide._id !== defaultRideData._id) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            rideId: newRide._id,
            location: {
              ltd: position.coords.latitude,
              lng: position.coords.longitude,
            },
            vehicleType: captain?.vehicle?.type || "car"
          };

          // Emitir ubicación al usuario a través del socket
          socket.emit("captain-location-update", locationData);
          
          // También calcular y enviar ETA
          calculateAndSendETA(position.coords.latitude, position.coords.longitude);
          
          Console.log("📍 Ubicación enviada al usuario:", locationData);
        },
        (error) => {
          Console.error("Error obteniendo ubicación para tracking:", error);
        }
      );
    }
  };

  // 🆕 CALCULAR Y ENVIAR ETA AL USUARIO
  const calculateAndSendETA = async (currentLat, currentLng) => {
    try {
      // Determinar el destino según el estado del viaje
      let destination = "";
      if (showBtn === "otp") {
        // Conductor va hacia el punto de recogida
        destination = newRide.pickup;
      } else if (showBtn === "end-ride") {
        // Conductor va hacia el destino final
        destination = newRide.destination;
      } else {
        return; // No hay viaje activo
      }

      // Llamar a la API para calcular distancia/tiempo
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/ride/get-fare?pickup=${currentLat},${currentLng}&destination=${destination}`,
        {
          headers: { token: token },
        }
      );

      if (response.data && response.data.duration) {
        const etaMinutes = Math.ceil(response.data.duration / 60);
        
        // Enviar ETA al usuario
        socket.emit("ride-eta-update", {
          rideId: newRide._id,
          eta: etaMinutes
        });
        
        Console.log(`⏱️ ETA enviado: ${etaMinutes} minutos`);
      }
    } catch (error) {
      Console.error("Error calculando ETA:", error);
    }
  };

  // 🆕 INICIAR TRACKING DE UBICACIÓN (cada 5 segundos)
  const startLocationTracking = () => {
    // Limpiar intervalo previo si existe
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
    }

    // Enviar ubicación inmediatamente
    sendLocationToUser();

    // Configurar intervalo de 5 segundos
    locationIntervalRef.current = setInterval(() => {
      sendLocationToUser();
    }, 5000);

    Console.log("🎯 Tracking de ubicación iniciado (cada 5 segundos)");
  };

  // 🆕 DETENER TRACKING DE UBICACIÓN
  const stopLocationTracking = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
      Console.log("⏹️ Tracking de ubicación detenido");
    }
  };

  const clearRideData = () => {
    stopNotificationLoop();
    
    // 🆕 DETENER TRACKING AL CANCELAR
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
      
      // 🆕 DETENER TRACKING SI EL VIAJE ES CANCELADO
      stopLocationTracking();
      
      updateLocation();
      clearRideData();
    });

    return () => {
      stopNotificationLoop();
      
      // 🆕 LIMPIAR TRACKING AL DESMONTAR
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

    captain.rides.forEach((ride) => {
      if (ride.status == "completed") {
        acceptedRides++;
        distanceTravelled += ride.distance;
      }
      if (ride.status == "cancelled") cancelledRides++;

      Totalearnings += ride.fare;
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
        Todaysearning += ride.fare;
      }
    });

    setEarnings({ total: Totalearnings, today: Todaysearning });
    setRides({
      accepted: acceptedRides,
      cancelled: cancelledRides,
      distanceTravelled: Math.round(distanceTravelled / 1000),
    });
  };

  useEffect(() => {
    calculateEarnings();
  }, [captain]);

  useEffect(() => {
    if (mapLocation.ltd && mapLocation.lng) {
      Console.log(mapLocation);
    }
  }, [mapLocation]);

  useEffect(() => {
    if (socket.id) Console.log("socket id:", socket.id);
  }, [socket.id]);

  return (
    <div
      className="relative w-full h-dvh bg-contain"
      style={{ backgroundImage: `url(${map})` }}
    >
      <Alert
        heading={alert.heading}
        text={alert.text}
        isVisible={alert.isVisible}
        onClose={hideAlert}
        type={alert.type}
      />
      
      {/* ✅ SIDEBAR SIN WRAPPER EXTRA + CONTROL DE ESTADO */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* 🔊 BOTÓN DE SONIDO - z-50 */}
      {/* 🔧 Se oculta cuando el sidebar está abierto */}
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

      {/* MAPA - z-0 */}
      <iframe
        src={mapLocation}
        className="map w-full h-[80vh] z-0"
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>

      {/* PANEL DE DETALLES DEL CONDUCTOR - z-10 */}
      {/* 🔧 Se oculta cuando el sidebar está abierto */}
      {showCaptainDetailsPanel && !sidebarOpen && (
        <div className="absolute bottom-0 flex flex-col justify-start p-4 gap-2 rounded-t-lg bg-white h-fit w-full z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="my-2 select-none rounded-full w-10 h-10 bg-blue-400 mx-auto flex items-center justify-center">
                <h1 className="text-lg text-white">
                  {captain?.fullname?.firstname[0]}
                  {captain?.fullname?.lastname[0]}
                </h1>
              </div>

              <div>
                <h1 className="text-lg font-semibold leading-6">
                  {captain?.fullname?.firstname} {captain?.fullname?.lastname}
                </h1>
                <p className="text-xs flex items-center gap-1 text-gray-500 ">
                  <Phone size={12} />
                  {captain?.phone}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 ">Ganancias</p>
              <h1 className="font-semibold">
                $ {earnings.today?.toLocaleString("es-CO")}
              </h1>
            </div>
          </div>

          <div className="flex justify-around items-center mt-2 py-4 rounded-lg bg-zinc-800">
            <div className="flex flex-col items-center text-white">
              <h1 className="mb-1 text-xl">{rides?.accepted}</h1>
              <p className="text-xs text-gray-400 text-center leading-3">
                Viajes
                <br />
                Aceptados
              </p>
            </div>
            <div className="flex flex-col items-center text-white">
              <h1 className="mb-1 text-xl">{rides?.distanceTravelled}</h1>
              <p className="text-xs text-gray-400 text-center leading-3">
                Km
                <br />
                Recorridos
              </p>
            </div>
            <div className="flex flex-col items-center text-white">
              <h1 className="mb-1 text-xl">{rides?.cancelled}</h1>
              <p className="text-xs text-gray-400 text-center leading-3">
                Viajes
                <br />
                Cancelados
              </p>
            </div>
          </div>

          <div className="flex justify-between border-2 items-center pl-3 py-2 rounded-lg">
            <div>
              <h1 className="text-lg font-semibold leading-6 tracking-tighter ">
                {captain?.vehicle?.number}
              </h1>
              <p className="text-xs text-gray-500 flex items-center">
                {captain?.vehicle?.color} |
                <User size={12} strokeWidth={2.5} /> {captain?.vehicle?.capacity}
              </p>
            </div>

            <img
              className="rounded-full h-16 scale-x-[-1]"
              src={
                captain?.vehicle?.type == "car"
                  ? "/car.png"
                  : `/${captain.vehicle.type}.webp`
              }
              alt="Foto del vehículo"
            />
          </div>
        </div>
      )}

      {/* ⭐ PANEL DE NUEVA OFERTA - z-20 (aparece sobre el panel de detalles) */}
      {/* 🔧 Se oculta cuando el sidebar está abierto */}
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