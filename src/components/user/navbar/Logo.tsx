import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="text-brand-blue font-bold text-2xl flex items-center">
      <motion.div
        className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3 shadow-md border border-gray-100"
        whileHover={{ rotate: 5, scale: 1.05 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Circle - Dark Blue */}
          <circle cx="50" cy="35" r="25" fill="#1e3a8a" opacity="0.9"/>
          
          {/* Inner Circle - Light Blue */}
          <circle cx="50" cy="35" r="20" fill="#3b82f6"/>
          
          {/* White Background for Cross */}
          <circle cx="50" cy="35" r="15" fill="white"/>
          
          {/* Medical Cross - Green */}
          <rect x="46" y="27" width="8" height="16" rx="2" fill="#059669"/>
          <rect x="42" y="31" width="16" height="8" rx="2" fill="#059669"/>
          
          {/* Ribbon - Left Side (Blue) */}
          <path d="M15 65 L45 55 L42 70 L20 75 Z" fill="#3b82f6"/>
          <path d="M15 65 L25 60 L22 75 L12 70 Z" fill="#1e40af"/>
          
          {/* Ribbon - Right Side (Dark Blue) */}
          <path d="M85 65 L55 55 L58 70 L80 75 Z" fill="#1e3a8a"/>
          <path d="M85 65 L75 60 L78 75 L88 70 Z" fill="#0f172a"/>
          
          {/* Ribbon Center Overlap */}
          <ellipse cx="50" cy="62" rx="12" ry="6" fill="#2563eb"/>
        </svg>
      </motion.div>
      <span className="gradient-text font-bold">HealNova</span>
    </Link>
  );
};

export default Logo;