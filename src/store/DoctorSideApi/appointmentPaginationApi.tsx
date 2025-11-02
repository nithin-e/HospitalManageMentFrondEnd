import axiosInstance from "@/cors/axiousInstance";
import { DOCTOR_ROUTES } from "@/routeConstant/routes.constant";

export const doctorAppointMentPaginationApi = async (params: URLSearchParams) => {
  try {
    const response = await axiosInstance.get(
      `${DOCTOR_ROUTES.APPOINTMENT_PAGINATION}?${params.toString()}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching pagination data:", error);
    throw error;
  }
};
