import axiosInstance from "@/cors/axiousInstance";


export const fetchDoctors = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/fecthAllDoctors", {
    });
   console.log('checkig tyme',response.data);
   

    return response.data; 
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; 
  }
};
