

import axiosInstance from "@/cors/axiousInstance";

export const fetchDoctorDashBoardData = async (email: string) => {
  try {
    
    
    
    
  
    
    const response = await axiosInstance.post(
      "/api/auth/user/fetchDoctorDashBoardData", 
      { email: email }, 
    );

   
    console.log('.....................<<<<<<<<<<6>>>>>>>>>>>>>>>>>.........................',response.data);
    

    return response.data; 
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error);
    throw error; 
  }
};