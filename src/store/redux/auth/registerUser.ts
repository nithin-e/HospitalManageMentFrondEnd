import axiosInstance from "@/cors/axiousInstance";






export interface RegisterProps {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  termsChecked?: boolean;
  error?: string;
  googleId?: string;
}


export const registerUserApi = async (userData: RegisterProps, accessToken: string, refreshToken: string) => {
  const response = await axiosInstance.post(
    "/api/user/register",
    userData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-refresh-token": refreshToken,
      },
    }
  );

  
  return response.data;
};

