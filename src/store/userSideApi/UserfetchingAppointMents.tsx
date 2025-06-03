

import axiosInstance from "@/cors/axiousInstance";

export const UserfetchingAppointMents = async (email: string) => {
  try {
   

    const response = await axiosInstance.post(
      "/api/auth/user/fectingAppointMent", 
      { email: email }, 
    );


    return response.data; 
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error);
    throw error; 
  }
};