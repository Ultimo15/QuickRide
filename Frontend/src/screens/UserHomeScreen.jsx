import { useCallback, useContext, useEffect, useRef, useState } from "react";
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

/**
 * 🏠 PANTALLA PRINCIPAL DEL USUARIO - REMODELADA
 * Ubicación: Frontend/src/screens/UserHomeScreen.jsx
 * 
 * Flujo moderno:
 * 1. Búsqueda de viaje (ModernSearchBar)
 * 2. Selección de vehículo (ModernVehicleSelector)
 * 3. Oferta de precio (PriceOfferPanel)
 * 4. Método de pago (PaymentMethodSelector)
 * 5. Confirmación y búsqueda de conductor
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
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("messages")) || []
  );

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

  // Control de paneles (solo uno visible a la vez)
  const [currentPanel, setCurrentPanel] = useState("search"); // search, vehicle, price, payment, details
  const rideTimeout = useRef(null);
  const mapIframeRef = useRef(null);

  // ==========================================
  // FUNCIÓN: OBTENER COORDENADAS DESDE DIRECCIÓN
  // ==========================================
  const getCoordinatesFromAddress = async (address) => {
    try {
      // Si ya son coordenadas (formato: "lat, lng"), las devolvemos
      if (address.includes(',') && !address.includes(' ')) {
        const [lat, lng] = address.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }

      // Si no, consultar al backend
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

      // Fallback: ubicación por defecto
      return { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng };
    } catch (error) {
      console.error("Error obteniendo coordenadas:", error);
      return { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng };
    }
  };

  // ==========================================
  // FUNCIÓN: BUSCAR TARIFA Y MOSTRAR PANEL DE VEHÍCULOS
  // ==========================================
  const handleSearchRide = async () => {
    Console.log("🔍 Buscando tarifa:", pickupLocation, destinationLocation);
    
    try {
      setLoading(true);
      
      // Actualizar mapa con la ruta
      setMapLocation(
        `https://www.google.com/maps?q=${pickupLocation} to ${destinationLocation}&output=embed`
      );

      // Obtener tarifa desde el backend
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
      setCurrentPanel("vehicle"); // Mostrar panel de vehículos
    } catch (error) {
      Console.error("❌ Error al calcular tarifa:", error);
      alert(
        "Error al calcular la tarifa. Verifica que las direcciones estén en nuestra zona de cobertura."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FUNCIÓN: CREAR VIAJE
  // ==========================================
  const createRide = async () => {
    Console.log("🚗 Creando viaje...");
    
    try {
      setLoading(true);

      // Obtener coordenadas de las direcciones
      const pickupCoords = await getCoordinatesFromAddress(pickupLocation);
      const destCoords = await getCoordinatesFromAddress(destinationLocation);

      Console.log("📍 Coordenadas obtenidas:", { pickupCoords, destCoords });

      // Crear viaje
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

      // Guardar datos del viaje
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
    } catch (error) {
      Console.error("❌ Error al crear viaje:", error);
      alert(
        error.response?.data?.message || 
        "Error al crear el viaje. Verifica que las direcciones estén en nuestra zona de cobertura."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FUNCIÓN: CANCELAR VIAJE
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

      // Limpiar estados
      setCaptainLocation(null);
      setCaptainVehicleType(null);
      setEta(null);
      setRideStatus("");
      setDefaults();
      localStorage.removeItem("rideDetails");
      updateLocation();
    } catch (error) {
      Console.error("❌ Error cancelando viaje:", error);
      alert("Error al cancelar el viaje. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FUNCIÓN: RESETEAR TODO
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
  // FUNCIÓN: ACTUALIZAR UBICACIÓN DEL MAPA
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
          // Fallback a San Antonio del Táchira
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

  // Inicializar ubicación del mapa
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
    });

    socket.on("ride-started", (data) => {
      Console.log("🚗 Viaje iniciado");
      setRideStatus("ongoing");
      setMapLocation(
        `https://www.google.com/maps?q=${data.pickup} to ${data.destination}&output=embed`
      );
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
    });

    return () => {
      socket.off("ride-confirmed");
      socket.off("ride-started");
      socket.off("ride-ended");
    };
  }, [user, socket]);

  // ==========================================
  // HELPER: ICONO DEL VEHÍCULO
  // ==========================================
  const getVehicleIcon = (vehicleType) => {
    const icons = { car: "🚗", bike: "🏍️" };
    return icons[vehicleType] || "🚗";
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
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
      />

      {/* INDICADOR DE TRACKING EN TIEMPO REAL */}
      {!sidebarOpen && (rideStatus === "accepted" || rideStatus === "ongoing") && captainLocation && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 bg-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="animate-pulse">
            <span className="text-2xl">{getVehicleIcon(captainVehicleType)}</span>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">
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

      {/* PANEL 1: BÚSQUEDA */}
      {currentPanel === "search" && !sidebarOpen && (
        <div className="absolute bottom-0 w-full z-10 p-4 bg-white rounded-t-3xl shadow-2xl">
          <ModernSearchBar
            pickupLocation={pickupLocation}
            setPickupLocation={setPickupLocation}
            destinationLocation={destinationLocation}
            setDestinationLocation={setDestinationLocation}
            onSearch={handleSearchRide}
            loading={loading}
          />
        </div>
      )}

      {/* PANEL 2: SELECCIÓN DE VEHÍCULO */}
      {currentPanel === "vehicle" && !sidebarOpen && (
        <div className="absolute bottom-0 w-full z-20 bg-white rounded-t-3xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
          <ModernVehicleSelector
            selectedVehicle={selectedVehicle}
            fare={fare}
            onSelect={setSelectedVehicle}
            estimatedTime={null}
          />
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setCurrentPanel("search")}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
            >
              Atrás
            </button>
            <button
              onClick={() => setCurrentPanel("price")}
              className="flex-1 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-900"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* PANEL 3: OFERTA DE PRECIO */}
      {currentPanel === "price" && !sidebarOpen && (
        <PriceOfferPanel
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

      {/* PANEL 4: MÉTODO DE PAGO */}
      {currentPanel === "payment" && !sidebarOpen && (
        <div className="absolute bottom-0 w-full z-20 bg-white rounded-t-3xl shadow-2xl p-6">
          <PaymentMethodSelector
            selected={paymentMethod}
            onChange={setPaymentMethod}
          />
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setCurrentPanel("price")}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
            >
              Atrás
            </button>
            <button
              onClick={createRide}
              disabled={loading}
              className="flex-1 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 disabled:bg-gray-400"
            >
              {loading ? "Creando..." : "Confirmar viaje"}
            </button>
          </div>
        </div>
      )}

      {/* PANEL 5: DETALLES DEL VIAJE */}
      {currentPanel === "details" && !sidebarOpen && (
        <RideDetails
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
          eta={eta}
          rideStatus={rideStatus}
          vehicleType={captainVehicleType}
        />
      )}
    </div>
  );
}

export default UserHomeScreen;