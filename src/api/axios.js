import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const UPLOADS_BASE_URL =
  import.meta.env.VITE_UPLOADS_BASE_URL || "http://localhost:8080/uploads";

const API = axios.create({
  baseURL: API_BASE_URL,
});

// JWT TOKEN REQUEST INTERCEPTOR
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// HTTP 401 RESPONSE INTERCEPTOR
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Do not redirect on login requests so the user sees credential error messages
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;