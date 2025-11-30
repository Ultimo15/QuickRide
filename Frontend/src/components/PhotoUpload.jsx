import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, X, User } from "lucide-react";
import Button from "./Button";

/**
 * PhotoUpload - Componente de Upload de Foto de Perfil Profesional
 *
 * @param {Object} props
 * @param {string} props.currentPhoto - URL de la foto actual
 * @param {Function} props.onPhotoChange - Callback cuando se selecciona una foto
 * @param {string} props.name - Nombre del usuario para generar iniciales
 * @param {string} props.size - Tamaño: 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} props.editable - Si se puede editar la foto
 */
const PhotoUpload = ({
  currentPhoto = null,
  onPhotoChange,
  name = "",
  size = "xl",
  editable = true,
}) => {
  const [preview, setPreview] = useState(currentPhoto);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Configuración de tamaños
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-40 h-40",
  };

  // Generar iniciales desde el nombre
  const getInitials = (fullName) => {
    if (!fullName || fullName.trim() === "") return "?";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);

  // Manejar selección de archivo
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Procesar archivo
  const processFile = (file) => {
    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Por favor selecciona una imagen válida (JPG, PNG o WEBP)");
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("La imagen no puede superar los 5MB");
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      if (onPhotoChange) {
        onPhotoChange(file, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Manejar drag & drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Eliminar foto
  const handleRemovePhoto = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onPhotoChange) {
      onPhotoChange(null, null);
    }
  };

  // Abrir selector de archivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Preview de la foto */}
      <motion.div
        className={`relative ${sizeClasses[size]} mb-4`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Contenedor de la imagen/placeholder */}
        <div
          className={`
            ${sizeClasses[size]}
            rounded-full
            overflow-hidden
            flex items-center justify-center
            font-bold text-4xl text-white
            bg-gradient-to-br from-blue-500 to-purple-600
            border-4 border-white
            shadow-uber-lg
            ${editable && !preview ? "cursor-pointer" : ""}
          `}
          onClick={editable && !preview ? openFileSelector : undefined}
          onDragEnter={editable ? handleDragEnter : undefined}
          onDragLeave={editable ? handleDragLeave : undefined}
          onDragOver={editable ? handleDragOver : undefined}
          onDrop={editable ? handleDrop : undefined}
        >
          {preview ? (
            <img
              src={preview}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="select-none">
              {initials !== "?" ? initials : <User className="w-16 h-16" />}
            </span>
          )}

          {/* Overlay para drag & drop */}
          {editable && isDragging && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <Upload className="w-12 h-12 text-white" />
            </div>
          )}
        </div>

        {/* Botón de cámara */}
        {editable && (
          <motion.button
            onClick={openFileSelector}
            className="absolute bottom-0 right-0 w-12 h-12 bg-uber-green hover:bg-uber-dark-green text-white rounded-full flex items-center justify-center shadow-uber-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Camera className="w-6 h-6" />
          </motion.button>
        )}

        {/* Botón para eliminar foto */}
        {editable && preview && (
          <motion.button
            onClick={handleRemovePhoto}
            className="absolute top-0 right-0 w-8 h-8 bg-uber-red hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-uber transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </motion.div>

      {/* Instrucciones */}
      {editable && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <p className="text-sm text-uber-medium-gray mb-2">
            {preview ? "Toca el botón de cámara para cambiar" : "Añade tu foto de perfil"}
          </p>
          <p className="text-xs text-uber-medium-gray">
            JPG, PNG o WEBP (máx. 5MB)
          </p>
        </motion.div>
      )}

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default PhotoUpload;
