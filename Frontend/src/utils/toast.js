import toast from 'react-hot-toast';

/**
 * Utilidades para mostrar notificaciones Toast profesionales
 */

export const showToast = {
  // Toast de éxito
  success: (message, options = {}) => {
    return toast.success(message, {
      ...options,
      style: {
        ...options.style,
      },
    });
  },

  // Toast de error
  error: (message, options = {}) => {
    return toast.error(message, {
      ...options,
      style: {
        ...options.style,
      },
    });
  },

  // Toast de loading
  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...options,
    });
  },

  // Toast personalizado
  custom: (message, options = {}) => {
    return toast(message, {
      ...options,
    });
  },

  // Promesa con toast automático
  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Procesando...',
      success: messages.success || 'Completado!',
      error: messages.error || 'Algo salió mal',
    });
  },

  // Cerrar un toast específico
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  // Cerrar todos los toasts
  dismissAll: () => {
    toast.dismiss();
  },
};

// Mensajes predefinidos para acciones comunes
export const TOAST_MESSAGES = {
  // Viajes
  rideCreated: '🚗 Viaje solicitado exitosamente',
  rideAccepted: '✅ Viaje aceptado por conductor',
  rideStarted: '🏁 Viaje iniciado',
  rideCompleted: '🎉 Viaje completado',
  rideCancelled: '❌ Viaje cancelado',
  searchingDriver: '🔍 Buscando conductor disponible...',

  // Autenticación
  loginSuccess: '✅ Sesión iniciada exitosamente',
  logoutSuccess: '👋 Sesión cerrada',
  signupSuccess: '🎉 Cuenta creada exitosamente',
  profileUpdated: '✅ Perfil actualizado',

  // Errores
  networkError: '📡 Error de conexión. Verifica tu internet',
  serverError: '⚠️ Error del servidor. Intenta nuevamente',
  authError: '🔒 Sesión expirada. Inicia sesión nuevamente',
  locationError: '📍 No se pudo obtener tu ubicación',
  invalidOTP: '❌ Código OTP inválido',

  // Chat
  messageSent: '✅ Mensaje enviado',
  messageError: '❌ No se pudo enviar el mensaje',

  // Calificaciones
  ratingSubmitted: '⭐ Calificación enviada',

  // General
  saveSuccess: '✅ Guardado exitosamente',
  deleteSuccess: '🗑️ Eliminado exitosamente',
  copySuccess: '📋 Copiado al portapapeles',
};

export default showToast;
