import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/user/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/user/ui/input-otp';
import { Button } from '@/components/user/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Loader, Mail } from 'lucide-react';

const OTPVerification = () => {
  const [value, setValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const email = location.state?.email || 'your email';

  const handleVerify = () => {
    if (value.length < 6) {
      toast({
        title: "Incomplete OTP",
        description: "Please enter all 6 digits of the OTP",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    // Mock verification - In a real app, this would call your backend/auth service
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      
      toast({
        title: "Verification successful",
        description: "Your account has been verified",
        variant: "default"
      });
      
      // Redirect after a brief delay to show the success state
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }, 2000);
  };

  const handleResendOTP = () => {
    toast({
      title: "OTP Resent",
      description: "A new verification code has been sent to your email",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 bg-brand-blue/10 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-brand-blue" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Verify Your Account</CardTitle>
            <CardDescription className="text-center">
              Enter the 6-digit code sent to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <InputOTP 
                value={value} 
                onChange={setValue} 
                maxLength={6}
                disabled={isVerified}
                className="mx-auto"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button 
              onClick={handleVerify} 
              className="w-full bg-brand-blue hover:bg-brand-blue/90"
              disabled={value.length < 6 || isVerifying || isVerified}
            >
              {isVerifying ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Verifying
                </>
              ) : isVerified ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Verified
                </>
              ) : (
                "Verify Account"
              )}
            </Button>
            <Button 
              variant="ghost" 
              className="text-sm text-gray-500 hover:text-brand-blue"
              onClick={handleResendOTP}
              disabled={isVerifying || isVerified}
            >
              Didn't receive a code? Resend
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
