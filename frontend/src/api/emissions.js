import client from './client';
export const logElectricity = (data) => client.post('/api/emissions/electricity', data);
export const uploadBill = (formData) => client.post('/api/emissions/electricity/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const logTransport = (data) => client.post('/api/emissions/transport', data);
export const logFood = (data) => client.post('/api/emissions/food', data);
export const logWaste = (data) => client.post('/api/emissions/waste', data);
export const logWater = (data) => client.post('/api/emissions/water', data);
export const getEmissions = (params) => client.get('/api/emissions', { params });
