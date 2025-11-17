import apiClient from "../config/api";

interface ProfileData {
  name: string;
  email: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const getProfile = async () => {
  const response = await apiClient.get("/profile");
  return response.data;
};

export const updateProfile = async (data: ProfileData) => {
  const response = await apiClient.put("/profile", data);
  return response.data;
};

export const changePassword = async (data: PasswordData) => {
  const response = await apiClient.put("/profile/change-password", data);
  return response.data;
};
