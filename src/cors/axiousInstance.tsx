
import { refreshTokenApi } from "@/store/DoctorSideApi/refreshTockenApi";
import axios from "axios";




// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Custom-Header': 'CustomValue'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
 
    const accessToken = localStorage.getItem("AccessToken");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('Response interceptor error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });

    if (error.response && error.response.status === 401) {        

        try {
          console.log("calling doctor refresh");
        const  refreshToken = localStorage.getItem("RefreshToken")

          if (!refreshToken) {

            window.location.href = "/login";
            return Promise.reject(error);
          }

          const response=   await  refreshTokenApi(refreshToken)


          console.log('Doctor refresh response insidde the intercepter:', response);
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;


            localStorage.setItem("AccessToken", accessToken);
            localStorage.setItem("RefreshToken", refreshToken);

          error.config.headers["Authorization"] = `Bearer ${accessToken}`;
          return axiosInstance.request(error.config);
          
        } catch (refreshError) {

         console.error('Doctor refresh errror inside the indercepter:',refreshError)
           window.location.href = "/login";
           return Promise.reject(error);
        }
        
      } 
      
    return Promise.reject(error);
  }
);

export default axiosInstance;

