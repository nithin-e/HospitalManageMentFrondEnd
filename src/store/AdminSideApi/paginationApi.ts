import axiosInstance from "@/cors/axiousInstance";

export const paginationApi = async (params) => {
  try {

   
    
    const response = await axiosInstance.get(`/api/admin/search?${params.toString()}`);
    return response;
  } catch (error) {
    console.error("Error fetching pagination data:", error);
    throw error;
  }
};
