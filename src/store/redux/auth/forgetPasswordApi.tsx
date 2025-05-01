import axiosInstance from "@/cors/axiousInstance";





export const forgetPassword = async (email: string,newPassword:any) => {
    try {
      
      const response = await axiosInstance.post("/api/auth/user/forgetPassword", { email,newPassword });
      console.log('res entha avastha',response.data);
      
      return response.data
    } catch (error) {
      console.error('Error in checkUserApi:', error);
      throw error; 
    }
  };