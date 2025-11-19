import apiClient from "../config/api";
import type {
  Vehicle,
  VehicleFormData,
  PaginatedResponse,
  FilterOptions,
} from "../types";

interface GetVehiclesOptions {
  page?: number;
  limit?: number;
  model?: string;
  favorites?: boolean;
  sortBy?: string;
  order?: string;
  brandId?: string;
  minYear?: number;
  maxYear?: number;
  pendingReminders?: boolean;
}

export const getVehicles = async (
  options: GetVehiclesOptions = {}
): Promise<PaginatedResponse<Vehicle>> => {
  const { 
    page = 1, 
    limit = 10, 
    model = "", 
    favorites = false, 
    sortBy = "created_at", 
    order = "DESC",
    brandId,
    minYear,
    maxYear,
    pendingReminders 
  } = options;

  const response = await apiClient.get("/vehicles", {
    params: { 
      page, 
      limit, 
      model, 
      favorites, 
      sortBy, 
      order,
      brandId,
      minYear,
      maxYear,
      pendingReminders
    },
  });
  return response.data;
};

export const getUserVehicleFilters = async (): Promise<FilterOptions> => {
  const response = await apiClient.get("/vehicles/filters");
  return response.data;
};

export const getVehicleById = async (id: number): Promise<Vehicle> => {
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

export const toggleVehicleFavorite = async (id: number) => {
  const response = await apiClient.patch(`/vehicles/${id}/favorite`);
  return response.data;
};