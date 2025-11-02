import axiosInstance from "@/cors/axiousInstance";
import { USER_ROUTES } from "@/routeConstant/routes.constant";

export const changing_UserPassWord = async ({ email, password }: { email: string, password: string }) => {
    try {
      const response = await axiosInstance.post(USER_ROUTES.CHANGING_USER_PASSWORD, 
        { email, password }, 
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  };