import api from './index';

export const getOrders = async (params) => {
  const response = await api.get('/orders', { params });
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

export const autoAssignAgent = async (id) => {
  const response = await api.post(`/orders/${id}/auto-assign`);
  return response.data;
};

export const overrideStatus = async (id, overrideData) => {
  const response = await api.patch(`/orders/${id}/override-status`, overrideData);
  return response.data;
};

export const rescheduleOrder = async (id, rescheduleData) => {
  const response = await api.post(`/orders/${id}/reschedule`, rescheduleData);
  return response.data;
};
