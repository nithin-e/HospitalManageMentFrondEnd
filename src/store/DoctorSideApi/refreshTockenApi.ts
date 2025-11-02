import axiosInstance from "@/cors/axiousInstance";
import { DOCTOR_ROUTES } from "@/routeConstant/routes.constant";



export const refreshTokenApi = async (refreshData: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      DOCTOR_ROUTES.REFRESH_TOCKEN_API,{ token: refreshData })
    return response;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};
