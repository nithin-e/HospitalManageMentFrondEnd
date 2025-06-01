import axiosInstance from "@/cors/axiousInstance";

export const changing_UserPassWord = async ({ email, password }: { email: string, password: string }) => {
    try {
      const response = await axiosInstance.post("api/auth/user/changing_UserPassWord", 
        { email, password }, 
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  };