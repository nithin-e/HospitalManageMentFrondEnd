// frontend/api/adminAppointments.ts
import axiosInstance from "@/cors/axiousInstance";
import { ADMIN_ROUTES } from "@/routeConstant/routes.constant";

interface PaginationParams {
  page?: number;
  limit?: number;
}

export const FetchingAllUserAppointsMentsAdmin = async (
  params: PaginationParams = {}
) => {
  try {
    const { page = 1, limit = 8 } = params;

    const response = await axiosInstance.post(
      ADMIN_ROUTES.FETCHING_ALL_USER_APPOINTS_MENTS_ADMIN,
      { page, limit }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error);
    throw error;
  }
};
