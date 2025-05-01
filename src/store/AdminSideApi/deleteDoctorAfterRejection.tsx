import axiosInstance from "@/cors/axiousInstance";

export const deleteDoctor = async (email) => {
  try {
    // Get the admin access token
    const accessToken = localStorage.getItem('adminAccessToken');
    
    if (!accessToken) {
      throw new Error("Admin not authenticated");
    }
    
    console.log("Making backend API call to delete doctor with email:", email);
    
    const response = await axiosInstance.post(
      "api/admin/deleteDoctorAfterReject", 
      { email }, 
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    console.log("Backend API response:", response);
    return response; 
  } catch (error) {
    console.error("Error deleting rejected doctor:", error);
    throw error; 
  }
};