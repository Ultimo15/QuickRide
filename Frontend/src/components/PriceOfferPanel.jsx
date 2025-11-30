import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

/**
 * 💰 PANEL DE OFERTA DE PRECIO - Estilo InDriver
 * Ubicación: Frontend/src/components/PriceOfferPanel.jsx
 */

function PriceOfferPanel({ 
  suggestedPrice,
  vehicleType = 'car',
  onPriceChange,
  onConfirm,
  onBack 
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
          type: 'danger',
          message: 'Tu oferta es muy baja. Es probable que ningún conductor la acepte.',
        });
      } else if (offeredPrice < suggestedPrice * 0.7) {
        setPriceWarning({
          type: 'warning',
          message: 'Tu oferta es baja. Puede tomar más tiempo encontrar un conductor.',
        });
      } else if (offeredPrice > maxPrice) {
        setPriceWarning({
          type: 'info',
          message: 'Tu oferta es muy alta. Considera usar el precio sugerido.',
        });
      } else if (offeredPrice > suggestedPrice * 1.3) {
        setPriceWarning({
          type: 'info',
          message: 'Tu oferta es alta. Encontrarás conductor rápidamente.',
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
  }, [offeredPrice, useCustomPrice, suggestedPrice]);

  const handleSliderChange = (e) => {
    setOfferedPrice(parseInt(e.target.value));
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
      setOfferedPrice(0);
    } else {
      setOfferedPrice(parseInt(value));
    }
  };

  return (
    <div className="bg-white rounded-t-3xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Precio del viaje</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {vehicleType === 'car' ? '🚗 Carro' : '🏍️ Moto'}
        </span>
      </div>

      {/* PRECIO SUGERIDO */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">Precio sugerido</span>
          <span className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded-full">
            Recomendado
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <DollarSign className="w-6 h-6 text-blue-600" />
          <span className="text-4xl font-bold text-blue-900">
            {suggestedPrice.toLocaleString('es-CO')}
          </span>
          <span className="text-lg text-blue-700">COP</span>
        </div>
        <p className="text-xs text-blue-700 mt-2">
          Basado en la distancia y el tráfico actual
        </p>
      </div>

      {/* TOGGLE: USAR PRECIO PERSONALIZADO */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="font-medium text-gray-900">Ofertar mi propio precio</p>
          <p className="text-xs text-gray-500 mt-1">Tipo InDriver: tú decides cuánto pagar</p>
        </div>
        <button
          onClick={() => {
            setUseCustomPrice(!useCustomPrice);
            if (!useCustomPrice) {
              setOfferedPrice(suggestedPrice);
            }
          }}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            useCustomPrice ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <div
            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
              useCustomPrice ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* PANEL DE OFERTA PERSONALIZADA */}
      {useCustomPrice && (
        <div className="space-y-4 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          {/* Input de precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu oferta
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={offeredPrice === 0 ? '' : offeredPrice.toLocaleString('es-CO')}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-16 py-4 text-2xl font-bold text-gray-900 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                  COP
                </span>
              </div>
            </div>
          </div>

          {/* Slider */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>{(suggestedPrice * 0.5).toLocaleString('es-CO')}</span>
              <span className="font-medium text-blue-600">Sugerido: {suggestedPrice.toLocaleString('es-CO')}</span>
              <span>{(suggestedPrice * 2).toLocaleString('es-CO')}</span>
            </div>
            <input
              type="range"
              min={suggestedPrice * 0.5}
              max={suggestedPrice * 2}
              step={500}
              value={offeredPrice}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Indicador de diferencia */}
          <div className="flex items-center justify-center gap-2 py-3 px-4 bg-white rounded-xl">
            {isLowerPrice ? (
              <>
                <TrendingDown className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-600">
                  {Math.abs(priceDifference).toFixed(0)}% menos que el sugerido
                </span>
              </>
            ) : isHigherPrice ? (
              <>
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-600">
                  {priceDifference.toFixed(0)}% más que el sugerido
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-blue-600">
                Precio sugerido
              </span>
            )}
          </div>

          {/* Advertencias */}
          {priceWarning && (
            <div className={`flex items-start gap-3 p-4 rounded-xl ${
              priceWarning.type === 'danger' ? 'bg-red-50 border border-red-200' :
              priceWarning.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                priceWarning.type === 'danger' ? 'text-red-500' :
                priceWarning.type === 'warning' ? 'text-yellow-600' :
                'text-blue-500'
              }`} />
              <p className={`text-sm ${
                priceWarning.type === 'danger' ? 'text-red-700' :
                priceWarning.type === 'warning' ? 'text-yellow-700' :
                'text-blue-700'
              }`}>
                {priceWarning.message}
              </p>
            </div>
          )}
        </div>
      )}

      {/* BOTONES */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
        >
          Atrás
        </button>
        <button
          onClick={() => onConfirm(useCustomPrice ? offeredPrice : null)}
          disabled={useCustomPrice && offeredPrice < suggestedPrice * 0.5}
          className="flex-1 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          Continuar
        </button>
      </div>

      {/* INFO ADICIONAL */}
      <p className="text-xs text-center text-gray-500">
        {useCustomPrice
          ? 'Los conductores podrán aceptar o rechazar tu oferta'
          : 'Usarás el precio sugerido para tu viaje'}
      </p>
    </div>
  );
}

export default PriceOfferPanel;