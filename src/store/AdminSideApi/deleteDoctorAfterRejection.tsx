import axiosInstance from "@/cors/axiousInstance";
import { ADMIN_ROUTES } from "@/routeConstant/routes.constant";

export const deleteDoctor = async (email) => {
  try {
    
    
    
    
    const response = await axiosInstance.post(
      ADMIN_ROUTES.DELETE_DOCTOR_AFTER_REJECTION, 
      { email }, 
      
    );

    console.log("Backend API response:", response);
    return response; 
  } catch (error) {
    console.error("Error deleting rejected doctor:", error);
    throw error; 
  }
};