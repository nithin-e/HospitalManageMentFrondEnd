import axiosInstance from "@/cors/axiousInstance";
import { DOCTOR_ROUTES } from "@/routeConstant/routes.constant";

// Updated type definition to match what's being passed
interface AppointmentSettings {
  doctorEmail: string;
  dateRange: string;
  selectedDates: any[];
  timeSlots: {
    date: string;
    slots: any;
  }[];
}

export const storeAppointmentSlotsAPI = async (
  appointmentSettings: AppointmentSettings
) => {
  try {
    const response = await axiosInstance.post(DOCTOR_ROUTES.APPOINTMENT_SLOTS, {
      appointmentSettings,
    });

    return response.data;
  } catch (error) {
    console.error("Error saving appointment slots:", error);
    throw error;
  }
};

export const fetchDoctorSlotsAPI = async (email: any) => {
  try {
    const response = await axiosInstance.post(DOCTOR_ROUTES.FETCH_DOCTOR_SLOTES, {
      email,
    });

    return response.data;
  } catch (error) {
    console.error("Error saving appointment slots:", error);
    throw error;
  }
};
