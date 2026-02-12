import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { supabase } from "./supabase";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach Supabase JWT token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch {
      // Silently fail — request will proceed without auth
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — sign out
      await supabase.auth.signOut();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
