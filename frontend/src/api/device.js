import client from './client';
export const getDevices = () => client.get('/api/device');
export const registerDevice = (data) => client.post('/api/device/register', data);
export const deleteDevice = (id) => client.delete(`/api/device/${id}`);
