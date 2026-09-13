import client from './client';
export const getDashboard = (period) => client.get(`/api/dashboard?period=${period}`);
