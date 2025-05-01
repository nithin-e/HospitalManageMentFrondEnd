import { logoutAdmin, logoutUser } from "@/store/redux/slices/authSlice";
import { store } from "@/store/redux/store";
import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Custom-Header': 'CustomValue'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Check if we're making an authenticated request
    if (!config.url?.includes('/auth/login')) {
      // Determine which token to use based on endpoint or other logic
      const isAdminEndpoint = config.url?.includes('/admin');
      
      // Get the appropriate token
      const accessToken = isAdminEndpoint 
        ? localStorage.getItem("adminAccessToken") 
        : localStorage.getItem("userAccessToken");
      
      // If no token exists, dispatch logout
      if (!accessToken) {
        if (isAdminEndpoint) {
          store.dispatch(logoutAdmin());
        } else {
          store.dispatch(logoutUser());
        }
        
        // You could throw an error here or let the request continue
        // return Promise.reject(new Error('No authentication token'));
      }
      
      // Add token to request headers
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        
        // Add refresh token if needed
        const refreshToken = isAdminEndpoint
          ? localStorage.getItem("adminRefreshToken")
          : localStorage.getItem("userRefreshToken");
          
        if (refreshToken) {
          config.headers["x-refresh-token"] = refreshToken;
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
   
    if (error.response && error.response.status === 401) {
      // Determine which user to logout based on the request URL
      const isAdminEndpoint = error.config.url?.includes('/admin');
      
      if (isAdminEndpoint) {
        store.dispatch(logoutAdmin());
      } else {
        store.dispatch(logoutUser());
      }
      
      // Redirect to login page if needed
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;