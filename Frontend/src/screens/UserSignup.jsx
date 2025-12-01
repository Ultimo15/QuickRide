import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowLeft, User, Phone, AlertCircle, Car } from "lucide-react";
import Button from "../components/Button";
import Heading from "../components/Heading";
import Input from "../components/Input";
import axios from "axios";
import Console from "../utils/console";
import showToast from "../utils/toast";

/**
 * UserSignup - Pantalla de Registro de Usuario Estilo Uber
 */
function UserSignup() {
  const [responseError, setResponseError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const navigation = useNavigate();

  const signupUser = async (data) => {
    const userData = {
      fullname: {
        firstname: data.firstname,
        lastname: data.lastname,
      },
      email: data.email,
      password: data.password,
      phone: data.phone,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/user/register`,
        userData
      );
      Console.log(response);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userData", JSON.stringify({
        type: "user",
        data: response.data.user,
      }));

      showToast.success("¡Cuenta creada exitosamente! Bienvenido");
      navigation("/home");
    } catch (error) {
      const errorMessage =
        error.response?.data?.[0]?.msg ||
        error.response?.data?.message ||
        "Error al crear la cuenta";
      setResponseError(errorMessage);
      showToast.error(errorMessage);
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
          onClick={() => navigation("/")}
          className="flex items-center gap-2 text-black hover:text-uber-medium-gray transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Atrás</span>
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Heading
            title="Crear Cuenta"
            subtitle="Regístrate para solicitar viajes"
            level="h1"
          />

          <form onSubmit={handleSubmit(signupUser)} className="mt-6">
            {/* Nombres */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              title="Crear Cuenta"
              loading={loading}
              loadingMessage="Creando cuenta..."
              type="submit"
              variant="primary"
              size="lg"
            />
          </form>

          <p className="text-sm text-center mt-6 text-uber-medium-gray">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="font-bold text-black hover:text-uber-green transition"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </motion.div>

        {/* Footer */}
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
                ¿Eres conductor?
              </span>
            </div>
          </div>

          <Button
            type="link"
            path="/captain/signup"
            title="Registrarse como Conductor"
            variant="outline"
            size="lg"
            icon={<Car className="w-5 h-5" />}
          />

          <p className="text-xs text-center text-uber-medium-gray mt-6 leading-relaxed">
            Al registrarte, aceptas nuestros{" "}
            <span className="font-semibold underline">Términos de Servicio</span> y{" "}
            <span className="font-semibold underline">Política de Privacidad</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default UserSignup;
