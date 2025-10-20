
import React, { useEffect } from 'react';
import Navbar from '@/components/user/Navbar';
import Hero from '@/components/user/Hero';
import About from '@/components/user/About';
import Services from '@/components/user/Services';
import Stats from '@/components/user/Stats';
import Doctors from '@/components/user/Doctors';
import CTA from '@/components/user/CTA';

 import Footer from '@/components/user/Footer';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { 
    stiffness: 100, 
    damping: 30, 
    restDelta: 0.001 
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const isMobile = useIsMobile();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div 
      className="min-h-screen overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-accent via-brand-blue to-brand-accent z-[100]"
        style={{ scaleX, transformOrigin: "0%" }}
      />
      
      <motion.div
        className="fixed inset-0 -z-10 bg-gradient-to-b from-blue-50 to-white pointer-events-none"
        style={{ y: backgroundY }}
      />
      
      <Navbar />
      
      <main className="w-full mx-auto">
        <Hero doctorImage="/public/uploads/mainDoctor.png" />
        <About />
        <Services />
        <Stats />
        <Doctors />
        <CTA image="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80" />
      
      </main>
      
      <Footer />
      
      <motion.div 
        className={`fixed ${isMobile ? 'bottom-4 right-4 w-10 h-10' : 'bottom-6 right-6 w-14 h-14'} bg-gradient-to-r from-brand-blue to-brand-accent text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg z-30`}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 300 }}
        whileHover={{ scale: 1.1, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <motion.svg 
          width={isMobile ? "18" : "24"} 
          height={isMobile ? "18" : "24"} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </motion.svg>
      </motion.div>
      
      <motion.div 
        className="fixed -bottom-40 -left-40 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl z-0"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="fixed -top-40 -right-40 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl z-0"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
    </motion.div>
  );
};

export default Index;
