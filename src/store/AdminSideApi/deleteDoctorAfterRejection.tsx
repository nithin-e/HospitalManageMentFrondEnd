import axiosInstance from "@/cors/axiousInstance";

export const deleteDoctor = async (email) => {
  try {
    
    
    console.log("Making backend API call to delete doctor with email:", email);
    
    const response = await axiosInstance.post(
      "api/admin/deleteDoctorAfterReject", 
      { email }, 
      
    );

    console.log("Backend API response:", response);
    return response; 
  } catch (error) {
    console.error("Error deleting rejected doctor:", error);
    throw error; 
  }
};