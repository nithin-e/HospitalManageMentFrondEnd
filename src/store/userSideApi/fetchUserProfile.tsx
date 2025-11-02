import axiosInstance from "@/cors/axiousInstance";
import { USER_ROUTES } from "@/routeConstant/routes.constant";

export const fetchUserProfileData = async (email: string) => {
  try {
    
    const response = await axiosInstance.post(USER_ROUTES.FETCH_USER_PROFILE, 
      { email },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};