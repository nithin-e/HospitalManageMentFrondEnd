import axiosInstance from "@/cors/axiousInstance";

export const makingAppointMent = async (appointmentData) => {
  try {
  
    const response = await axiosInstance.post(
      "/api/auth/user/makingAppointMent", 
      appointmentData,
    );
    
    return response.data; 
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error; 
  }
};