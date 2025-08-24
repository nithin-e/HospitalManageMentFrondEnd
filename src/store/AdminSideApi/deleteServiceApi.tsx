import axiosInstance from "@/cors/axiousInstance";

export const deleteServiceApi = async ({ serviceId }: { serviceId: string }) => {
  try {

    console.log('ibde entha avsthaaa',serviceId);
    
    // Changed to DELETE method and correct endpoint
    const response = await axiosInstance.post(`/api/admin/deleteService/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};