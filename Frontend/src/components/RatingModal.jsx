import { useState } from "react";
import { Star, X } from "lucide-react";
import Button from "./Button";

/**
 * Modal para calificar un viaje completado
 * @param {boolean} isOpen - Controla si el modal está visible
 * @param {function} onClose - Callback para cerrar el modal
 * @param {function} onSubmit - Callback al enviar la calificación (stars, comment)
 * @param {object} rideData - Datos del viaje a calificar
 * @param {string} userType - "user" o "captain"
 */
function RatingModal({ isOpen, onClose, onSubmit, rideData, userType = "user" }) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      alert("Por favor selecciona una calificación");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(rating, comment.trim() || null);
      
      // Resetear formulario
      setRating(5);
      setComment("");
      onClose();
    } catch (error) {
      console.error("Error al enviar calificación:", error);
      alert("Error al enviar la calificación. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setRating(5);
    setComment("");
    onClose();
  };

  // Determinar quién está siendo calificado
  const ratedPerson = userType === "user" 
    ? rideData?.captain 
    : rideData?.user;

  const ratedPersonName = ratedPerson?.fullname
    ? `${ratedPerson.fullname.firstname} ${ratedPerson.fullname.lastname || ""}`
    : userType === "user" ? "tu conductor" : "el pasajero";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn">
        {/* Botón cerrar */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Encabezado */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Star className="w-8 h-8 text-blue-600" fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ¿Cómo estuvo tu viaje?
          </h2>
          <p className="text-sm text-gray-600">
            Califica tu experiencia con {ratedPersonName}
          </p>
        </div>

        {/* Información del viaje */}
        {rideData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
                  {ratedPerson?.fullname?.firstname?.[0] || "?"}
                  {ratedPerson?.fullname?.lastname?.[0] || ""}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{ratedPersonName}</p>
                  {userType === "user" && rideData.captain?.vehicle && (
                    <p className="text-xs text-gray-500">
                      {rideData.captain.vehicle.color} {rideData.captain.vehicle.type}
                      {rideData.captain.vehicle.plate && ` • ${rideData.captain.vehicle.plate}`}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">
                  ${rideData.finalPrice?.toLocaleString('es-CO') || rideData.fare?.toLocaleString('es-CO')}
                </p>
                {rideData.distance && (
                  <p className="text-xs text-gray-500">
                    {(rideData.distance / 1000).toFixed(1)} km
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Estrellas de calificación */}
        <div className="mb-6">
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  size={40}
                  className={`transition-colors ${
                    star <= (hoveredRating || rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill={star <= (hoveredRating || rating) ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600">
            {rating === 5 && "¡Excelente!"}
            {rating === 4 && "Muy bueno"}
            {rating === 3 && "Bueno"}
            {rating === 2 && "Regular"}
            {rating === 1 && "Necesita mejorar"}
          </p>
        </div>

        {/* Comentario opcional */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentario (opcional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            placeholder="Cuéntanos más sobre tu experiencia..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 text-right mt-1">
            {comment.length}/500 caracteres
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Omitir
          </button>
          <Button
            title="Enviar calificación"
            fun={handleSubmit}
            loading={loading}
            classes="flex-1"
          />
        </div>
      </div>
    </div>
  );
}

export default RatingModal;