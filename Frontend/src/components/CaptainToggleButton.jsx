import { Power, DollarSign, TrendingUp, Clock } from 'lucide-react';

/**
 * 🔘 BOTÓN TOGGLE PARA CONDUCTOR (ON/OFF)
 * Ubicación: Frontend/src/components/CaptainToggleButton.jsx
 */

function CaptainToggleButton({ 
  isOnline, 
  earnings = { today: 0, total: 0 }, 
  ridesCompleted = 0,
  onToggle, 
  loading = false 
}) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 space-y-6">
      {/* HEADER CON STATUS */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Estado de conexión</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <p className={`text-sm font-medium ${
              isOnline ? 'text-green-600' : 'text-gray-500'
            }`}>
              {isOnline ? 'En línea - Recibiendo viajes' : 'Fuera de línea'}
            </p>
          </div>
        </div>
        
        {/* TOGGLE SWITCH */}
        <button
          onClick={onToggle}
          disabled={loading}
          className={`relative w-24 h-12 rounded-full transition-all ${
            isOnline ? 'bg-green-500' : 'bg-gray-300'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}`}
        >
          <div
            className={`absolute top-1 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center transition-transform ${
              isOnline ? 'translate-x-12' : 'translate-x-1'
            }`}
          >
            <Power className={`w-5 h-5 ${isOnline ? 'text-green-600' : 'text-gray-600'}`} />
          </div>
        </button>
      </div>
      
      {/* TARJETAS DE INFORMACIÓN */}
      <div className="grid grid-cols-2 gap-3">
        {/* Ganancias del día */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6" />
            <span className="text-xs bg-blue-400 bg-opacity-50 px-2 py-1 rounded-full">
              Hoy
            </span>
          </div>
          <p className="text-2xl font-bold mb-1">
            ${earnings.today?.toLocaleString('es-CO') || '0'}
          </p>
          <p className="text-xs text-blue-100">Ganancias del día</p>
        </div>

        {/* Viajes completados */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-6 h-6" />
            <span className="text-xs bg-green-400 bg-opacity-50 px-2 py-1 rounded-full">
              Hoy
            </span>
          </div>
          <p className="text-2xl font-bold mb-1">{ridesCompleted}</p>
          <p className="text-xs text-green-100">Viajes completados</p>
        </div>
      </div>

      {/* GANANCIAS TOTALES */}
      <div className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Ganancias totales</p>
              <p className="text-xl font-bold text-gray-900">
                ${earnings.total?.toLocaleString('es-CO') || '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* INSTRUCCIONES */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs text-blue-800 text-center">
          {isOnline 
            ? '✅ Estás recibiendo notificaciones de nuevos viajes. Mantén la app abierta.'
            : '⚠️ Activa tu estado para comenzar a recibir solicitudes de viaje.'}
        </p>
      </div>
    </div>
  );
}

export default CaptainToggleButton;