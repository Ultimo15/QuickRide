// Icono de Carro para el mapa - Estilo Uber
const CarMarker = ({ className = "w-12 h-12", color = "#000000" }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sombra */}
      <ellipse
        cx="32"
        cy="56"
        rx="20"
        ry="4"
        fill="#000000"
        opacity="0.2"
      />

      {/* Cuerpo del carro */}
      <path
        d="M12 36L16 24L20 20H44L48 24L52 36V48C52 50.2091 50.2091 52 48 52H16C13.7909 52 12 50.2091 12 48V36Z"
        fill={color}
      />

      {/* Techo */}
      <path
        d="M20 20L24 12H40L44 20H20Z"
        fill={color}
        opacity="0.8"
      />

      {/* Ventanas */}
      <rect
        x="22"
        y="14"
        width="8"
        height="8"
        rx="1"
        fill="#E0F2FE"
        opacity="0.6"
      />
      <rect
        x="34"
        y="14"
        width="8"
        height="8"
        rx="1"
        fill="#E0F2FE"
        opacity="0.6"
      />

      {/* Ruedas */}
      <circle cx="20" cy="48" r="5" fill="#1A1A1A" />
      <circle cx="20" cy="48" r="2" fill="#545454" />
      <circle cx="44" cy="48" r="5" fill="#1A1A1A" />
      <circle cx="44" cy="48" r="2" fill="#545454" />

      {/* Luces delanteras */}
      <circle cx="48" cy="32" r="2" fill="#FFC107" opacity="0.8" />
      <circle cx="48" cy="38" r="2" fill="#FFC107" opacity="0.8" />

      {/* Dirección indicator (flecha pequeña) */}
      <path
        d="M54 28L58 32L54 36V28Z"
        fill="#00C853"
      />
    </svg>
  );
};

export default CarMarker;
