import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Key, ArrowRight, Phone } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from "@/store/redux/store";
import axiosInstance from '@/cors/axiousInstance';
import { auth } from "@/store/firebase";
import { useFormik } from "formik";
import * as Yup from 'yup';
import { sendOtp } from '@/hooks/auth';
import { forgetPassword } from '@/store/redux/auth/forgetPasswordApi';
import { RecaptchaVerifier } from 'firebase/auth';
import { fetchUserProfileData } from '@/store/userSideApi/fetchUserProfile';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

const ForgotPassword = () => {
  const dispatch: AppDispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [otpInput, setOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [counter, setCounter] = useState(40);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [userPhone, setUserPhone] = useState('');
  const [apiError, setApiError] = useState('');
  const [otpError, setOtpError] = useState('');
  const navigate = useNavigate();

  // Step 1: Email validation schema
  const emailValidationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
  });

  // Step 2: Password validation schema
  const passwordValidationSchema = Yup.object({
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .max(50, 'Password must not exceed 50 characters')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  });

  // Formik for email step
  const emailFormik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: emailValidationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setApiError('');
      try {
        const response = await fetchUserProfileData(values.email);
        console.log('Check user response:', response);

        if (!response) {
          setApiError("No account found with this email address.");
        } else if (response.phone_number) {
          setUserPhone(response.phone_number);
          await sendOtp(setOtpInput, auth, response.phone_number, setConfirmationResult);
          setApiError('');
        } else {
          setApiError("Unable to retrieve user information. Please try again.");
        }
      } catch (error) {
        setApiError(error.message || "An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Formik for password step
  const passwordFormik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      // This will be called after OTP verification
    },
  });

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      navigate('/');
    }
  }, [navigate]);

  // OTP verification and password reset
  const verifyOtpAndResetPassword = async () => {
    setOtpError('');
    
    if (!confirmationResult) {
      setOtpError("No OTP confirmation result available");
      return;
    }

    if (!passwordFormik.isValid) {
      setOtpError("Please ensure your password meets all requirements");
      return;
    }

    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);
      const response = await forgetPassword(emailFormik.values.email, passwordFormik.values.password);
      console.log('Password reset response:', response);

      if (response.success === true) {
        navigate('/login', { state: { passwordReset: true } });
      } else if (response.success === false) {
        setOtpError("Failed to reset password. Please check your email.");
      }
    } catch (error) {
      setOtpError(error.message || "Invalid OTP or password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setCounter(40);
      setOtp('');
      setOtpError('');
      await sendOtp(setOtpInput, auth, userPhone, setConfirmationResult);
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      setOtpError("Failed to resend OTP. Please try again.");
    }
  };

  useEffect(() => {
    if (otpInput && counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [counter, otpInput]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0.3, 0.5, 0.3],
      transition: {
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <motion.div
        variants={backgroundVariants}
        initial="hidden"
        animate="visible"
        className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4"
            >
              <Key className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-600">Secure access to HealNova</p>
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mt-2"
            >
              <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
              Back to login
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium">
                <Phone className="w-4 h-4" />
                HealNova
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Forgot Password
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                {!otpInput ? "Enter your email to receive an OTP" : "Verify OTP and set new password"}
              </p>

              {!otpInput ? (
                // Step 1: Email Input
                <form onSubmit={emailFormik.handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={emailFormik.values.email}
                        onChange={emailFormik.handleChange}
                        onBlur={emailFormik.handleBlur}
                        disabled={isLoading}
                      />
                    </div>
                    {emailFormik.touched.email && emailFormik.errors.email && (
                      <p className="text-sm text-red-600">{emailFormik.errors.email}</p>
                    )}
                    {apiError && (
                      <p className="text-sm text-red-600">{apiError}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                    {isLoading ? "Verifying..." : "Send OTP"}
                  </Button>
                </form>
              ) : (
                // Step 2: OTP + Password Input
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                      Enter OTP
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      className="h-12 text-center text-lg tracking-widest border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                    {counter > 0 ? (
                      <p className="text-sm text-gray-600 text-center">
                        Resend OTP in {counter} seconds
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-center"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      New Password
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter new password"
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={passwordFormik.values.password}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                      />
                    </div>
                    {passwordFormik.touched.password && passwordFormik.errors.password && (
                      <p className="text-sm text-red-600">{passwordFormik.errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={passwordFormik.values.confirmPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                      />
                    </div>
                    {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                      <p className="text-sm text-red-600">{passwordFormik.errors.confirmPassword}</p>
                    )}
                    {otpError && (
                      <p className="text-sm text-red-600">{otpError}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={verifyOtpAndResetPassword}
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </div>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="text-center text-sm text-gray-600 pt-4">
              Remember your password?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;