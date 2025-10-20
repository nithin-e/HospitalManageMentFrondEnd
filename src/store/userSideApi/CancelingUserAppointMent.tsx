import axiosInstance from "@/cors/axiousInstance";

export const CancelingUserAppointMent = async (time:String,date:String,email:String) => {
  try {
    
    const response = await axiosInstance.post("/api/doctor/CancelingUserAppointMent", 
      {time,date,email },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};