import axiosInstance from "@/cors/axiousInstance";
import { DOCTOR_ROUTES } from "@/routeConstant/routes.constant";

// Prescription interface
interface Prescription {
  doctorId: string;
  userIdd: string;
  appointmentId: string;
  date: string;
  time: string;
}

// Function to send prescription data
export const fetchingPrescription = async (prescription: Prescription): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      DOCTOR_ROUTES.FETCHING_PRESCRIPTION,
      prescription
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching prescription:", error);
    throw error;
  }
};
