// Pin de Ubicación del Usuario - Estilo Uber
const UserLocationPin = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Pulso exterior (animado con CSS) */}
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="#1877F2"
        opacity="0.15"
        className="animate-pulse"
      />

      {/* Círculo medio */}
      <circle
        cx="24"
        cy="24"
        r="16"
        fill="#1877F2"
        opacity="0.3"
      />

      {/* Círculo principal */}
      <circle
        cx="24"
        cy="24"
        r="10"
        fill="#1877F2"
        stroke="#FFFFFF"
        strokeWidth="3"
      />

      {/* Punto central */}
      <circle
        cx="24"
        cy="24"
        r="4"
        fill="#FFFFFF"
      />
    </svg>
  );
};

export default UserLocationPin;
