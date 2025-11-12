import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
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
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [userPhone, setUserPhone] = useState('');
  const { toast } = useToast();
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
      try {
        // Check if user exists
        const response = await axiosInstance.post("/api/user/checkUser", { 
          email: values.email 
        });

        console.log('Check user response:', response);

        if (response.data.message === "User not found or inactive") {
          throw new Error("No account found with this email address.");
        } else if (response.data.user && response.data.user.phoneNumber) {
          // User exists, store phone number and send OTP
          setUserPhone(response.data.user.phoneNumber);
          await sendOtp(setOtpInput, auth, response.data.user.phoneNumber, setConfirmationResult);
        } else {
          throw new Error("Unable to retrieve user information. Please try again.");
        }
      } catch (error: any) {
        toast({
          title: "Verification Failed",
          description: error.message || "An error occurred. Please try again.",
          variant: "destructive"
        });
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
    if (!confirmationResult) {
      toast({
        title: "Error",
        description: "No OTP confirmation result available",
        variant: "destructive"
      });
      return;
    }

    if (!passwordFormik.isValid) {
      toast({
        title: "Invalid Password",
        description: "Please ensure your password meets all requirements",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);
      
      const response = await forgetPassword(emailFormik.values.email, passwordFormik.values.password);
      
      console.log('Password reset response:', response);
      
      if (response.success === true) {
        toast({
          title: "Success",
          description: "Password reset successfully. Please login with your new password.",
        });
        navigate('/login', { state: { passwordReset: true } });
      } else if (response.success === false) {
        toast({
          title: "Reset Failed",
          description: "Failed to reset password. Please check your email.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: error.message || "Invalid OTP or password reset failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setCounter(40);
      setOtp('');
      await sendOtp(setOtpInput, auth, userPhone, setConfirmationResult);
    } catch (error) {
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
      transition: { type: "spring", stiffness: 300, damping: 24 }
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
    <div className="min-h-[85vh] w-full flex flex-col md:flex-row-reverse overflow-hidden relative">
      <motion.div 
        className="fixed -right-1/4 -bottom-1/3 w-1/3 h-1/3 bg-gradient-to-tl from-brand-accent/20 to-brand-accent/5 rounded-full blur-3xl -z-10"
        initial="hidden"
        animate="visible"
        variants={backgroundVariants}
      />
      
      <motion.div 
        className="fixed -left-1/4 -top-1/4 w-1/3 h-1/3 bg-gradient-to-br from-brand-blue/20 to-brand-blue/5 rounded-full blur-3xl -z-10"
        initial="hidden"
        animate="visible"
        variants={backgroundVariants}
      />
      
      <motion.div 
        className="hidden md:flex md:w-1/2 bg-healthcare-pink items-center justify-center p-6 relative"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div className="relative max-w-sm">
          <motion.img 
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Healthcare professional" 
            className="rounded-xl shadow-lg w-full max-w-sm"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          />
          <motion.div 
            className="absolute bottom-8 left-8 text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold">Reset Your Password</h2>
            <p className="mt-1 text-sm text-white/80">Secure access to <span className="text-brand-accent">HealNova</span></p>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-8 md:p-12">
        <motion.div 
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-1">
            <Link to="/login" className="inline-flex items-center text-brand-blue hover:text-brand-accent text-sm">
              <ArrowRight className="mr-1 h-3 w-3 rotate-180" />
              Back to login
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-4">
            <div className="flex items-center">
              <motion.div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center mr-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                    stroke="#003B73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-accent">
                HealNova
              </span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Forgot Password</h1>
            <p className="mt-1 text-sm text-gray-600">
              {!otpInput ? "Enter your email to receive an OTP" : "Verify OTP and set new password"}
            </p>
          </motion.div>

          <motion.div variants={containerVariants} className="mt-6 space-y-4">
            {!otpInput ? (
              // Step 1: Email Input
              <motion.form 
                variants={containerVariants}
                className="space-y-4"
                onSubmit={emailFormik.handleSubmit}
              >
                <motion.div variants={itemVariants} className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-medium text-gray-700">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      className={`pl-8 h-9 text-sm ${emailFormik.touched.email && emailFormik.errors.email ? 'border-red-500' : ''}`}
                      {...emailFormik.getFieldProps('email')}
                    />
                  </div>
                  {emailFormik.touched.email && emailFormik.errors.email && (
                    <motion.p variants={itemVariants} className="text-xs text-red-500">
                      {emailFormik.errors.email}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    className="w-full bg-brand-blue hover:bg-brand-blue/90 h-9"
                    disabled={isLoading || !emailFormik.isValid || !emailFormik.dirty}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <Mail className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? "Verifying..." : "Send OTP"}
                  </Button>
                </motion.div>
              </motion.form>
            ) : (
              // Step 2: OTP + Password Input
              <motion.div variants={containerVariants} className="space-y-4">
                <motion.div variants={itemVariants} className="space-y-1">
                  <Label htmlFor="otp" className="text-xs font-medium text-gray-700">
                    Enter OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    className="h-9 text-sm"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="text-xs text-gray-600">
                  {counter > 0 ? (
                    <span>Resend OTP in {counter} seconds</span>
                  ) : (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-brand-blue hover:text-brand-accent text-xs"
                      onClick={handleResendOtp}
                    >
                      Resend OTP
                    </Button>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                  <Label htmlFor="password" className="text-xs font-medium text-gray-700">
                    New Password
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className={`pl-8 h-9 text-sm ${passwordFormik.touched.password && passwordFormik.errors.password ? 'border-red-500' : ''}`}
                      {...passwordFormik.getFieldProps('password')}
                    />
                  </div>
                  {passwordFormik.touched.password && passwordFormik.errors.password && (
                    <motion.p variants={itemVariants} className="text-xs text-red-500">
                      {passwordFormik.errors.password}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-xs font-medium text-gray-700">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className={`pl-8 h-9 text-sm ${passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword ? 'border-red-500' : ''}`}
                      {...passwordFormik.getFieldProps('confirmPassword')}
                    />
                  </div>
                  {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                    <motion.p variants={itemVariants} className="text-xs text-red-500">
                      {passwordFormik.errors.confirmPassword}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    onClick={verifyOtpAndResetPassword}
                    className="w-full bg-brand-blue hover:bg-brand-blue/90 h-9"
                    disabled={
                      isLoading || 
                      otp.length !== 6 || 
                      !passwordFormik.isValid || 
                      !passwordFormik.dirty
                    }
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : null}
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              Remember your password?{" "}
              <Link to="/login" className="text-brand-blue hover:text-brand-accent">
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
        <div id="recaptcha-container" className="mt-4"></div>
      </div>
    </div>
  );
};

export default ForgotPassword;