import { useState, useEffect } from 'react';
import { DEFAULT_LOCATION } from '../utils/constants';

/**
 * Hook personalizado para obtener la geolocalización del usuario
 * Si falla, usa la ubicación por defecto (San Antonio del Táchira, Venezuela)
 */
const useGeolocation = () => {
  const [location, setLocation] = useState({
    latitude: DEFAULT_LOCATION.lat,
    longitude: DEFAULT_LOCATION.lng,
    accuracy: null,
    error: null,
    loading: true,
  });

  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }

    // Opciones de geolocalización
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    // Callback de éxito
    const handleSuccess = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
      });
    };

    // Callback de error
    const handleError = (error) => {
      console.warn('Error getting location:', error.message);
      
      // Usar ubicación por defecto en caso de error
      setLocation({
        latitude: DEFAULT_LOCATION.lat,
        longitude: DEFAULT_LOCATION.lng,
        accuracy: null,
        error: error.message,
        loading: false,
      });
    };

    // Obtener posición actual
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      options
    );

    // Observar cambios en la posición
    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );

    setWatchId(id);

    // Cleanup
    return () => {
      if (id) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, []);

  // Función para actualizar manualmente la ubicación
  const refreshLocation = () => {
    setLocation((prev) => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setLocation({
          latitude: DEFAULT_LOCATION.lat,
          longitude: DEFAULT_LOCATION.lng,
          accuracy: null,
          error: error.message,
          loading: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return {
    ...location,
    refreshLocation,
  };
};

export default useGeolocation;