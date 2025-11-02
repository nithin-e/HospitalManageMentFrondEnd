import axiosInstance from "@/cors/axiousInstance";
import { ADMIN_ROUTES } from "@/routeConstant/routes.constant";

export const deleteServiceApi = async ({ serviceId }: { serviceId: string }) => {
  try {
    console.log("ibde entha avsthaaa", serviceId);

    const response = await axiosInstance.post(
      `${ADMIN_ROUTES.DELETE_SERVICE}/${serviceId}`
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};
