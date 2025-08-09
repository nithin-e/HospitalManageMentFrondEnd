import React from 'react';
import Navbar from '@/components/user/user1/Navbar';
import Footer from '@/components/user/user1/Footer';
import ServiceCard from '@/components/user/user1/ServiceCard';

import { Calendar, Users, Award, ChevronRight, Stethoscope, Heart } from 'lucide-react';
import { Button } from './reusable/Button';


const servicesData = [
  {
    title: "Cardiology",
    description: "Expert care for your heart health including diagnosis and treatment of coronary artery disease, heart rhythm problems, and heart failure.",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    featured: true
  },
  {
    title: "Dentistry",
    description: "Comprehensive dental care including preventive, restorative, and cosmetic services to keep your smile healthy and beautiful.",
    imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
  },
  {
    title: "Neurology",
    description: "Specialized care for disorders of the nervous system, including the brain, spinal cord, nerves, and muscles.",
    imageUrl: "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1472&q=80",
    featured: true
  },
  {
    title: "Orthopedics",
    description: "Treatment for musculoskeletal issues including injuries, joint pain, spine disorders, and sports medicine.",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
  },
  {
    title: "Pediatrics",
    description: "Complete healthcare for infants, children and adolescents focusing on physical, emotional, and social health development.",
    imageUrl: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
  },
  {
    title: "Diabetes Care",
    description: "Comprehensive care for diabetes management including prevention, education, treatment, and long-term health maintenance.",
    imageUrl: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80",
  },
  {
    title: "Urology",
    description: "Specialized care for urinary tract and male reproductive system including kidney stones, bladder issues, and prostate health.",
    imageUrl: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
  },
  {
    title: "Ophthalmology",
    description: "Expert care for eye health including vision tests, glasses, contact lenses, and treatment of eye diseases and conditions.",
    imageUrl: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
  },
];

const Services2: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Services Hero Section */}
      <div className="bg-healthcare-gray py-20 px-6 relative overflow-hidden">
        {/* Abstract medical background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-center bg-cover mix-blend-multiply"></div>
        </div>
        
        
        <div className="hidden md:block absolute top-20 right-10 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl"></div>
        <div className="hidden md:block absolute -bottom-20 -left-20 w-80 h-80 bg-brand-lightBlue/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto animate-fade-in">
            <span className="inline-block bg-brand-accent/20 text-brand-blue px-4 py-1 rounded-full text-sm font-medium tracking-wide mb-3">OUR SPECIALTIES</span>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-blue mb-6">Specialized Medical Services</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-brand-lightBlue to-brand-accent mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg">
              With our team of highly skilled specialists and advanced medical technology, we provide comprehensive care across numerous medical disciplines.
            </p>
          </div>
          
          
         
        
          
          {/* Service stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center animate-fade-in border border-gray-100">
              <div className="text-4xl font-bold text-brand-blue mb-2">15+</div>
              <div className="text-gray-600">Medical Specialties</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center animate-fade-in border border-gray-100" style={{animationDelay: '0.1s'}}>
              <div className="text-4xl font-bold text-brand-blue mb-2">24/7</div>
              <div className="text-gray-600">Emergency Care</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center animate-fade-in border border-gray-100" style={{animationDelay: '0.2s'}}>
              <div className="text-4xl font-bold text-brand-blue mb-2">50+</div>
              <div className="text-gray-600">Specialist Doctors</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center animate-fade-in border border-gray-100" style={{animationDelay: '0.3s'}}>
              <div className="text-4xl font-bold text-brand-blue mb-2">10k+</div>
              <div className="text-gray-600">Satisfied Patients</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Services Content */}
      <section className="py-20 px-6 bg-gradient-to-b from-healthcare-gray to-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-brand-lightBlue font-semibold text-sm uppercase tracking-wider bg-brand-accent/30 px-4 py-1 rounded-full">What We Offer</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-4 mb-4">Our Medical Services</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-brand-lightBlue to-brand-blue mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer a comprehensive range of medical services with state-of-the-art technology and experienced specialists dedicated to providing exceptional care.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
            {servicesData.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                description={service.description}
                imageUrl={service.imageUrl}
                featured={service.featured}
              />
            ))}
          </div>
          
          <div className="bg-gradient-to-r bg-[hsl(var(--border))] to-brand-accent/20 p-8 md:p-12 rounded-2xl shadow-lg text-center transform hover:scale-[1.01] transition-transform duration-300 border border-brand-accent/40">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex justify-center items-center w-16 h-16 bg-brand-blue/10 rounded-full mb-6 shadow-md">
                <Heart size={28} className="text-brand-blue" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-brand-blue">Need our medical services?</h3>
              <p className="text-gray-600 mb-8 text-lg">
                Join thousands of satisfied patients and experience our professional healthcare services tailored to your needs.
              </p>
              <Button
                size="lg"
                className="bg-brand-blue text-white py-6 px-10 text-lg transition-colors duration-300 group shadow-lg"
                asChild
              >
                <a href="/applyAsDoctor" className="flex items-center">
                  Apply For Services
                  <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
              </Button>



             
             
              
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Services2;