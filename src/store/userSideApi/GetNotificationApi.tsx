import axiosInstance from "@/cors/axiousInstance";

export const GetFetchNotifications = async (email: string) => {
  try {
    
    const response = await axiosInstance.post("/api/notifiction/getNotifications", 
      { email }, 
    );
    
    console.log('checking data', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};