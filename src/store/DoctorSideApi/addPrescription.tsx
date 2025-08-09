import axiosInstance from "@/cors/axiousInstance";

// Corrected interface name and syntax
interface Prescription {
  doctorId: string;
  patientId: string;
  appointmentId: string;
  prescriptionDetails: string;
  date: string;
  time:string;
}

// Function to send prescription data
export const AddPrescription = async (prescription: Prescription): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      "/api/doctor/AddPrescription",
      prescription
    );

    return response.data;
  } catch (error) {
    console.error("Error adding prescription:", error);
    throw error;
  }
};
