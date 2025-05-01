// src/hooks/auth.js
import {
    ApplicationVerifier,
    Auth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
  } from "firebase/auth";
  import { toast } from "sonner";
  
  export const onCaptchaVerify = (auth) => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
  
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {
          console.log("recaptcha verified result:", response);
        },
        "expired-callback": () => {
          toast.error("Verification Expired");
          window.recaptchaVerifier?.clear();
        },
        "error-callback": (error) => {
          console.error("Recaptcha Error:", error);
        //   toast.error("Verification failed");
        },
      }
    );
  };
  
  export const sendOtp = async (
    setotpInput:any,
    auth:any,
    mobile:any,
    setConfirmationResult:any
  ) => {
    try {
        console.log('kittando',mobile);
        
      const number = "+91" + mobile;
  
      onCaptchaVerify(auth);
  
      const appVerifier = window?.recaptchaVerifier;
  
      if (!appVerifier) {
        throw new Error("RecaptchaVerifier could not be created");
      }
  
      const result = await signInWithPhoneNumber(auth, number, appVerifier);
      setConfirmationResult(result);
      toast.success("OTP sent successfully");
      setotpInput(true);
    } catch (error) {
      console.error("OTP Send Error:", error);
  
      // More detailed error handling
      if (error instanceof Error) {
        switch (error.message) {
          case "auth/invalid-app-credential":
            toast.error(
              "Invalid app credentials. Please check your Firebase configuration."
            );
            break;
          case "auth/too-many-requests":
            toast.error("Too many requests. Please try again later.");
            break;
          default:
            toast.error(`OTP Send Failed: ${error.message}`);
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };