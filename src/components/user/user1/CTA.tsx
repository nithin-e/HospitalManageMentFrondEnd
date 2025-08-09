import React from 'react';
import { Button } from "@/components/user/ui/button";
import { motion } from 'framer-motion';
import { Shield, ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CTAProps {
  image: string;
}

const CTA: React.FC<CTAProps> = ({ image }) => {
  const isMobile = useIsMobile();
  
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 md:px-6 lg:px-8 bg-white relative overflow-hidden">
      <motion.div 
        className="absolute top-0 right-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-gray-100/30 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 20, 0],
          y: [0, -20, 0]
        }}
        transition={{ 
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
      
      <motion.div 
        className="absolute bottom-0 left-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-gray-200/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -20, 0],
          y: [0, 20, 0]
        }}
        transition={{ 
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
    
      <div className="container mx-auto relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div 
            className="text-gray-800 order-2 md:order-1"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 backdrop-blur-md rounded-full flex items-center justify-center mb-4 sm:mb-6"
              initial={{ scale: 0, rotate: -20 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Shield size={isMobile ? 20 : 28} className="text-gray-600" />
            </motion.div>
            
            <motion.h2 
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Protect your Health
              </motion.span>
              <motion.span 
                className="block mt-1 sm:mt-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                With Group Coverage
              </motion.span>
            </motion.h2>
            
            <motion.p 
              className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Our comprehensive healthcare plans provide complete coverage for you 
              and your family. Enjoy peace of mind knowing that your health needs 
              are taken care of by our expert team.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-gray-800 text-white hover:bg-gray-700 button-transition px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-6 h-auto text-sm sm:text-base md:text-lg w-full sm:w-auto">
                  Learn More
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" className="border-gray-800 text-gray-800 hover:bg-gray-100 button-transition px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-6 h-auto text-sm sm:text-base md:text-lg w-full sm:w-auto">
                  Contact Us <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.div
            className="order-1 md:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div className="relative">
              <motion.div 
                className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 w-full h-full bg-gray-200/30 rounded-lg"
                initial={{ opacity: 0, x: 20, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              />
              
              <motion.img 
                src={image} 
                alt="Healthcare professionals" 
                className="w-full h-auto rounded-lg shadow-2xl relative z-10"
                initial={{ filter: "brightness(0.9)" }}
                whileInView={{ filter: "brightness(1)" }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTA;