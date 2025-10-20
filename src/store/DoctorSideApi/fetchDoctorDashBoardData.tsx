import axiosInstance from "@/cors/axiousInstance";

export const fetchDoctorDashBoardData = async (email: string) => {
  try {
    const response = await axiosInstance.post(
      "/api/user/fetchDoctorDashBoardData",
      { email: email }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error);
    throw error;
  }
};
