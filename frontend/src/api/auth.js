import client from './client';
export const register = (data) => client.post('/api/auth/register', data);
export const login = (data) => client.post('/api/auth/login', data);
export const logout = () => client.post('/api/auth/logout');
export const forgotPassword = (email) => client.post('/api/auth/forgot-password', { email });
export const resetPassword = (data) => client.post('/api/auth/reset-password', data);
