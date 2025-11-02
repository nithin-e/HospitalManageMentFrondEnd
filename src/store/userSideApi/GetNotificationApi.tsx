import axiosInstance from "@/cors/axiousInstance";
import { USER_ROUTES } from "@/routeConstant/routes.constant";

export const GetFetchNotifications = async (email: string) => {
  try {
    
    const response = await axiosInstance.post(USER_ROUTES.GET_NOTIFICATION_API, 
      { email }, 
    );
    
    console.log('checking data', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};