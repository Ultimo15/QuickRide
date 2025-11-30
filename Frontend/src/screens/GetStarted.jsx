import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, User, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import background from "/get_started_illustration.jpg";
import logo from "/logo-quickride.png";

/**
 * Pantalla GetStarted - Bienvenida Profesional Estilo Uber
 */
function GetStarted() {
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedData = JSON.parse(userData);
      if (parsedData.type === "user") {
        navigate("/home");
      } else if (parsedData.type === "captain") {
        navigate("/captain/home");
      }
    }
  }, [navigate]);

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div
      className="flex flex-col justify-between w-full h-dvh bg-cover bg-center relative"
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* Overlay oscuro para mejor legibilidad */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Logo */}
      <motion.div
        className="relative z-10 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <img
          className="h-12 object-contain drop-shadow-lg"
          src={logo}
          alt="QuickRide Logo"
        />
      </motion.div>

      {/* Panel inferior */}
      <motion.div
        className="relative z-10 bg-white rounded-t-3xl px-6 py-8 shadow-uber-xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Título */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-3 leading-tight">
            Viaja rápido y seguro
          </h1>
          <p className="text-uber-medium-gray text-base">
            Solicita un viaje o conviértete en conductor y empieza a ganar dinero
          </p>
        </motion.div>

        {/* Botones de acción */}
        <motion.div variants={itemVariants} className="space-y-3 mb-6">
          {/* Botón de Usuario */}
          <Button
            title="Solicitar un viaje"
            path="/login"
            type="link"
            variant="primary"
            size="lg"
            icon={<User className="w-5 h-5" />}
            fullWidth
          />

          {/* Botón de Conductor */}
          <Button
            title="Convertirse en conductor"
            path="/captain/login"
            type="link"
            variant="outline"
            size="lg"
            icon={<Car className="w-5 h-5" />}
            fullWidth
          />
        </motion.div>

        {/* Footer con términos */}
        <motion.p
          variants={itemVariants}
          className="text-center text-xs text-uber-medium-gray"
        >
          Al continuar, aceptas nuestros{" "}
          <span className="underline font-medium">Términos y Condiciones</span>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default GetStarted;
