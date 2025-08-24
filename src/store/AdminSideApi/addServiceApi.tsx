import axiosInstance from "@/cors/axiousInstance";

export const addServiceApi = async (serviceData: {
  name: string;
  description: string;
}) => {
  try {
    const response = await axiosInstance.post("/api/admin/addService", serviceData);
    return response.data;
  } catch (error) {
    console.error("Error adding service:", error);
    throw error;
  }
};
