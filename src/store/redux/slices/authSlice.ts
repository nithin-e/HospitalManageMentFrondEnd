import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { registerUserApi, RegisterProps } from "../auth/registerUser";
import { checkUserApi } from "../auth/checkUser";
import { handleAsyncThunk } from "@/util/handleAsyncThunk";

// User Interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Auth State
// Auth State
interface AuthState {
  user: User | null;
  admin: User | null;
  isUserAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  isDoctorMe: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  admin: null,
  isUserAuthenticated: false,
  isAdminAuthenticated: false,
  isDoctorMe: false,
  loading: false,
  error: null,
};

interface CheckUserPayload {
  email: string;
  phoneNumber: any;
}

interface LoginPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Thunks
export const registerUser = createAsyncThunk<User, RegisterProps, { rejectValue: string }>(
    "auth/register",
    async (userData, { rejectWithValue }) => {
      try {
        const accessToken = localStorage.getItem("accessToken") || "";
        const refreshToken = localStorage.getItem("refreshToken") || "";
  
        return await registerUserApi(userData, accessToken, refreshToken);
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Registration failed");
      }
    }
  );

export const checkUser = createAsyncThunk<
  { email: string; phoneNumber: any },
  CheckUserPayload,
  { rejectValue: string }
>(
  "auth/checkUser",
  async ({ email, phoneNumber }, { rejectWithValue }) => {
    try {
      let res = await checkUserApi(email, phoneNumber);
      console.log('............', res);
      return res;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// New login action without API call
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<LoginPayload>) => {
      const { user, accessToken, refreshToken } = action.payload;
      
      if (user.role === 'admin') {
        state.admin = user;
        state.isAdminAuthenticated = true;
        
        // Store admin tokens
        localStorage.setItem('adminAccessToken', accessToken);
        localStorage.setItem('adminRefreshToken', refreshToken);
      } else if(user.role === 'user'){
        state.user = user;
        state.isUserAuthenticated = true;
        
        // Store user tokens
        localStorage.setItem('userAccessToken', accessToken);
        localStorage.setItem('userRefreshToken', refreshToken);
      }else if(user.role === 'doctor'){
        localStorage.removeItem('userAccessToken');
        localStorage.removeItem('userRefreshToken');
        localStorage.setItem('doctorAccessToken', accessToken);
        localStorage.setItem('doctorRefreshToken', refreshToken);
      }
      
      state.loading = false;
      state.error = null;
    },
    logoutUser: (state) => {

      console.log('heyyy logout User');
      
      state.user = null;
      state.isUserAuthenticated = false;
      localStorage.removeItem('userAccessToken');
      localStorage.removeItem('userRefreshToken');
    },
    
    logoutAdmin: (state) => {
      state.admin = null;
      state.isAdminAuthenticated = false;
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminRefreshToken');
    },
    
    // Keep a full logout for when you need to logout both
    logoutAll: (state) => {
      state.user = null;
      state.admin = null;
      state.isUserAuthenticated = false;
      state.isAdminAuthenticated = false;
      state.isDoctorMe = false;
      localStorage.removeItem('userAccessToken');
      localStorage.removeItem('userRefreshToken');
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('persist:root');
    },
  },
  extraReducers: (builder) => {
    handleAsyncThunk<User>(builder, registerUser);
    handleAsyncThunk<{ email: string; phoneNumber: any }>(builder, checkUser);
  },
});

export const { login, logoutUser, logoutAdmin, logoutAll } = authSlice.actions;
export default authSlice.reducer;