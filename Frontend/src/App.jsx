import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import {
  GetStarted,
  UserLogin,
  CaptainLogin,
  UserHomeScreen,
  CaptainHomeScreen,
  UserProtectedWrapper,
  CaptainProtectedWrapper,
  UserSignup,
  CaptainSignup,
  RideHistory,
  UserEditProfile,
  CaptainEditProfile,
  Error,
  ChatScreen,
  VerifyEmail,
  ResetPassword,
  ForgotPassword
} from "./screens/";
import { logger } from "./utils/logger";
import { SocketDataContext } from "./contexts/SocketContext";
import { useEffect, useContext } from "react";
import { ChevronLeft, Trash2 } from "lucide-react";

function App() {
  // ============================================
  // 🆕 FUNCIÓN MEJORADA PARA RESET SEGURO
  // ============================================
  const handleResetApp = () => {
    const userConfirmed = window.confirm(
      "⚠️ ADVERTENCIA: Esta acción eliminará todos tus datos locales y cerrará tu sesión.\n\n" +
      "Esto incluye:\n" +
      "• Información de inicio de sesión\n" +
      "• Historial de viajes guardado\n" +
      "• Configuraciones personales\n\n" +
      "¿Estás seguro de que deseas continuar?"
    );

    if (userConfirmed) {
      try {
        // Limpiar localStorage
        localStorage.clear();
        
        // Limpiar sessionStorage también (por seguridad)
        sessionStorage.clear();
        
        console.log("✅ Datos locales eliminados correctamente");
        
        // Recargar la página
        window.location.href = "/";
      } catch (error) {
        console.error("❌ Error al resetear la app:", error);
        alert("Hubo un error al resetear la aplicación. Por favor, cierra y vuelve a abrir el navegador.");
      }
    } else {
      console.log("ℹ️ Reset cancelado por el usuario");
    }
  };

  return (
    <div className="w-full h-dvh flex items-center">
      <div className="relative w-full sm:min-w-96 sm:w-96 h-full bg-white overflow-hidden">
        {/* ============================================
            BOTÓN DE RESET DE EMERGENCIA
            - Aparece en el borde derecho (hover para mostrar)
            - Elimina todos los datos locales
            - Útil para debugging y solución de problemas
            ============================================ */}
        <div className="absolute top-36 -right-11 opacity-20 hover:opacity-100 z-50 flex items-center p-1 pl-0 gap-1 bg-zinc-50 border-2 border-r-0 border-gray-300 hover:-translate-x-11 rounded-l-md transition-all duration-300">
          <ChevronLeft />
          <button 
            className="flex justify-center items-center w-10 h-10 rounded-lg border-2 border-red-300 bg-red-200 text-red-500 hover:bg-red-300 transition-colors" 
            onClick={handleResetApp}
            title="Reset App (Eliminar todos los datos)"
          >
            <Trash2 strokeWidth={1.8} width={18} />
          </button>
        </div>

        <BrowserRouter>
          <LoggingWrapper />
          <Routes>
            {/* ============================================
                RUTAS PÚBLICAS
                ============================================ */}
            <Route path="/" element={<GetStarted />} />
            
            {/* ============================================
                RUTAS DE USUARIO
                ============================================ */}
            <Route
              path="/home"
              element={
                <UserProtectedWrapper>
                  <UserHomeScreen />
                </UserProtectedWrapper>
              }
            />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/signup" element={<UserSignup />} />
            <Route
              path="/user/edit-profile"
              element={
                <UserProtectedWrapper>
                  <UserEditProfile />
                </UserProtectedWrapper>
              }
            />
            <Route
              path="/user/rides"
              element={
                <UserProtectedWrapper>
                  <RideHistory />
                </UserProtectedWrapper>
              }
            />

            {/* ============================================
                RUTAS DE CONDUCTOR
                ============================================ */}
            <Route
              path="/captain/home"
              element={
                <CaptainProtectedWrapper>
                  <CaptainHomeScreen />
                </CaptainProtectedWrapper>
              }
            />
            <Route path="/captain/login" element={<CaptainLogin />} />
            <Route path="/captain/signup" element={<CaptainSignup />} />
            <Route
              path="/captain/edit-profile"
              element={
                <CaptainProtectedWrapper>
                  <CaptainEditProfile />
                </CaptainProtectedWrapper>
              }
            />
            <Route
              path="/captain/rides"
              element={
                <CaptainProtectedWrapper>
                  <RideHistory />
                </CaptainProtectedWrapper>
              }
            />

            {/* ============================================
                RUTAS COMPARTIDAS (Usuario y Conductor)
                ============================================ */}
            <Route path="/:userType/chat/:rideId" element={<ChatScreen />} />
            <Route path="/:userType/verify-email/" element={<VerifyEmail />} />
            <Route path="/:userType/forgot-password/" element={<ForgotPassword />} />
            <Route path="/:userType/reset-password/" element={<ResetPassword />} />

            {/* ============================================
                RUTA 404 - ERROR
                ============================================ */}
            <Route path="*" element={<Error />} />
          </Routes>
        </BrowserRouter>
      </div>

      {/* ============================================
          IMAGEN LATERAL (Solo visible en pantallas SM+)
          ============================================ */}
      <div className="hidden sm:block w-full h-full bg-[#eae1fe] overflow-hidden select-none border-l-2 border-black">
        <img
          className="h-full object-cover mx-auto select-none"
          src="https://img.freepik.com/free-vector/taxi-app-service-concept_23-2148497472.jpg?semt=ais_hybrid"
          alt="Taxi App Illustration"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export default App;

// ============================================
// COMPONENTE DE LOGGING
// Registra cambios de ruta para debugging
// ============================================
function LoggingWrapper() {
  const location = useLocation();
  const { socket } = useContext(SocketDataContext);

  useEffect(() => {
    // Solo hacer logging si el socket está disponible
    if (socket && socket.connected) {
      logger(socket);
    }
  }, [location.pathname, location.search, socket]);

  return null;
}