

import axiosInstance from "@/cors/axiousInstance";

export const fectingAllUserAppointMents = async () => {
  try {
   
    const response = await axiosInstance.get(
      "/api/doctor/fectingAllUserAppointMents"
    );

    return response.data; 
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error);
    throw error; 
  }
};