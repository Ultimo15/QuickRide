import { useState, useEffect, useRef } from "react";
import { MapPin, X, Loader2 } from "lucide-react";

/**
 * Componente de búsqueda de lugares con autocompletado de Google Places
 * 
 * @param {string} placeholder - Texto del placeholder
 * @param {string} value - Valor actual del input
 * @param {function} onChange - Callback para actualizar el valor
 * @param {function} onPlaceSelect - Callback cuando se selecciona un lugar
 * @param {string} className - Clases CSS adicionales
 */

function LocationSearchInput({ 
  placeholder = "Buscar lugar...", 
  value = "", 
  onChange, 
  onPlaceSelect,
  className = "" 
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleMapsReady, setGoogleMapsReady] = useState(false);
  
  const inputRef = useRef(null);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const debounceTimer = useRef(null);

  // Verificar si Google Maps está cargado
  useEffect(() => {
    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setGoogleMapsReady(true);
        clearInterval(checkGoogleMaps);
        
        // Inicializar servicios
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        
        const dummyDiv = document.createElement("div");
        placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
        
        console.log("✅ Google Places API lista para usar");
      }
    }, 100);

    // Timeout de 10 segundos
    const timeout = setTimeout(() => {
      clearInterval(checkGoogleMaps);
      if (!googleMapsReady) {
        console.error("❌ Google Maps no se cargó en 10 segundos");
      }
    }, 10000);

    return () => {
      clearInterval(checkGoogleMaps);
      clearTimeout(timeout);
    };
  }, [googleMapsReady]);

  // Función para buscar sugerencias
  const searchPlaces = (input) => {
    if (!input || input.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!autocompleteService.current) {
      console.warn("⚠️ Autocomplete service no está listo aún");
      return;
    }

    setIsLoading(true);

    const request = {
      input: input,
      componentRestrictions: { country: "co" }, // Solo Colombia
      types: ["geocode", "establishment"]
    };

    autocompleteService.current.getPlacePredictions(
      request,
      (predictions, status) => {
        setIsLoading(false);

        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          console.log(`✅ ${predictions.length} sugerencias encontradas`);
          setSuggestions(predictions);
          setShowSuggestions(true);
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          console.log("⚠️ No se encontraron resultados");
          setSuggestions([]);
          setShowSuggestions(false);
        } else {
          console.error("❌ Error en búsqueda:", status);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    );
  };

  // Manejar cambios en el input con debounce
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchPlaces(newValue);
    }, 300);
  };

  // Manejar selección de sugerencia
  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);

    if (!placesService.current) {
      console.error("❌ Places service no disponible");
      return;
    }

    const request = {
      placeId: suggestion.place_id,
      fields: ["name", "formatted_address", "geometry", "place_id"]
    };

    placesService.current.getDetails(request, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        console.log("✅ Lugar seleccionado:", place.name);
        
        if (onPlaceSelect) {
          onPlaceSelect({
            address: place.formatted_address,
            name: place.name,
            placeId: place.place_id,
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          });
        }
      } else {
        console.error("❌ Error obteniendo detalles:", status);
      }
    });
  };

  // Limpiar input
  const handleClear = () => {
    onChange("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${className}`} ref={inputRef}>
      {/* Input de búsqueda */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (value.length >= 3 && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          disabled={!googleMapsReady}
          className="w-full pl-11 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        {/* Botón limpiar o loading */}
        {isLoading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
        ) : value ? (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        ) : null}
      </div>

      {/* Advertencia si Google Maps no está cargado */}
      {!googleMapsReady && value.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
          ⏳ Cargando Google Maps...
        </div>
      )}

      {/* Lista de sugerencias */}
      {googleMapsReady && showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === 0 ? "rounded-t-xl" : ""
              } ${index === suggestions.length - 1 ? "rounded-b-xl" : ""}`}
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {suggestion.structured_formatting.main_text}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {suggestion.structured_formatting.secondary_text}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mensaje de "no hay sugerencias" */}
      {googleMapsReady && showSuggestions && !isLoading && suggestions.length === 0 && value.length >= 3 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 text-center text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No se encontraron lugares</p>
          <p className="text-xs text-gray-400 mt-1">Intenta con otro término</p>
        </div>
      )}
    </div>
  );
}

export default LocationSearchInput;