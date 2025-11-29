import { useEffect, useState } from "react";
import { ChevronRight, CircleUserRound, History, KeyRound, Menu, X } from "lucide-react";
import Button from "./Button";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Console from "../utils/console";

function Sidebar() {
  const token = localStorage.getItem("token");
  const [showSidebar, setShowSidebar] = useState(false);
  const [newUser, setNewUser] = useState({});

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    setNewUser(userData);
  }, []);

  const navigate = useNavigate();

  const logout = async () => {
    try {
      await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/${newUser.type}/logout`,
        {
          headers: {
            token: token,
          },
        }
      );
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("messages");
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("panelDetails");
      localStorage.removeItem("showPanel");
      localStorage.removeItem("showBtn");
      navigate("/");
    } catch (error) {
      Console.log("Error al cerrar sesión", error);
    }
  };

  return (
    <>
      {/* ============================================
          BOTÓN DE MENÚ (HAMBURGUESA)
          z-50 para estar siempre visible
          ============================================ */}
      <div
        className="m-3 mt-4 absolute right-0 top-0 z-50 cursor-pointer bg-white p-1 rounded shadow-md hover:shadow-lg transition-shadow"
        onClick={() => {
          setShowSidebar(!showSidebar);
        }}
      >
        {showSidebar ? <X /> : <Menu />}
      </div>

      {/* ============================================
          OVERLAY OSCURO (Fondo semi-transparente)
          Aparece cuando el sidebar está abierto
          z-40 para estar debajo del sidebar pero encima de todo lo demás
          ============================================ */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* ============================================
          SIDEBAR PRINCIPAL
          z-50 para estar encima del overlay y todos los paneles
          ============================================ */}
      <div
        className={`${
          showSidebar ? "left-0" : "-left-[100%]"
        } fixed top-0 w-full sm:w-96 h-dvh bg-white p-4 pt-5 flex flex-col justify-between z-50 transition-all duration-300 shadow-2xl overflow-y-auto`}
      >
        {/* CONTENIDO DEL SIDEBAR */}
        <div className="select-none">
          <h1 className="relative text-2xl font-semibold">Perfil</h1>

          {/* INFORMACIÓN DEL USUARIO */}
          <div className="leading-3 mt-8 mb-4">
            <div className="my-2 rounded-full w-24 h-24 bg-blue-400 mx-auto flex items-center justify-center">
              <h1 className="text-5xl text-white">
                {newUser?.data?.fullname?.firstname[0]}
                {newUser?.data?.fullname?.lastname[0]}
              </h1>
            </div>
            <h1 className="text-center font-semibold text-2xl">
              {newUser?.data?.fullname?.firstname}{" "}
              {newUser?.data?.fullname?.lastname}
            </h1>
            <h1 className="mt-1 text-center text-zinc-400">
              {newUser?.data?.email}
            </h1>
          </div>

          {/* OPCIONES DEL MENÚ */}
          <Link
            to={`/${newUser?.type}/edit-profile`}
            className="flex items-center justify-between py-4 cursor-pointer hover:bg-zinc-100 rounded-xl px-3 transition-colors"
            onClick={() => setShowSidebar(false)}
          >
            <div className="flex gap-3">
              <CircleUserRound /> <h1>Editar Perfil</h1>
            </div>
            <div>
              <ChevronRight />
            </div>
          </Link>

          <Link
            to={`/${newUser?.type}/rides`}
            className="flex items-center justify-between py-4 cursor-pointer hover:bg-zinc-100 rounded-xl px-3 transition-colors"
            onClick={() => setShowSidebar(false)}
          >
            <div className="flex gap-3">
              <History /> <h1>Historial de Viajes</h1>
            </div>
            <div>
              <ChevronRight />
            </div>
          </Link>

          <Link
            to={`/${newUser?.type}/reset-password?token=${token}`}
            className="flex items-center justify-between py-4 cursor-pointer hover:bg-zinc-100 rounded-xl px-3 transition-colors"
            onClick={() => setShowSidebar(false)}
          >
            <div className="flex gap-3">
              <KeyRound /> <h1>Cambiar Contraseña</h1>
            </div>
            <div>
              <ChevronRight />
            </div>
          </Link>
        </div>

        {/* BOTÓN DE CERRAR SESIÓN */}
        <div className="pb-4">
          <Button title={"Cerrar Sesión"} classes={"bg-red-600"} fun={logout} />
        </div>
      </div>
    </>
  );
}

export default Sidebar;