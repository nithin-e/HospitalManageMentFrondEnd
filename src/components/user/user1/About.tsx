import React from 'react';
import { CheckCircle } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

const About: React.FC = () => {
  const checkItems = [
    "24/7 Medical Support",
    "Experienced Doctors",
    "Modern Equipment",
    "Patient-Centered Care"
  ];
  
  const isMobile = useIsMobile();

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <section id="about" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 lg:px-12 bg-healthcare-blue/50 overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16">
          <motion.div 
            className="w-full md:w-1/2"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative">
              <motion.div 
                className="absolute -top-6 -left-6 w-16 sm:w-24 h-16 sm:h-24 border-2 border-brand-accent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              ></motion.div>
              
              <motion.div 
                className="absolute top-10 left-10 w-6 sm:w-10 h-6 sm:h-10 bg-brand-accent/30 rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              ></motion.div>
              
              <motion.div 
                className="bg-white p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center absolute -bottom-6 sm:-bottom-8 -right-6 sm:-right-8 shadow-lg z-20"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  delay: 0.6 
                }}
                whileHover={{ rotate: 15, scale: 1.1 }}
              >
                <svg width={isMobile ? "24" : "32"} height={isMobile ? "24" : "32"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                    stroke="#59CBE8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
              
              <motion.div 
                className="h-60 sm:h-72 md:h-80 bg-gradient-to-r from-brand-blue to-brand-lightBlue rounded-lg flex items-center justify-center relative z-10 overflow-hidden shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Replace the SVG with an actual image */}
                <img 
                  src="/public/lovable-uploads/image.png" 
                  alt="Healthcare professional" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            className="w-full md:w-1/2 mt-12 md:mt-0"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <motion.h2 
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Your Health Requirement Is
              <motion.span 
                className="block gradient-text"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Our First Focus
              </motion.span>
            </motion.h2>
            
            <motion.p 
              className="text-sm sm:text-base md:text-lg text-gray-600 mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              We prioritize your health needs with our comprehensive approach to healthcare. 
              Our team of specialists works together to provide personalized care tailored to your unique requirements.
            </motion.p>
            
            <motion.div 
              className="space-y-3 sm:space-y-4 mb-8"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              {checkItems.map((item, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center gap-2 sm:gap-3"
                  variants={item}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="text-brand-blue"
                  >
                    <CheckCircle size={isMobile ? 16 : 20} className="min-w-[16px] sm:min-w-[20px]" />
                  </motion.div>
                  <span className="text-sm sm:text-base text-gray-700">{item}</span>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="h-1 sm:h-2 w-16 sm:w-20 bg-brand-accent rounded-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;