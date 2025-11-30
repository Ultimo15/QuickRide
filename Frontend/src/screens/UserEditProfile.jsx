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
} from "lucide-react";
import Button from "../components/Button";
import Heading from "../components/Heading";
import Input from "../components/Input";
import PhotoUpload from "../components/PhotoUpload";
import axios from "axios";
import { useUser } from "../contexts/UserContext";
import Console from "../utils/console";
import showToast from "../utils/toast";

/**
 * UserEditProfile - Pantalla de Edición de Perfil de Usuario Estilo Uber
 * Permite editar foto, nombre, teléfono y cambiar contraseña
 */
function UserEditProfile() {
  const token = localStorage.getItem("token");
  const { user, setUser } = useUser();
  const navigation = useNavigate();

  // Estados
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto || null);
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
      firstname: user?.fullname?.firstname || "",
      lastname: user?.fullname?.lastname || "",
      phone: user?.phone || "",
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
  const updateUserProfile = async (data) => {
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
        };

        // Si hay cambio de contraseña
        if (showPasswordSection && data.currentPassword && data.newPassword) {
          requestData.currentPassword = data.currentPassword;
          requestData.newPassword = data.newPassword;
        }

        headers["Content-Type"] = "application/json";
      }

      Console.log("Actualizando perfil:", requestData);

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/user/update`,
        requestData,
        { headers }
      );

      Console.log("Respuesta:", response);

      // Actualizar contexto del usuario
      if (response.data.user) {
        setUser(response.data.user);

        // Actualizar localStorage
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        userData.data = response.data.user;
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      showToast.success("¡Perfil actualizado exitosamente!");

      // Navegar después de 1.5 segundos
      setTimeout(() => {
        navigation("/home");
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
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Heading
            title="Editar Perfil"
            subtitle="Actualiza tu información personal"
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
              name={`${user?.fullname?.firstname || ""} ${user?.fullname?.lastname || ""}`}
              size="xl"
              editable={true}
            />
          </motion.div>

          <form onSubmit={handleSubmit(updateUserProfile)} className="mt-6">
            {/* Email (Solo lectura) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Input
                label="Correo electrónico"
                type="email"
                name="email"
                defaultValue={user?.email || ""}
                disabled={true}
                leftIcon={<Mail className="w-5 h-5" />}
              />
              <p className="text-xs text-uber-medium-gray mt-1 mb-4">
                El correo no puede ser modificado
              </p>
            </motion.div>

            {/* Nombres */}
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
            >
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
            </motion.div>

            {/* Teléfono */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
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

            {/* Toggle Password Section */}
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.3 }}
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
              transition={{ delay: 0.5, duration: 0.3 }}
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
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <p className="text-xs text-uber-medium-gray text-center leading-relaxed">
              Los cambios se aplicarán inmediatamente después de guardar. Si cambias tu
              contraseña, deberás iniciar sesión nuevamente con la nueva contraseña.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default UserEditProfile;
