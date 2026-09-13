import client from './client';
export const getReport = (params) => client.get('/api/reports', { params });
export const exportCsv = (params) => client.get('/api/reports/export/csv', { params, responseType: 'blob' });
