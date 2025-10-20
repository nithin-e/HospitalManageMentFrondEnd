import axiosInstance from "@/cors/axiousInstance";

export interface ApplyDoctorProps {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  licenseNumber: string;
  specialty: string;
  qualifications: string;
  medicalLicenseNumber: string;
  agreeTerms: boolean;
  profileImage?: File;
  medicalLicense?: File;
}

export const registerDoctorApi = async (doctorData: FormData) => {
  try {
    console.log("Preparing to send doctor registration data");
   
    const response = await axiosInstance.post(
      "/api/user/applyDoctor",
      doctorData
    );

    console.log("API response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("API error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(`Failed to register doctor: ${error.message}`);
  }
};