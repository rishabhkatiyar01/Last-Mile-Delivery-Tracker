import api from './index';

export const updateLocation = async (lat, lng) => {
  const response = await api.patch('/agent/location', { lat, lng });
  return response.data;
};

export const updateAvailability = async (status) => {
  const response = await api.patch('/agent/availability', { status });
  return response.data;
};
