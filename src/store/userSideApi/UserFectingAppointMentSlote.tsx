

import axiosInstance from "@/cors/axiousInstance";
import { USER_ROUTES } from "@/routeConstant/routes.constant";

export const UserFectingAppointMentSlote = async (email: string) => {
  try {
   

    const response = await axiosInstance.post(
      USER_ROUTES.USER_FECTING_APPOINTMENT_SLOTE, 
      { email: email }, 
    );


    return response.data; 
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error);
    throw error; 
  }
};