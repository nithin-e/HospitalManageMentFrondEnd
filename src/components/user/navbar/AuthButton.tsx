import React from 'react';
import { Button } from "@/components/user/ui/button";
import { LogIn, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AuthButtonsProps {
  isMobile?: boolean;
  isLoggedIn?: boolean;
  onLogoutClick?: () => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ isMobile = false, isLoggedIn = false, onLogoutClick }) => {

  return (
    <motion.div
      className={isMobile ? "flex flex-col space-y-4 w-full max-w-xs" : "flex items-center space-x-3"}
      initial={isMobile ? { opacity: 0, y: 20 } : undefined}
      animate={isMobile ? { opacity: 1, y: 0 } : undefined}
      transition={isMobile ? { duration: 0.3, delay: 0.4 } : undefined}
    >
      {isLoggedIn ? (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant="outline" 
            className={`${isMobile ? 'w-full bg-brand-blue hover:bg-brand-blue/90 text-white' : 'border-brand-blue text-brand-blue hover:bg-brand-blue/5'}`}
            onClick={onLogoutClick}
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
        </motion.div>
      ) : (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/login" className={isMobile ? "w-full" : ""}>
            <Button 
              variant={isMobile ? "default" : "outline"}
              className={isMobile ? "w-full bg-brand-blue hover:bg-brand-blue/90 text-white" : "border-brand-blue text-brand-blue hover:bg-brand-blue/5"}
            >
              <LogIn size={16} className="mr-2" />
              Sign In
            </Button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AuthButtons;
