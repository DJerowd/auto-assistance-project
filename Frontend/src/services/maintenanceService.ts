import apiClient from "../config/api";
import type {
  Maintenance,
  MaintenanceFormData,
  PaginatedResponse,
} from "../types";

export const getVehicleMaintenances = async (
  vehicleId: number,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Maintenance>> => {
  const response = await apiClient.get(`/vehicles/${vehicleId}/maintenances`, {
    params: { page, limit },
  });
  return response.data;
};

export const createMaintenance = async (
  vehicleId: number,
  data: MaintenanceFormData
) => {
  const response = await apiClient.post(
    `/vehicles/${vehicleId}/maintenances`,
    data
  );
  return response.data;
};

export const updateMaintenance = async (
  id: number,
  data: MaintenanceFormData
) => {
  const response = await apiClient.put(`/maintenances/${id}`, data);
  return response.data;
};

export const deleteMaintenance = async (id: number) => {
  const response = await apiClient.delete(`/maintenances/${id}`);
  return response.data;
};
