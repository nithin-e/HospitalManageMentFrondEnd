import axiosInstance from "@/cors/axiousInstance";





export const checkUserApi = async (email: string,phoneNumber:any) => {
    try {
      
      const response = await axiosInstance.post("/api/auth/user/checkUser", { email,phoneNumber });
      console.log('responceda...', response)
      return response.data
    } catch (error) {
      console.error('Error in checkUserApi:', error);
      throw error; 
    }
  };