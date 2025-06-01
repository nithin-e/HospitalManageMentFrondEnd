

import axiosInstance from "@/cors/axiousInstance";

export const fectingAppointMentSlotes = async (email: string) => {
  try {
    // Get the admin access token
    const accessToken = localStorage.getItem('adminAccessToken');
    
    if (!accessToken) {
      throw new Error("Admin not authenticated");
    }
    
    console.log("Making backend API call to fetch doctor slotes data with email:", email);
    
    const response = await axiosInstance.post(
      "/api/doctor/fectingAppointMentSlotes", 
      { email: email }, 
      { headers: { Authorization: `Bearer ${accessToken}` }} 
    );

   
    

    return response.data; 
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error);
    throw error; 
  }
};