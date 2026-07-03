import api from './index';

export const getZones = async () => {
  const response = await api.get('/admin/zones');
  return response.data;
};

export const createZone = async (zoneData) => {
  const response = await api.post('/admin/zones', zoneData);
  return response.data;
};

export const deleteZone = async (id) => {
  const response = await api.delete(`/admin/zones/${id}`);
  return response.data;
};

export const getRateCards = async () => {
  const response = await api.get('/admin/rate-cards');
  return response.data;
};

export const createRateCard = async (rateCardData) => {
  const response = await api.post('/admin/rate-cards', rateCardData);
  return response.data;
};

export const getAgents = async () => {
  const response = await api.get('/admin/agents');
  return response.data;
};

export const createAgent = async (agentData) => {
  const response = await api.post('/admin/agents', agentData);
  return response.data;
};

export const getCustomers = async () => {
  const response = await api.get('/admin/customers');
  return response.data;
};

export const createCustomer = async (customerData) => {
  const response = await api.post('/admin/customers', customerData);
  return response.data;
};
