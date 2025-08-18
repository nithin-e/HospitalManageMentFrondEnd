import React from 'react';
import { motion } from 'framer-motion';

interface NavItemProps {
  name: string;
  href: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ name, href, onClick }) => {
  return (
    <motion.a 
      href={href} 
      className="text-sm font-medium text-gray-700 hover:text-brand-blue transition-colors relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {name}
      <motion.div 
        className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-blue"
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.2 }}
      />
    </motion.a>
  );
};

export default NavItem;