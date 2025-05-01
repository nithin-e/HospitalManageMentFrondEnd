import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavItem from './NavItem';
import AuthButtons from './AuthButton';

interface MobileMenuProps {
  isOpen: boolean;
  navItems: Array<{ name: string; href: string }>;
  onItemClick: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, navItems, onItemClick }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="md:hidden bg-white shadow-lg absolute top-0 left-0 right-0 h-screen z-40"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: '100vh' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col justify-center items-center h-full space-y-8 px-4 py-5">
            {navItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <NavItem 
                  name={item.name}
                  href={item.href}
                  onClick={onItemClick}
                />
              </motion.div>
            ))}
            
            <AuthButtons isMobile onLogoutClick={onItemClick} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
