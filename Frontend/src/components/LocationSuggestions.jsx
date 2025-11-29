import { MapPin, Loader2 } from "lucide-react";
import Console from "../utils/console";

/**
 * Componente que muestra sugerencias de lugares desde Google Places API
 * Actualizado para trabajar con objetos de lugar completos en vez de solo strings
 */
function LocationSuggestions({
  suggestions = [],
  setSuggestions,
  setPickupLocation,
  setDestinationLocation,
  input,
  isLoading = false,
}) {
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
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
      {suggestions.map((suggestion, index) => {
        // Manejar tanto objetos de Google Places como strings simples
        const mainText = suggestion.structured_formatting?.main_text || suggestion.description || suggestion;
        const secondaryText = suggestion.structured_formatting?.secondary_text || "";
        const placeId = suggestion.place_id || `suggestion-${index}`;

        return (
          <div
            onClick={() => {
              Console.log("Lugar seleccionado:", suggestion);
              
              // Si es un objeto de Google Places, guardamos toda la info
              const locationData = {
                address: suggestion.description || suggestion,
                placeId: suggestion.place_id,
                mainText: mainText,
                secondaryText: secondaryText,
              };

              if (input === "pickup") {
                setPickupLocation(locationData);
                setSuggestions([]);
              }
              if (input === "destination") {
                setDestinationLocation(locationData);
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