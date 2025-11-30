import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, Check, Zap } from "lucide-react";
import CarMarker from "../assets/icons/CarMarker";
import BikeMarker from "../assets/icons/BikeMarker";

/**
 * ModernVehicleSelector - Selector de vehículo profesional estilo Uber
 * Permite elegir entre Carro y Moto con animaciones y diseño atractivo
 */
function ModernVehicleSelector({
  selectedVehicle,
  fare,
  onSelect,
  estimatedTime,
}) {
  const vehicles = [
    {
      id: "car",
      name: "Carro",
      description: "Cómodo y espacioso",
      icon: <CarMarker className="w-16 h-16" color="#000000" />,
      capacity: 4,
      emoji: "🚗",
      features: [
        { label: "Aire acondicionado", icon: null },
        { label: "Más espacio", icon: null },
      ],
    },
    {
      id: "bike",
      name: "Moto",
      description: "Rápido y económico",
      icon: <BikeMarker className="w-16 h-16" color="#000000" />,
      capacity: 1,
      emoji: "🏍️",
      features: [
        { label: "Más rápido", icon: <Zap className="w-3 h-3" /> },
        { label: "Evita el tráfico", icon: null },
      ],
    },
  ];

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* TÍTULO */}
      <div>
        <motion.h3
          className="text-2xl font-bold text-black mb-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          Elige tu vehículo
        </motion.h3>
        <motion.p
          className="text-sm text-uber-medium-gray"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          Selecciona el que mejor se adapte a ti
        </motion.p>
      </div>

      {/* TARJETAS DE VEHÍCULOS */}
      <div className="space-y-3">
        {vehicles.map((vehicle, index) => {
          const isSelected = selectedVehicle === vehicle.id;
          const price = fare[vehicle.id] || 0;

          return (
            <motion.button
              key={vehicle.id}
              onClick={() => onSelect(vehicle.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-uber-xl border-2 transition-all ${
                isSelected
                  ? "border-black bg-uber-extra-light-gray shadow-uber-xl"
                  : "border-uber-light-gray hover:border-uber-medium-gray hover:shadow-uber-lg bg-white"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
              whileHover={{ scale: isSelected ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* ICONO DEL VEHÍCULO */}
              <div
                className={`relative flex-shrink-0 w-20 h-20 rounded-uber-lg flex items-center justify-center transition-all ${
                  isSelected ? "bg-black" : "bg-uber-extra-light-gray"
                }`}
              >
                <div className={isSelected ? "brightness-0 invert" : ""}>
                  {vehicle.icon}
                </div>

                {/* CHECK ICON */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-7 h-7 bg-uber-green rounded-full flex items-center justify-center shadow-uber"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* INFO DEL VEHÍCULO */}
              <div className="flex-1 text-left">
                <h4 className="font-bold text-lg text-black mb-0.5">
                  {vehicle.name} {vehicle.emoji}
                </h4>
                <p className="text-sm text-uber-medium-gray mb-2">
                  {vehicle.description}
                </p>

                {/* FEATURES */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {vehicle.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2.5 py-1 rounded-uber-md flex items-center gap-1 ${
                        isSelected
                          ? "bg-black text-white"
                          : "bg-uber-light-gray text-uber-dark-gray"
                      }`}
                    >
                      {feature.icon}
                      {feature.label}
                    </span>
                  ))}
                </div>

                {/* INFO ADICIONAL */}
                <div className="flex items-center gap-3">
                  {estimatedTime && (
                    <span className="flex items-center gap-1 text-xs text-uber-medium-gray font-medium">
                      <Clock className="w-3.5 h-3.5 text-uber-green" />
                      {estimatedTime} min
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-uber-medium-gray font-medium">
                    <Users className="w-3.5 h-3.5 text-uber-medium-gray" />
                    {vehicle.capacity}{" "}
                    {vehicle.capacity === 1 ? "persona" : "personas"}
                  </span>
                </div>
              </div>

              {/* PRECIO */}
              <div className="text-right flex-shrink-0">
                <motion.div
                  key={`price-${vehicle.id}-${isSelected}`}
                  initial={{ scale: 1 }}
                  animate={isSelected ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className={`text-2xl font-bold ${
                    isSelected ? "text-uber-green" : "text-black"
                  }`}>
                    ${price.toLocaleString("es-CO")}
                  </p>
                  <p className="text-xs text-uber-medium-gray font-medium">COP</p>
                </motion.div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* INFO DE PRECIOS */}
      <motion.div
        className="bg-uber-light-gray/30 border border-uber-light-gray rounded-uber-lg p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs text-uber-dark-gray leading-relaxed">
          ℹ️ Los precios pueden variar según la distancia y el tráfico. El
          precio final se confirmará al finalizar el viaje.
        </p>
      </motion.div>
    </motion.div>
  );
}

export default ModernVehicleSelector;
