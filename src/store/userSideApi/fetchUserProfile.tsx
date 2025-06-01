import axiosInstance from "@/cors/axiousInstance";

export const fetchUserProfileData = async (email: string) => {
  try {
    
    const response = await axiosInstance.post("api/auth/user/fectingUserProfileData", 
      { email },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};