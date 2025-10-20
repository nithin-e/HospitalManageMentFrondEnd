import axiosInstance from "@/cors/axiousInstance";

export const changing_UserPassWord = async ({ email, password }: { email: string, password: string }) => {
    try {
      const response = await axiosInstance.post("api/user/changing_UserPassWord", 
        { email, password }, 
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  };