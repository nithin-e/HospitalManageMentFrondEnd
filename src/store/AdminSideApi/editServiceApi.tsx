import axiosInstance from "@/cors/axiousInstance";

export const editServiceApi = async (serviceId: string, serviceData: { name: string; description: string }) => {
  try {
    console.log('Editing service with ID:', serviceId, 'Data:', serviceData);
    
    const response = await axiosInstance.post(`/api/admin/editService/${serviceId}`, serviceData);
    return response.data;
  } catch (error) {
    console.error("Error editing service:", error);
    throw error;
  }
};