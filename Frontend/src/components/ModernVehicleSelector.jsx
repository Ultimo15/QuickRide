import { Clock, Users, Check } from 'lucide-react';

/**
 * 🚗 SELECTOR DE VEHÍCULO MODERNO
 * Ubicación: Frontend/src/components/ModernVehicleSelector.jsx
 */

function ModernVehicleSelector({ 
  selectedVehicle, 
  fare, 
  onSelect, 
  estimatedTime 
}) {
  const vehicles = [
    {
      id: 'car',
      name: 'Carro',
      description: 'Cómodo y espacioso',
      image: '/car.png',
      capacity: 4,
      icon: '🚗',
      features: ['Aire acondicionado', 'Más espacio']
    },
    {
      id: 'bike',
      name: 'Moto',
      description: 'Rápido y económico',
      image: '/bike.webp',
      capacity: 1,
      icon: '🏍️',
      features: ['Más rápido', 'Evita el tráfico']
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">Elige tu vehículo</h3>
        <p className="text-sm text-gray-500">Selecciona el que mejor se adapte a ti</p>
      </div>
      
      <div className="space-y-3">
        {vehicles.map((vehicle) => {
          const isSelected = selectedVehicle === vehicle.id;
          const price = fare[vehicle.id] || 0;
          
          return (
            <button
              key={vehicle.id}
              onClick={() => onSelect(vehicle.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'border-black bg-gray-50 shadow-2xl scale-[1.02]'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
              }`}
            >
              {/* Icono del vehículo */}
              <div className={`relative flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center ${
                isSelected ? 'bg-black' : 'bg-gray-100'
              }`}>
                <span className="text-4xl">{vehicle.icon}</span>
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              {/* Info del vehículo */}
              <div className="flex-1 text-left">
                <h4 className="font-bold text-lg text-gray-900 mb-0.5">{vehicle.name}</h4>
                <p className="text-sm text-gray-500 mb-2">{vehicle.description}</p>
                
                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                {/* Info adicional */}
                <div className="flex items-center gap-3 mt-2">
                  {estimatedTime && (
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      {estimatedTime} min
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-gray-600">
                    <Users className="w-3 h-3" />
                    {vehicle.capacity} {vehicle.capacity === 1 ? 'persona' : 'personas'}
                  </span>
                </div>
              </div>
              
              {/* Precio */}
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-gray-900">
                  ${price.toLocaleString('es-CO')}
                </p>
                <p className="text-xs text-gray-500">COP</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* INFO DE PRECIOS */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-xs text-yellow-800">
          ℹ️ Los precios pueden variar según la distancia y el tráfico. El precio final se confirmará al finalizar el viaje.
        </p>
      </div>
    </div>
  );
}

export default ModernVehicleSelector;