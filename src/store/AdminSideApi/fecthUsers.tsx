import axiosInstance from "@/cors/axiousInstance";
import { ADMIN_ROUTES } from "@/routeConstant/routes.constant";

export const fetchUsers = async () => {
  try {
    const response = await axiosInstance.get(ADMIN_ROUTES.FECTH_USERS, {
    });

    return response.data; 
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; 
  }
};
