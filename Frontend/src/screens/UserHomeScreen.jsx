import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../contexts/UserContext";
import {
  ModernSearchBar,
  PriceOfferPanel,
  PaymentMethodSelector,
  ModernVehicleSelector,
  RideDetails,
  Sidebar,
} from "../components";
import axios from "axios";
import { SocketDataContext } from "../contexts/SocketContext";
import { DEFAULT_LOCATION } from "../utils/constants";
import Console from "../utils/console";
import showToast from "../utils/toast";
import { Navigation, MapPin, Clock } from "lucide-react";

/**
 * UserHomeScreen - Pantalla principal del usuario estilo Uber
 * Flujo completo de solicitud de viaje con animaciones profesionales
 */
function UserHomeScreen() {
  const token = localStorage.getItem("token");
  const { socket } = useContext(SocketDataContext);
  const { user } = useUser();

  // Estados de datos
  const [pickupLocation, setPickupLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [fare, setFare] = useState({ car: 0, bike: 0 });
  const [offeredPrice, setOfferedPrice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [confirmedRideData, setConfirmedRideData] = useState(null);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mapLocation, setMapLocation] = useState("");
  const [rideCreated, setRideCreated] = useState(false);

  // Estados de tracking en tiempo real
  const [captainLocation, setCaptainLocation] = useState(null);
  const [captainVehicleType, setCaptainVehicleType] = useState(null);
  const [eta, setEta] = useState(null);
  const [rideStatus, setRideStatus] = useState("");

  // Control de paneles
  const [currentPanel, setCurrentPanel] = useState("search");
  const rideTimeout = useRef(null);
  const mapIframeRef = useRef(null);

  // ==========================================
  // OBTENER COORDENADAS DESDE DIRECCIÓN
  // ==========================================
  const getCoordinatesFromAddress = async (address) => {
    try {
      if (address.includes(",") && !address.includes(" ")) {
        const [lat, lng] = address.split(",").map((coord) => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }

      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/map/get-coordinates`,
        {
          params: { address },
          headers: { token },
        }
      );

      if (response.data && response.data.lat && response.data.lng) {
        return { lat: response.data.lat, lng: response.data.lng };
      }

      return { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng };
    } catch (error) {
      console.error("Error obteniendo coordenadas:", error);
      return { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng };
    }
  };

  // ==========================================
  // BUSCAR TARIFA
  // ==========================================
  const handleSearchRide = async () => {
    Console.log("🔍 Buscando tarifa");

    try {
      setLoading(true);

      setMapLocation(
        `https://www.google.com/maps?q=${pickupLocation} to ${destinationLocation}&output=embed`
      );

      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/ride/get-fare`,
        {
          params: {
            pickup: pickupLocation,
            destination: destinationLocation,
          },
          headers: { token },
        }
      );

      Console.log("✅ Tarifa recibida:", response.data);
      setFare(response.data.fare);
      setCurrentPanel("vehicle");
      showToast.success("Tarifa calculada exitosamente");
    } catch (error) {
      Console.error("❌ Error al calcular tarifa:", error);
      showToast.error(
        "Error al calcular la tarifa. Verifica las direcciones."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CREAR VIAJE
  // ==========================================
  const createRide = async () => {
    Console.log("🚗 Creando viaje...");

    try {
      setLoading(true);

      const pickupCoords = await getCoordinatesFromAddress(pickupLocation);
      const destCoords = await getCoordinatesFromAddress(destinationLocation);

      Console.log("📍 Coordenadas obtenidas:", { pickupCoords, destCoords });

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/ride/create`,
        {
          pickup: pickupLocation,
          destination: destinationLocation,
          vehicleType: selectedVehicle,
          pickupCoordinates: pickupCoords,
          destinationCoordinates: destCoords,
          offeredPrice: offeredPrice,
          paymentMethod: paymentMethod,
        },
        {
          headers: { token },
        }
      );

      Console.log("✅ Viaje creado:", response.data);

      const rideData = {
        pickup: pickupLocation,
        destination: destinationLocation,
        vehicleType: selectedVehicle,
        fare: fare,
        offeredPrice: offeredPrice,
        paymentMethod: paymentMethod,
        _id: response.data._id,
      };

      localStorage.setItem("rideDetails", JSON.stringify(rideData));
      setRideCreated(true);
      setCurrentPanel("details");
      showToast.success("Viaje solicitado. Buscando conductor...");
    } catch (error) {
      Console.error("❌ Error al crear viaje:", error);
      showToast.error(
        error.response?.data?.message || "Error al crear el viaje"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CANCELAR VIAJE
  // ==========================================
  const cancelRide = async () => {
    const rideDetails = JSON.parse(localStorage.getItem("rideDetails"));

    if (!rideDetails || !rideDetails._id) {
      Console.error("No se encontraron detalles del viaje");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/ride/cancel`,
        {
          rideId: rideDetails._id,
          reason: "Cancelado por el usuario",
        },
        {
          headers: { token },
        }
      );

      Console.log("✅ Viaje cancelado");
      showToast.success("Viaje cancelado");

      setCaptainLocation(null);
      setCaptainVehicleType(null);
      setEta(null);
      setRideStatus("");
      setDefaults();
      localStorage.removeItem("rideDetails");
      updateLocation();
    } catch (error) {
      Console.error("❌ Error cancelando viaje:", error);
      showToast.error("Error al cancelar el viaje");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESETEAR TODO
  // ==========================================
  const setDefaults = () => {
    setPickupLocation("");
    setDestinationLocation("");
    setSelectedVehicle("car");
    setFare({ car: 0, bike: 0 });
    setOfferedPrice(null);
    setPaymentMethod("cash");
    setConfirmedRideData(null);
    setRideCreated(false);
    setCurrentPanel("search");
  };

  // ==========================================
  // ACTUALIZAR UBICACIÓN DEL MAPA
  // ==========================================
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
          setMapLocation(
            `https://www.google.com/maps?q=${DEFAULT_LOCATION.lat},${DEFAULT_LOCATION.lng}&output=embed`
          );
        }
      );
    }
  };

  // ==========================================
  // EFECTOS
  // ==========================================

  // Inicializar ubicación
  useEffect(() => {
    updateLocation();
  }, []);

  // Socket: Tracking en tiempo real
  useEffect(() => {
    if (!socket || !confirmedRideData) return;

    Console.log("🎯 Iniciando tracking en tiempo real");

    socket.on("captain-location-update", (data) => {
      Console.log("📍 Ubicación del conductor actualizada:", data);
      setCaptainLocation(data.location);
      setCaptainVehicleType(data.vehicleType);
    });

    socket.on("ride-eta-update", (data) => {
      Console.log("⏱️ ETA actualizado:", data);
      setEta(data.eta);
    });

    socket.on("ride-status-update", (data) => {
      Console.log("🔄 Estado actualizado:", data);
      setRideStatus(data.status);
    });

    return () => {
      socket.off("captain-location-update");
      socket.off("ride-eta-update");
      socket.off("ride-status-update");
    };
  }, [socket, confirmedRideData, rideStatus]);

  // Socket: Eventos del viaje
  useEffect(() => {
    if (!socket) return;

    if (user._id) {
      socket.emit("join", {
        userId: user._id,
        userType: "user",
      });
    }

    socket.on("ride-confirmed", (data) => {
      Console.log("✅ Viaje confirmado", data);
      clearTimeout(rideTimeout.current);
      setRideStatus("accepted");
      setConfirmedRideData(data);
      setRideCreated(false);
      showToast.success("¡Conductor encontrado!");
    });

    socket.on("ride-started", (data) => {
      Console.log("🚗 Viaje iniciado");
      setRideStatus("ongoing");
      setMapLocation(
        `https://www.google.com/maps?q=${data.pickup} to ${data.destination}&output=embed`
      );
      showToast.success("El viaje ha comenzado");
    });

    socket.on("ride-ended", () => {
      Console.log("🏁 Viaje finalizado");
      setCaptainLocation(null);
      setCaptainVehicleType(null);
      setEta(null);
      setRideStatus("");
      setDefaults();
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("messages");
      updateLocation();
      showToast.success("Viaje completado");
    });

    return () => {
      socket.off("ride-confirmed");
      socket.off("ride-started");
      socket.off("ride-ended");
    };
  }, [user, socket]);

  // ==========================================
  // HELPER
  // ==========================================
  const getVehicleIcon = (vehicleType) => {
    const icons = { car: "🚗", bike: "🏍️" };
    return icons[vehicleType] || "🚗";
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="relative w-full h-screen bg-uber-extra-light-gray overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* MAPA */}
      <iframe
        ref={mapIframeRef}
        src={mapLocation}
        className="absolute inset-0 w-full h-full z-0"
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Mapa de QuickRide"
      />

      {/* TRACKING INDICATOR */}
      <AnimatePresence>
        {!sidebarOpen &&
          (rideStatus === "accepted" || rideStatus === "ongoing") &&
          captainLocation && (
            <motion.div
              className="absolute top-20 left-1/2 z-30 bg-white rounded-uber-xl px-6 py-3 shadow-uber-xl flex items-center gap-3 border-2 border-uber-green"
              initial={{ y: -100, x: "-50%", opacity: 0 }}
              animate={{ y: 0, x: "-50%", opacity: 1 }}
              exit={{ y: -100, x: "-50%", opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-2xl">{getVehicleIcon(captainVehicleType)}</span>
              </motion.div>
              <div>
                <p className="text-xs text-uber-medium-gray font-semibold">
                  {rideStatus === "accepted"
                    ? "Tu conductor viene en camino"
                    : "En viaje"}
                </p>
                {eta && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-uber-green" />
                    <p className="text-lg font-bold text-uber-green">
                      {eta} {eta === 1 ? "minuto" : "minutos"}
                    </p>
                  </div>
                )}
              </div>
              <motion.div
                className="w-2 h-2 rounded-full bg-uber-green"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          )}
      </AnimatePresence>

      {/* PANELES CON ANIMATEPRESENCE */}
      <AnimatePresence mode="wait">
        {!sidebarOpen && (
          <>
            {/* PANEL 1: BÚSQUEDA */}
            {currentPanel === "search" && (
              <motion.div
                key="search"
                className="absolute bottom-0 w-full z-10 p-4 bg-white rounded-t-uber-3xl shadow-uber-xl"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                <ModernSearchBar
                  pickupLocation={pickupLocation}
                  setPickupLocation={setPickupLocation}
                  destinationLocation={destinationLocation}
                  setDestinationLocation={setDestinationLocation}
                  onSearch={handleSearchRide}
                  loading={loading}
                />
              </motion.div>
            )}

            {/* PANEL 2: VEHÍCULO */}
            {currentPanel === "vehicle" && (
              <motion.div
                key="vehicle"
                className="absolute bottom-0 w-full z-20 bg-white rounded-t-uber-3xl shadow-uber-xl p-6 max-h-[80vh] overflow-y-auto"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                <ModernVehicleSelector
                  selectedVehicle={selectedVehicle}
                  fare={fare}
                  onSelect={setSelectedVehicle}
                  estimatedTime={eta}
                />
                <div className="flex gap-3 mt-6">
                  <motion.button
                    onClick={() => setCurrentPanel("search")}
                    className="flex-1 py-4 border-2 border-uber-light-gray text-black rounded-uber-xl font-bold hover:bg-uber-extra-light-gray transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Atrás
                  </motion.button>
                  <motion.button
                    onClick={() => setCurrentPanel("price")}
                    className="flex-1 py-4 bg-black text-white rounded-uber-xl font-bold hover:bg-uber-dark-gray transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continuar
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* PANEL 3: PRECIO */}
            {currentPanel === "price" && (
              <PriceOfferPanel
                key="price"
                suggestedPrice={fare[selectedVehicle]}
                vehicleType={selectedVehicle}
                onPriceChange={setOfferedPrice}
                onConfirm={(price) => {
                  setOfferedPrice(price);
                  setCurrentPanel("payment");
                }}
                onBack={() => setCurrentPanel("vehicle")}
              />
            )}

            {/* PANEL 4: PAGO */}
            {currentPanel === "payment" && (
              <motion.div
                key="payment"
                className="absolute bottom-0 w-full z-20 bg-white rounded-t-uber-3xl shadow-uber-xl p-6"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                <PaymentMethodSelector
                  selected={paymentMethod}
                  onChange={setPaymentMethod}
                />
                <div className="flex gap-3 mt-6">
                  <motion.button
                    onClick={() => setCurrentPanel("price")}
                    className="flex-1 py-4 border-2 border-uber-light-gray text-black rounded-uber-xl font-bold hover:bg-uber-extra-light-gray transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Atrás
                  </motion.button>
                  <motion.button
                    onClick={createRide}
                    disabled={loading}
                    className="flex-1 py-4 bg-black text-white rounded-uber-xl font-bold hover:bg-uber-dark-gray disabled:bg-uber-medium-gray disabled:cursor-not-allowed transition-colors"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? "Creando..." : "Confirmar viaje"}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* PANEL 5: DETALLES */}
            {currentPanel === "details" && (
              <RideDetails
                key="details"
                pickupLocation={pickupLocation}
                destinationLocation={destinationLocation}
                selectedVehicle={selectedVehicle}
                fare={fare}
                showPanel={true}
                createRide={createRide}
                cancelRide={cancelRide}
                loading={loading}
                rideCreated={rideCreated}
                confirmedRideData={confirmedRideData}
                captainLocation={captainLocation}
                estimatedTime={eta}
                rideStatus={rideStatus}
                vehicleType={captainVehicleType}
              />
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserHomeScreen;
