import { Banknote, Smartphone, Check } from 'lucide-react';

/**
 * 💳 SELECTOR DE MÉTODO DE PAGO
 * Ubicación: Frontend/src/components/PaymentMethodSelector.jsx
 */

function PaymentMethodSelector({ selected, onChange }) {
  const methods = [
    { 
      id: 'cash', 
      name: 'Efectivo', 
      icon: Banknote, 
      color: 'green',
      description: 'Paga en efectivo al conductor'
    },
    { 
      id: 'nequi', 
      name: 'Nequi', 
      icon: Smartphone, 
      color: 'purple',
      description: 'Paga con tu cuenta Nequi'
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Método de pago</h3>
        <p className="text-sm text-gray-500">Selecciona cómo deseas pagar</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selected === method.id;
          
          return (
            <button
              key={method.id}
              onClick={() => onChange(method.id)}
              className={`relative p-6 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'border-black bg-gray-900 text-white shadow-xl'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-black" />
                </div>
              )}
              
              <Icon className={`w-10 h-10 mx-auto mb-3 ${
                isSelected 
                  ? 'text-white' 
                  : method.color === 'green' ? 'text-green-600' : 'text-purple-600'
              }`} />
              
              <p className={`text-base font-bold mb-1 ${
                isSelected ? 'text-white' : 'text-gray-900'
              }`}>
                {method.name}
              </p>
              
              <p className={`text-xs ${
                isSelected ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {method.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* INFO ADICIONAL */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs text-blue-800">
          {selected === 'cash' 
            ? '💵 Asegúrate de tener efectivo para pagar al conductor al finalizar el viaje.'
            : '📱 El pago se realizará a través de tu app Nequi al finalizar el viaje.'}
        </p>
      </div>
    </div>
  );
}

export default PaymentMethodSelector;