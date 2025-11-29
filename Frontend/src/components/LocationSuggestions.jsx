import { MapPin } from "lucide-react";
import Console from "../utils/console";

function LocationSuggestions({
  suggestions = [],
  setSuggestions,
  setPickupLocation,
  setDestinationLocation,
  input,
}) {
  return (
    <div>
      {suggestions.map((suggestion, index) => (
        <div
          onClick={() => {
            Console.log(suggestion);
            if (input == "pickup") {
              setPickupLocation(suggestion);
              setSuggestions([]);
            }
            if (input == "destination") {
              setDestinationLocation(suggestion);
              setSuggestions([]);
            }
          }}
          key={index}
          className="cursor-pointer flex items-center gap-2 border-b-2 last:border-b-0 py-3 border-gray-200"
        >
          <div className="bg-gray-100 p-2 rounded-full">
            <MapPin size={20} />
          </div>
          <div>
            <h2 className="text-sm font-semibold">{suggestion}</h2>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LocationSuggestions;