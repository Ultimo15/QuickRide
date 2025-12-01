import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  PhoneCall,
  MessageCircle,
  X,
  CheckCircle,
  Navigation,
  AlertCircle,
} from "lucide-react";
import Button from "./Button";
import Avatar from "./Avatar";
import OriginPin from "../assets/icons/OriginPin";
import DestinationPin from "../assets/icons/DestinationPin";

/**
 * NewRide - Panel del conductor para gestionar solicitudes de viaje
 * Permite aceptar/ignorar, verificar OTP y finalizar viajes
 */
function NewRide({
  rideData,
  otp,
  setOtp,
  showBtn,
  showPanel,
  setShowPanel,
  showPreviousPanel,
  loading,
  acceptRide,
  endRide,
  verifyOTP,
  error,
}) {
  const ignoreRide = () => {
    setShowPanel(false);
    showPreviousPanel(true);
  };

  const userName = `${rideData?.user?.fullname?.firstname || ""} ${rideData?.user?.fullname?.lastname || ""}`;

  return (
    <AnimatePresence>
      {showPanel && (
        <motion.div
          className="absolute bottom-0 w-full bg-white rounded-t-uber-3xl shadow-uber-xl p-6 z-20 max-h-[85vh] overflow-y-auto"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          {/* CLOSE BUTTON */}
          <motion.button
            onClick={ignoreRide}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-uber-extra-light-gray hover:bg-uber-light-gray flex items-center justify-center transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5 text-uber-medium-gray" />
          </motion.button>

          {/* HEADER: INFO DEL PASAJERO */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <Avatar
                src={rideData?.user?.profilePhoto}
                name={userName}
                size="lg"
              />
              <div className="flex-1">
                <h1 className="text-xl font-bold text-black leading-tight">
                  {userName}
                </h1>
                <p className="text-sm text-uber-medium-gray mt-0.5">
                  {rideData?.user?.phone || rideData?.user?.email}
                </p>
              </div>
              <div className="text-right">
                <motion.p
                  className="text-2xl font-bold text-uber-green"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  ${rideData?.fare?.toLocaleString("es-CO")}
                </motion.p>
                <p className="text-xs text-uber-medium-gray font-medium">
                  {(Number(rideData?.distance?.toFixed(2)) / 1000)?.toFixed(1)}{" "}
                  km
                </p>
              </div>
            </div>

            {/* ACCIONES: CHAT Y LLAMADA (solo después de aceptar) */}
            <AnimatePresence>
              {showBtn !== "accept" && (
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.a
                    href={`/captain/chat/${rideData?._id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-uber-extra-light-gray hover:bg-uber-light-gray rounded-uber-lg font-semibold text-black transition-colors text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Enviar mensaje</span>
                  </motion.a>
                  <motion.a
                    href={`tel:${rideData?.user?.phone}`}
                    className="flex items-center justify-center w-14 h-12 bg-uber-green hover:bg-green-600 rounded-uber-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <PhoneCall className="w-5 h-5 text-white" />
                  </motion.a>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* DETALLES DEL VIAJE */}
          <motion.div
            className="space-y-3 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* ORIGEN */}
            <motion.div
              className="flex items-start gap-3 p-3 bg-white border-2 border-uber-light-gray rounded-uber-lg"
              whileHover={{ borderColor: "#000" }}
              transition={{ duration: 0.2 }}
            >
              <OriginPin className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-uber-medium-gray font-semibold mb-0.5">
                  Punto de recogida
                </p>
                <h3 className="text-base font-bold text-black leading-tight">
                  {rideData.pickup.split(", ")[0]}
                </h3>
                <p className="text-xs text-uber-medium-gray mt-0.5 truncate">
                  {rideData.pickup.split(", ").slice(1).join(", ")}
                </p>
              </div>
            </motion.div>

            {/* DESTINO */}
            <motion.div
              className="flex items-start gap-3 p-3 bg-white border-2 border-uber-light-gray rounded-uber-lg"
              whileHover={{ borderColor: "#000" }}
              transition={{ duration: 0.2 }}
            >
              <DestinationPin className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-uber-medium-gray font-semibold mb-0.5">
                  Destino
                </p>
                <h3 className="text-base font-bold text-black leading-tight">
                  {rideData.destination.split(", ")[0]}
                </h3>
                <p className="text-xs text-uber-medium-gray mt-0.5 truncate">
                  {rideData.destination.split(", ").slice(1).join(", ")}
                </p>
              </div>
            </motion.div>

            {/* TARIFA */}
            <motion.div
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-uber-green/10 to-uber-green/5 border-2 border-uber-green rounded-uber-lg"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-uber-green flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-uber-medium-gray font-semibold mb-0.5">
                  Total del viaje
                </p>
                <p className="text-2xl font-bold text-black">
                  ${rideData.fare?.toLocaleString("es-CO")}
                </p>
                <p className="text-xs text-uber-medium-gray">COP • Efectivo</p>
              </div>
            </motion.div>
          </motion.div>

          {/* BOTONES DE ACCIÓN */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {showBtn === "accept" ? (
              // ESTADO 1: ACEPTAR O IGNORAR
              <div className="space-y-3">
                <motion.div
                  className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-uber-lg"
                  animate={{
                    borderColor: [
                      "rgba(250, 204, 21, 0.3)",
                      "rgba(250, 204, 21, 0.6)",
                      "rgba(250, 204, 21, 0.3)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  </motion.div>
                  <p className="text-xs text-yellow-800 font-medium">
                    Nueva solicitud de viaje. Acepta rápido para no perderla.
                  </p>
                </motion.div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={ignoreRide}
                    disabled={loading}
                    className="flex-1 py-4 border-2 border-uber-light-gray text-black rounded-uber-xl font-bold hover:bg-uber-extra-light-gray transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Ignorar
                  </motion.button>
                  <div className="flex-1">
                    <Button
                      title="Aceptar viaje"
                      fun={acceptRide}
                      loading={loading}
                      loadingMessage="Aceptando..."
                      variant="success"
                      size="lg"
                      icon={<CheckCircle className="w-5 h-5" />}
                    />
                  </div>
                </div>
              </div>
            ) : showBtn === "otp" ? (
              // ESTADO 2: VERIFICAR OTP
              <div className="space-y-4">
                <motion.div
                  className="p-4 bg-uber-green/10 border-2 border-uber-green rounded-uber-lg"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-5 h-5 text-uber-green" />
                    <p className="text-sm font-bold text-black">
                      Dirígete al punto de recogida
                    </p>
                  </div>
                  <p className="text-xs text-uber-medium-gray">
                    El pasajero te proporcionará un código OTP de 6 dígitos
                    cuando llegues. Ingrésalo para iniciar el viaje.
                  </p>
                </motion.div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Código OTP (6 dígitos)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    placeholder="000000"
                    className="w-full px-4 py-4 text-center text-3xl font-bold tracking-widest bg-uber-extra-light-gray border-2 border-uber-light-gray rounded-uber-lg focus:border-black focus:outline-none transition-colors"
                  />
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        className="text-uber-red text-xs mt-2 text-center font-medium flex items-center justify-center gap-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  title="Verificar OTP e iniciar viaje"
                  fun={verifyOTP}
                  loading={loading}
                  loadingMessage="Verificando..."
                  variant="success"
                  size="lg"
                  icon={<CheckCircle className="w-5 h-5" />}
                  disabled={otp.length !== 6}
                />
              </div>
            ) : (
              // ESTADO 3: FINALIZAR VIAJE
              <div className="space-y-4">
                <motion.div
                  className="p-4 bg-blue-50 border-2 border-blue-200 rounded-uber-lg"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-bold text-black">
                      Viaje en curso
                    </p>
                  </div>
                  <p className="text-xs text-blue-800">
                    Dirígete al destino de forma segura. Cuando llegues, pulsa
                    "Finalizar viaje" para completar el servicio.
                  </p>
                </motion.div>

                <Button
                  title="Finalizar viaje"
                  fun={endRide}
                  loading={loading}
                  loadingMessage="Finalizando..."
                  variant="success"
                  size="lg"
                  icon={<CheckCircle className="w-5 h-5" />}
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NewRide;
