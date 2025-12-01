import { motion, AnimatePresence } from "framer-motion";
import { Power, Zap, CheckCircle, AlertCircle } from "lucide-react";

/**
 * 🔘 BOTÓN TOGGLE PARA CONDUCTOR - PROFESIONAL ESTILO UBER
 * Permite cambiar estado online/offline con animaciones y feedback visual
 */

function CaptainToggleButton({
  isOnline,
  earnings = { today: 0, total: 0 },
  ridesCompleted = 0,
  onToggle,
  loading = false,
}) {
  return (
    <motion.div
      className="relative bg-gradient-to-br from-black to-uber-dark-gray rounded-uber-2xl shadow-uber-xl p-6 overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      {/* EFECTO DE BRILLO ANIMADO */}
      <AnimatePresence>
        {isOnline && (
          <motion.div
            className="absolute -top-1/2 -right-1/2 w-full h-full bg-uber-green/10 rounded-full blur-3xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 space-y-5">
        {/* HEADER CON STATUS */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <motion.h3
              className="text-lg font-bold text-white mb-1.5"
              animate={isOnline ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isOnline ? "Estás disponible" : "Fuera de línea"}
            </motion.h3>
            <div className="flex items-center gap-2">
              <motion.div
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnline ? "bg-uber-green" : "bg-uber-medium-gray"
                }`}
                animate={
                  isOnline
                    ? {
                        scale: [1, 1.3, 1],
                        opacity: [1, 0.7, 1],
                      }
                    : {}
                }
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p
                className={`text-sm font-medium ${
                  isOnline ? "text-uber-green" : "text-uber-light-gray"
                }`}
              >
                {isOnline ? "Recibiendo viajes" : "No recibirás viajes"}
              </p>
            </div>
          </div>

          {/* TOGGLE SWITCH PROFESIONAL */}
          <motion.button
            onClick={onToggle}
            disabled={loading}
            className={`relative w-20 h-10 rounded-full transition-all shadow-uber ${
              isOnline ? "bg-uber-green" : "bg-uber-medium-gray"
            } ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:shadow-uber-lg"
            }`}
            whileHover={!loading ? { scale: 1.05 } : {}}
            whileTap={!loading ? { scale: 0.95 } : {}}
          >
            <motion.div
              className="absolute top-1 w-8 h-8 bg-white rounded-full shadow-uber flex items-center justify-center"
              animate={{
                x: isOnline ? 40 : 4,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, rotate: 0 }}
                    animate={{ opacity: 1, rotate: 360 }}
                    exit={{ opacity: 0 }}
                    transition={{ rotate: { duration: 1, repeat: Infinity } }}
                  >
                    <Power className="w-4 h-4 text-uber-medium-gray" />
                  </motion.div>
                ) : (
                  <motion.div
                    key={isOnline ? "on" : "off"}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Power
                      className={`w-4 h-4 ${
                        isOnline ? "text-uber-green" : "text-uber-medium-gray"
                      }`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.button>
        </div>

        {/* MINI ESTADÍSTICAS (solo cuando está online) */}
        <AnimatePresence>
          {isOnline && (
            <motion.div
              className="flex items-center gap-4 p-3 bg-white/10 backdrop-blur-sm rounded-uber-lg border border-white/20"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-4 h-4 text-uber-green" />
                  <span className="text-xs text-white/70 font-semibold">
                    Hoy
                  </span>
                </div>
                <motion.p
                  className="text-lg font-bold text-white"
                  key={earnings.today}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  ${earnings.today?.toLocaleString("es-CO") || "0"}
                </motion.p>
              </div>

              <div className="w-px h-10 bg-white/20" />

              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle className="w-4 h-4 text-uber-green" />
                  <span className="text-xs text-white/70 font-semibold">
                    Viajes
                  </span>
                </div>
                <motion.p
                  className="text-lg font-bold text-white"
                  key={ridesCompleted}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {ridesCompleted}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MENSAJE DE ESTADO */}
        <motion.div
          className={`flex items-start gap-3 p-3.5 rounded-uber-lg border-2 ${
            isOnline
              ? "bg-uber-green/10 border-uber-green/30"
              : "bg-yellow-500/10 border-yellow-500/30"
          }`}
          animate={
            isOnline
              ? {}
              : {
                  borderColor: ["rgba(234, 179, 8, 0.3)", "rgba(234, 179, 8, 0.6)", "rgba(234, 179, 8, 0.3)"],
                }
          }
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isOnline ? (
            <CheckCircle className="w-5 h-5 text-uber-green flex-shrink-0 mt-0.5" />
          ) : (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            </motion.div>
          )}
          <div className="flex-1">
            <p
              className={`text-xs font-semibold leading-relaxed ${
                isOnline ? "text-uber-green" : "text-yellow-500"
              }`}
            >
              {isOnline
                ? "Estás recibiendo notificaciones de nuevos viajes. Mantén la app abierta para no perder oportunidades."
                : "Activa tu estado para comenzar a recibir solicitudes de viaje y ganar dinero."}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default CaptainToggleButton;
