import axiosInstance from "@/cors/axiousInstance";
import { ADMIN_ROUTES } from "@/routeConstant/routes.constant";

export const handlingAdminCancel = async (email:string,rejectionReasonTexts:any) => {
    try {
      
      
      
      const response = await axiosInstance.post(ADMIN_ROUTES.HANDLING_ADMIN_CANCEL, 
        { email,rejectionReasonTexts }, 

      );
  
      return response; 
    } catch (error) {
      console.error("Error storing notification:", error);
      throw error; 
    }
  };