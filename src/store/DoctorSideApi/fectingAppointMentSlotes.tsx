

import axiosInstance from "@/cors/axiousInstance";
import { DOCTOR_ROUTES } from "@/routeConstant/routes.constant";

export const fectingAppointMentSlotes = async (email: string) => {
  try {
   
    
    console.log("Making backend API call to fetch doctor slotes data with email:", email);
    
    const response = await axiosInstance.post(
      DOCTOR_ROUTES.FECTING_APPOINTMENT_SLOTES, 
      { email: email }, 
    );

   
    

    return response.data; 
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error);
    throw error; 
  }
};