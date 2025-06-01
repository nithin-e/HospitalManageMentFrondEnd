

import axiosInstance from "@/cors/axiousInstance";

export const fetchDoctorDashBoardData = async (email: string) => {
  try {
    
    
    
    
    console.log("Making backend API call to fetch doctor dashboard data with email:", email);
    
    const response = await axiosInstance.post(
      "/api/auth/user/fetchDoctorDashBoardData", 
      { email: email }, 
    );

   
    

    return response.data; 
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error);
    throw error; 
  }
};