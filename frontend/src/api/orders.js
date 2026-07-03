import api from './index';

export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getOrder = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const getQuote = async (data) => {
  const response = await api.post('/orders/quote', data);
  return response.data;
};

export const createOrder = async (data) => {
  const response = await api.post('/orders', data);
  return response.data;
};

export const getTracking = async (id) => {
  const response = await api.get(`/orders/${id}/tracking`);
  return response.data;
};

export const updateStatus = async (id, statusData) => {
  const response = await api.patch(`/orders/${id}/status`, statusData);
  return response.data;
};

export const assignAgent = async (id, agentId) => {
  const response = await api.patch(`/orders/${id}/assign`, { agentId });
  return response.data;
};
