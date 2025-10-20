

import axiosInstance from "@/cors/axiousInstance";

export const UserFectingAppointMentSlote = async (email: string) => {
  try {
   

    const response = await axiosInstance.post(
      "/api/doctor/fectingAppointMentSlotes", 
      { email: email }, 
    );


    return response.data; 
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error);
    throw error; 
  }
};