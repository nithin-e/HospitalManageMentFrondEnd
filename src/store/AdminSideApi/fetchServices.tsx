import axiosInstance from "@/cors/axiousInstance";

export const fetchServicesApi = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/fetchService");
    return response.data
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};
