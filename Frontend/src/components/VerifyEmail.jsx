import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Console from "../utils/console";
import { ArrowLeft } from "lucide-react";
import Heading from "./Heading";
import Button from "./Button";
import mailImg from "/mail.png";
import useCooldownTimer from "../hooks/useCooldownTimer";
import { Alert } from "../components";
import { useAlert } from "../hooks/useAlert";

function VerifyEmail({ user, role }) {
    const navigation = useNavigate();
    const token = localStorage.getItem("token");
    const [loading, setLoading] = useState(false);
    const { alert, showAlert, hideAlert } = useAlert();
    const { timeLeft, isActive, startCooldown } = useCooldownTimer(60000, 'forgot-password-cooldown');

    const sendVerificationEmail = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/mail/verify-${role}-email`,
                {
                    headers: {
                        token: token,
                    },
                }
            );
            if (response.status === 200) {
                showAlert('¡Correo de verificación enviado!', 'Por favor revisa tu bandeja de entrada y haz clic en el enlace recibido para verificar tu cuenta', 'success');
                startCooldown();
            }
        } catch (error) {
            showAlert('Ocurrió un error', error.response.data.message, 'failure');
            Console.error("Error enviando correo de verificación:", error);
        } finally {
            setLoading(false);
        }
    };

    const getButtonTitle = () => {
        if (isActive) {
            return `Espera ${timeLeft}s`;
        }
        return "Enviar Correo de Verificación";
    };

    return (
        <div className="w-full h-dvh flex flex-col text-center p-4 pt-6 gap-24">
            <Alert
                heading={alert.heading}
                text={alert.text}
                isVisible={alert.isVisible}
                onClose={hideAlert}
                type={alert.type}
            />
            <div className="flex gap-3">
                <ArrowLeft
                    strokeWidth={3}
                    className="mt-[5px] cursor-pointer"
                    onClick={() => navigation(-1)}
                />
                <Heading title={"Regresar"} />
            </div>
            <div className="px-2">
                <p className="">Hola {user?.fullname?.firstname}</p>
                <h1 className="text-2xl font-bold">Verifica tu Correo</h1>
                <img src={mailImg} alt="Verificar Correo" className="h-24 mx-auto mb-4" />
                <span className="inline-block font-semibold bg-green-200 rounded-lg px-4 py-2 my-3">
                    {user.email}
                </span>
                <p className="text-sm mb-6">
                    Haz clic en el botón Enviar Correo de Verificación para recibir el enlace
                    de verificación y activar tu cuenta.
                </p>
                <Button
                    title={getButtonTitle()}
                    classes={"bg-orange-500"}
                    loading={loading}
                    loadingMessage={"Enviando correo..."}
                    fun={sendVerificationEmail}
                    disabled={loading || isActive}
                />
            </div>
        </div>
    );
};

export default VerifyEmail