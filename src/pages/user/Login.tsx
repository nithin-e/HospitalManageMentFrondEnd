import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LogIn, Mail, Key, ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import axiosInstance from "@/cors/axiousInstance";
import { useDispatch } from "react-redux";
import { login } from "@/store/redux/slices/authSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useGoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showBlockedMessage, setShowBlockedMessage] = useState(false);

  const location = useLocation();
  const passwordReset = location.state?.passwordReset;
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const dispatch = useDispatch();

  // Effect to handle password reset message display
  useEffect(() => {
    if (passwordReset) {
      setShowMessage(true);
      const timeout = setTimeout(() => {
        setShowMessage(false);
      }, 4000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [passwordReset]);

  useEffect(() => {
    if (showBlockedMessage) {
      const timeout = setTimeout(() => {
        setShowBlockedMessage(false);
      }, 4000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [showBlockedMessage]);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    rememberMe: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.post("/api/user/loginUser", {
          email: values.email,
          password: values.password,
        });

        if (!response.data || !response.data.user) {
          throw new Error("Incorrect Credentials");
        }

        if (response.data.user.isActive === false) {
          setShowBlockedMessage(true);
          return;
        }

        console.log("Login response:", response);

        const loginPayload = {
          user: {
            _id: response.data.user.id || response.data.user._id,
            name: response.data.user.name,
            email: response.data.user.email,
            role: response.data.user.role,
          },
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
        };
        console.log("Login payload:", response);

        const result = await dispatch(login(loginPayload));
        if ((result.payload as any).user.role === "admin") {
          navigate("/adminDash");
        } else if ((result.payload as any).user.role === "user") {
          navigate("/");
        } else if ((result.payload as any).user.role === "doctor") {
          const email = result.payload.user?.email;
          console.log(
            "dey dey check this payload first",
            result.payload.user.email
          );

          navigate("/DoctorDashboard", { state: { email: email } });
          //  navigate('/DoctorDashboard');
        }
      } catch (error) {
        let errorMsg = "An error occurred during login";

        if (error.code === "auth/wrong-password") {
          errorMsg = "Incorrect password";
        } else if (error.code === "auth/user-not-found") {
          errorMsg = "No account found with this email";
        } else if (error.code === "auth/invalid-email") {
          errorMsg = "Invalid email format";
        } else if (error.message) {
          errorMsg = error.message;
        }

        formik.setFieldError("password", errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      navigate("/");
    }
  }, [navigate]);

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        // Include the access token in the Authorization header
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!userInfoResponse.ok) {
          throw new Error("Failed to fetch user info from Google");
        }

        const userData = await userInfoResponse.json();
        console.log("check this responce after thhe google login", userData);

        const backendResponse = await axiosInstance.post(
          "/api/user/loginUser",
          {
            googleId: userData.sub,
            email: userData.email,
            name: userData.name,
            accessToken: tokenResponse.access_token,
          }
        );

        if (backendResponse.data.user.isActive === false) {
          setShowBlockedMessage(true);
          return;
        }

        console.log("backendResponse after google login", backendResponse);


        const loginPayload = {
          user: {
            _id: backendResponse.data.user.id,
            name: backendResponse.data.user.name,
            email: backendResponse.data.user.email,
            role: backendResponse.data.user.role,
          },
          accessToken: backendResponse.data.access_token,
          refreshToken: backendResponse.data.refresh_token,
        };

        console.log(
          "------------------------------login payload-------------------------------------",
          loginPayload
        );

        const result = await dispatch(login(loginPayload));
        console.log("goofgle 000login result:", result);

        if ((result.payload as any).user.role === "admin") {
          navigate("/adminDash");
        } else if ((result.payload as any).user.role === "user") {
          navigate("/");
        }
      } catch (error) {
        formik.setFieldError(
          "password",
          error.message || "Failed to sign in with Google"
        );
      } finally {
        setIsGoogleLoading(false);
      }
    },

    onError: (error) => {
      setIsGoogleLoading(false);
      formik.setFieldError(
        "password",
        error.error_description || "Authentication error occurred"
      );
    },
    scope: "email profile openid",
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0.3, 0.5, 0.3],
      transition: {
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const googleButtonVariants = {
    hover: {
      scale: 1.02,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    tap: { scale: 0.98 },
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row overflow-hidden relative">
      <motion.div
        className="fixed -left-1/4 -bottom-1/3 w-1/2 h-1/2 bg-gradient-to-tr from-brand-blue/20 to-brand-blue/5 rounded-full blur-3xl -z-10"
        initial="hidden"
        animate="visible"
        variants={backgroundVariants}
      />
      <motion.div
        className="fixed -right-1/4 -top-1/4 w-1/2 h-1/2 bg-gradient-to-bl from-brand-accent/20 to-brand-accent/5 rounded-full blur-3xl -z-10"
        initial="hidden"
        animate="visible"
        variants={{
          ...backgroundVariants,
          visible: {
            ...backgroundVariants.visible,
            transition: {
              ...backgroundVariants.visible.transition,
              delay: 2,
            },
          },
        }}
      />
      <motion.div
        className="hidden md:flex md:w-1/2 bg-healthcare-blue items-center justify-center p-10 relative"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.div className="relative max-w-md">
          <motion.div
            className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-brand-accent"
            animate={{
              y: [0, -15, 0],
              x: [0, 5, 0],
              rotate: [0, 5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-brand-blue"
            animate={{
              y: [0, 15, 0],
              x: [0, -5, 0],
              rotate: [0, -5, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 7,
              delay: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"
            alt="Healthcare professional"
            className="rounded-2xl shadow-xl w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            style={{ boxShadow: "0 20px 40px rgba(0, 59, 115, 0.15)" }}
          />
          <motion.div
            className="absolute -bottom-4 right-12 w-32 h-32 rounded-full bg-white/10 backdrop-blur-md"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
        <motion.div
          className="absolute bottom-16 left-10 md:max-w-md text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            Welcome to <span className="text-brand-accent">HealNova</span>{" "}
            Healthcare
          </motion.h2>
          <motion.p
            className="mt-3 text-lg text-white/80"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            Providing exceptional care with advanced technology
          </motion.p>
        </motion.div>
      </motion.div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 md:p-16">
        <motion.div
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-2">
            <Link
              to="/"
              className="inline-flex items-center text-brand-blue hover:text-brand-accent transition-colors"
            >
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              Back to home
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mb-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center">
              <motion.div
                className="w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center mr-2"
                whileHover={{ rotate: 10, scale: 1.1 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                    stroke="#003B73"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
              <motion.span
                className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-accent text-3xl font-bold"
                whileHover={{ scale: 1.05 }}
              >
                HealNova
              </motion.span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-gray-900"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Welcome Back
            </motion.h1>
            <motion.p
              className="mt-3 text-lg text-gray-600"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Sign in to your account to continue
            </motion.p>
          </motion.div>

          {passwordReset && showMessage && (
            <motion.p
              className="mt-4 text-green-600 text-sm font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              Password reset successfully done
            </motion.p>
          )}

          {showBlockedMessage && (
            <motion.p
              className="mt-4 text-red-600 text-sm font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              Your account is blocked. Please try registering with another
              email.
            </motion.p>
          )}

          <motion.div
            variants={itemVariants}
            className="mt-8"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <motion.button
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => handleGoogleSignIn()}
              disabled={isGoogleLoading}
              variants={googleButtonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {isGoogleLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-gray combination of gray-600 border-t-transparent rounded-full"
                />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.20-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.70 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.60 3.30-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
              )}
              {isGoogleLoading ? "Signing in..." : "Continue with Google"}
            </motion.button>
          </motion.div>

          <div className="mt-8 mb-8 flex items-center">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="px-4 text-sm text-gray-500">
              or continue with email
            </span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          <motion.form
            variants={containerVariants}
            onSubmit={formik.handleSubmit}
            className="space-y-6"
          >
            <motion.div
              variants={itemVariants}
              className="space-y-2"
              whileHover={{ scale: 1.01 }}
            >
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`pl-10 ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-500"
                      : ""
                  }`}
                  {...formik.getFieldProps("email")}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <motion.p
                  variants={itemVariants}
                  className="text-sm text-red-500"
                >
                  {formik.errors.email}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="space-y-2"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <Link
                  to="/resetPass"
                  className="text-sm font-medium text-brand-blue hover:text-brand-accent transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`pl-10 ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-500"
                      : ""
                  }`}
                  {...formik.getFieldProps("password")}
                />
              </div>
              {formik.touched.password && formik.errors.password && (
                <motion.p
                  variants={itemVariants}
                  className="text-sm text-red-500"
                >
                  {formik.errors.password}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-center space-x-2"
            >
              <Checkbox
                id="remember"
                checked={formik.values.rememberMe}
                onCheckedChange={(checked) =>
                  formik.setFieldValue("rememberMe", checked)
                }
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="w-full bg-brand-blue hover:bg-brand-blue/90"
                size={isMobile ? "default" : "lg"}
                disabled={isLoading || !formik.isValid || !formik.dirty}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </motion.div>
          </motion.form>

          <motion.div variants={itemVariants} className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-brand-blue hover:text-brand-accent transition-colors"
              >
                Sign up
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
