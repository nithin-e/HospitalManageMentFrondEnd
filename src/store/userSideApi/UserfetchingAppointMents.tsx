import axiosInstance from "@/cors/axiousInstance";
import { USER_ROUTES } from "@/routeConstant/routes.constant";

export const UserfetchingAppointMents = async (
  email: string, 
  page: number = 1, 
  limit: number = 6
) => {
  try {
    const response = await axiosInstance.post(
      USER_ROUTES.USER_FETCHING_APPOINTMENTS, 
      { 
        email: email,
        page: page,
        limit: limit
      }, 
    );

    return response.data; 
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error);
    throw error; 
  }
};