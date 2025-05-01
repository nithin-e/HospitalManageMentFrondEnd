import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="text-brand-blue font-bold text-2xl flex items-center">
      <motion.div
        className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center mr-2"
        whileHover={{ rotate: 10 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
            stroke="#003B73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
      <span className="gradient-text font-bold">ONA</span>
    </Link>
  );
};

export default Logo;
