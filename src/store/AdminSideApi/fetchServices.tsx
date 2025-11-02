import axiosInstance from "@/cors/axiousInstance";
import { ADMIN_ROUTES } from "@/routeConstant/routes.constant";

export const fetchServicesApi = async () => {
  try {
    const response = await axiosInstance.get(ADMIN_ROUTES.FETCH_SERVICES);
    return response.data
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

