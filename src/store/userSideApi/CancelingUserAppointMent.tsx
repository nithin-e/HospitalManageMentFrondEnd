import axiosInstance from "@/cors/axiousInstance";
import { USER_ROUTES } from "@/routeConstant/routes.constant";

export const CancelingUserAppointMent = async (time:string,date:string,email:string) => {
  try {
    
    const response = await axiosInstance.post(USER_ROUTES.CANCELING_USER_APPOINTMENT, 
      {time,date,email },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};