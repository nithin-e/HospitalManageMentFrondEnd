import axiosInstance from "@/cors/axiousInstance";

// Updated type definition to match what's being passed
interface AppointmentSettings {
  doctorEmail: string;
  dateRange: string;
  selectedDates: any[];
  timeSlots: {
    date: string;
    slots: any;
  }[];
}

export const storeAppointmentSlotsAPI = async (appointmentSettings: AppointmentSettings) => {
  try {
    
   console.log('----------------------<<<<<<<<<appointmentSettings>>>>>>>>>>>>>>>>>>>>>>---------------------------',appointmentSettings);
   
    

    const response = await axiosInstance.post(
      "/api/doctor/appointment-slots", 
      { appointmentSettings }
      
    );

    return response.data; 
  } catch (error) {
    console.error("Error saving appointment slots:", error);
    throw error; 
  }
};


export const fetchDoctorSlotsAPI = async (email:any) => {
  try {
    
    const response = await axiosInstance.post(
      "/api/doctor/fetchDoctorSlots", 
      { email }
    );

    return response.data; 
  } catch (error) {
    console.error("Error saving appointment slots:", error);
    throw error; 
  }
};