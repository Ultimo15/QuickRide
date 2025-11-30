import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowLeft,
  User,
  Phone,
  AlertCircle,
  Car as CarIcon,
  Palette,
  Hash,
  Users,
  ChevronRight,
} from "lucide-react";
import Button from "../components/Button";
import Heading from "../components/Heading";
import Input from "../components/Input";
import axios from "axios";
import Console from "../utils/console";
import showToast from "../utils/toast";

/**
 * CaptainSignup - Pantalla de Registro de Conductor Estilo Uber
 * Incluye información personal y del vehículo (placa y modelo)
 */
function CaptainSignup() {
  const [responseError, setResponseError] = useState("");
  const [showVehiclePanel, setShowVehiclePanel] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const navigation = useNavigate();

  const signupCaptain = async (data) => {
    const captainData = {
      fullname: {
        firstname: data.firstname,
        lastname: data.lastname,
      },
      email: data.email,
      password: data.password,
      phone: data.phone,
      vehicle: {
        color: data.color,
        number: data.number, // Placa
        model: data.model, // Modelo del vehículo
        capacity: data.capacity,
        type: data.type,
      },
    };
    Console.log(captainData);

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/captain/register`,
        captainData
      );
      Console.log(response);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userData", JSON.stringify({
        type: "captain",
        data: response.data.captain,
      }));

      showToast.success("¡Cuenta de conductor creada exitosamente!");
      navigation("/captain/home");
    } catch (error) {
      const errorMessage =
        error.response?.data?.[0]?.msg ||
        error.response?.data?.message ||
        "Error al crear la cuenta";
      setResponseError(errorMessage);
      showToast.error(errorMessage);
      setShowVehiclePanel(false);
      Console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (responseError) {
      const timer = setTimeout(() => {
        setResponseError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [responseError]);

  return (
    <div className="w-full min-h-dvh flex flex-col bg-uber-extra-light-gray">
      {/* Header */}
      <motion.div
        className="bg-white px-4 py-4 shadow-uber"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => {
            if (showVehiclePanel) {
              setShowVehiclePanel(false);
            } else {
              navigation("/");
            }
          }}
          className="flex items-center gap-2 text-black hover:text-uber-medium-gray transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Atrás</span>
        </button>
      </motion.div>

      {/* Progress Indicator */}
      <div className="bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                !showVehiclePanel
                  ? "bg-black text-white"
                  : "bg-uber-green text-white"
              }`}
            >
              {!showVehiclePanel ? "1" : "✓"}
            </div>
            <span className="text-sm font-semibold">Datos Personales</span>
          </div>
          <div className={`flex-1 h-1 mx-3 ${showVehiclePanel ? "bg-uber-green" : "bg-uber-light-gray"}`} />
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                showVehiclePanel
                  ? "bg-black text-white"
                  : "bg-uber-light-gray text-uber-medium-gray"
              }`}
            >
              2
            </div>
            <span className={`text-sm font-semibold ${showVehiclePanel ? "text-black" : "text-uber-medium-gray"}`}>
              Vehículo
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto">
        <form onSubmit={handleSubmit(signupCaptain)}>
          <AnimatePresence mode="wait">
            {!showVehiclePanel ? (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Heading
                  title="Información Personal"
                  subtitle="Completa tus datos como conductor"
                  level="h1"
                />

                {/* Nombres */}
                <div className="grid grid-cols-2 gap-3 mt-6">
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

                <Input
                  label="Teléfono"
                  type="tel"
                  name="phone"
                  placeholder="3001234567"
                  register={register}
                  error={errors.phone}
                  leftIcon={<Phone className="w-5 h-5" />}
                />

                <Input
                  label="Correo electrónico"
                  type="email"
                  name="email"
                  placeholder="ejemplo@correo.com"
                  register={register}
                  error={errors.email}
                  leftIcon={<Mail className="w-5 h-5" />}
                />

                <Input
                  label="Contraseña"
                  type="password"
                  name="password"
                  placeholder="Mínimo 6 caracteres"
                  register={register}
                  error={errors.password}
                  leftIcon={<Lock className="w-5 h-5" />}
                />

                {responseError && (
                  <motion.div
                    className="flex items-center gap-2 p-3 mb-4 bg-uber-light-red border border-uber-red rounded-uber-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <AlertCircle className="w-5 h-5 text-uber-red flex-shrink-0" />
                    <p className="text-sm text-uber-red">{responseError}</p>
                  </motion.div>
                )}

                <Button
                  title="Siguiente: Datos del Vehículo"
                  fun={() => setShowVehiclePanel(true)}
                  variant="primary"
                  size="lg"
                  icon={<ChevronRight className="w-5 h-5" />}
                />

                <p className="text-sm text-center mt-6 text-uber-medium-gray">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    to="/captain/login"
                    className="font-bold text-black hover:text-uber-green transition"
                  >
                    Inicia sesión aquí
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="vehicle"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Heading
                  title="Datos del Vehículo"
                  subtitle="Información de tu carro o moto"
                  level="h1"
                />

                <div className="mt-6">
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

                  <Input
                    label="Placa del Vehículo"
                    name="number"
                    placeholder="ABC-123"
                    register={register}
                    error={errors.number}
                    leftIcon={<Hash className="w-5 h-5" />}
                  />

                  <Input
                    label="Modelo del Vehículo"
                    name="model"
                    placeholder="Ej: Toyota Corolla 2020"
                    register={register}
                    error={errors.model}
                    leftIcon={<CarIcon className="w-5 h-5" />}
                  />

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

                  {responseError && (
                    <motion.div
                      className="flex items-center gap-2 p-3 mb-4 bg-uber-light-red border border-uber-red rounded-uber-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <AlertCircle className="w-5 h-5 text-uber-red flex-shrink-0" />
                      <p className="text-sm text-uber-red">{responseError}</p>
                    </motion.div>
                  )}

                  <Button
                    title="Crear Cuenta de Conductor"
                    loading={loading}
                    loadingMessage="Creando cuenta..."
                    type="submit"
                    variant="success"
                    size="lg"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Footer */}
        {!showVehiclePanel && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-uber-light-gray"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-uber-extra-light-gray text-uber-medium-gray">
                  ¿No eres conductor?
                </span>
              </div>
            </div>

            <Button
              type="link"
              path="/signup"
              title="Registrarse como Usuario"
              variant="success"
              size="lg"
              icon={<User className="w-5 h-5" />}
            />

            <p className="text-xs text-center text-uber-medium-gray mt-6 leading-relaxed">
              Al registrarte, aceptas nuestros{" "}
              <span className="font-semibold underline">Términos de Servicio</span> y{" "}
              <span className="font-semibold underline">Política de Privacidad</span>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default CaptainSignup;
