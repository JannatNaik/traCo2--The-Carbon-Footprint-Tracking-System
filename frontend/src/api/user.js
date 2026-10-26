import client from './client';
export const getProfile = () => client.get('/api/user/profile');
export const updateProfile = (data) => client.put('/api/user/profile', data);
export const uploadAvatar = (formData) => client.post('/api/user/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
