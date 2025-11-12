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
    const response = await axiosInstance.post(
      "/api/user/applyDoctor",
      doctorData
    );

    console.log("API response:", response.data);
    return response.data;
  } catch (error) {

    throw new Error(`Failed to register doctor: ${error.message}`);
  }
};