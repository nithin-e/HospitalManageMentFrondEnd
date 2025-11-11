import { refreshTokenApi } from "@/store/DoctorSideApi/refreshTockenApi";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("AccessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (config.method !== "get" && config.method !== "delete") {
      config.headers["Content-Type"] = "application/json";
    } else {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response received:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.error("Response interceptor error:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });

    if (error.response && error.response.status === 401) {
      try {
        console.log("calling doctor refresh");
        const refreshToken = localStorage.getItem("RefreshToken");

        if (!refreshToken) {
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const response = await refreshTokenApi(refreshToken);
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem("AccessToken", accessToken);
        localStorage.setItem("RefreshToken", newRefreshToken);

        error.config.headers["Authorization"] = `Bearer ${accessToken}`;
        return axiosInstance.request(error.config);
      } catch (refreshError) {
        console.error("Doctor refresh error inside the interceptor:", refreshError);
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
