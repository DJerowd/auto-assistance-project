import apiClient from "../config/api";
import type { PaginatedResponse, AdminVehicle } from "../types";

export const createBrand = async (name: string) => {
  const response = await apiClient.post("/admin/brands", { name });
  return response.data;
};

export const updateBrand = async (id: number, name: string) => {
  await apiClient.put(`/admin/brands/${id}`, { name });
};

export const deleteBrand = async (id: number) => {
  await apiClient.delete(`/admin/brands/${id}`);
};

export const createColor = async (name: string, hex: string) => {
  const response = await apiClient.post("/admin/colors", { name, hex });
  return response.data;
};

export const updateColor = async (id: number, name: string, hex: string) => {
  await apiClient.put(`/admin/colors/${id}`, { name, hex });
};

export const deleteColor = async (id: number) => {
  await apiClient.delete(`/admin/colors/${id}`);
};

export const createFeature = async (name: string) => {
  const response = await apiClient.post("/admin/features", { name });
  return response.data;
};

export const updateFeature = async (id: number, name: string) => {
  await apiClient.put(`/admin/features/${id}`, { name });
};

export const deleteFeature = async (id: number) => {
  await apiClient.delete(`/admin/features/${id}`);
};

export const createServiceType = async (name: string) => {
  const response = await apiClient.post("/admin/service-types", { name });
  return response.data;
};

export const updateServiceType = async (id: number, name: string) => {
  await apiClient.put(`/admin/service-types/${id}`, { name });
};

export const deleteServiceType = async (id: number) => {
  await apiClient.delete(`/admin/service-types/${id}`);
};

export const getAllUsers = async (search = "") => {
  const response = await apiClient.get("/admin/users", {
    params: { search },
  });
  return response.data;
};

export const updateUserRole = async (id: number, role: "ADMIN" | "USER") => {
  const response = await apiClient.patch(`/admin/users/${id}/role`, { role });
  return response.data;
};

export const deleteUser = async (id: number) => {
  await apiClient.delete(`/admin/users/${id}`);
};

export const getAllVehicles = async (
  page = 1,
  limit = 20,
  ownerEmail = "",
  model = ""
): Promise<PaginatedResponse<AdminVehicle>> => {
  const response = await apiClient.get("/admin/vehicles", {
    params: { page, limit, ownerEmail, model },
  });
  return response.data;
};

export const deleteVehicleAdmin = async (id: number) => {
  await apiClient.delete(`/admin/vehicles/${id}`);
};
