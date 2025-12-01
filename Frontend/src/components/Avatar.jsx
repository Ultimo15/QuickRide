import { useState } from 'react';
import { User } from 'lucide-react';

/**
 * Componente Avatar Profesional - Estilo Uber
 *
 * @param {Object} props
 * @param {string} props.src - URL de la imagen de perfil
 * @param {string} props.alt - Texto alternativo
 * @param {string} props.name - Nombre completo para generar iniciales
 * @param {string} props.size - Tamaño: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} props.showStatus - Mostrar indicador de estado
 * @param {boolean} props.isOnline - Estado online/offline
 * @param {string} props.className - Clases adicionales
 * @param {Function} props.onClick - Callback al hacer click
 */
const Avatar = ({
  src = null,
  alt = 'Avatar',
  name = '',
  size = 'md',
  showStatus = false,
  isOnline = false,
  className = '',
  onClick = null,
}) => {
  const [imageError, setImageError] = useState(false);

  // Configuración de tamaños
  const sizeClasses = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-18 h-18 text-xl',
  };

  const statusSizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  };

  // Generar iniciales desde el nombre
  const getInitials = (fullName) => {
    if (!fullName || fullName.trim() === '') return '?';

    const parts = fullName.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);

  // Generar color de fondo basado en el nombre
  const getBackgroundColor = (fullName) => {
    if (!fullName) return 'bg-gray-400';

    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];

    const charCode = fullName.charCodeAt(0) + fullName.charCodeAt(fullName.length - 1);
    return colors[charCode % colors.length];
  };

  const bgColor = getBackgroundColor(name);

  // Determinar si mostrar imagen o fallback
  const showImage = src && !imageError;

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Avatar principal */}
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full
          overflow-hidden
          flex items-center justify-center
          font-semibold
          text-white
          border-2 border-white
          shadow-md
          transition-all
          ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
          ${showImage ? 'bg-gray-200' : bgColor}
        `}
        onClick={onClick}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="select-none">
            {initials !== '?' ? (
              initials
            ) : (
              <User className="w-1/2 h-1/2" />
            )}
          </span>
        )}
      </div>

      {/* Indicador de estado (online/offline) */}
      {showStatus && (
        <div
          className={`
            absolute
            bottom-0
            right-0
            ${statusSizeClasses[size]}
            rounded-full
            border-2 border-white
            ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
            shadow-sm
          `}
        />
      )}
    </div>
  );
};

export default Avatar;
