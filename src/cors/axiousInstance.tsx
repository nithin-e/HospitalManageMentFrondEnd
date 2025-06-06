import { logoutAdmin, logoutUser } from "@/store/redux/slices/authSlice";
import { logoutDoctor } from "@/store/redux/slices/DoctorSlice";
import { store } from "@/store/redux/store";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";



// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    'Accept': 'application/json',
    'Custom-Header': 'CustomValue'
   
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {

    if (!config.headers.Authorization && !config.url?.includes('/auth/login')) {
      const isAdminEndpoint = config.url?.includes('/admin');
      const isDoctorEndpoint = config.url?.includes('/doctor');
      // const isUserEndpoint = !isAdminEndpoint && !isDoctorEndpoint;
      
      let accessToken;
      
      if (isAdminEndpoint) {
        accessToken = localStorage.getItem("adminAccessToken");
      } else if (isDoctorEndpoint) {
        console.log('taking doctor tocken');
        
        accessToken = localStorage.getItem("doctorAccessToken");
      } else {
        accessToken = localStorage.getItem("userAccessToken");
      }
  
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    
    console.log('Request config headers:', config.headers);
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
    console.log('Response((((((((((((((((())))))))))))))))) received:', {
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

      const isAdminEndpoint = error.config.url?.includes('/admin');
      const isDoctorEndpoint = error.config.url?.includes('/doctor');
    


     console.log('<<<<<<<<<<<<<<<<<<<<000000000isDoctorEndpoint000000000>>>>>>>>>>>>',isDoctorEndpoint);
     
     
        var refreshToken = null;

        

        try {
          console.log("calling doctor refresh");
 
          if (isDoctorEndpoint){
            refreshToken = localStorage.getItem("doctorRefreshToken");
            console.log('Doctorrefresh token kittando',refreshToken);
            
          }else if(isAdminEndpoint){
            refreshToken= localStorage.getItem("adminRefreshToken");
          }else{
          
            refreshToken = localStorage.getItem("userRefreshToken");

            console.log("calling user refresh <<<<<<<<<>>>>>>>>>>>>> ",refreshToken);
          }

          if (!refreshToken) {
            store.dispatch(logoutDoctor());
            window.location.href = "/login";
            return Promise.reject(error);
          }
          
          const response = await axios.post(`http://localhost:4000/auth/refresh`, {
            token: refreshToken,
          });

          console.log('Doctor refresh response:', response);
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          if(isDoctorEndpoint){
            localStorage.setItem("doctorAccessToken", accessToken);
            localStorage.setItem("doctorRefreshToken", newRefreshToken);
          }else if(isAdminEndpoint){
            localStorage.setItem("adminAccessToken", accessToken);
            localStorage.setItem("adminRefreshToken", refreshToken);
          }else{
            localStorage.setItem("userAccessToken", accessToken);
            localStorage.setItem("userRefreshToken", refreshToken);
          }
          
          error.config.headers["Authorization"] = `Bearer ${accessToken}`;
          return axiosInstance.request(error.config);
          
        } catch (refreshError) {

         
          if(isDoctorEndpoint){
            store.dispatch(logoutDoctor());
            localStorage.removeItem("doctorAccessToken");
            localStorage.removeItem("doctorRefreshToken");
          }else{
            store.dispatch(logoutUser());
            localStorage.removeItem("userAccessToken");
            localStorage.removeItem("userRefreshToken"); 
             console.log('refreshError failed:', refreshError);
          }
          window.location.href = "/login";
           return Promise.reject(error);
        }
        
      } 
      
    return Promise.reject(error);
  }
);

export default axiosInstance;

