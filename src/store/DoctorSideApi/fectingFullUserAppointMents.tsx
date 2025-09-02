// api/doctorApi.ts
import axiosInstance from "@/cors/axiousInstance";





export const fectingAllUserAppointMents = async (email: string, page: number = 1, limit: number = 3)=> {
  try {
    const response = await axiosInstance.post(
      "/api/doctor/fectingAllUserAppointMents",
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