// Fixed API call function
import axiosInstance from "@/cors/axiousInstance";

export const fetchUserConversations = async (
  userId: string,
  doctorId: string
) => {
  try {
    const response = await axiosInstance.post(
      "api/auth/user/fetchUserConversations",
      {
        userId,
        doctorId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user conversations:", error);
    throw error;
  }
};
