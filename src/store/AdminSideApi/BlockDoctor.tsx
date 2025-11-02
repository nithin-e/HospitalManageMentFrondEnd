import axiosInstance from "@/cors/axiousInstance";
import { ADMIN_ROUTES } from "@/routeConstant/routes.constant";




export const blockingDoctor = async (reason:string, email:string) => {
  try {
    
    const response = await axiosInstance.post(
      ADMIN_ROUTES.BLOCK_DOCTOR, 
      { reason,email }, 
      
    );

    console.log("Backend API response:", response);
    return response; 
  } catch (error) {
    console.error("Error deleting rejected doctor:", error);
    throw error; 
  }
};