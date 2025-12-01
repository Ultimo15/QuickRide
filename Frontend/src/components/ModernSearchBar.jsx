import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  X,
  ChevronRight,
  Loader2,
  ArrowDownUp,
} from "lucide-react";
import axios from "axios";
import { DEFAULT_LOCATION } from "../utils/constants";
import showToast from "../utils/toast";

/**
 * ModernSearchBar - Barra de búsqueda profesional estilo Uber
 * Permite buscar origen y destino con autocompletado y geolocalización
 */
function ModernSearchBar({
  pickupLocation,
  setPickupLocation,
  destinationLocation,
  setDestinationLocation,
  onSearch,
  loading = false,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState("pickup");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const debounceTimer = useRef(null);
  const token = localStorage.getItem("token");

  // Obtener sugerencias del backend
  const fetchSuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/map/get-suggestions?input=${query}`,
        { headers: { token } }
      );
      setSuggestions(response.data || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounce para búsqueda
  const handleInputChange = (field, value) => {
    if (field === "pickup") {
      setPickupLocation(value);
    } else {
      setDestinationLocation(value);
    }

    setActiveInput(field);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 500);
  };

  // Seleccionar sugerencia
  const handleSelectSuggestion = (suggestion) => {
    if (activeInput === "pickup") {
      setPickupLocation(suggestion);
    } else {
      setDestinationLocation(suggestion);
    }
    setSuggestions([]);
  };

  // Intercambiar origen y destino
  const handleSwap = () => {
    const temp = pickupLocation;
    setPickupLocation(destinationLocation);
    setDestinationLocation(temp);
  };

  // Obtener ubicación actual
  const handleGetCurrentLocation = () => {
    setGettingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Usar coordenadas directamente
          setPickupLocation(
            `${position.coords.latitude}, ${position.coords.longitude}`
          );
          setSuggestions([]);
          setGettingLocation(false);
          showToast.success("Ubicación obtenida exitosamente");
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback: usar ubicación predeterminada
          setPickupLocation(`${DEFAULT_LOCATION.city}, ${DEFAULT_LOCATION.country}`);
          setGettingLocation(false);
          showToast.error(
            "No se pudo obtener tu ubicación. Verifica los permisos del navegador."
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setGettingLocation(false);
      showToast.error("Tu navegador no soporta geolocalización");
    }
  };

  // Limpiar input
  const handleClear = (field) => {
    if (field === "pickup") {
      setPickupLocation("");
    } else {
      setDestinationLocation("");
    }
    setSuggestions([]);
  };

  return (
    <motion.div
      className="w-full space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* TÍTULO */}
      <div className="flex items-center justify-between">
        <motion.h2
          className="text-2xl font-bold text-black"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          ¿A dónde vas?
        </motion.h2>
        {(pickupLocation || destinationLocation) && (
          <motion.button
            onClick={() => {
              setPickupLocation("");
              setDestinationLocation("");
              setSuggestions([]);
            }}
            className="text-sm text-uber-green hover:text-uber-dark-green font-semibold transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Limpiar todo
          </motion.button>
        )}
      </div>

      {/* CONTENEDOR DE INPUTS */}
      <motion.div
        className="relative bg-white rounded-uber-xl shadow-uber-lg border border-uber-light-gray"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {/* Línea conectora entre inputs */}
        <div className="absolute left-[26px] sm:left-[30px] top-[4.5rem] bottom-[4.5rem] w-0.5 bg-gradient-to-b from-black via-uber-medium-gray to-uber-green z-0" />

        {/* INPUT ORIGEN */}
        <div className="relative p-3 sm:p-4 border-b border-uber-light-gray">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Icono A */}
            <motion.div
              className="relative z-10 flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black flex items-center justify-center shadow-uber"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-white font-bold text-xs sm:text-sm">A</span>
            </motion.div>

            {/* Input */}
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => handleInputChange("pickup", e.target.value)}
              onFocus={() => setActiveInput("pickup")}
              placeholder="Punto de recogida"
              className="flex-1 text-sm sm:text-base font-medium text-black placeholder-uber-medium-gray outline-none bg-transparent focus:placeholder-uber-light-gray transition-colors"
            />

            {/* Botones de acción */}
            <div className="flex items-center gap-2">
              {pickupLocation && (
                <motion.button
                  onClick={() => handleClear("pickup")}
                  className="p-1.5 hover:bg-uber-extra-light-gray rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-uber-medium-gray" />
                </motion.button>
              )}

              {!pickupLocation && (
                <motion.button
                  onClick={handleGetCurrentLocation}
                  disabled={gettingLocation}
                  className="flex items-center gap-2 px-3 py-1.5 bg-uber-extra-light-gray hover:bg-uber-light-gray text-black rounded-uber-lg transition-colors text-sm font-semibold disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {gettingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  <span className="hidden xs:inline text-xs sm:text-sm">Mi ubicación</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* BOTÓN SWAP (Intercambiar) */}
        {pickupLocation && destinationLocation && (
          <motion.button
            onClick={handleSwap}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white hover:bg-uber-extra-light-gray border-2 border-uber-light-gray rounded-full flex items-center justify-center shadow-uber transition-colors"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            <ArrowDownUp className="w-5 h-5 text-uber-medium-gray" />
          </motion.button>
        )}

        {/* INPUT DESTINO */}
        <div className="relative p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Icono B */}
            <motion.div
              className="relative z-10 flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-uber-green flex items-center justify-center shadow-uber"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-white font-bold text-xs sm:text-sm">B</span>
            </motion.div>

            {/* Input */}
            <input
              type="text"
              value={destinationLocation}
              onChange={(e) => handleInputChange("destination", e.target.value)}
              onFocus={() => setActiveInput("destination")}
              placeholder="¿A dónde vas?"
              className="flex-1 text-sm sm:text-base font-medium text-black placeholder-uber-medium-gray outline-none bg-transparent focus:placeholder-uber-light-gray transition-colors"
            />

            {/* Botón limpiar */}
            {destinationLocation && (
              <motion.button
                onClick={() => handleClear("destination")}
                className="p-1.5 hover:bg-uber-extra-light-gray rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-uber-medium-gray" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* SUGERENCIAS */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            className="bg-white rounded-uber-xl shadow-uber-xl border border-uber-light-gray overflow-hidden max-h-80 overflow-y-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {loadingSuggestions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-uber-green animate-spin" />
              </div>
            ) : (
              <div className="divide-y divide-uber-light-gray">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-uber-extra-light-gray transition-colors text-left group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-uber-extra-light-gray flex items-center justify-center group-hover:bg-uber-light-gray transition-colors">
                      <MapPin className="w-5 h-5 text-uber-medium-gray group-hover:text-uber-green transition-colors" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-black truncate">
                        {suggestion.split(",")[0]}
                      </p>
                      <p className="text-xs text-uber-medium-gray truncate">
                        {suggestion.split(",").slice(1).join(",")}
                      </p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-uber-light-gray group-hover:text-uber-green transition-colors" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTÓN BUSCAR */}
      <AnimatePresence>
        {pickupLocation && destinationLocation && (
          <motion.button
            onClick={onSearch}
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-uber-xl font-bold text-base hover:bg-uber-dark-gray transition-all disabled:bg-uber-medium-gray disabled:cursor-not-allowed shadow-uber-lg hover:shadow-uber-xl"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Buscando viaje...
              </span>
            ) : (
              "Buscar viaje"
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ModernSearchBar;
