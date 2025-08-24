import axiosInstance from "@/cors/axiousInstance";

export const doctorPaginationApi = async (params) => {
  try {

   
    
    const response = await axiosInstance.get(`/api/admin/doctorPagination?${params.toString()}`);
    return response;
  } catch (error) {
    console.error("Error fetching pagination data:", error);
    throw error;
  }
};
