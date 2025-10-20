import axiosInstance from "@/cors/axiousInstance";

export const storeNotificationData = async (email:any) => {
    try {      
      const response = await axiosInstance.post("/api/notification/storeNotificationData", 
        { email }
      );
  
      return response; 
    } catch (error) {
      console.error("Error storing notification:", error);
      throw error; 
    }
  };