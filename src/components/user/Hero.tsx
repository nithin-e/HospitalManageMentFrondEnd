import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Star, Calendar, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface HeroProps {
  doctorImage: string;
}

const Hero: React.FC<HeroProps> = ({ doctorImage }) => {
  return (
    <section id="home" className="pt-32 pb-16 md:pt-40 md:pb-24 px-4 md:px-6 lg:px-8 overflow-hidden">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="order-2 md:order-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Comprehensive Healthcare <br />
              <motion.span 
                className="gradient-text text-brand-blue"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                Tailored Just for You
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-gray-600 mb-8 max-w-md text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Our expert medical team provides personalized, compassionate care 
              using cutting-edge technology and a patient-first approach.
            </motion.p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/AppointMent">
                <Button className="bg-brand-blue hover:bg-brand-blue/90 text-white px-8 py-6 h-auto button-transition flex items-center">
                  <Calendar size={20} className="mr-2" />
                       Book Appointment
                          </Button>
                           </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" className="border-gray-300 text-gray-700 flex items-center px-6 py-6 h-auto button-transition">
                  <ShieldCheck size={20} className="mr-2 text-brand-blue" />
                  Our Services
                </Button>
              </motion.div>
            </div>
            
            <motion.div 
              className="flex items-center space-x-4 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((item, i) => (
                  <Star 
                    key={item} 
                    size={20} 
                    className="text-yellow-400 fill-yellow-400 mr-1" 
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600 font-medium">
                  (4.8/5 Rating)
                </span>
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4 max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <div className="flex items-center">
                <ShieldCheck size={24} className="text-brand-blue mr-2" />
                <span className="text-gray-700">Expert Doctors</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck size={24} className="text-brand-blue mr-2" />
                <span className="text-gray-700">24/7 Support</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck size={24} className="text-brand-blue mr-2" />
                <span className="text-gray-700">Modern Facilities</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck size={24} className="text-brand-blue mr-2" />
                <span className="text-gray-700">Personalized Care</span>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right side image remains the same as in previous example */}
          <motion.div 
            className="order-1 md:order-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative">
              <motion.div 
                className="absolute top-1/4 -left-6 w-20 h-20 bg-brand-accent/30 rounded-full blur-xl z-0"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 0.8, 0.6] 
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              ></motion.div>
              
              <motion.div 
                className="absolute bottom-1/4 -right-6 w-32 h-32 bg-brand-blue/20 rounded-full blur-xl z-0"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.7, 0.5] 
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              ></motion.div>
              
              <motion.div 
                className="relative bg-white rounded-[50%] overflow-hidden shadow-lg z-10"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                whileHover={{ 
                  y: -5, 
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transition: { duration: 0.3 }
                }}
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={doctorImage} 
                    alt="Professional Doctor" 
                    className="w-full h-full object-cover rounded-[50%]"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;