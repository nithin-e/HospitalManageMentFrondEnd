import axiosInstance from "@/cors/axiousInstance";
import { DOCTOR_ROUTES } from "@/routeConstant/routes.constant";

export const makingAppointMent = async (appointmentData) => {
  try {
  
    const response = await axiosInstance.post(
     DOCTOR_ROUTES.MAKING_APPOINTMENT, 
      appointmentData,
    );
    
    return response.data; 
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error; 
  }
};