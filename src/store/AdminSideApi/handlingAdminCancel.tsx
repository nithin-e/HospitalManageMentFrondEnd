import axiosInstance from "@/cors/axiousInstance";

export const handlingAdminCancel = async (email:any,rejectionReasonTexts:any) => {
    try {
      // Get the admin access token
      const accessToken = localStorage.getItem('adminAccessToken');
      
      if (!accessToken) {
        throw new Error("Admin not authenticated");
      }
      
      const response = await axiosInstance.post("/api/notifiction/handleCanceldoctorApplication", 
        { email,rejectionReasonTexts }, 

      );
  
      return response; 
    } catch (error) {
      console.error("Error storing notification:", error);
      throw error; 
    }
  };