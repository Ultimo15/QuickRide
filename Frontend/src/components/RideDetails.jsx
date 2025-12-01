import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  PhoneCall,
  MessageCircle,
  X,
  Navigation,
  Clock,
  User,
  Hash,
  CheckCircle,
} from "lucide-react";
import Button from "./Button";
import Avatar from "./Avatar";
import CarMarker from "../assets/icons/CarMarker";
import BikeMarker from "../assets/icons/BikeMarker";
import OriginPin from "../assets/icons/OriginPin";
import DestinationPin from "../assets/icons/DestinationPin";

/**
 * RideDetails - Panel de detalles del viaje con seguimiento en tiempo real
 * Muestra info del conductor, rutas, precio y acciones
 */
function RideDetails({
  pickupLocation,
  destinationLocation,
  selectedVehicle,
  fare,
  showPanel,
  setShowPanel,
  showPreviousPanel,
  createRide,
  cancelRide,
  loading,
  rideCreated,
  confirmedRideData,
  estimatedTime,
}) {
  const isSearching = rideCreated && !confirmedRideData;
  const hasDriver = confirmedRideData?._id;

  return (
    <AnimatePresence>
      {showPanel && (
        <motion.div
          className="absolute bottom-0 w-full bg-white rounded-t-uber-3xl shadow-uber-xl p-6 max-h-[85vh] overflow-y-auto"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          {/* CLOSE BUTTON */}
          <motion.button
            onClick={() => setShowPanel(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-uber-extra-light-gray hover:bg-uber-light-gray flex items-center justify-center transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5 text-uber-medium-gray" />
          </motion.button>

          {/* BUSCANDO CONDUCTOR */}
          {isSearching && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-4">
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-uber-green/10 mb-3"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 360],
                  }}
                  transition={{
                    scale: { duration: 2, repeat: Infinity },
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  }}
                >
                  <Navigation className="w-8 h-8 text-uber-green" />
                </motion.div>
                <h2 className="text-xl font-bold text-black mb-1">
                  Buscando conductor cercano
                </h2>
                <p className="text-sm text-uber-medium-gray">
                  Esto puede tomar unos segundos...
                </p>
              </div>
              <div className="overflow-hidden rounded-full h-1 bg-uber-light-gray">
                <motion.div
                  className="h-full bg-uber-green"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          )}

          {/* INFORMACIÓN DEL CONDUCTOR */}
          {hasDriver && (
            <motion.div
              className="mb-6 p-4 bg-gradient-to-br from-black to-uber-dark-gray rounded-uber-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <Avatar
                  src={confirmedRideData?.captain?.profilePhoto}
                  name={`${confirmedRideData?.captain?.fullname?.firstname} ${confirmedRideData?.captain?.fullname?.lastname}`}
                  size="lg"
                  showStatus={true}
                  isOnline={true}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">
                    {confirmedRideData?.captain?.fullname?.firstname}{" "}
                    {confirmedRideData?.captain?.fullname?.lastname}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-uber-light-gray font-medium flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5" />
                      {confirmedRideData?.captain?.vehicle?.number}
                    </span>
                    <span className="text-xs text-uber-light-gray">•</span>
                    <span className="text-sm text-uber-light-gray capitalize">
                      {confirmedRideData?.captain?.vehicle?.color}{" "}
                      {confirmedRideData?.captain?.vehicle?.type === "car"
                        ? "Carro"
                        : "Moto"}
                    </span>
                  </div>
                  {confirmedRideData?.captain?.vehicle?.model && (
                    <p className="text-xs text-uber-light-gray mt-0.5">
                      {confirmedRideData.captain.vehicle.model}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {selectedVehicle === "car" ? (
                    <CarMarker className="w-12 h-12 brightness-0 invert" />
                  ) : (
                    <BikeMarker className="w-12 h-12 brightness-0 invert" />
                  )}
                </div>
              </div>

              {/* OTP */}
              <motion.div
                className="bg-uber-green rounded-uber-lg p-3 flex items-center justify-between"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-black" />
                  <span className="text-sm font-semibold text-black">
                    Código de verificación (OTP)
                  </span>
                </div>
                <span className="text-2xl font-bold text-black tracking-wider">
                  {confirmedRideData?.otp}
                </span>
              </motion.div>

              {/* ACCIONES */}
              <div className="flex gap-2 mt-4">
                <motion.a
                  href={`/user/chat/${confirmedRideData?._id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white hover:bg-uber-extra-light-gray rounded-uber-lg font-semibold text-black transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat</span>
                </motion.a>
                <motion.a
                  href={`tel:${confirmedRideData?.captain?.phone}`}
                  className="flex items-center justify-center w-12 h-12 bg-white hover:bg-uber-extra-light-gray rounded-uber-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <PhoneCall className="w-5 h-5 text-black" />
                </motion.a>
              </div>
            </motion.div>
          )}

          {/* VEHÍCULO (solo cuando está buscando) */}
          {isSearching && (
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {selectedVehicle === "car" ? (
                <CarMarker className="w-24 h-24" />
              ) : (
                <BikeMarker className="w-24 h-24" />
              )}
            </motion.div>
          )}

          {/* DETALLES DEL VIAJE */}
          <motion.div
            className="space-y-3 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: hasDriver ? 0.3 : 0.2 }}
          >
            {/* ETA */}
            {estimatedTime && (
              <div className="flex items-center gap-3 p-3 bg-uber-extra-light-gray rounded-uber-lg">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-uber-green flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-uber-medium-gray font-medium">
                    Tiempo estimado
                  </p>
                  <p className="text-lg font-bold text-black">
                    {estimatedTime} minutos
                  </p>
                </div>
              </div>
            )}

            {/* ORIGEN */}
            <div className="flex items-start gap-3 p-3 bg-white border-2 border-uber-light-gray rounded-uber-lg">
              <OriginPin className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-uber-medium-gray font-semibold mb-0.5">
                  Punto de recogida
                </p>
                <h3 className="text-base font-bold text-black leading-tight">
                  {pickupLocation.split(", ")[0]}
                </h3>
                <p className="text-xs text-uber-medium-gray mt-0.5 truncate">
                  {pickupLocation.split(", ").slice(1).join(", ")}
                </p>
              </div>
            </div>

            {/* DESTINO */}
            <div className="flex items-start gap-3 p-3 bg-white border-2 border-uber-light-gray rounded-uber-lg">
              <DestinationPin className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-uber-medium-gray font-semibold mb-0.5">
                  Destino
                </p>
                <h3 className="text-base font-bold text-black leading-tight">
                  {destinationLocation.split(", ")[0]}
                </h3>
                <p className="text-xs text-uber-medium-gray mt-0.5 truncate">
                  {destinationLocation.split(", ").slice(1).join(", ")}
                </p>
              </div>
            </div>

            {/* PRECIO */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-uber-green/10 to-uber-green/5 border-2 border-uber-green rounded-uber-lg">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-uber-green flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-uber-medium-gray font-semibold mb-0.5">
                  Total a pagar
                </p>
                <p className="text-2xl font-bold text-black">
                  ${fare[selectedVehicle]?.toLocaleString("es-CO")}
                </p>
                <p className="text-xs text-uber-medium-gray">COP • Efectivo</p>
              </div>
            </div>
          </motion.div>

          {/* BOTÓN DE ACCIÓN */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: hasDriver ? 0.4 : 0.3 }}
          >
            {rideCreated || confirmedRideData ? (
              <Button
                title="Cancelar viaje"
                loading={loading}
                loadingMessage="Cancelando..."
                fun={cancelRide}
                variant="danger"
                size="lg"
                icon={<X className="w-5 h-5" />}
              />
            ) : (
              <Button
                title="Confirmar viaje"
                fun={createRide}
                loading={loading}
                loadingMessage="Confirmando..."
                variant="success"
                size="lg"
                icon={<CheckCircle className="w-5 h-5" />}
              />
            )}
          </motion.div>

          {/* INFO ADICIONAL */}
          {hasDriver && (
            <motion.p
              className="text-xs text-center text-uber-medium-gray mt-4 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Muestra el código OTP al conductor para confirmar tu viaje. No lo
              compartas con nadie más.
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RideDetails;
