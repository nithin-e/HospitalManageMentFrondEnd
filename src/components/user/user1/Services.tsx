
import React from 'react';
import { Card, CardContent } from "@/components/user/ui/card";
import { Heart, Brain, Bone, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        y: -10, 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.05)"
      }}
      className="card-hover"
    >
      <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 h-full bg-white overflow-hidden">
        <CardContent className="pt-6 relative">
          <motion.div 
            className="mb-5 flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-brand-blue/10 to-brand-accent/10"
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {icon}
          </motion.div>
          
          <motion.div
            className="absolute top-2 right-2 opacity-10"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <PlusCircle size={40} className="text-brand-blue" />
          </motion.div>
          
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
          
          <motion.div 
            className="h-1 w-12 bg-brand-accent/50 rounded-full mt-4"
            initial={{ width: 0 }}
            whileInView={{ width: 48 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Services: React.FC = () => {
  const services = [
    {
      icon: <Heart className="text-brand-blue" size={32} />,
      title: "Cardiology",
      description: "Comprehensive heart care with advanced diagnostics and treatments for cardiovascular conditions."
    },
    {
      icon: <Brain className="text-brand-blue" size={32} />,
      title: "Neurology",
      description: "Expert evaluation and management of neurological disorders affecting the brain and nervous system."
    },
    {
      icon: <Bone className="text-brand-blue" size={32} />,
      title: "Dental",
      description: "Complete dental services from preventive care to advanced restorative and cosmetic procedures."
    }
  ];

  return (
    <section id="services" className="py-20 px-4 md:px-6 lg:px-8 relative overflow-hidden">
      <motion.div 
        className="absolute -top-40 -right-40 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl z-0"
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
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-accent/5 rounded-full blur-3xl z-0"
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
    
      <div className="container mx-auto relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4"
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
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <PlusCircle className="text-brand-blue" size={30} />
            </motion.div>
          </motion.div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Departments & Services</h2>
          
          <motion.div 
            className="h-1 w-20 bg-brand-accent mx-auto mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our hospital offers a wide range of specialized departments and services 
            to address all your healthcare needs with expertise and compassion.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
