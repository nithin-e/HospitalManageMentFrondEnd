import axiosInstance from "@/cors/axiousInstance";

export const ChangingUserInfo = async (userData: { 
  email: string, 
  name?: string, 
  phoneNumber?: string 
}) => {
  try {
    const response = await axiosInstance.post("api/auth/user/ChangingUserInfo", userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user info:", error);
    throw error;
  }
};