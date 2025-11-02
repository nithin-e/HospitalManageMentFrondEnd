// Fixed API call function
import axiosInstance from "@/cors/axiousInstance";
import { USER_ROUTES } from "@/routeConstant/routes.constant";

export const fetchUserConversations = async (
  userId: string,
  doctorId: string
) => {
  try {
    const response = await axiosInstance.post(
      USER_ROUTES.FETCH_USER_CONVERSATIONS,
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
