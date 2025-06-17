import axiosInstance from "@/cors/axiousInstance";

export const FetchingAllUserAppointsMentsAdmin = async () => {
  try {
   
    const response = await axiosInstance.get(
      "/api/admin/FecthAppointMentForAdmin"
    );

    return response.data; 
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error);
    throw error; 
  }
};