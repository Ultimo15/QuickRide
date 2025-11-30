// ==========================================
// CONSTANTES GLOBALES - QUICKRIDE
// ==========================================

// ==========================================
// UBICACIÓN PREDETERMINADA
// ==========================================
export const DEFAULT_LOCATION = {
  // San Antonio del Táchira, Venezuela
  lat: 7.8144,
  lng: -72.4431,
  zoom: 14,
  city: 'San Antonio del Táchira',
  country: 'Venezuela'
};

// Radio de proximidad para notificación de llegada (en metros)
export const ARRIVAL_RADIUS = 50;

// ==========================================
// ICONOS DE MAPAS (URLs externas)
// ==========================================
export const MAP_ICONS = {
  // Marcador de ubicación del usuario/pasajero (Punto A)
  userLocation: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  
  // Marcador de destino (Punto B)
  destination: 'https://cdn-icons-png.flaticon.com/512/684/684809.png',
  
  // Vehículos en movimiento
  carIcon: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png',
  bikeIcon: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
  
  // Iconos para el panel
  pinIcon: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  flagIcon: 'https://cdn-icons-png.flaticon.com/512/3177/3177361.png',
  clockIcon: 'https://cdn-icons-png.flaticon.com/512/2838/2838779.png',
};

// ==========================================
// TIPOS DE VEHÍCULOS
// ==========================================
export const VEHICLE_TYPES = {
  CAR: 'car',
  BIKE: 'bike',
  // AUTO eliminado según requerimientos
};

export const VEHICLE_NAMES = {
  car: 'Carro',
  bike: 'Moto',
};

export const VEHICLE_IMAGES = {
  car: '/src/assets/images/car.png',
  bike: '/src/assets/images/bike.png',
};

// ==========================================
// MÉTODOS DE PAGO
// ==========================================
export const PAYMENT_METHODS = {
  CASH: 'cash',
  NEQUI: 'nequi',
};

export const PAYMENT_METHOD_LABELS = {
  cash: 'Efectivo',
  nequi: 'Nequi',
};

// ==========================================
// ESTADOS DE VIAJE
// ==========================================
export const RIDE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const RIDE_STATUS_LABELS = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  ongoing: 'En curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

// ==========================================
// ESTADO DEL CAPITÁN
// ==========================================
export const CAPTAIN_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
};

// ==========================================
// NOTIFICACIONES DE SONIDO
// ==========================================
export const SOUND_NOTIFICATIONS = {
  newMessage: '/sounds/message-notification.mp3',
  newRide: '/sounds/ride-notification.mp3',
  rideAccepted: '/sounds/ride-accepted.mp3',
  driverArrived: '/sounds/driver-arrived.mp3',
};

// ==========================================
// TIEMPOS Y LÍMITES
// ==========================================
export const TIMEOUTS = {
  rideRequest: 90000, // 90 segundos para que alguien acepte el viaje
  otpWait: 300000, // 5 minutos para ingresar OTP
  messageDebounce: 500, // Debounce para mensajes
  locationUpdate: 5000, // Actualización de ubicación cada 5 segundos
};

// ==========================================
// CALIFICACIONES
// ==========================================
export const RATING = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 5,
};

// ==========================================
// VALIDACIONES
// ==========================================
export const VALIDATION = {
  minPasswordLength: 6,
  maxPasswordLength: 50,
  minNameLength: 2,
  maxNameLength: 50,
  phoneLength: 10,
  otpLength: 4,
  maxCommentLength: 500,
  minPrice: 1000, // Precio mínimo en pesos colombianos
  maxPrice: 1000000, // Precio máximo
};

// ==========================================
// MENSAJES DE ERROR COMUNES
// ==========================================
export const ERROR_MESSAGES = {
  networkError: 'Error de conexión. Por favor verifica tu internet.',
  serverError: 'Error del servidor. Intenta nuevamente.',
  authError: 'Sesión expirada. Por favor inicia sesión nuevamente.',
  locationError: 'No se pudo obtener tu ubicación. Verifica los permisos.',
  invalidOTP: 'Código OTP inválido.',
  rideTimeout: 'No se encontró conductor disponible. Intenta nuevamente.',
  cancelError: 'No se pudo cancelar el viaje. Intenta nuevamente.',
};

// ==========================================
// MENSAJES DE ÉXITO
// ==========================================
export const SUCCESS_MESSAGES = {
  rideCreated: 'Viaje solicitado exitosamente',
  rideAccepted: 'Viaje aceptado',
  rideCompleted: 'Viaje completado',
  rideCancelled: 'Viaje cancelado',
  profileUpdated: 'Perfil actualizado exitosamente',
  ratingSubmitted: 'Calificación enviada',
};

// ==========================================
// CONFIGURACIÓN DE MAPA
// ==========================================
export const MAP_CONFIG = {
  defaultZoom: 14,
  minZoom: 10,
  maxZoom: 20,
  gestureHandling: 'greedy', // Permite usar el mapa con un dedo
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

// ==========================================
// REGEX PARA VALIDACIONES
// ==========================================
export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9]{10}$/,
  plate: /^[A-Z]{3}-[0-9]{3}$/, // Formato placa colombiana: ABC-123
  onlyLetters: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  onlyNumbers: /^[0-9]+$/,
};

// ==========================================
// CONFIGURACIÓN DE WEBSOCKET
// ==========================================
export const SOCKET_EVENTS = {
  // Eventos de conexión
  connect: 'connect',
  disconnect: 'disconnect',
  
  // Eventos de viajes
  newRide: 'new-ride',
  rideAccepted: 'ride-accepted',
  rideStarted: 'ride-started',
  rideCompleted: 'ride-completed',
  rideCancelled: 'ride-cancelled',
  
  // Eventos de ubicación
  locationUpdate: 'location-update',
  driverArrived: 'driver-arrived',
  
  // Eventos de chat
  newMessage: 'new-message',
  messageRead: 'message-read',
  
  // Eventos de capitán
  captainOnline: 'captain-online',
  captainOffline: 'captain-offline',
  
  // Eventos de logs
  log: 'log',
};

// ==========================================
// API ENDPOINTS (relativos al SERVER_URL)
// ==========================================
export const API_ENDPOINTS = {
  // Auth
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
  verifyEmail: '/api/auth/verify-email',
  forgotPassword: '/api/auth/forgot-password',
  
  // Users
  userProfile: '/api/users/profile',
  updateProfile: '/api/users/profile',
  
  // Captains
  captainProfile: '/api/captains/profile',
  toggleStatus: '/api/captains/toggle-status',
  
  // Rides
  createRide: '/api/rides/create',
  acceptRide: '/api/rides/accept',
  startRide: '/api/rides/start',
  completeRide: '/api/rides/complete',
  cancelRide: '/api/rides/cancel',
  rideHistory: '/api/rides/history',
  rateRide: '/api/rides/rate',
  
  // Maps
  getCoordinates: '/api/maps/get-coordinates',
  getDistanceTime: '/api/maps/get-distance-time',
  getSuggestions: '/api/maps/get-suggestions',
  
  // Chat
  getMessages: '/api/chat/messages',
  sendMessage: '/api/chat/send',
};

// ==========================================
// CLASES CSS COMUNES
// ==========================================
export const CSS_CLASSES = {
  button: {
    primary: 'bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition',
    secondary: 'bg-gray-200 text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition',
    danger: 'bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition',
    success: 'bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition',
  },
  input: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black',
  card: 'bg-white rounded-lg shadow-lg p-6',
};

// ==========================================
// EXPORTACIÓN POR DEFECTO
// ==========================================
export default {
  DEFAULT_LOCATION,
  ARRIVAL_RADIUS,
  MAP_ICONS,
  VEHICLE_TYPES,
  VEHICLE_NAMES,
  VEHICLE_IMAGES,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  RIDE_STATUS,
  RIDE_STATUS_LABELS,
  CAPTAIN_STATUS,
  SOUND_NOTIFICATIONS,
  TIMEOUTS,
  RATING,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  MAP_CONFIG,
  REGEX,
  SOCKET_EVENTS,
  API_ENDPOINTS,
  CSS_CLASSES,
};