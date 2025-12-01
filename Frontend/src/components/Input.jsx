import { motion } from "framer-motion";

/**
 * Componente Input Profesional - Estilo Uber
 *
 * @param {Object} props
 * @param {string} props.label - Etiqueta del input
 * @param {string} props.type - Tipo de input: 'text' | 'email' | 'password' | 'number' | 'tel' | 'select'
 * @param {string} props.name - Nombre del campo
 * @param {string} props.placeholder - Placeholder
 * @param {string} props.defaultValue - Valor por defecto
 * @param {Function} props.register - Función de react-hook-form
 * @param {Object} props.error - Objeto de error
 * @param {Array} props.options - Opciones para select
 * @param {boolean} props.disabled - Estado deshabilitado
 * @param {React.ReactNode} props.leftIcon - Icono izquierdo
 * @param {React.ReactNode} props.rightIcon - Icono derecho
 */
function Input({
  label,
  type = "text",
  name,
  placeholder,
  defaultValue,
  register = () => {},
  error,
  options = [],
  disabled = false,
  leftIcon,
  rightIcon,
}) {
  const baseInputClasses = `
    w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-uber-lg
    bg-uber-extra-light-gray
    border-2 border-transparent
    text-sm sm:text-base text-black
    placeholder:text-uber-medium-gray
    transition-all duration-200
    focus:outline-none focus:border-black focus:bg-white
    disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-200
    ${leftIcon ? "pl-10 sm:pl-12" : ""}
    ${rightIcon ? "pr-10 sm:pr-12" : ""}
    ${error ? "border-uber-red focus:border-uber-red" : ""}
  `;

  return (
    <motion.div
      className="mb-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="block text-xs sm:text-sm font-semibold text-black mb-2"
        >
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-uber-medium-gray">
            {leftIcon}
          </div>
        )}

        {/* Input Field */}
        {type === "select" ? (
          <select
            {...register(name)}
            id={name}
            defaultValue={defaultValue}
            className={baseInputClasses}
            disabled={disabled}
          >
            {options.map((option, index) => (
              <option
                key={index}
                value={typeof option === 'string' ? option.toLowerCase() : option.value}
              >
                {typeof option === 'string' ? option : option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            {...register(name)}
            id={name}
            type={type}
            placeholder={placeholder || label}
            defaultValue={defaultValue}
            className={baseInputClasses}
            disabled={disabled}
            autoComplete={type === "password" ? "current-password" : "on"}
          />
        )}

        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-uber-medium-gray">
            {rightIcon}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          className="text-xs text-uber-red mt-1 font-medium"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error.message}
        </motion.p>
      )}
    </motion.div>
  );
}

export default Input;