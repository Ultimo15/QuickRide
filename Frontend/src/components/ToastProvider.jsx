import { Toaster } from 'react-hot-toast';

/**
 * ToastProvider - Configuración global de react-hot-toast
 * Proporciona notificaciones estilo Uber
 */
const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Opciones por defecto para todos los toasts
        className: '',
        duration: 4000,
        style: {
          background: '#FFFFFF',
          color: '#000000',
          borderRadius: '12px',
          padding: '16px 20px',
          fontSize: '15px',
          fontWeight: '500',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          maxWidth: '500px',
        },

        // Estilos específicos por tipo
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#00C853',
            secondary: '#FFFFFF',
          },
          style: {
            border: '2px solid #00C853',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#D32F2F',
            secondary: '#FFFFFF',
          },
          style: {
            border: '2px solid #D32F2F',
          },
        },
        loading: {
          iconTheme: {
            primary: '#000000',
            secondary: '#FFFFFF',
          },
        },
      }}
    />
  );
};

export default ToastProvider;
