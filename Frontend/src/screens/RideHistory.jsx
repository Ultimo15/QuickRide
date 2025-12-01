import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  CreditCard,
  MapPin,
  Navigation,
  Filter,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";

/**
 * RideHistory - Historial de viajes profesional estilo Uber
 * Con filtros, búsqueda, tarjetas mejoradas y animaciones
 */
function RideHistory() {
  const navigation = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [user] = useState(userData.data);
  const [filter, setFilter] = useState("all"); // all, completed, cancelled
  const [searchQuery, setSearchQuery] = useState("");

  function classifyAndSortRides(rides) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = (date) =>
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    const isYesterday = (date) =>
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate();

    const sortByDate = (rides) =>
      rides.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const todayRides = [];
    const yesterdayRides = [];
    const earlierRides = [];

    rides.forEach((ride) => {
      const createdDate = new Date(ride.createdAt);
      if (isToday(createdDate)) {
        todayRides.push(ride);
      } else if (isYesterday(createdDate)) {
        yesterdayRides.push(ride);
      } else {
        earlierRides.push(ride);
      }
    });

    return {
      today: sortByDate(todayRides),
      yesterday: sortByDate(yesterdayRides),
      earlier: sortByDate(earlierRides),
    };
  }

  // Filter and search rides
  const filteredRides = useMemo(() => {
    let rides = user.rides || [];

    // Apply status filter
    if (filter === "completed") {
      rides = rides.filter((ride) => ride.status === "completed");
    } else if (filter === "cancelled") {
      rides = rides.filter((ride) => ride.status === "cancelled");
    }

    // Apply search
    if (searchQuery.trim()) {
      rides = rides.filter(
        (ride) =>
          ride.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ride.destination.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return rides;
  }, [user.rides, filter, searchQuery]);

  const classifiedRides = classifyAndSortRides(filteredRides);
  const totalRides = filteredRides.length;

  return (
    <div className="min-h-screen bg-uber-extra-light-gray">
      {/* HEADER */}
      <motion.div
        className="bg-gradient-to-r from-black to-uber-dark-gray p-6 pb-8"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            onClick={() => navigation(-1)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-white">Historial de viajes</h1>
            <p className="text-sm text-uber-light-gray mt-0.5">
              {totalRides} {totalRides === 1 ? "viaje" : "viajes"} encontrados
            </p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-uber-medium-gray" />
          <input
            type="text"
            placeholder="Buscar por ubicación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-transparent focus:border-uber-green rounded-uber-xl text-black placeholder-uber-medium-gray outline-none transition-all"
          />
        </div>

        {/* FILTERS */}
        <div className="flex gap-2 mt-4">
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
            icon={<Filter className="w-4 h-4" />}
            label="Todos"
          />
          <FilterButton
            active={filter === "completed"}
            onClick={() => setFilter("completed")}
            icon={<CheckCircle className="w-4 h-4" />}
            label="Completados"
          />
          <FilterButton
            active={filter === "cancelled"}
            onClick={() => setFilter("cancelled")}
            icon={<XCircle className="w-4 h-4" />}
            label="Cancelados"
          />
        </div>
      </motion.div>

      {/* CONTENT */}
      <div className="p-4 pb-20">
        {totalRides === 0 ? (
          <EmptyState
            icon={<Calendar className="w-16 h-16" />}
            title="No hay viajes"
            message={
              searchQuery
                ? "No encontramos viajes que coincidan con tu búsqueda"
                : filter === "all"
                ? "Aún no has realizado ningún viaje"
                : `No tienes viajes ${filter === "completed" ? "completados" : "cancelados"}`
            }
          />
        ) : (
          <div className="space-y-6">
            {/* TODAY */}
            {classifiedRides.today.length > 0 && (
              <Section title="Hoy" rides={classifiedRides.today} />
            )}

            {/* YESTERDAY */}
            {classifiedRides.yesterday.length > 0 && (
              <Section title="Ayer" rides={classifiedRides.yesterday} />
            )}

            {/* EARLIER */}
            {classifiedRides.earlier.length > 0 && (
              <Section title="Anteriores" rides={classifiedRides.earlier} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Filter Button Component
const FilterButton = ({ active, onClick, icon, label }) => (
  <motion.button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-uber-lg font-semibold text-sm transition-all ${
      active
        ? "bg-uber-green text-white shadow-uber"
        : "bg-white/10 text-white hover:bg-white/20"
    }`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    {icon}
    <span>{label}</span>
  </motion.button>
);

// Section Component
const Section = ({ title, rides }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full mb-3 group"
        whileTap={{ scale: 0.98 }}
      >
        <h2 className="text-lg font-bold text-black">{title}</h2>
        <motion.div
          animate={{ rotate: isOpen ? 0 : -180 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-uber-medium-gray group-hover:text-black transition-colors" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {rides.map((ride, index) => (
              <RideCard key={ride._id} ride={ride} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Ride Card Component
export const RideCard = ({ ride, index }) => {
  function formatDate(inputDate) {
    const date = new Date(inputDate);
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  }

  function formatTime(inputDate) {
    const date = new Date(inputDate);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${formattedMinutes} ${period}`;
  }

  const statusConfig = {
    completed: {
      bg: "bg-uber-green/10",
      border: "border-uber-green",
      text: "text-uber-green",
      icon: <CheckCircle className="w-4 h-4" />,
      label: "Completado",
    },
    cancelled: {
      bg: "bg-uber-red/10",
      border: "border-uber-red",
      text: "text-uber-red",
      icon: <XCircle className="w-4 h-4" />,
      label: "Cancelado",
    },
  };

  const status = statusConfig[ride.status] || statusConfig.completed;

  return (
    <motion.div
      className="bg-white rounded-uber-xl p-4 shadow-uber border-2 border-uber-light-gray hover:border-black transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, y: -2 }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-uber-medium-gray font-medium">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(ride.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-uber-medium-gray font-medium">
            <Clock className="w-4 h-4" />
            <span>{formatTime(ride.createdAt)}</span>
          </div>
        </div>

        {/* STATUS BADGE */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-uber-lg border ${status.bg} ${status.border}`}
        >
          {status.icon}
          <span className={`text-xs font-bold ${status.text}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* ROUTE */}
      <div className="relative pl-6 mb-4">
        {/* LINE */}
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-uber-green to-uber-red" />

        {/* ORIGIN */}
        <div className="relative mb-3">
          <div className="absolute -left-6 top-1">
            <div className="w-4 h-4 rounded-full bg-uber-green border-2 border-white shadow-uber" />
          </div>
          <div>
            <p className="text-xs text-uber-medium-gray font-semibold mb-0.5">
              Origen
            </p>
            <p className="text-sm font-bold text-black leading-tight">
              {ride.pickup.split(", ")[0]}
            </p>
            <p className="text-xs text-uber-medium-gray truncate">
              {ride.pickup.split(", ").slice(1).join(", ")}
            </p>
          </div>
        </div>

        {/* DESTINATION */}
        <div className="relative">
          <div className="absolute -left-6 top-1">
            <div className="w-4 h-4 rounded-sm bg-uber-red border-2 border-white shadow-uber" />
          </div>
          <div>
            <p className="text-xs text-uber-medium-gray font-semibold mb-0.5">
              Destino
            </p>
            <p className="text-sm font-bold text-black leading-tight">
              {ride.destination.split(", ")[0]}
            </p>
            <p className="text-xs text-uber-medium-gray truncate">
              {ride.destination.split(", ").slice(1).join(", ")}
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between pt-3 border-t-2 border-uber-light-gray">
        <div className="flex items-center gap-4">
          {ride.distance && (
            <div className="flex items-center gap-1.5 text-xs text-uber-medium-gray font-medium">
              <Navigation className="w-4 h-4" />
              <span>{(ride.distance / 1000).toFixed(1)} km</span>
            </div>
          )}
          {ride.duration && (
            <div className="flex items-center gap-1.5 text-xs text-uber-medium-gray font-medium">
              <Clock className="w-4 h-4" />
              <span>{Math.round(ride.duration / 60)} min</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-uber-green" />
          <span className="text-lg font-bold text-black">
            ${ride.fare?.toLocaleString("es-CO")}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default RideHistory;
