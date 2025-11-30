import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * Loading Skeletons profesionales para diferentes componentes
 */

// Skeleton para tarjeta de viaje
export const RideCardSkeleton = () => {
  return (
    <div className="bg-white rounded-uber-lg shadow-uber p-4 mb-3">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton circle width={48} height={48} />
        <div className="flex-1">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={16} className="mt-1" />
        </div>
      </div>
      <Skeleton count={2} height={16} className="mb-2" />
      <div className="flex gap-2 mt-3">
        <Skeleton width={80} height={32} borderRadius={8} />
        <Skeleton width={80} height={32} borderRadius={8} />
      </div>
    </div>
  );
};

// Skeleton para lista de viajes
export const RideListSkeleton = ({ count = 3 }) => {
  return (
    <div>
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <RideCardSkeleton key={index} />
        ))}
    </div>
  );
};

// Skeleton para perfil de usuario/conductor
export const ProfileSkeleton = () => {
  return (
    <div className="bg-white rounded-uber-lg shadow-uber p-6">
      <div className="flex flex-col items-center mb-6">
        <Skeleton circle width={96} height={96} />
        <Skeleton width={150} height={24} className="mt-4" />
        <Skeleton width={120} height={16} className="mt-2" />
      </div>
      <div className="space-y-4">
        <div>
          <Skeleton width={80} height={16} className="mb-2" />
          <Skeleton height={48} borderRadius={12} />
        </div>
        <div>
          <Skeleton width={80} height={16} className="mb-2" />
          <Skeleton height={48} borderRadius={12} />
        </div>
        <div>
          <Skeleton width={80} height={16} className="mb-2" />
          <Skeleton height={48} borderRadius={12} />
        </div>
      </div>
    </div>
  );
};

// Skeleton para mensaje de chat
export const ChatMessageSkeleton = ({ isOwnMessage = false }) => {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'bg-black' : 'bg-uber-extra-light-gray'} rounded-uber-lg p-3`}>
        <Skeleton
          width={Math.random() * 100 + 120}
          height={16}
          baseColor={isOwnMessage ? '#333' : '#E0E0E0'}
          highlightColor={isOwnMessage ? '#555' : '#F5F5F5'}
        />
      </div>
    </div>
  );
};

// Skeleton para lista de mensajes
export const ChatListSkeleton = ({ count = 5 }) => {
  return (
    <div>
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <ChatMessageSkeleton key={index} isOwnMessage={index % 2 === 0} />
        ))}
    </div>
  );
};

// Skeleton para estadísticas de conductor
export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array(4)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="bg-white rounded-uber-lg shadow-uber p-4">
            <Skeleton width={60} height={16} className="mb-2" />
            <Skeleton width="80%" height={28} />
          </div>
        ))}
    </div>
  );
};

// Skeleton genérico de texto
export const TextSkeleton = ({ lines = 3, width = '100%' }) => {
  return (
    <div>
      {Array(lines)
        .fill(0)
        .map((_, index) => (
          <Skeleton key={index} width={width} height={16} className="mb-2" />
        ))}
    </div>
  );
};

// Skeleton para botón
export const ButtonSkeleton = ({ width = '100%', height = 48 }) => {
  return <Skeleton width={width} height={height} borderRadius={12} />;
};

export default {
  RideCardSkeleton,
  RideListSkeleton,
  ProfileSkeleton,
  ChatMessageSkeleton,
  ChatListSkeleton,
  StatsSkeleton,
  TextSkeleton,
  ButtonSkeleton,
};
