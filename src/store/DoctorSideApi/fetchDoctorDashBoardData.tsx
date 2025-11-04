import axiosInstance from "@/cors/axiousInstance";
import { DOCTOR_ROUTES } from "@/routeConstant/routes.constant";

export const fetchDoctorDashBoardData = async (email: string) => {
  try {
    const response = await axiosInstance.post(
      DOCTOR_ROUTES.FETCH_DOCTOR_DASHBOARD_DATA,
      { email: email }
    );

    return response.data
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error);
    throw error;
  }
};
