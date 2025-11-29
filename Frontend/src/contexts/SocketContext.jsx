import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import Console from "../utils/console";

export const SocketDataContext = createContext();

function SocketContext({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Crear instancia de socket con configuración completa
    const socketInstance = io(import.meta.env.VITE_SERVER_URL, {
      transports: ['websocket', 'polling'], // CRÍTICO para Render
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 20000
    });

    // Evento: Conexión exitosa
    socketInstance.on('connect', () => {
      Console.log('✅ Connected to server. Socket ID:', socketInstance.id);
      setConnected(true);
    });

    // Evento: Desconexión
    socketInstance.on('disconnect', (reason) => {
      Console.log('❌ Disconnected from server. Reason:', reason);
      setConnected(false);
    });

    // Evento: Error de conexión
    socketInstance.on('connect_error', (error) => {
      Console.error('🔴 Socket connection error:', error.message);
    });

    setSocket(socketInstance);

    // Cleanup al desmontar
    return () => {
      Console.log('🔌 Cleaning up socket connection');
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketDataContext.Provider value={{ socket, connected }}>
      {children}
    </SocketDataContext.Provider>
  );
}

export default SocketContext;