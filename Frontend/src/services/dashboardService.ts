import apiClient from '../config/api';

export const getDashboardStats = async () => {
    const response = await apiClient.get('/dashboard');
    return response.data;
};