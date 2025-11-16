import apiClient from "../config/api";

export const uploadVehicleImages = async (vehicleId: number, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await apiClient.post(
    `/vehicles/${vehicleId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const deleteVehicleImage = async (imageId: number) => {
  const response = await apiClient.delete(`/images/${imageId}`);
  return response.data;
};

export const setPrimaryVehicleImage = async (imageId: number) => {
  const response = await apiClient.patch(`/images/${imageId}/set-primary`);
  return response.data;
};
