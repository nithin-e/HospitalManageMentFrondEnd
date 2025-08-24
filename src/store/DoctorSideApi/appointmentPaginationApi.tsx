import axiosInstance from "@/cors/axiousInstance";

export const doctorAppointMentPaginationApi = async (params) => {
  try {

   
    const response = await axiosInstance.get(`/api/doctor/doctorAppointmentPagination?${params.toString()}`);
    return response;
  } catch (error) {
    console.error("Error fetching pagination data:", error);
    throw error;
  }
};
