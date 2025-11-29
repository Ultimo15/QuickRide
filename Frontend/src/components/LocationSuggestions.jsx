import { MapPin, Loader2 } from "lucide-react";
import Console from "../utils/console";

/**
 * Componente que muestra sugerencias de lugares desde Google Places API
 */
function LocationSuggestions({
  suggestions = [],
  setSuggestions,
  setPickupLocation,
  setDestinationLocation,
  input,
  isLoading = false,
}) {
  Console.log("🔍 Renderizando sugerencias:", suggestions.length);

  // Si está cargando
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Buscando lugares...</span>
      </div>
    );
  }

  // Si no hay sugerencias
  if (suggestions.length === 0) {
    Console.log("⚠️ No hay sugerencias para mostrar");
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
      {suggestions.map((suggestion, index) => {
        // Manejar tanto objetos de Google Places como strings simples
        const mainText = suggestion.structured_formatting?.main_text || suggestion.description || suggestion;
        const secondaryText = suggestion.structured_formatting?.secondary_text || "";
        const placeId = suggestion.place_id || `suggestion-${index}`;
        
        // ✅ Extraer la dirección completa como string
        const fullAddress = suggestion.description || suggestion;

        Console.log(`📍 Sugerencia ${index}:`, fullAddress);

        return (
          <div
            onClick={() => {
              Console.log("✅ Lugar seleccionado:", fullAddress);
              
              // ✅ Guardar solo el string de la dirección
              if (input === "pickup") {
                setPickupLocation(fullAddress);
                setSuggestions([]);
              }
              if (input === "destination") {
                setDestinationLocation(fullAddress);
                setSuggestions([]);
              }
            }}
            key={placeId}
            className="cursor-pointer flex items-start gap-3 border-b-2 last:border-b-0 py-3 px-4 hover:bg-blue-50 transition-colors border-gray-200"
          >
            <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
              <MapPin size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 truncate">
                {mainText}
              </h2>
              {secondaryText && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {secondaryText}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default LocationSuggestions;