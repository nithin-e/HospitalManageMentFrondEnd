

import axiosInstance from "@/cors/axiousInstance";

export const fectingAppointMentSlotes = async (email: string) => {
  try {
   
    
    console.log("Making backend API call to fetch doctor slotes data with email:", email);
    
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