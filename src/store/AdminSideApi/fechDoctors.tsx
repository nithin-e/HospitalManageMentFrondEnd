import axiosInstance from "@/cors/axiousInstance";
import { log } from "node:console";

export const fetchDoctors = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/fecthAllDoctors", {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    });
   console.log('checkig tyme',response.data);
   

    return response.data; 
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; 
  }
};
