import { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, X, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { DEFAULT_LOCATION } from '../utils/constants';

/**
 * 🎯 BARRA DE BÚSQUEDA MODERNA - Estilo Uber
 * Ubicación: Frontend/src/components/ModernSearchBar.jsx
 */

function ModernSearchBar({ 
  pickupLocation, 
  setPickupLocation,
  destinationLocation,
  setDestinationLocation,
  onSearch,
  loading = false 
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState('pickup');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const debounceTimer = useRef(null);
  const token = localStorage.getItem('token');

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
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounce para búsqueda
  const handleInputChange = (field, value) => {
    if (field === 'pickup') {
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
    if (activeInput === 'pickup') {
      setPickupLocation(suggestion);
    } else {
      setDestinationLocation(suggestion);
    }
    setSuggestions([]);
  };

  // Obtener ubicación actual
  const handleGetCurrentLocation = () => {
    setGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Usar coordenadas directamente
          setPickupLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
          setSuggestions([]);
          setGettingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback: usar ubicación predeterminada
          setPickupLocation(`${DEFAULT_LOCATION.city}, ${DEFAULT_LOCATION.country}`);
          setGettingLocation(false);
          alert('No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setGettingLocation(false);
      alert('Tu navegador no soporta geolocalización');
    }
  };

  // Limpiar input
  const handleClear = (field) => {
    if (field === 'pickup') {
      setPickupLocation('');
    } else {
      setDestinationLocation('');
    }
    setSuggestions([]);
  };

  return (
    <div className="w-full space-y-4">
      {/* TÍTULO */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">¿A dónde vas?</h2>
        {(pickupLocation || destinationLocation) && (
          <button
            onClick={() => {
              setPickupLocation('');
              setDestinationLocation('');
              setSuggestions([]);
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* CONTENEDOR DE INPUTS */}
      <div className="relative bg-white rounded-2xl shadow-lg border-2 border-gray-100">
        {/* Línea conectora entre inputs */}
        <div className="absolute left-6 top-[4.5rem] bottom-[4.5rem] w-0.5 bg-gradient-to-b from-blue-500 to-green-500 z-0" />

        {/* INPUT ORIGEN */}
        <div className="relative p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* Icono A */}
            <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">A</span>
            </div>

            {/* Input */}
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => handleInputChange('pickup', e.target.value)}
              onFocus={() => setActiveInput('pickup')}
              placeholder="Punto de recogida"
              className="flex-1 text-base font-medium text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            />

            {/* Botones de acción */}
            <div className="flex items-center gap-2">
              {pickupLocation && (
                <button
                  onClick={() => handleClear('pickup')}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
              
              {!pickupLocation && (
                <button
                  onClick={handleGetCurrentLocation}
                  disabled={gettingLocation}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {gettingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Mi ubicación</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* INPUT DESTINO */}
        <div className="relative p-4">
          <div className="flex items-center gap-3">
            {/* Icono B */}
            <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">B</span>
            </div>

            {/* Input */}
            <input
              type="text"
              value={destinationLocation}
              onChange={(e) => handleInputChange('destination', e.target.value)}
              onFocus={() => setActiveInput('destination')}
              placeholder="¿A dónde vas?"
              className="flex-1 text-base font-medium text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            />

            {/* Botón limpiar */}
            {destinationLocation && (
              <button
                onClick={() => handleClear('destination')}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SUGERENCIAS */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-h-80 overflow-y-auto">
          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <MapPin className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.split(',')[0]}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {suggestion.split(',').slice(1).join(',')}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BOTÓN BUSCAR */}
      {pickupLocation && destinationLocation && (
        <button
          onClick={onSearch}
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-xl font-semibold text-base hover:bg-gray-900 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Buscando...
            </span>
          ) : (
            'Buscar viaje'
          )}
        </button>
      )}
    </div>
  );
}

export default ModernSearchBar;