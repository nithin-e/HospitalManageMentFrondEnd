import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { handleDoctorAsyncThunk } from "@/util/handleDoctorAsyncThunk";
import { fetchDoctorDashBoardData } from "@/store/DoctorSideApi/fetchDoctorDashBoardData";
import { fetchDoctorSlotsAPI, storeAppointmentSlotsAPI } from "@/store/DoctorSideApi/appointment-slots";


// Doctor Interface
interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  phoneNumber: string;
  experience: number;
  profileImage?: string;
  isAvailable: boolean;
  firstName?: string;
  isActive:boolean

}



// Doctor State
interface DoctorState {
  currentDoctor: Doctor | null;
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  isDoctorAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  dashboardData: any;
  appointmentSlots: any;
  data?: Doctor;
}


const initialState: DoctorState = {
  currentDoctor: null,
  doctors: [],
  selectedDoctor: null,
  isDoctorAuthenticated: false,
  loading: false,
  error: null,
  dashboardData: null,
  appointmentSlots: null,
  data: undefined,
};


export interface AppointmentSettingsType {
  doctorEmail: string;
  dateRange: string;
  selectedDates: string[];
  timeSlots: { 
    date: string; 
    slots: string[]; 
  }[];
  startTime?: string;
  endTime?: string;
  slotDuration?: number;
  includeRestPeriods?: boolean;
}

// Thunks
export const fetchDoctorDashBoardDatas = createAsyncThunk(
  "/user/fetchDoctorDashBoardData",
  async (email: string, { rejectWithValue }) => {
    try {
      return await fetchDoctorDashBoardData(email);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch doctor dashboard data");
    }
  }
);



export const storeAppointmentSlots = createAsyncThunk(
  "/user/storeAppointmentSlots",
  async (appointmentSettings: AppointmentSettingsType, { rejectWithValue }) => {
    try {
      
      const result = await storeAppointmentSlotsAPI(appointmentSettings);
      
      return JSON.parse(JSON.stringify(result));
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to store appointment slots");
    }
  }
);

// FIXED: Renamed this to avoid naming conflicts
export const fetchDoctorAppointmentSlots = createAsyncThunk(
  "/user/fetchDoctorAppointmentSlots",
  async (doctorEmail: string, { rejectWithValue }) => {
    try {
      const result = await fetchDoctorSlotsAPI(doctorEmail);

      console.log('check eda check',result);
      
      return JSON.parse(JSON.stringify(result));
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch doctor appointment slots");
    }
  }
);

// Doctor Slice
const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    setSelectedDoctor: (state, action: PayloadAction<Doctor>) => {
      state.selectedDoctor = action.payload;
    },
    clearSelectedDoctor: (state) => {
      state.selectedDoctor = null;
    },
    logoutDoctor: (state) => {
      state.currentDoctor = null;
      state.isDoctorAuthenticated = false;
      localStorage.removeItem('doctorAccessToken');
      localStorage.removeItem('doctorRefreshToken');
    },
  },
  extraReducers: (builder) => {
    handleDoctorAsyncThunk(builder, fetchDoctorDashBoardDatas);
    // FIXED: Use the correctly named thunks here
    handleDoctorAsyncThunk(builder, storeAppointmentSlots, "appointmentSlots");
    handleDoctorAsyncThunk(builder, fetchDoctorAppointmentSlots, "appointmentSlots");
  },
});

export const { 
  setSelectedDoctor, 
  clearSelectedDoctor, 
  logoutDoctor, 
} = doctorSlice.actions;

export default doctorSlice.reducer;