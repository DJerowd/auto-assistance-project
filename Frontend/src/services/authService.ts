import apiClient from '../config/api';
import type { LoginCredentials, RegisterData } from '../types';

export const loginUser = async (credentials: LoginCredentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (data: RegisterData) => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};