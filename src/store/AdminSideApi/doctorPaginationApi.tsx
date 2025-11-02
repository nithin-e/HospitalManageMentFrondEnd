import axiosInstance from "@/cors/axiousInstance";
import { ADMIN_ROUTES } from "@/routeConstant/routes.constant";

export const doctorPaginationApi = async (params: URLSearchParams) => {
  try {
    const response = await axiosInstance.get(
      `${ADMIN_ROUTES.DOCTOR_PAGINATION}?${params.toString()}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching pagination data:", error);
    throw error;
  }
};
