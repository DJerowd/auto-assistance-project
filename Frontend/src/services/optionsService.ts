import apiClient from "../config/api";
import type { VehicleOptions } from "../types";

export const getVehicleOptions = async (): Promise<VehicleOptions> => {
  const response = await apiClient.get("/data/vehicle-options");
  return response.data;
};
