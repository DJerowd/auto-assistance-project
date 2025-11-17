import apiClient from "../config/api";
import type { ReminderFormData, Reminder } from "../types";

export const getVehicleReminders = async (
  vehicleId: number,
  page = 1,
  limit = 20,
  status?: Reminder['status'] 
) => {
  const response = await apiClient.get(`/vehicles/${vehicleId}/reminders`, {
    params: { page, limit, status },
  });
  return response.data;
};

export const createReminder = async (
  vehicleId: number,
  data: ReminderFormData
) => {
  const response = await apiClient.post(
    `/vehicles/${vehicleId}/reminders`,
    data
  );
  return response.data;
};

export const updateReminder = async (id: number, data: ReminderFormData) => {
  const response = await apiClient.put(`/reminders/${id}`, data);
  return response.data;
};

export const deleteReminder = async (id: number) => {
  const response = await apiClient.delete(`/reminders/${id}`);
  return response.data;
};
