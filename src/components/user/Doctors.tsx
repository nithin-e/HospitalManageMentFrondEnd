
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { Check, Heart, Mail, PhoneCall, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DoctorCardProps {
  image: string;
  name: string;
  specialty: string;
  index: number;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ image, name, specialty, index }) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -15 }}
      className="group"
    >
      <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
        <motion.div 
          className="bg-gradient-to-br from-healthcare-blue to-healthcare-blue/80 p-4 sm:p-6 flex items-center justify-center relative overflow-hidden"
          whileHover={{ backgroundColor: "rgba(230, 244, 241, 0.8)" }}
        >
          <motion.div
            className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-70 transition-opacity duration-500"
            style={{
              background: "radial-gradient(circle, rgba(89,203,232,0.2) 0%, rgba(89,203,232,0) 70%)"
            }}
          />
          
          <motion.div 
            className="absolute -bottom-1 -right-1 w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2] 
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          
          <motion.div 
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
          
          <motion.img 
            src={image} 
            alt={name} 
            className="w-24 h-24 sm:w-36 sm:h-36 object-cover rounded-full border-4 border-white shadow-lg z-10"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            initial={{ scale: 0.9, opacity: 0.8 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
          />
          
          <motion.div 
            className="absolute -bottom-10 opacity-0 group-hover:opacity-100 group-hover:bottom-2 transition-all duration-300 flex space-x-2 z-20"
          >
            <motion.div 
              className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer"
              whileHover={{ scale: 1.1, y: -3 }}
            >
              <PhoneCall size={isMobile ? 10 : 14} className="text-brand-blue" />
            </motion.div>
            <motion.div 
              className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer"
              whileHover={{ scale: 1.1, y: -3 }}
            >
              <Mail size={isMobile ? 10 : 14} className="text-brand-blue" />
            </motion.div>
            <motion.div 
              className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer"
              whileHover={{ scale: 1.1, y: -3 }}
            >
              <Heart size={isMobile ? 10 : 14} className="text-red-500" />
            </motion.div>
          </motion.div>
        </motion.div>
        
        <CardContent className="text-center pt-4 sm:pt-6 pb-4 sm:pb-6 relative">
          <motion.div
            className="absolute top-2 right-2 w-4 h-4 sm:w-5 sm:h-5 bg-green-100 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 300, delay: 0.3 + (index * 0.1) }}
          >
            <Check size={isMobile ? 8 : 12} className="text-green-600" />
          </motion.div>
          
          <h3 className="font-semibold text-base sm:text-lg">{name}</h3>
          <p className="text-gray-600 text-xs sm:text-sm mb-2">{specialty}</p>
          
          <motion.div 
            className="h-1 w-0 bg-brand-accent/50 mx-auto rounded-full"
            whileInView={{ width: isMobile ? 30 : 40 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 + (index * 0.1) }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Doctors: React.FC = () => {
  const isMobile = useIsMobile();
  const doctors = [
    {
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      name: "Dr. Robert Smith",
      specialty: "Cardiology"
    },
    {
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      name: "Dr. Maria Sanders",
      specialty: "Neurology"
    },
    {
      image: "https://randomuser.me/api/portraits/men/86.jpg",
      name: "Dr. David Kim",
      specialty: "Orthopedics"
    },
    {
      image: "https://randomuser.me/api/portraits/women/67.jpg",
      name: "Dr. Sarah Lee",
      specialty: "Pediatrics"
    }
  ];

  return (
    <section id="doctors" className="py-12 sm:py-16 md:py-20 px-4 md:px-6 lg:px-8 overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-12 h-12 sm:w-16 sm:h-16 bg-healthcare-pink rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              delay: 0.1 
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 10, 0, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Users size={isMobile ? 20 : 30} className="text-pink-600" />
            </motion.div>
          </motion.div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Our Doctors</h2>
          
          <motion.div 
            className="h-1 w-16 sm:w-20 bg-brand-accent mx-auto mb-4 sm:mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: isMobile ? 60 : 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Meet our team of experienced and dedicated healthcare professionals 
            committed to providing exceptional care.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {doctors.map((doctor, index) => (
            <DoctorCard
              key={index}
              image={doctor.image}
              name={doctor.name}
              specialty={doctor.specialty}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Doctors;
