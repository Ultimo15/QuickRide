import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useUser } from "../contexts/UserContext";
import map from "/map.png";
import {
  Button,
  LocationSuggestions,
  SelectVehicle,
  RideDetails,
  Sidebar,
} from "../components";
import axios from "axios";
import debounce from "lodash.debounce";
import { SocketDataContext } from "../contexts/SocketContext";
import Console from "../utils/console";

function UserHomeScreen() {
  const token = localStorage.getItem("token");
  const { socket } = useContext(SocketDataContext);
  const { user } = useUser();
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("messages")) || []
  );
  const [loading, setLoading] = useState(false);
  const [selectedInput, setSelectedInput] = useState("pickup");
  const [locationSuggestion, setLocationSuggestion] = useState([]);
  const [mapLocation, setMapLocation] = useState("");
  const [rideCreated, setRideCreated] = useState(false);

  // 🆕 ESTADOS PARA TRACKING EN TIEMPO REAL
  const [captainLocation, setCaptainLocation] = useState(null);
  const [captainVehicleType, setCaptainVehicleType] = useState(null);
  const [eta, setEta] = useState(null);
  const [rideStatus, setRideStatus] = useState(""); // 'accepted', 'ongoing', 'completed'
  const mapIframeRef = useRef(null);

  // Detalles del viaje
  const [pickupLocation, setPickupLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [fare, setFare] = useState({
    car: 0,
    bike: 0,
  });
  const [confirmedRideData, setConfirmedRideData] = useState(null);
  const rideTimeout = useRef(null);

  // Paneles
  const [showFindTripPanel, setShowFindTripPanel] = useState(true);
  const [showSelectVehiclePanel, setShowSelectVehiclePanel] = useState(false);
  const [showRideDetailsPanel, setShowRideDetailsPanel] = useState(false);

  const handleLocationChange = useCallback(
    debounce(async (inputValue, token) => {
      if (inputValue.length >= 3) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/map/get-suggestions?input=${inputValue}`,
            {
              headers: {
                token: token,
              },
            }
          );
          Console.log("✅ Sugerencias recibidas:", response.data);
          setLocationSuggestion(response.data);
        } catch (error) {
          Console.error("❌ Error al obtener sugerencias:", error);
        }
      }
    }, 700),
    []
  );

  const onChangeHandler = (e) => {
    setSelectedInput(e.target.id);
    const value = e.target.value;
    if (e.target.id === "pickup") {
      setPickupLocation(value);
    } else if (e.target.id === "destination") {
      setDestinationLocation(value);
    }

    handleLocationChange(value, token);

    if (e.target.value.length < 3) {
      setLocationSuggestion([]);
    }
  };

  const getDistanceAndFare = async (pickupLocation, destinationLocation) => {
    Console.log(pickupLocation, destinationLocation);
    try {
      setLoading(true);
      setMapLocation(
        `https://www.google.com/maps?q=${pickupLocation} to ${destinationLocation}&output=embed`
      );
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/ride/get-fare?pickup=${pickupLocation}&destination=${destinationLocation}`,
        {
          headers: {
            token: token,
          },
        }
      );
      Console.log(response);
      setFare(response.data.fare);

      setShowFindTripPanel(false);
      setShowSelectVehiclePanel(true);
      setLocationSuggestion([]);
      setLoading(false);
    } catch (error) {
      Console.log(error);
      setLoading(false);
      alert("Error al calcular la tarifa. Verifica que las direcciones estén en nuestra zona de cobertura.");
    }
  };

  const createRide = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/ride/create`,
        {
          pickup: pickupLocation,
          destination: destinationLocation,
          vehicleType: selectedVehicle,
        },
        {
          headers: {
            token: token,
          },
        }
      );
      Console.log(response);
      const rideData = {
        pickup: pickupLocation,
        destination: destinationLocation,
        vehicleType: selectedVehicle,
        fare: fare,
        confirmedRideData: confirmedRideData,
        _id: response.data._id,
      };
      localStorage.setItem("rideDetails", JSON.stringify(rideData));
      setLoading(false);
      setRideCreated(true);

      setShowRideDetailsPanel(true);
      setShowSelectVehiclePanel(false);
      setShowFindTripPanel(false);
    } catch (error) {
      Console.log(error);
      setLoading(false);
      alert("Error al crear el viaje. Verifica que las direcciones estén en nuestra zona de cobertura.");
    }
  };

  const cancelRide = async () => {
    const rideDetails = JSON.parse(localStorage.getItem("rideDetails"));
    
    if (!rideDetails || !rideDetails._id) {
      Console.error("No se encontraron detalles del viaje");
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/ride/cancel?rideId=${rideDetails._id}`,
        {
          headers: { token: token },
        }
      );
      
      Console.log("✅ Viaje cancelado:", response.data);
      
      // 🆕 Limpiar estados de tracking
      setCaptainLocation(null);
      setCaptainVehicleType(null);
      setEta(null);
      setRideStatus("");
      
      setShowRideDetailsPanel(false);
      setShowSelectVehiclePanel(false);
      setShowFindTripPanel(true);
      setDefaults();
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("panelDetails");
      
      setLoading(false);
      updateLocation();
    } catch (error) {
      Console.error("Error cancelando viaje:", error);
      setLoading(false);
      alert("Error al cancelar el viaje. Por favor, intenta de nuevo.");
    }
  };

  const setDefaults = () => {
    setPickupLocation("");
    setDestinationLocation("");
    setSelectedVehicle("car");
    setFare({
      car: 0,
      bike: 0,
    });
    setConfirmedRideData(null);
    setRideCreated(false);
  };

  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapLocation(
            `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}&output=embed`
          );
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
        }
      );
    }
  };

  useEffect(() => {
    updateLocation();
  }, []);

  // 🆕 EFECTO PARA TRACKING EN TIEMPO REAL
  useEffect(() => {
    if (!socket || !confirmedRideData) return;

    Console.log("🎯 Iniciando tracking en tiempo real para usuario");

    // Escuchar actualizaciones de ubicación del conductor
    socket.on("captain-location-update", (data) => {
      Console.log("📍 Ubicación del conductor actualizada:", data);
      
      setCaptainLocation(data.location);
      setCaptainVehicleType(data.vehicleType);

      // Actualizar mapa con la ubicación del conductor
      if (rideStatus === "accepted") {
        // Mostrar ruta del conductor hacia el punto de recogida
        setMapLocation(
          `https://www.google.com/maps/embed/v1/directions?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'}&origin=${data.location.ltd},${data.location.lng}&destination=${pickupLocation}&mode=driving`
        );
      } else if (rideStatus === "ongoing") {
        // Mostrar ruta hacia el destino
        setMapLocation(
          `https://www.google.com/maps/embed/v1/directions?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'}&origin=${data.location.ltd},${data.location.lng}&destination=${destinationLocation}&mode=driving`
        );
      }
    });

    // Escuchar actualizaciones de ETA
    socket.on("ride-eta-update", (data) => {
      Console.log("⏱️ ETA actualizado:", data);
      setEta(data.eta);
    });

    // Escuchar cambios de estado del viaje
    socket.on("ride-status-update", (data) => {
      Console.log("🔄 Estado del viaje actualizado:", data);
      setRideStatus(data.status);
    });

    return () => {
      socket.off("captain-location-update");
      socket.off("ride-eta-update");
      socket.off("ride-status-update");
    };
  }, [socket, confirmedRideData, rideStatus, pickupLocation, destinationLocation]);

  // Eventos Socket (ORIGINAL + MEJORAS)
  useEffect(() => {
    if (!socket) {
      Console.warn("⚠️ Socket no inicializado");
      return;
    }

    if (user._id) {
      socket.emit("join", {
        userId: user._id,
        userType: "user",
      });
    }

    socket.on("ride-confirmed", (data) => {
      Console.log("Limpiando timeout", rideTimeout);
      clearTimeout(rideTimeout.current);
      Console.log("Viaje confirmado", data);

      // 🆕 Establecer estado del viaje como "accepted"
      setRideStatus("accepted");

      setConfirmedRideData(data);
      setRideCreated(false);
      setShowRideDetailsPanel(true);
      setShowSelectVehiclePanel(false);
      setShowFindTripPanel(false);
    });

    socket.on("ride-started", (data) => {
      Console.log("Viaje iniciado");
      
      // 🆕 Cambiar estado a "ongoing"
      setRideStatus("ongoing");
      
      setMapLocation(
        `https://www.google.com/maps?q=${data.pickup} to ${data.destination}&output=embed`
      );
    });

    socket.on("ride-ended", () => {
      Console.log("✅ Viaje finalizado - Limpiando estados");
      
      // 🆕 Limpiar estados de tracking
      setCaptainLocation(null);
      setCaptainVehicleType(null);
      setEta(null);
      setRideStatus("");
      
      // Limpiar paneles
      setShowRideDetailsPanel(false);
      setShowSelectVehiclePanel(false);
      setShowFindTripPanel(true);
      
      // Limpiar datos del viaje
      setDefaults();
      
      // Limpiar localStorage
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("panelDetails");
      localStorage.removeItem("messages");
      
      // 🆕 IMPORTANTE: Actualizar ubicación del mapa al estado inicial
      updateLocation();
      
      Console.log("✅ Estados limpiados correctamente");
    });

    return () => {
      socket.off("ride-confirmed");
      socket.off("ride-started");
      socket.off("ride-ended");
    };
  }, [user, socket]);

  // Persistencia
  useEffect(() => {
    const storedRideDetails = localStorage.getItem("rideDetails");
    const storedPanelDetails = localStorage.getItem("panelDetails");

    if (storedRideDetails) {
      const ride = JSON.parse(storedRideDetails);
      setPickupLocation(ride.pickup);
      setDestinationLocation(ride.destination);
      setSelectedVehicle(ride.vehicleType);
      setFare(ride.fare);
      setConfirmedRideData(ride.confirmedRideData);
    }

    if (storedPanelDetails) {
      const panels = JSON.parse(storedPanelDetails);
      setShowFindTripPanel(panels.showFindTripPanel);
      setShowSelectVehiclePanel(panels.showSelectVehiclePanel);
      setShowRideDetailsPanel(panels.showRideDetailsPanel);
    }
  }, []);

  useEffect(() => {
    const rideData = {
      pickup: pickupLocation,
      destination: destinationLocation,
      vehicleType: selectedVehicle,
      fare: fare,
      confirmedRideData: confirmedRideData,
    };
    localStorage.setItem("rideDetails", JSON.stringify(rideData));
  }, [
    pickupLocation,
    destinationLocation,
    selectedVehicle,
    fare,
    confirmedRideData,
  ]);

  useEffect(() => {
    const panelDetails = {
      showFindTripPanel,
      showSelectVehiclePanel,
      showRideDetailsPanel,
    };
    localStorage.setItem("panelDetails", JSON.stringify(panelDetails));
  }, [showFindTripPanel, showSelectVehiclePanel, showRideDetailsPanel]);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!confirmedRideData?._id) return;

    socket.emit("join-room", confirmedRideData._id);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, { msg, by: "other" }]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [confirmedRideData, socket]);

  // 🆕 FUNCIÓN HELPER PARA OBTENER ÍCONO DEL VEHÍCULO
  const getVehicleIcon = (vehicleType) => {
    const icons = {
      car: "🚗",
      bike: "🏍️",
      auto: "🛺"
    };
    return icons[vehicleType] || "🚗";
  };

  return (
    <div
      className="relative w-full h-dvh bg-contain"
      style={{ backgroundImage: `url(${map})` }}
    >
      {/* ✅ SIDEBAR SIN WRAPPER EXTRA - CORRECCIÓN APLICADA */}
      <Sidebar />

      {/* MAPA - z-0 */}
      <iframe
        ref={mapIframeRef}
        src={mapLocation}
        className="absolute map w-full h-[120vh] z-0"
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>

      {/* 🆕 INDICADOR DE TRACKING EN TIEMPO REAL - z-30 */}
      {(rideStatus === "accepted" || rideStatus === "ongoing") && captainLocation && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 bg-white rounded-full px-6 py-3 shadow-lg flex items-center gap-3">
          <div className="animate-pulse">
            <span className="text-2xl">{getVehicleIcon(captainVehicleType)}</span>
          </div>
          <div>
            <p className="text-xs text-gray-600">
              {rideStatus === "accepted" ? "Tu conductor viene en camino" : "En viaje"}
            </p>
            {eta && (
              <p className="text-lg font-bold text-blue-600">
                {eta} {eta === 1 ? "minuto" : "minutos"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* PANEL DE BÚSQUEDA DE VIAJE - z-10 */}
      {showFindTripPanel && (
        <div className="absolute bottom-0 flex flex-col justify-start p-4 pb-2 gap-4 rounded-t-lg bg-white w-full z-10 max-h-[80vh]">
          <h1 className="text-2xl font-semibold">Buscar viaje</h1>
          <div className="flex items-center relative w-full h-fit">
            <div className="h-3/5 w-[3px] flex flex-col items-center justify-between bg-black rounded-full absolute mx-5">
              <div className="w-2 h-2 rounded-full border-[3px] bg-white border-black"></div>
              <div className="w-2 h-2 rounded-sm border-[3px] bg-white border-black"></div>
            </div>
            <div className="w-full">
              <input
                id="pickup"
                placeholder="Punto de recogida"
                className="w-full bg-zinc-100 pl-10 pr-4 py-3 rounded-lg outline-black text-sm mb-2 truncate"
                value={pickupLocation}
                onChange={onChangeHandler}
                autoComplete="off"
              />
              <input
                id="destination"
                placeholder="Destino"
                className="w-full bg-zinc-100 pl-10 pr-4 py-3 rounded-lg outline-black text-sm truncate"
                value={destinationLocation}
                onChange={onChangeHandler}
                autoComplete="off"
              />
            </div>
          </div>

          {/* ✅ SUGERENCIAS CON ALTURA FIJA Y SCROLL */}
          {locationSuggestion.length > 0 && (
            <div className="w-full max-h-60 overflow-y-auto">
              <LocationSuggestions
                suggestions={locationSuggestion}
                setSuggestions={setLocationSuggestion}
                setPickupLocation={setPickupLocation}
                setDestinationLocation={setDestinationLocation}
                input={selectedInput}
              />
            </div>
          )}

          {pickupLocation.length > 2 && destinationLocation.length > 2 && (
            <Button
              title={"Buscar"}
              loading={loading}
              fun={() => {
                getDistanceAndFare(pickupLocation, destinationLocation);
              }}
            />
          )}
        </div>
      )}

      {/* PANEL DE SELECCIÓN DE VEHÍCULO - z-10 */}
      <SelectVehicle
        selectedVehicle={setSelectedVehicle}
        showPanel={showSelectVehiclePanel}
        setShowPanel={setShowSelectVehiclePanel}
        showPreviousPanel={setShowFindTripPanel}
        showNextPanel={setShowRideDetailsPanel}
        fare={fare}
      />

      {/* PANEL DE DETALLES DEL VIAJE - z-10 */}
      <RideDetails
        pickupLocation={pickupLocation}
        destinationLocation={destinationLocation}
        selectedVehicle={selectedVehicle}
        fare={fare}
        showPanel={showRideDetailsPanel}
        setShowPanel={setShowRideDetailsPanel}
        showPreviousPanel={setShowSelectVehiclePanel}
        createRide={createRide}
        cancelRide={cancelRide}
        loading={loading}
        rideCreated={rideCreated}
        confirmedRideData={confirmedRideData}
        // 🆕 PROPS PARA TRACKING EN TIEMPO REAL
        captainLocation={captainLocation}
        eta={eta}
        rideStatus={rideStatus}
        vehicleType={captainVehicleType}
      />
    </div>
  );
}

export default UserHomeScreen;