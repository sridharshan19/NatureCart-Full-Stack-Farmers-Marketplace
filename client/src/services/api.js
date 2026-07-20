import axios from "axios";
import { clearAuthStorage } from "../utils/helpers";

const getDefaultApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, "");
  }
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return window.location.origin;
  }
  return "http://localhost:5000";
};

export const API_BASE_URL = getDefaultApiUrl();

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("naturecart_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
      console.warn("[API] Request timed out. Server might be slow or unresponsive.");
    }

    if (error?.response?.status === 401) {
      clearAuthStorage();
    }

    return Promise.reject(error);
  }
);

export default api;
