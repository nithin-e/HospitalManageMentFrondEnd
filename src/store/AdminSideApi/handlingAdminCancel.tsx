import axiosInstance from "@/cors/axiousInstance";

export const handlingAdminCancel = async (email:any,rejectionReasonTexts:any) => {
    try {
      
      
      
      const response = await axiosInstance.post("/api/notifiction/handleCanceldoctorApplication", 
        { email,rejectionReasonTexts }, 

      );
  
      return response; 
    } catch (error) {
      console.error("Error storing notification:", error);
      throw error; 
    }
  };