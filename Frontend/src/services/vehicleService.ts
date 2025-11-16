import apiClient from "../config/api";
import type { VehicleFormData } from "../types";

export const getVehicles = async (page = 1, limit = 10) => {
  const response = await apiClient.get("/vehicles", {
    params: { page, limit },
  });
  return response.data;
};

export const getVehicleById = async (id: number) => {
  const response = await apiClient.get(`/vehicles/${id}`);
  return response.data;
};

export const createVehicle = async (data: VehicleFormData) => {
  const response = await apiClient.post("/vehicles", data);
  return response.data;
};

export const updateVehicle = async (id: number, data: VehicleFormData) => {
  const response = await apiClient.put(`/vehicles/${id}`, data);
  return response.data;
};

export const deleteVehicle = async (id: number) => {
  const response = await apiClient.delete(`/vehicles/${id}`);
  return response.data;
};
