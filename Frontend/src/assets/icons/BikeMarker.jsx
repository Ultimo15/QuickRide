// Icono de Moto para el mapa - Estilo Uber
const BikeMarker = ({ className = "w-12 h-12", color = "#000000" }) => {
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
        rx="18"
        ry="3"
        fill="#000000"
        opacity="0.2"
      />

      {/* Rueda trasera */}
      <circle cx="18" cy="46" r="7" fill="#1A1A1A" />
      <circle cx="18" cy="46" r="4" fill="#545454" />
      <circle cx="18" cy="46" r="2" fill="#EEEEEE" />

      {/* Rueda delantera */}
      <circle cx="46" cy="46" r="7" fill="#1A1A1A" />
      <circle cx="46" cy="46" r="4" fill="#545454" />
      <circle cx="46" cy="46" r="2" fill="#EEEEEE" />

      {/* Chasis */}
      <path
        d="M18 46L28 28L38 28L46 46"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Asiento */}
      <path
        d="M26 28L30 24H34L38 28"
        fill={color}
      />

      {/* Manillar */}
      <path
        d="M38 28L42 24"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="42" cy="22" r="2" fill={color} />

      {/* Piloto (conductor) */}
      <circle cx="32" cy="18" r="4" fill="#1A1A1A" />
      <path
        d="M32 22L32 30"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Casco */}
      <path
        d="M28 16C28 13.7909 29.7909 12 32 12C34.2091 12 36 13.7909 36 16V18H28V16Z"
        fill="#00C853"
      />

      {/* Luz delantera */}
      <circle cx="48" cy="40" r="2" fill="#FFC107" opacity="0.9" />

      {/* Dirección indicator (flecha pequeña) */}
      <path
        d="M52 38L56 42L52 46V38Z"
        fill="#00C853"
      />
    </svg>
  );
};

export default BikeMarker;
