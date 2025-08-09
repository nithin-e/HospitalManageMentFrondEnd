import axiosInstance from "@/cors/axiousInstance";



export const refreshTokenApi = async (refreshData: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      "/auth/refresh",{ token: refreshData })
    return response;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};
