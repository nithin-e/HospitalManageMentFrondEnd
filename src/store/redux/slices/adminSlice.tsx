// // admin/adminSlice.ts
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { RegisterProps } from "../auth/registerUser";
// import { handleAsyncThunk } from "@/util/adminHandleAsyncThunk";
// import axios from "axios"; // Added import for API calls

// // Admin slice state
// interface AdminState {
//   user: RegisterProps | null;
//   isAuthenticated: boolean;
//   isDoctorMe: boolean;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: AdminState = {
//   user: null,
//   isAuthenticated: false,
//   isDoctorMe: false,
//   loading: false,
//   error: null,
// };

// // Async thunk for fetching doctor details
// // export const fetchAllDoctorDetails = createAsyncThunk<
// //   RegisterProps,
// //   void,
// //   { rejectValue: string }
// // >("admin/fetchAllDoctorDetails", async (_, { rejectWithValue }) => {
// //   try {
// //     const accessToken = localStorage.getItem("accessToken") || "";
// //     const refreshToken = localStorage.getItem("refreshToken") || "";

// //     // Make actual API call with proper authorization headers
// //     const response = await axios.get("/api/doctors/me", {
// //       headers: {
// //         Authorization: `Bearer ${accessToken}`,
// //         "x-refresh-token": refreshToken
// //       }
// //     });

// //     return response.data;
// //   } catch (error: any) {
// //     return rejectWithValue(error.response?.data?.message || "Fetching doctor details failed");
// //   }
// // });

// // Admin slice
// const adminSlice = createSlice({
//   name: "admin",
//   initialState,
//   reducers: {
//     logout: (state) => {
//       state.user = null;
//       state.isAuthenticated = false;
//       state.isDoctorMe = false;
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");
//       localStorage.removeItem("persist:root");
//     },
//   },
//   extraReducers: (builder) => {
//     // handleAsyncThunk<RegisterProps>(builder, fetchAllDoctorDetails) 
    

    
//   },
// });

// export const { logout } = adminSlice.actions;
// export default adminSlice.reducer;