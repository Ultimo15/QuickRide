import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Lock,
  Save,
  AlertCircle,
  Eye,
  EyeOff,
  Car as CarIcon,
  Hash,
  Palette,
  Users,
} from "lucide-react";
import Button from "../components/Button";
import Heading from "../components/Heading";
import Input from "../components/Input";
import PhotoUpload from "../components/PhotoUpload";
import axios from "axios";
import { useCaptain } from "../contexts/CaptainContext";
import Console from "../utils/console";
import showToast from "../utils/toast";

/**
 * CaptainEditProfile - Pantalla de Edición de Perfil de Conductor Estilo Uber
 * Permite editar foto, datos personales, vehículo (placa, modelo, color, capacidad, tipo) y cambiar contraseña
 */
function CaptainEditProfile() {
  const token = localStorage.getItem("token");
  const { captain, setCaptain } = useCaptain();
  const navigation = useNavigate();

  // Estados
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(captain?.profilePhoto || null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      firstname: captain?.fullname?.firstname || "",
      lastname: captain?.fullname?.lastname || "",
      phone: captain?.phone || "",
      number: captain?.vehicle?.number || "",
      model: captain?.vehicle?.model || "",
      color: captain?.vehicle?.color || "",
      capacity: captain?.vehicle?.capacity || "",
      type: captain?.vehicle?.type || "car",
    },
  });

  // Vigilar nueva contraseña para validación de confirmación
  const newPassword = watch("newPassword");

  // Manejar cambio de foto
  const handlePhotoChange = (file, preview) => {
    setPhotoFile(file);
    setPhotoPreview(preview);
  };

  // Actualizar perfil
  const updateCaptainProfile = async (data) => {
    try {
      setLoading(true);

      // Preparar FormData si hay foto
      let requestData;
      let headers = { token };

      if (photoFile) {
        requestData = new FormData();
        requestData.append("profilePhoto", photoFile);
        requestData.append("firstname", data.firstname);
        requestData.append("lastname", data.lastname);
        requestData.append("phone", data.phone);
        requestData.append("vehicleNumber", data.number);
        requestData.append("vehicleModel", data.model);
        requestData.append("vehicleColor", data.color);
        requestData.append("vehicleCapacity", data.capacity);
        requestData.append("vehicleType", data.type);

        // Si hay cambio de contraseña
        if (showPasswordSection && data.currentPassword && data.newPassword) {
          requestData.append("currentPassword", data.currentPassword);
          requestData.append("newPassword", data.newPassword);
        }
      } else {
        // Sin foto, enviar JSON
        requestData = {
          fullname: {
            firstname: data.firstname,
            lastname: data.lastname,
          },
          phone: data.phone,
          vehicle: {
            number: data.number,
            model: data.model,
            color: data.color,
            capacity: data.capacity,
            type: data.type,
          },
        };

        // Si hay cambio de contraseña
        if (showPasswordSection && data.currentPassword && data.newPassword) {
          requestData.currentPassword = data.currentPassword;
          requestData.newPassword = data.newPassword;
        }

        headers["Content-Type"] = "application/json";
      }

      Console.log("Actualizando perfil de conductor:", requestData);

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/captain/update`,
        requestData,
        { headers }
      );

      Console.log("Respuesta:", response);

      // Actualizar contexto del conductor
      if (response.data.captain) {
        setCaptain(response.data.captain);

        // Actualizar localStorage
        const captainData = JSON.parse(localStorage.getItem("userData") || "{}");
        captainData.data = response.data.captain;
        localStorage.setItem("userData", JSON.stringify(captainData));
      }

      showToast.success("¡Perfil actualizado exitosamente!");

      // Navegar después de 1.5 segundos
      setTimeout(() => {
        navigation("/captain/home");
      }, 1500);
    } catch (error) {
      Console.log("Error al actualizar:", error);
      const errorMessage =
        error.response?.data?.[0]?.msg ||
        error.response?.data?.message ||
        "Error al actualizar el perfil";
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-dvh flex flex-col bg-uber-extra-light-gray">
      {/* Header */}
      <motion.div
        className="bg-white px-4 py-4 shadow-uber sticky top-0 z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => navigation(-1)}
          className="flex items-center gap-2 text-black hover:text-uber-medium-gray transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Atrás</span>
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Heading
            title="Editar Perfil - Conductor"
            subtitle="Actualiza tu información y datos del vehículo"
            level="h1"
          />

          {/* Photo Upload Section */}
          <motion.div
            className="mt-6 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <PhotoUpload
              currentPhoto={photoPreview}
              onPhotoChange={handlePhotoChange}
              name={`${captain?.fullname?.firstname || ""} ${captain?.fullname?.lastname || ""}`}
              size="xl"
              editable={true}
            />
          </motion.div>

          <form onSubmit={handleSubmit(updateCaptainProfile)} className="mt-6">
            {/* Información Personal Section */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <h3 className="text-lg font-bold text-black mb-4">
                Información Personal
              </h3>

              {/* Email (Solo lectura) */}
              <Input
                label="Correo electrónico"
                type="email"
                name="email"
                defaultValue={captain?.email || ""}
                disabled={true}
                leftIcon={<Mail className="w-5 h-5" />}
              />
              <p className="text-xs text-uber-medium-gray mt-1 mb-4">
                El correo no puede ser modificado
              </p>

              {/* Nombres */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nombre"
                  name="firstname"
                  placeholder="Tu nombre"
                  register={register}
                  error={errors.firstname}
                  leftIcon={<User className="w-5 h-5" />}
                />
                <Input
                  label="Apellido"
                  name="lastname"
                  placeholder="Tu apellido"
                  register={register}
                  error={errors.lastname}
                  leftIcon={<User className="w-5 h-5" />}
                />
              </div>

              {/* Teléfono */}
              <Input
                label="Teléfono"
                type="tel"
                name="phone"
                placeholder="3001234567"
                register={register}
                error={errors.phone}
                leftIcon={<Phone className="w-5 h-5" />}
              />
            </motion.div>

            {/* Información del Vehículo Section */}
            <motion.div
              className="mb-6 p-4 bg-white rounded-uber-lg shadow-uber"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
            >
              <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                <CarIcon className="w-6 h-6 text-uber-green" />
                Datos del Vehículo
              </h3>

              {/* Tipo de Vehículo */}
              <Input
                label="Tipo de Vehículo"
                type="select"
                options={[
                  { value: "car", label: "Carro 🚗" },
                  { value: "bike", label: "Moto 🏍️" },
                ]}
                name="type"
                register={register}
                error={errors.type}
                leftIcon={<CarIcon className="w-5 h-5" />}
              />

              {/* Placa del Vehículo */}
              <Input
                label="Placa del Vehículo"
                name="number"
                placeholder="ABC-123"
                register={register}
                error={errors.number}
                leftIcon={<Hash className="w-5 h-5" />}
              />

              {/* Modelo del Vehículo */}
              <Input
                label="Modelo del Vehículo"
                name="model"
                placeholder="Ej: Toyota Corolla 2020"
                register={register}
                error={errors.model}
                leftIcon={<CarIcon className="w-5 h-5" />}
              />

              {/* Color y Capacidad */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Color"
                  name="color"
                  placeholder="Ej: Negro"
                  register={register}
                  error={errors.color}
                  leftIcon={<Palette className="w-5 h-5" />}
                />
                <Input
                  label="Capacidad"
                  type="number"
                  name="capacity"
                  placeholder="4"
                  register={register}
                  error={errors.capacity}
                  leftIcon={<Users className="w-5 h-5" />}
                />
              </div>
            </motion.div>

            {/* Toggle Password Section */}
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="flex items-center gap-2 text-black hover:text-uber-green transition font-semibold"
              >
                <Lock className="w-5 h-5" />
                {showPasswordSection ? "Cancelar cambio de contraseña" : "Cambiar contraseña"}
              </button>
            </motion.div>

            {/* Password Change Section */}
            {showPasswordSection && (
              <motion.div
                className="mt-4 p-4 bg-white rounded-uber-lg shadow-uber"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start gap-2 mb-4 p-3 bg-uber-light-gray rounded-uber-md">
                  <AlertCircle className="w-5 h-5 text-uber-medium-gray flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-uber-medium-gray">
                    Para cambiar tu contraseña, debes ingresar tu contraseña actual y la nueva
                    contraseña (mínimo 6 caracteres).
                  </p>
                </div>

                <Input
                  label="Contraseña actual"
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  placeholder="Tu contraseña actual"
                  register={register}
                  error={errors.currentPassword}
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-uber-medium-gray hover:text-black transition"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                />

                <Input
                  label="Nueva contraseña"
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Mínimo 6 caracteres"
                  register={register}
                  error={errors.newPassword}
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-uber-medium-gray hover:text-black transition"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                />

                <Input
                  label="Confirmar nueva contraseña"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Repite la nueva contraseña"
                  register={register}
                  error={errors.confirmPassword}
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-uber-medium-gray hover:text-black transition"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                  validation={{
                    validate: (value) =>
                      value === newPassword || "Las contraseñas no coinciden",
                  }}
                />
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.3 }}
            >
              <Button
                title="Guardar Cambios"
                loading={loading}
                loadingMessage="Guardando..."
                type="submit"
                variant="success"
                size="lg"
                icon={<Save className="w-5 h-5" />}
              />
            </motion.div>
          </form>

          {/* Footer Info */}
          <motion.div
            className="mt-8 p-4 bg-white rounded-uber-lg shadow-uber"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <p className="text-xs text-uber-medium-gray text-center leading-relaxed">
              Los cambios se aplicarán inmediatamente después de guardar. Asegúrate de que los
              datos del vehículo (placa, modelo, color) sean correctos para que los usuarios
              puedan identificarte fácilmente.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default CaptainEditProfile;
