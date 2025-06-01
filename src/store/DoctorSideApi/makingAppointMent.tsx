import axiosInstance from "@/cors/axiousInstance";

export const makingAppointMent = async (appointmentData) => {
  try {
    // Get the admin access token
    const accessToken = localStorage.getItem('adminAccessToken');
    
    if (!accessToken) {
      throw new Error("Admin not authenticated");
    }
    
    console.log("Making backend API call to create appointment with data:", appointmentData);
    
    const response = await axiosInstance.post(
      "/api/doctor/makingAppointMent", 
      appointmentData,  // Passing the complete appointment data including userEmail
      { headers: { Authorization: `Bearer ${accessToken}` }}
    );
    
    return response.data; 
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error; 
  }
};