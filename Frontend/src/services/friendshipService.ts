import apiClient from "../config/api";
import type { Friend, FriendRequest, Vehicle } from "../types";

export const getFriends = async (): Promise<Friend[]> => {
  const response = await apiClient.get("/friendships");
  return response.data;
};

export const searchPotentialFriends = async (query: string): Promise<Friend[]> => {
  const response = await apiClient.get(`/friendships/search?q=${query}`);
  return response.data;
};

export const getPendingRequests = async (): Promise<FriendRequest[]> => {
  const response = await apiClient.get("/friendships/requests");
  return response.data;
};

export const sendFriendRequest = async (email: string) => {
  const response = await apiClient.post("/friendships/request", { email });
  return response.data;
};

export const respondFriendRequest = async (
  id: number,
  action: "ACCEPT" | "REJECT",
) => {
  const response = await apiClient.put(`/friendships/requests/${id}`, {
    action,
  });
  return response.data;
};

export const removeFriend = async (id: number) => {
  await apiClient.delete(`/friendships/${id}`);
};

export const getFriendVehicles = async (
  friendId: number,
): Promise<Vehicle[]> => {
  const response = await apiClient.get(`/vehicles/friend/${friendId}`);
  return response.data;
};
