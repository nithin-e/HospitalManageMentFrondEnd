import axiosInstance from "@/cors/axiousInstance";


interface doctorBlockData{
  
  email:string;
}


export const blockingDoctor = async (reason:string, email:string) => {
  try {
    
    const response = await axiosInstance.post(
      "api/admin/blockingDoctor", 
      { reason,email }, 
      
    );

    console.log("Backend API response:", response);
    return response; 
  } catch (error) {
    console.error("Error deleting rejected doctor:", error);
    throw error; 
  }
};