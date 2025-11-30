import { motion } from 'framer-motion';
import { Inbox, MapPin, MessageCircle, Star, Car, Clock } from 'lucide-react';
import Button from './Button';

/**
 * Componente EmptyState - Muestra mensaje cuando no hay datos
 *
 * @param {Object} props
 * @param {string} props.type - Tipo: 'rides' | 'messages' | 'ratings' | 'search' | 'general'
 * @param {string} props.title - Título personalizado
 * @param {string} props.description - Descripción personalizada
 * @param {React.ReactNode} props.icon - Icono personalizado
 * @param {string} props.actionLabel - Etiqueta del botón de acción
 * @param {Function} props.onAction - Callback del botón
 */
const EmptyState = ({
  type = 'general',
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  // Configuración predefinida por tipo
  const presets = {
    rides: {
      icon: <Car className="w-16 h-16" />,
      title: 'No hay viajes',
      description: 'Aún no has realizado ningún viaje. ¡Solicita uno ahora!',
      actionLabel: 'Solicitar viaje',
    },
    messages: {
      icon: <MessageCircle className="w-16 h-16" />,
      title: 'No hay mensajes',
      description: 'No tienes mensajes en este chat todavía.',
    },
    ratings: {
      icon: <Star className="w-16 h-16" />,
      title: 'No hay calificaciones',
      description: 'Completa viajes para recibir calificaciones.',
    },
    search: {
      icon: <MapPin className="w-16 h-16" />,
      title: 'No se encontraron resultados',
      description: 'Intenta con otro término de búsqueda.',
    },
    waiting: {
      icon: <Clock className="w-16 h-16" />,
      title: 'Esperando...',
      description: 'Buscando conductores disponibles cerca de ti.',
    },
    general: {
      icon: <Inbox className="w-16 h-16" />,
      title: 'No hay datos',
      description: 'No se encontró información para mostrar.',
    },
  };

  const preset = presets[type] || presets.general;
  const finalIcon = icon || preset.icon;
  const finalTitle = title || preset.title;
  const finalDescription = description || preset.description;
  const finalActionLabel = actionLabel || preset.actionLabel;

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Icono */}
      <motion.div
        className="text-uber-medium-gray mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        {finalIcon}
      </motion.div>

      {/* Título */}
      <h3 className="text-xl font-bold text-black mb-2">
        {finalTitle}
      </h3>

      {/* Descripción */}
      <p className="text-uber-medium-gray text-sm max-w-sm mb-6">
        {finalDescription}
      </p>

      {/* Botón de acción (opcional) */}
      {finalActionLabel && onAction && (
        <Button
          title={finalActionLabel}
          fun={onAction}
          variant="primary"
          size="md"
          fullWidth={false}
        />
      )}
    </motion.div>
  );
};

export default EmptyState;
