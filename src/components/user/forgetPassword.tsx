import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Key, ArrowRight, Phone, AlertCircle, CheckCircle } from 'lucide-react';
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
  const [successMessage, setSuccessMessage] = useState('');
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
          setSuccessMessage("OTP sent successfully to your registered phone number");
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
    setApiError('');
    
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    if (!confirmationResult) {
      setApiError("No OTP confirmation result available. Please request a new OTP.");
      return;
    }

    // Validate password fields
    await passwordFormik.validateForm();
    if (!passwordFormik.isValid || Object.keys(passwordFormik.errors).length > 0) {
      passwordFormik.setTouched({
        password: true,
        confirmPassword: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);
      const response = await forgetPassword(emailFormik.values.email, passwordFormik.values.password);
      console.log('Password reset response:', response);
      
      if (response.success === true) {
        setSuccessMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate('/login', { state: { passwordReset: true } });
        }, 2000);
      } else if (response.success === false) {
        setApiError("Failed to reset password. Please try again.");
      }
    } catch (error) {
      if (error.code === 'auth/invalid-verification-code') {
        setOtpError("Invalid OTP. Please check and try again.");
      } else {
        setApiError(error.message || "Password reset failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setCounter(40);
      setOtp('');
      setOtpError('');
      setApiError('');
      await sendOtp(setOtpInput, auth, userPhone, setConfirmationResult);
      setSuccessMessage("OTP resent successfully");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setApiError("Failed to resend OTP. Please try again.");
      console.error("Failed to resend OTP:", error);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100"
        variants={backgroundVariants}
        initial="hidden"
        animate="visible"
      />

      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <motion.div
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
          variants={itemVariants}
        >
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4 shadow-lg">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Forgot Password
            </h1>
            <p className="text-gray-600">
              {!otpInput ? "Enter your email to receive an OTP" : "Verify OTP and set new password"}
            </p>
          </motion.div>

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{successMessage}</p>
            </motion.div>
          )}

          {/* API Error Message */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{apiError}</p>
            </motion.div>
          )}

          <motion.form
            onSubmit={!otpInput ? emailFormik.handleSubmit : (e) => {
              e.preventDefault();
              verifyOtpAndResetPassword();
            }}
            className="space-y-6"
            variants={itemVariants}
          >
            {!otpInput ? (
              // Step 1: Email Input
              <motion.div variants={itemVariants}>
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email address
                </Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    value={emailFormik.values.email}
                    onChange={emailFormik.handleChange}
                    onBlur={emailFormik.handleBlur}
                  />
                </div>
                {emailFormik.touched.email && emailFormik.errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {emailFormik.errors.email}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 mt-4"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Send OTP</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </motion.div>
            ) : (
              // Step 2: OTP + Password Input
              <>
                <motion.div variants={itemVariants}>
                  <Label htmlFor="otp" className="text-gray-700 font-medium">
                    Enter OTP
                  </Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-center text-lg tracking-widest"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        setOtpError('');
                      }}
                      maxLength={6}
                    />
                  </div>
                  {otpError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {otpError}
                    </p>
                  )}
                  
                  <div className="text-center mt-2">
                    {counter > 0 ? (
                      <p className="text-sm text-gray-600">
                        Resend OTP in <span className="font-semibold text-blue-600">{counter}</span> seconds
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    New Password
                  </Label>
                  <div className="relative mt-2">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter new password"
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      value={passwordFormik.values.password}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                    />
                  </div>
                  {passwordFormik.touched.password && passwordFormik.errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {passwordFormik.errors.password}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                    Confirm New Password
                  </Label>
                  <div className="relative mt-2">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      value={passwordFormik.values.confirmPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                    />
                  </div>
                  {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {passwordFormik.errors.confirmPassword}
                    </p>
                  )}
                </motion.div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Reset Password</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </>
            )}
          </motion.form>

          <motion.div
            className="mt-6 text-center text-sm text-gray-600"
            variants={itemVariants}
          >
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Sign in
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="text-center mt-6 text-sm text-gray-600"
          variants={itemVariants}
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to login
          </Link>
        </motion.div>
      </motion.div>

      <div id="recaptcha-container"></div>
    </div>
  );
};

export default ForgotPassword;