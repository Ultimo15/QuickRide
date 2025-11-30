// Pin de Origen (Punto A) - Estilo Uber
const OriginPin = ({ className = "w-10 h-10" }) => {
  return (
    <svg
      viewBox="0 0 48 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sombra */}
      <ellipse
        cx="24"
        cy="60"
        rx="12"
        ry="3"
        fill="#000000"
        opacity="0.3"
      />

      {/* Pin principal */}
      <path
        d="M24 0C13.5066 0 5 8.50659 5 19C5 32.5 24 56 24 56C24 56 43 32.5 43 19C43 8.50659 34.4934 0 24 0Z"
        fill="#000000"
      />

      {/* Borde blanco */}
      <path
        d="M24 2C14.6112 2 7 9.61116 7 19C7 30.5 24 52 24 52C24 52 41 30.5 41 19C41 9.61116 33.3888 2 24 2Z"
        fill="#000000"
        stroke="#FFFFFF"
        strokeWidth="1"
      />

      {/* Círculo central con "A" */}
      <circle cx="24" cy="19" r="10" fill="#FFFFFF" />

      {/* Letra "A" */}
      <text
        x="24"
        y="26"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fontFamily="Poppins, sans-serif"
        fill="#000000"
      >
        A
      </text>
    </svg>
  );
};

export default OriginPin;
