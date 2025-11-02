import axiosInstance from "@/cors/axiousInstance";
import { USER_ROUTES } from "@/routeConstant/routes.constant";


export const UserfetchingDoctors = async () => {
  try {
    const response = await axiosInstance.get(USER_ROUTES.USER_FETCHING_DOCTORS, {
    });
   console.log('checkig tyme',response.data);
   

    return response.data; 
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; 
  }
};