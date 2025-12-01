import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  User as UserIcon,
  History,
  LogOut,
  Menu,
  X,
  Mail,
  Phone,
  Car as CarIcon,
  Hash,
  Palette,
} from "lucide-react";
import Button from "./Button";
import Avatar from "./Avatar";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Console from "../utils/console";
import showToast from "../utils/toast";

/**
 * Sidebar - Menú lateral profesional estilo Uber
 * Muestra perfil, avatar con foto, opciones de navegación y logout
 */
function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const token = localStorage.getItem("token");
  const [showSidebar, setShowSidebar] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();

  // Sincronizar estado local con prop
  useEffect(() => {
    if (setSidebarOpen) {
      setShowSidebar(sidebarOpen || false);
    }
  }, [sidebarOpen, setSidebarOpen]);

  // Cargar datos del usuario
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("userData"));
    setUserData(data);
  }, []);

  // Función para cambiar el estado del sidebar
  const toggleSidebar = (value) => {
    setShowSidebar(value);
    if (setSidebarOpen) {
      setSidebarOpen(value);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setIsLoggingOut(true);
      await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/${userData?.type}/logout`,
        {
          headers: {
            token: token,
          },
        }
      );

      // Limpiar localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("messages");
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("panelDetails");
      localStorage.removeItem("showPanel");
      localStorage.removeItem("showBtn");

      showToast.success("Sesión cerrada exitosamente");

      // Navegar a home después de un pequeño delay
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      Console.log("Error al cerrar sesión", error);
      showToast.error("Error al cerrar sesión");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Datos del usuario
  const fullName = `${userData?.data?.fullname?.firstname || ""} ${userData?.data?.fullname?.lastname || ""}`;
  const email = userData?.data?.email || "";
  const phone = userData?.data?.phone || "";
  const isCaptain = userData?.type === "captain";
  const vehicle = userData?.data?.vehicle;

  // Opciones del menú
  const menuOptions = [
    {
      icon: <UserIcon className="w-5 h-5" />,
      label: "Editar Perfil",
      path: `/${userData?.type}/edit-profile`,
    },
    {
      icon: <History className="w-5 h-5" />,
      label: "Historial de Viajes",
      path: `/${userData?.type}/rides`,
    },
  ];

  return (
    <>
      {/* ============================================
          BOTÓN DE MENÚ (HAMBURGUESA)
          ============================================ */}
      <motion.button
        className="fixed top-4 right-4 z-[100] cursor-pointer bg-white p-3 rounded-full shadow-uber-lg hover:shadow-uber-xl transition-all border-2 border-uber-light-gray hover:border-black"
        onClick={() => toggleSidebar(!showSidebar)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={showSidebar ? "Cerrar menú" : "Abrir menú"}
      >
        {showSidebar ? (
          <X className="w-6 h-6 text-black" />
        ) : (
          <Menu className="w-6 h-6 text-black" />
        )}
      </motion.button>

      {/* ============================================
          OVERLAY OSCURO
          ============================================ */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            className="fixed inset-0 bg-black z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => toggleSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* ============================================
          SIDEBAR PRINCIPAL
          ============================================ */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            className="fixed top-0 left-0 w-full sm:w-96 h-dvh bg-white z-50 shadow-uber-xl overflow-y-auto"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="flex flex-col h-full">
              {/* HEADER DEL SIDEBAR */}
              <div className="bg-gradient-to-br from-black to-uber-dark-gray p-6 pb-8">
                <motion.h2
                  className="text-2xl font-bold text-white mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Mi Perfil
                </motion.h2>

                {/* AVATAR Y NOMBRE */}
                <motion.div
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Avatar
                    src={userData?.data?.profilePhoto}
                    name={fullName}
                    size="xl"
                    className="mb-4"
                  />
                  <h3 className="text-xl font-bold text-white text-center">
                    {fullName}
                  </h3>
                  <p className="text-sm text-uber-light-gray mt-1 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {email}
                  </p>
                  {phone && (
                    <p className="text-sm text-uber-light-gray mt-1 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {phone}
                    </p>
                  )}
                </motion.div>

                {/* INFORMACIÓN DEL VEHÍCULO (Solo para conductores) */}
                {isCaptain && vehicle && (
                  <motion.div
                    className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-uber-lg border border-white/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CarIcon className="w-4 h-4 text-uber-green" />
                      <span className="text-xs font-semibold text-white uppercase">
                        Mi Vehículo
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-uber-light-gray">
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        <span>Placa: {vehicle.number || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Palette className="w-3 h-3" />
                        <span>{vehicle.color || "N/A"}</span>
                      </div>
                    </div>
                    {vehicle.model && (
                      <p className="text-xs text-uber-light-gray mt-1">
                        Modelo: {vehicle.model}
                      </p>
                    )}
                    <p className="text-xs text-uber-light-gray mt-1">
                      Tipo: {vehicle.type === "car" ? "🚗 Carro" : "🏍️ Moto"} · Capacidad: {vehicle.capacity || "N/A"}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* OPCIONES DEL MENÚ */}
              <div className="flex-1 p-4">
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {menuOptions.map((option, index) => (
                    <Link
                      key={index}
                      to={option.path}
                      onClick={() => toggleSidebar(false)}
                    >
                      <motion.div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-uber-extra-light-gray rounded-uber-lg transition-colors group"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-black group-hover:text-uber-green transition-colors">
                            {option.icon}
                          </div>
                          <span className="font-semibold text-black group-hover:text-uber-green transition-colors">
                            {option.label}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-uber-medium-gray group-hover:text-uber-green transition-colors" />
                      </motion.div>
                    </Link>
                  ))}
                </motion.div>
              </div>

              {/* BOTÓN DE CERRAR SESIÓN */}
              <motion.div
                className="p-4 border-t border-uber-light-gray"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  title="Cerrar Sesión"
                  loading={isLoggingOut}
                  loadingMessage="Cerrando sesión..."
                  fun={logout}
                  variant="danger"
                  size="lg"
                  icon={<LogOut className="w-5 h-5" />}
                />

                <p className="text-xs text-center text-uber-medium-gray mt-3">
                  QuickRide v1.0 · {isCaptain ? "Modo Conductor" : "Modo Usuario"}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
