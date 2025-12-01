import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Send, ThumbsUp, MessageSquare } from "lucide-react";
import Button from "./Button";
import Avatar from "./Avatar";
import showToast from "../utils/toast";

/**
 * RatingModal - Modal profesional para calificar viajes
 * Animaciones de estrellas y diseño Uber
 */
function RatingModal({ isOpen, onClose, onSubmit, rideData, userType = "user" }) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      showToast.error("Por favor selecciona una calificación");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(rating, comment.trim() || null);

      showToast.success(
        rating >= 4
          ? "¡Gracias por tu calificación positiva!"
          : "Gracias por tu retroalimentación"
      );

      // Resetear formulario
      setRating(5);
      setComment("");
      onClose();
    } catch (error) {
      console.error("Error al enviar calificación:", error);
      showToast.error("Error al enviar la calificación. Intenta de nuevo.");
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
  const ratedPerson = userType === "user" ? rideData?.captain : rideData?.user;

  const ratedPersonName = ratedPerson?.fullname
    ? `${ratedPerson.fullname.firstname} ${ratedPerson.fullname.lastname || ""}`
    : userType === "user"
    ? "tu conductor"
    : "el pasajero";

  // Mensajes según rating
  const ratingMessages = {
    5: "¡Excelente! ⭐",
    4: "Muy bueno 👍",
    3: "Bueno 👌",
    2: "Regular 😐",
    1: "Necesita mejorar 😕",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
          />

          {/* MODAL */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="bg-white rounded-uber-2xl shadow-uber-xl w-full max-w-md p-6 relative pointer-events-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* CLOSE BUTTON */}
              <motion.button
                onClick={handleSkip}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-uber-extra-light-gray hover:bg-uber-light-gray flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-uber-medium-gray" />
              </motion.button>

              {/* HEADER */}
              <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <motion.div
                  className="w-16 h-16 bg-uber-green/10 rounded-full mx-auto mb-4 flex items-center justify-center"
                  animate={{
                    scale: rating >= 4 ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Star
                    className="w-8 h-8 text-uber-green"
                    fill="currentColor"
                  />
                </motion.div>
                <h2 className="text-2xl font-bold text-black mb-2">
                  ¿Cómo estuvo tu viaje?
                </h2>
                <p className="text-sm text-uber-medium-gray">
                  Califica tu experiencia con {ratedPersonName}
                </p>
              </motion.div>

              {/* INFO DEL VIAJE */}
              {rideData && (
                <motion.div
                  className="bg-uber-extra-light-gray rounded-uber-lg p-4 mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={ratedPerson?.profilePhoto}
                        name={ratedPersonName}
                        size="md"
                      />
                      <div>
                        <p className="font-bold text-black">{ratedPersonName}</p>
                        {userType === "user" && rideData.captain?.vehicle && (
                          <p className="text-xs text-uber-medium-gray capitalize">
                            {rideData.captain.vehicle.color}{" "}
                            {rideData.captain.vehicle.type === "car"
                              ? "Carro"
                              : "Moto"}
                            {rideData.captain.vehicle.number &&
                              ` • ${rideData.captain.vehicle.number}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-black">
                        $
                        {rideData.finalPrice?.toLocaleString("es-CO") ||
                          rideData.fare?.toLocaleString("es-CO")}
                      </p>
                      {rideData.distance && (
                        <p className="text-xs text-uber-medium-gray">
                          {(rideData.distance / 1000).toFixed(1)} km
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ESTRELLAS */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex justify-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star, index) => {
                    const isActive = star <= (hoveredRating || rating);
                    return (
                      <motion.button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="focus:outline-none"
                        whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                        whileTap={{ scale: 0.9 }}
                        animate={
                          isActive && rating === star
                            ? {
                                scale: [1, 1.3, 1],
                                rotate: [0, 360, 0],
                              }
                            : {}
                        }
                        transition={{
                          scale: { duration: 0.3 },
                          rotate: { duration: 0.5 },
                        }}
                      >
                        <Star
                          size={44}
                          className={`transition-colors ${
                            isActive
                              ? "text-yellow-400"
                              : "text-uber-light-gray"
                          }`}
                          fill={isActive ? "currentColor" : "none"}
                          strokeWidth={isActive ? 0 : 2}
                        />
                      </motion.button>
                    );
                  })}
                </div>
                <motion.div
                  className="text-center"
                  key={rating}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-lg font-bold text-black">
                    {ratingMessages[rating]}
                  </p>
                </motion.div>
              </motion.div>

              {/* COMENTARIO */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-black mb-2">
                  <MessageSquare className="w-4 h-4 text-uber-medium-gray" />
                  Comentario (opcional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  placeholder="Cuéntanos más sobre tu experiencia..."
                  className="w-full px-4 py-3 border-2 border-uber-light-gray rounded-uber-lg focus:border-black focus:outline-none transition-colors resize-none text-black placeholder-uber-medium-gray"
                  rows={4}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-uber-medium-gray">
                    Tu opinión nos ayuda a mejorar
                  </p>
                  <p className="text-xs text-uber-medium-gray font-medium">
                    {comment.length}/500
                  </p>
                </div>
              </motion.div>

              {/* BOTONES */}
              <motion.div
                className="flex gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  onClick={handleSkip}
                  className="flex-1 px-4 py-3 border-2 border-uber-light-gray rounded-uber-xl font-bold text-black hover:bg-uber-extra-light-gray transition-colors disabled:opacity-50"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Omitir
                </motion.button>
                <div className="flex-1">
                  <Button
                    title="Enviar"
                    fun={handleSubmit}
                    loading={loading}
                    loadingMessage="Enviando..."
                    variant="success"
                    size="lg"
                    icon={<Send className="w-5 h-5" />}
                  />
                </div>
              </motion.div>

              {/* SUGERENCIAS RÁPIDAS (si rating < 4) */}
              {rating < 4 && (
                <motion.div
                  className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-uber-lg"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-xs text-yellow-800 font-medium">
                    💡 Ayúdanos a entender qué salió mal para mejorar el
                    servicio
                  </p>
                </motion.div>
              )}

              {/* CONFETTI EFFECT (si rating === 5) */}
              {rating === 5 && (
                <motion.div
                  className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, times: [0, 0.3, 1] }}
                >
                  <ThumbsUp className="w-8 h-8 text-uber-green" />
                </motion.div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default RatingModal;
