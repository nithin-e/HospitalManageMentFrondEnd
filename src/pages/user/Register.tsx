import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Mail, Key, User, ArrowRight, Phone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AppDispatch } from "../../store/redux/store";
import { useDispatch } from 'react-redux';
import axiosInstance from '@/cors/axiousInstance';
import { auth } from "../../store/firebase";
import { useFormik } from "formik";
import * as Yup from 'yup';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { sendOtp } from '@/hooks/auth';
import { registerUser } from '@/store/redux/slices/authSlice';
import { useGoogleLogin } from '@react-oauth/google';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  termsChecked: boolean;
  googleId?: string;
}

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

const Register = () => {
  const dispatch: AppDispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [otpInput, setOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [counter, setCounter] = useState(40);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Validation schema using Yup
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters')
      .matches(/^[a-zA-Z\s-]+$/, 'Name can only contain letters, spaces, and hyphens')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phoneNumber: Yup.string()
      .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
      .required('Phone number is required'),
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
    termsChecked: Yup.boolean()
      .oneOf([true], 'You must accept the terms and conditions')
      .required('You must accept the terms and conditions'),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      termsChecked: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.post("/api/user/checkUser", { 
          email: values.email, 
          phoneNumber: values.phoneNumber 
        });

        if (response.data.message === 'user not registered') {
          await sendOtp(setOtpInput, auth, values.phoneNumber, setConfirmationResult);
        } else if (response.data.message === "user already have an account") {
          throw new Error("You are already registered with this email. Please log in instead.");
        }
      } catch (error: any) {
        toast({
          title: "Registration Failed",
          description: error.message || "An error occurred. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      navigate('/');
    }
  }, [navigate]);

  const verifyOtp = async () => {
    try {
      if (!confirmationResult) throw new Error("No confirmation result");
      const result = await confirmationResult.confirm(otp);
      const res=  await dispatch(registerUser(formik.values));
      if ((res.payload as any).user.role === 'admin') {
       
        navigate('/adminDash');
      } else if ((res.payload as any).user.role === 'user') {
        console.log('yes iam a user');
        navigate('/login');
      }
      
    } catch (error: any) {
      toast({
        title: "OTP Verification Failed",
        description: error.message || "Invalid OTP",
        variant: "destructive"
      });
    }
  };

  const handleResendOtp = async () => {
    try {
      setCounter(40);
      setOtp('');
      await sendOtp(setOtpInput, auth, formik.values.phoneNumber, setConfirmationResult);
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

  const handleGoogleSignUp = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch user info from Google');
        }

        const userData = await userInfoResponse.json();
        const googleFormData = {
          googleId: userData.sub,
          email: userData.email,
          name: userData.name,
        };
      const result= await dispatch(registerUser(googleFormData));
     
      if ((result.payload as any).user.role === 'admin') {

       
        
        navigate('/adminDash');
      } else if ((result.payload as any).user.role === 'user') {
        console.log('yes iam a user');
        navigate('/');
      }else{
        navigate('/');
      }
      
       
      } catch (error: any) {
        toast({
          title: "Google Signup Failed",
          description: error.message || "Failed to sign up with Google",
          variant: "destructive",
        });
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      setIsGoogleLoading(false);
      toast({
        title: "Google Signup Failed",
        description: error.error_description || "Authentication error occurred",
        variant: "destructive",
      });
    },
    scope: 'email profile openid',
  });

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
            src="https://images.unsplash.com/photo-1504813184591-01572f98c85f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80"
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
            <h2 className="text-2xl font-bold">Join <span className="text-brand-accent">ONA</span></h2>
            <p className="mt-1 text-sm text-white/80">Personalized healthcare services</p>
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
            <Link to="/" className="inline-flex items-center text-brand-blue hover:text-brand-accent text-sm">
              <ArrowRight className="mr-1 h-3 w-3 rotate-180" />
              Back to home
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
                ONA
              </span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="mt-1 text-sm text-gray-600">Join our healthcare platform</p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6">
          
          </motion.div>

          <div className="my-4 flex items-center">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="px-3 text-xs text-gray-500">or register with email</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>


          <motion.form 
            variants={containerVariants}
            className="space-y-4"
            onSubmit={formik.handleSubmit}
          >
            {!otpInput ? (
              <>
                <motion.div variants={itemVariants} className="space-y-1">
                  <Label htmlFor="name" className="text-xs font-medium text-gray-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      className={`pl-8 h-9 text-sm ${formik.touched.name && formik.errors.name ? 'border-red-500' : ''}`}
                      {...formik.getFieldProps('name')}
                    />
                  </div>
                  {formik.touched.name && formik.errors.name && (
                    <motion.p variants={itemVariants} className="text-xs text-red-500">
                      {formik.errors.name}
                    </motion.p>
                  )}
                </motion.div>

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
                      className={`pl-8 h-9 text-sm ${formik.touched.email && formik.errors.email ? 'border-red-500' : ''}`}
                      {...formik.getFieldProps('email')}
                    />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <motion.p variants={itemVariants} className="text-xs text-red-500">
                      {formik.errors.email}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                  <Label htmlFor="phoneNumber" className="text-xs font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="+1234567890"
                      className={`pl-8 h-9 text-sm ${formik.touched.phoneNumber && formik.errors.phoneNumber ? 'border-red-500' : ''}`}
                      {...formik.getFieldProps('phoneNumber')}
                    />
                  </div>
                  {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                    <motion.p variants={itemVariants} className="text-xs text-red-500">
                      {formik.errors.phoneNumber}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                  <Label htmlFor="password" className="text-xs font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className={`pl-8 h-9 text-sm ${formik.touched.password && formik.errors.password ? 'border-red-500' : ''}`}
                      {...formik.getFieldProps('password')}
                    />
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <motion.p variants={itemVariants} className="text-xs text-red-500">
                      {formik.errors.password}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-xs font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className={`pl-8 h-9 text-sm ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500' : ''}`}
                      {...formik.getFieldProps('confirmPassword')}
                    />
                  </div>
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <motion.p variants={itemVariants} className="text-xs text-red-500">
                      {formik.errors.confirmPassword}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formik.values.termsChecked}
                    onCheckedChange={(checked) => formik.setFieldValue('termsChecked', checked)}
                  />
                  <label htmlFor="terms" className="text-xs">
                    I agree to the{" "}
                    <Link to="#" className="text-brand-blue hover:text-brand-accent">
                      terms
                    </Link>{" "}
                    and{" "}
                    <Link to="#" className="text-brand-blue hover:text-brand-accent">
                      privacy policy
                    </Link>
                  </label>
                </motion.div>
                {formik.touched.termsChecked && formik.errors.termsChecked && (
                  <motion.p variants={itemVariants} className="text-xs text-red-500">
                    {formik.errors.termsChecked}
                  </motion.p>
                )}

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    className="w-full bg-brand-blue hover:bg-brand-blue/90 h-9"
                    disabled={isLoading || !formik.isValid || !formik.dirty}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? "Creating..." : "Sign up"}
                  </Button>
                </motion.div>
              </>
            ) : (
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="space-y-1">
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
                  />
                </div>
                <div className="text-xs text-gray-600">
                  {counter > 0 ? (
                    <span>Resend OTP in {counter} seconds</span>
                  ) : (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-brand-blue hover:text-brand-accent"
                      onClick={handleResendOtp}
                    >
                      Resend OTP
                    </Button>
                  )}
                </div>
                <Button
                  onClick={verifyOtp}
                  className="w-full bg-brand-blue hover:bg-brand-blue/90 h-9"
                  disabled={isLoading || otp.length !== 6}
                >
                  Verify OTP
                </Button>
              </motion.div>
            )}
          </motion.form>

          <motion.div variants={itemVariants} className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              Already have an account?{" "}
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

export default Register;