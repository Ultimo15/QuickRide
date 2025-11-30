import { motion } from "framer-motion";

/**
 * Componente Heading Profesional - Estilo Uber
 *
 * @param {Object} props
 * @param {string} props.title - Título a mostrar
 * @param {string} props.subtitle - Subtítulo opcional
 * @param {string} props.level - Nivel de encabezado: 'h1' | 'h2' | 'h3' | 'h4'
 * @param {string} props.align - Alineación: 'left' | 'center' | 'right'
 * @param {string} props.className - Clases adicionales
 */
function Heading({
  title,
  subtitle,
  level = "h1",
  align = "left",
  className = "",
}) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const levelClasses = {
    h1: "text-3xl md:text-4xl font-bold",
    h2: "text-2xl md:text-3xl font-bold",
    h3: "text-xl md:text-2xl font-semibold",
    h4: "text-lg md:text-xl font-semibold",
  };

  const Tag = level;

  return (
    <motion.div
      className={`mb-6 ${alignClasses[align]} ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Tag className={`${levelClasses[level]} text-black leading-tight`}>
        {title}
      </Tag>
      {subtitle && (
        <motion.p
          className="text-uber-medium-gray text-sm md:text-base mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}

export default Heading;