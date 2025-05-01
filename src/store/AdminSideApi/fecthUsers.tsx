import axiosInstance from "@/cors/axiousInstance";

export const fetchUsers = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/fecthAllUser", {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    });

    return response.data; 
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; 
  }
};
