import client from './client';
export const getBadges = () => client.get('/api/rewards/badges');
export const getCredits = () => client.get('/api/rewards/credits');
export const getChallenges = () => client.get('/api/rewards/challenges');
