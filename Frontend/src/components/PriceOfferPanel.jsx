import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Info,
} from "lucide-react";

/**
 * PriceOfferPanel - Panel de oferta de precio estilo InDriver
 * Permite al usuario ofertar su propio precio o usar el sugerido
 */
function PriceOfferPanel({
  suggestedPrice,
  vehicleType = "car",
  onPriceChange,
  onConfirm,
  onBack,
}) {
  const [offeredPrice, setOfferedPrice] = useState(suggestedPrice);
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [priceWarning, setPriceWarning] = useState(null);

  const priceDifference = ((offeredPrice - suggestedPrice) / suggestedPrice) * 100;
  const isLowerPrice = offeredPrice < suggestedPrice;
  const isHigherPrice = offeredPrice > suggestedPrice;

  useEffect(() => {
    if (useCustomPrice) {
      const minPrice = suggestedPrice * 0.5;
      const maxPrice = suggestedPrice * 2;

      if (offeredPrice < minPrice) {
        setPriceWarning({
          type: "danger",
          message: "Tu oferta es muy baja. Es probable que ningún conductor la acepte.",
        });
      } else if (offeredPrice < suggestedPrice * 0.7) {
        setPriceWarning({
          type: "warning",
          message: "Tu oferta es baja. Puede tomar más tiempo encontrar un conductor.",
        });
      } else if (offeredPrice > maxPrice) {
        setPriceWarning({
          type: "info",
          message: "Tu oferta es muy alta. Considera usar el precio sugerido.",
        });
      } else if (offeredPrice > suggestedPrice * 1.3) {
        setPriceWarning({
          type: "success",
          message: "¡Excelente oferta! Encontrarás conductor rápidamente.",
        });
      } else {
        setPriceWarning(null);
      }
    } else {
      setPriceWarning(null);
    }

    if (onPriceChange) {
      onPriceChange(useCustomPrice ? offeredPrice : null);
    }
  }, [offeredPrice, useCustomPrice, suggestedPrice, onPriceChange]);

  const handleSliderChange = (e) => {
    setOfferedPrice(parseInt(e.target.value));
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value === "") {
      setOfferedPrice(0);
    } else {
      setOfferedPrice(parseInt(value));
    }
  };

  return (
    <motion.div
      className="bg-white rounded-t-uber-3xl shadow-uber-xl p-6 space-y-6 max-h-[90vh] overflow-y-auto"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <motion.h2
          className="text-2xl font-bold text-black"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          Precio del viaje
        </motion.h2>
        <motion.span
          className="text-sm text-black font-semibold bg-uber-extra-light-gray px-3 py-1.5 rounded-uber-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          {vehicleType === "car" ? "🚗 Carro" : "🏍️ Moto"}
        </motion.span>
      </div>

      {/* PRECIO SUGERIDO */}
      <motion.div
        className="bg-gradient-to-br from-black to-uber-dark-gray rounded-uber-xl p-6 border-2 border-black"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">Precio sugerido</span>
          <span className="text-xs text-black bg-uber-green px-2.5 py-1 rounded-uber-md font-bold">
            Recomendado
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <DollarSign className="w-6 h-6 text-uber-green" />
          <motion.span
            className="text-4xl font-bold text-white"
            key={suggestedPrice}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
          >
            {suggestedPrice.toLocaleString("es-CO")}
          </motion.span>
          <span className="text-lg text-uber-light-gray">COP</span>
        </div>
        <p className="text-xs text-uber-light-gray mt-2 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Basado en la distancia y el tráfico actual
        </p>
      </motion.div>

      {/* TOGGLE: USAR PRECIO PERSONALIZADO */}
      <motion.div
        className="flex items-center justify-between p-4 bg-uber-extra-light-gray rounded-uber-xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div>
          <p className="font-bold text-black">Ofertar mi propio precio</p>
          <p className="text-xs text-uber-medium-gray mt-1">
            Tipo InDriver: tú decides cuánto pagar
          </p>
        </div>
        <motion.button
          onClick={() => {
            setUseCustomPrice(!useCustomPrice);
            if (!useCustomPrice) {
              setOfferedPrice(suggestedPrice);
            }
          }}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            useCustomPrice ? "bg-uber-green" : "bg-uber-medium-gray"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-uber"
            animate={{
              x: useCustomPrice ? 24 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        </motion.button>
      </motion.div>

      {/* PANEL DE OFERTA PERSONALIZADA */}
      <AnimatePresence>
        {useCustomPrice && (
          <motion.div
            className="space-y-4 p-6 bg-uber-extra-light-gray rounded-uber-xl border-2 border-dashed border-uber-medium-gray"
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Input de precio */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Tu oferta
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-uber-medium-gray" />
                  <input
                    type="text"
                    value={offeredPrice === 0 ? "" : offeredPrice.toLocaleString("es-CO")}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-16 py-4 text-2xl font-bold text-black bg-white border-2 border-uber-light-gray rounded-uber-lg focus:border-black focus:outline-none transition-colors"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-uber-medium-gray font-semibold">
                    COP
                  </span>
                </div>
              </div>
            </div>

            {/* Slider */}
            <div>
              <div className="flex justify-between text-xs text-uber-medium-gray mb-2 font-medium">
                <span>${(suggestedPrice * 0.5).toLocaleString("es-CO")}</span>
                <span className="font-bold text-uber-green">
                  Sugerido: ${suggestedPrice.toLocaleString("es-CO")}
                </span>
                <span>${(suggestedPrice * 2).toLocaleString("es-CO")}</span>
              </div>
              <input
                type="range"
                min={suggestedPrice * 0.5}
                max={suggestedPrice * 2}
                step={500}
                value={offeredPrice}
                onChange={handleSliderChange}
                className="w-full h-2 bg-uber-light-gray rounded-full appearance-none cursor-pointer accent-uber-green"
                style={{
                  background: `linear-gradient(to right, #00C853 0%, #00C853 ${
                    ((offeredPrice - suggestedPrice * 0.5) /
                      (suggestedPrice * 2 - suggestedPrice * 0.5)) *
                    100
                  }%, #E0E0E0 ${
                    ((offeredPrice - suggestedPrice * 0.5) /
                      (suggestedPrice * 2 - suggestedPrice * 0.5)) *
                    100
                  }%, #E0E0E0 100%)`,
                }}
              />
            </div>

            {/* Indicador de diferencia */}
            <motion.div
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white rounded-uber-lg shadow-uber"
              key={`diff-${priceDifference}`}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.3 }}
            >
              {isLowerPrice ? (
                <>
                  <TrendingDown className="w-5 h-5 text-uber-red" />
                  <span className="text-sm font-bold text-uber-red">
                    {Math.abs(priceDifference).toFixed(0)}% menos que el sugerido
                  </span>
                </>
              ) : isHigherPrice ? (
                <>
                  <TrendingUp className="w-5 h-5 text-uber-green" />
                  <span className="text-sm font-bold text-uber-green">
                    {priceDifference.toFixed(0)}% más que el sugerido
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-uber-green" />
                  <span className="text-sm font-bold text-black">Precio sugerido</span>
                </>
              )}
            </motion.div>

            {/* Advertencias */}
            <AnimatePresence>
              {priceWarning && (
                <motion.div
                  className={`flex items-start gap-3 p-4 rounded-uber-lg border-2 ${
                    priceWarning.type === "danger"
                      ? "bg-red-50 border-uber-red"
                      : priceWarning.type === "warning"
                      ? "bg-yellow-50 border-yellow-500"
                      : priceWarning.type === "success"
                      ? "bg-green-50 border-uber-green"
                      : "bg-blue-50 border-blue-500"
                  }`}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <AlertCircle
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      priceWarning.type === "danger"
                        ? "text-uber-red"
                        : priceWarning.type === "warning"
                        ? "text-yellow-600"
                        : priceWarning.type === "success"
                        ? "text-uber-green"
                        : "text-blue-500"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      priceWarning.type === "danger"
                        ? "text-red-700"
                        : priceWarning.type === "warning"
                        ? "text-yellow-700"
                        : priceWarning.type === "success"
                        ? "text-green-700"
                        : "text-blue-700"
                    }`}
                  >
                    {priceWarning.message}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTONES */}
      <motion.div
        className="flex gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          onClick={onBack}
          className="flex-1 py-4 border-2 border-uber-light-gray text-black rounded-uber-xl font-bold hover:bg-uber-extra-light-gray transition-all flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Atrás
        </motion.button>
        <motion.button
          onClick={() => onConfirm(useCustomPrice ? offeredPrice : null)}
          disabled={useCustomPrice && offeredPrice < suggestedPrice * 0.5}
          className="flex-1 py-4 bg-black text-white rounded-uber-xl font-bold hover:bg-uber-dark-gray transition-all disabled:bg-uber-medium-gray disabled:cursor-not-allowed shadow-uber-lg hover:shadow-uber-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continuar
        </motion.button>
      </motion.div>

      {/* INFO ADICIONAL */}
      <motion.p
        className="text-xs text-center text-uber-medium-gray leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {useCustomPrice
          ? "Los conductores podrán aceptar o rechazar tu oferta"
          : "Usarás el precio sugerido para tu viaje"}
      </motion.p>
    </motion.div>
  );
}

export default PriceOfferPanel;
