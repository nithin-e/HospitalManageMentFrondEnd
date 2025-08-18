
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { TrendingUp, Users, Building2, Award } from 'lucide-react';

interface StatCardProps {
  value: string;
  label: string;
  color: string;
  index: number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, color, index, icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      whileHover={{ 
        y: -10, 
        scale: 1.02,
        boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 15px -5px rgba(0, 0, 0, 0.05)"
      }}
    >
      <Card className={`border-none ${color} hover:shadow-xl transition-all duration-300 overflow-hidden`}>
        <CardContent className="pt-6 text-center relative">
          <motion.div 
            className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-black/5 z-0"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2] 
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
        
          <motion.div 
            className="flex justify-center mb-3"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              delay: 0.2 + (index * 0.1) 
            }}
          >
            {icon}
          </motion.div>
          
          <motion.p 
            className="text-4xl font-bold mb-1"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              delay: 0.3 + (index * 0.15) 
            }}
          >
            <motion.span
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {value}
            </motion.span>
          </motion.p>
          
          <motion.div 
            className="h-1 w-0 bg-gray-300/50 mx-auto mb-2 rounded-full"
            whileInView={{ width: 40 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 + (index * 0.1) }}
          />
          
          <p className="text-gray-600 text-sm">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Stats: React.FC = () => {
  const stats = [
    { 
      value: "967", 
      label: "Expert Doctors", 
      color: "bg-healthcare-pink",
      icon: <Users size={24} className="text-pink-600" />
    },
    { 
      value: "267", 
      label: "Hospital Rooms", 
      color: "bg-healthcare-blue",
      icon: <Building2 size={24} className="text-blue-600" /> 
    },
    { 
      value: "867", 
      label: "Happy Patients", 
      color: "bg-healthcare-gray",
      icon: <Award size={24} className="text-indigo-600" />
    },
    { 
      value: "97%", 
      label: "Success Rate", 
      color: "bg-green-100",
      icon: <TrendingUp size={24} className="text-green-600" />
    }
  ];

  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="text-2xl md:text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            We're an employee benefit at{" "}
            <motion.span 
              className="text-brand-blue"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              20,000+
            </motion.span>{" "}
            companies
          </motion.h2>
          
          <motion.div 
            className="h-1 w-20 bg-brand-accent mx-auto mb-2"
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              value={stat.value}
              label={stat.label}
              color={stat.color}
              index={index}
              icon={stat.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
