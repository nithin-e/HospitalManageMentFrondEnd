// api/doctorApi.ts
import axiosInstance from "@/cors/axiousInstance";
import { DOCTOR_ROUTES } from "@/routeConstant/routes.constant";





export const fectingAllUserAppointMents = async (email: string, page: number = 1, limit: number = 3)=> {
  try {
    const response = await axiosInstance.post(
      DOCTOR_ROUTES.FECTING_FULL_USER_APPOINTMENTS,
      {
        email,
        page,
        limit
      }
    );
    return response.data; 
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error);
    throw error; 
  }
};