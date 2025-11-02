import axiosInstance from "@/cors/axiousInstance";
import { ADMIN_ROUTES } from "@/routeConstant/routes.constant";

export const paginationApi = async (params: URLSearchParams) => {
  try {
    const response = await axiosInstance.get(
      `${ADMIN_ROUTES.PAGINATION_API}?${params.toString()}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching pagination data:", error);
    throw error;
  }
};
