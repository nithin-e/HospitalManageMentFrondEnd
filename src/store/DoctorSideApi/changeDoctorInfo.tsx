import axiosInstance from "@/cors/axiousInstance";
import { DOCTOR_ROUTES } from "@/routeConstant/routes.constant";

export const changeDoctorInfo = async (formData) => {
  try {
    const response = await axiosInstance.post(
      DOCTOR_ROUTES.CHANGE_DOCTOR_INFO,
      { formData }
    );

    console.log("Backend API response:", response);
    return response;
  } catch (error) {
    console.error("Error deleting rejected doctor:", error);
    throw error;
  }
};
