import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Spinner from "./Spinner";

/**
 * Componente Button Profesional - Estilo Uber
 *
 * @param {Object} props
 * @param {string} props.path - Ruta para botones tipo link
 * @param {string} props.title - Texto del botón
 * @param {React.ReactNode} props.icon - Icono opcional
 * @param {string} props.type - Tipo: 'link' | 'button' | 'submit'
 * @param {string} props.variant - Variante: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost'
 * @param {string} props.size - Tamaño: 'sm' | 'md' | 'lg'
 * @param {boolean} props.fullWidth - Ancho completo
 * @param {string} props.classes - Clases CSS adicionales
 * @param {Function} props.fun - onClick handler
 * @param {boolean} props.loading - Estado de carga
 * @param {string} props.loadingMessage - Mensaje durante carga
 * @param {boolean} props.disabled - Estado deshabilitado
 */
function Button({
  path,
  title,
  icon,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = true,
  classes = "",
  fun,
  loading = false,
  loadingMessage = "Cargando...",
  disabled = false,
}) {
  // Variantes de estilo
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800 active:bg-gray-900",
    secondary: "bg-uber-light-gray text-black hover:bg-uber-medium-gray hover:text-white active:bg-gray-600",
    outline: "bg-transparent text-black border-2 border-black hover:bg-black hover:text-white",
    danger: "bg-uber-red text-white hover:bg-red-600 active:bg-red-700",
    success: "bg-uber-green text-white hover:bg-uber-dark-green active:bg-green-700",
    ghost: "bg-transparent text-black hover:bg-uber-extra-light-gray active:bg-uber-light-gray",
  };

  // Tamaños
  const sizes = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-4 px-8 text-lg",
  };

  const baseClasses = `
    inline-flex justify-center items-center gap-2
    font-semibold rounded-uber-lg
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
    shadow-uber
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? "w-full" : ""}
    ${loading ? "cursor-wait" : "cursor-pointer"}
    ${classes}
  `;

  const MotionButton = motion.button;
  const MotionLink = motion(Link);

  if (type === "link") {
    return (
      <MotionLink
        to={path}
        className={baseClasses}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
      >
        {icon && <span>{icon}</span>}
        <span>{title}</span>
      </MotionLink>
    );
  }

  return (
    <MotionButton
      type={type}
      className={baseClasses}
      onClick={fun}
      disabled={loading || disabled}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Spinner />
          <span>{loadingMessage}</span>
        </span>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          <span>{title}</span>
        </>
      )}
    </MotionButton>
  );
}

export default Button;