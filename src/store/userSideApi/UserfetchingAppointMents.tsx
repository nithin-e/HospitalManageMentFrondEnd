import axiosInstance from "@/cors/axiousInstance";

export const UserfetchingAppointMents = async (
  email: string, 
  page: number = 1, 
  limit: number = 6
) => {
  try {
    const response = await axiosInstance.post(
      "/api/auth/user/fectingAppointMent", 
      { 
        email: email,
        page: page,
        limit: limit
      }, 
    );

    return response.data; 
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error);
    throw error; 
  }
};