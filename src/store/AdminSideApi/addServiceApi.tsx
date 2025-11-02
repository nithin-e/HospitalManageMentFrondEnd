import axiosInstance from "@/cors/axiousInstance";
import { ADMIN_ROUTES } from "@/routeConstant/routes.constant";

export const addServiceApi = async (serviceData: {
  name: string;
  description: string;
}) => {
  try {
    const response = await axiosInstance.post(ADMIN_ROUTES.ADD_SERVICE, serviceData);
    return response.data;
  } catch (error) {
    console.error("Error adding service:", error);
    throw error;
  }
};


