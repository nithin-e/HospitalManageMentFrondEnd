import axiosInstance from "@/cors/axiousInstance";


export const UserfetchingDoctors = async () => {
  try {
    const response = await axiosInstance.get("/api/auth/user/fecthAllDoctors", {
    });
   console.log('checkig tyme',response.data);
   

    return response.data; 
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; 
  }
};