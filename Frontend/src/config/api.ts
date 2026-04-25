import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const { logout } = useAuthStore.getState();
      const { disconnect } = useChatStore.getState();
      disconnect();
      logout();
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
