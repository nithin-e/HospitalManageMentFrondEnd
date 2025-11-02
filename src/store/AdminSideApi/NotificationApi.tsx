import axiosInstance from "@/cors/axiousInstance";
import { ADMIN_ROUTES } from "@/routeConstant/routes.constant";

export const storeNotificationData = async (email:string) => {
    try {      
      const response = await axiosInstance.post(ADMIN_ROUTES.NOTIFICATION_API, 
        { email }
      );
  
      return response; 
    } catch (error) {
      console.error("Error storing notification:", error);
      throw error; 
    }
  };