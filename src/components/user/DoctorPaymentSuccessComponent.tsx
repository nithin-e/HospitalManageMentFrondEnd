import React, { useState, useEffect, useRef } from 'react';
import { Check, Calendar, UserRound, ArrowRight, Activity, Heart, Stethoscope, Clipboard, Phone, Clock, PlusCircle, AlertCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '@/store/redux/slices/authSlice';

const DoctorPaymentSuccessComponent = () => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [pulse, setPulse] = useState(false);
  const cardRef = useRef(null);
  const Navigate=useNavigate()

    const dispatch = useDispatch();

  
  useEffect(() => {
    // Add floating medical symbols effect with enhanced visibility
    const addMedicalSymbols = () => {
      const symbolsContainer = document.getElementById('medical-symbols-container');
      const symbols = ['⚕️', '+', '🩺', '💊', '🏥', '🫀', '🧠', '🦴', '💉', '🧬', '⚕️'];
      const count = 24;
      
      for (let i = 0; i < count; i++) {
        const symbol = document.createElement('div');
        symbol.className = 'medical-symbol';
        symbol.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        
        // Random positions and animations
        const size = Math.random() * 22 + 14;
        const isPlus = symbol.innerText === '+';
        
        symbol.style.position = 'absolute';
        symbol.style.fontSize = `${isPlus ? size * 2 : size}px`;
        symbol.style.color = isPlus ? 'rgba(59, 130, 246, 0.3)' : 'rgba(46, 204, 113, 0.3)';
        symbol.style.left = `${Math.random() * 90 + 5}%`;
        symbol.style.top = `${Math.random() * 70 + 15}%`;
        symbol.style.opacity = '0';
        symbol.style.transform = 'translateY(20px) rotate(0deg)';
        symbol.style.transition = 'all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        symbol.style.animation = `float ${Math.random() * 8 + 12}s ease-in-out infinite`;
        symbol.style.animationDelay = `${Math.random() * 5}s`;
        symbol.style.zIndex = '0';
        
        symbolsContainer.appendChild(symbol);
        
        setTimeout(() => {
          symbol.style.opacity = '1';
          symbol.style.transform = 'translateY(0) rotate(${Math.random() * 20 - 10}deg)';
        }, Math.random() * 1200 + 500);
      }
    };
    
    // Start pulsing animation
    const pulseInterval = setInterval(() => {
      setPulse(prev => !prev);
    }, 2000);
    
    // Card entrance animation
    setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.style.opacity = '1';
        cardRef.current.style.transform = 'translateY(0)';
      }
      setTimeout(() => setAnimationComplete(true), 1000);
    }, 300);
    
    addMedicalSymbols();
    
    // Auto-hide confetti after 7 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 7000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(pulseInterval);
    };
  }, []);


  const extractEmailFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    return email;
  };


  const email = extractEmailFromUrl();
console.log("Extracted email:", email);



  const navigateToDashboard = () => {
    console.log("Navigating to doctor dashboard");
  
       localStorage.removeItem('AccessToken');
       localStorage.removeItem('RefreshToken');
 

       


       dispatch(logoutUser())
       console.log('User logged out successfully');

           Navigate('/DoctorDashboard', { state: { email: email } });

 
    // Navigate('/login')
   
    if (cardRef.current) {
      cardRef.current.classList.add('scale-95');
      setTimeout(() => {
        cardRef.current.classList.remove('scale-95');
      }, 150);
    }
  };

  return (
<div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 mt-12">
{/* Add CSS animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes heartbeat {
          0% { transform: scale(1); }
          15% { transform: scale(1.2); }
          30% { transform: scale(1); }
          45% { transform: scale(1.15); }
          60% { transform: scale(1); }
        }
        
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
          100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
        }
        
        @keyframes confetti {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        
        @keyframes breathe {
          0% { opacity: 0.3; }
          50% { opacity: 0.7; }
          100% { opacity: 0.3; }
        }
        
        @keyframes fadeShift {
          0% { transform: translateX(0); opacity: 0.7; }
          50% { transform: translateX(100%); opacity: 0; }
          51% { transform: translateX(-100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 0.7; }
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: 1000;
          }
        }
        
        .animate-confetti {
          animation: confetti 4s cubic-bezier(0.36, 0.11, 0.89, 0.32) forwards;
        }
        
        .animate-card-item {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .item-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .animate-breathe {
          animation: breathe 4s ease-in-out infinite;
        }
        
        .animate-dash {
          stroke-dasharray: 50;
          animation: dash 20s linear infinite;
        }
        
        .svg-hospital {
          filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1));
        }
      `}} />
      
      {/* Hospital-themed background */}
      <div className="fixed inset-0 z-0">
        {/* Background grid pattern for hospital feel */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 20px, #3b82f6 20px, #3b82f6 21px), 
                            repeating-linear-gradient(90deg, transparent, transparent 20px, #3b82f6 20px, #3b82f6 21px)`,
        }}></div>
        
        {/* Abstract hospital building in the background */}
        <div className="absolute bottom-0 left-0 right-0 h-64 opacity-5 pointer-events-none">
          <svg className="w-full h-full svg-hospital" viewBox="0 0 1200 300" preserveAspectRatio="none">
            <rect x="350" y="50" width="500" height="250" fill="#3b82f6" />
            <rect x="400" y="100" width="80" height="120" fill="white" />
            <rect x="520" y="100" width="80" height="120" fill="white" />
            <rect x="640" y="100" width="80" height="120" fill="white" />
            <rect x="720" y="100" width="80" height="120" fill="white" />
            <rect x="600" y="250" width="100" height="50" fill="white" />
            <path d="M580 50 L600 20 L620 50 Z" fill="#3b82f6" />
            <rect x="590" y="20" width="20" height="15" fill="#3b82f6" />
            <rect x="595" y="5" width="10" height="15" fill="#3b82f6" />
          </svg>
        </div>
      </div>
      
      {/* Medical symbols container */}
      <div id="medical-symbols-container" className="fixed inset-0 pointer-events-none overflow-hidden"></div>
      
      {/* Moving EKG line at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 1200 50" preserveAspectRatio="none" className="w-full h-full">
          <path 
            d="M0,25 L30,25 L60,25 L90,25 L120,25 L150,15 L180,35 L210,5 L240,45 L270,25 L300,25 L330,25 L360,25 L390,25 L420,25 L450,25 L480,15 L510,35 L540,5 L570,45 L600,25 L630,25 L660,25 L690,25 L720,25 L750,25 L780,25 L810,15 L840,35 L870,5 L900,45 L930,25 L960,25 L990,25 L1020,25 L1050,25 L1080,25 L1110,25 L1140,15 L1170,35 L1200,25" 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="2"
            className="animate-dash"
          />
        </svg>
      </div>
      
      {/* Enhanced confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {[...Array(60)].map((_, i) => (
            <div 
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-5%`,
                backgroundColor: ['#0ea5e9', '#8b5cf6', '#10b981', '#f97316', '#ef4444', '#06b6d4', '#14b8a6', '#3b82f6'][Math.floor(Math.random() * 8)],
                width: `${Math.random() * 14 + 5}px`,
                height: `${Math.random() * 14 + 5}px`,
                borderRadius: Math.random() > 0.3 ? '50%' : '0',
                animationDuration: `${Math.random() * 4 + 2}s`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Success Card with enhanced entrance animation */}
      <div 
        ref={cardRef}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl z-20 relative overflow-hidden border border-blue-100 transition-all duration-700 ease-out"
        style={{ 
          opacity: 0, 
          transform: 'translateY(40px)',
          boxShadow: '0 10px 50px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(59, 130, 246, 0.08)'
        }}
      >
        {/* Animated top decoration */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-600 via-blue-400 to-teal-400">
          <div className="absolute inset-0 w-1/2 h-full bg-white opacity-30" style={{
            animation: 'fadeShift 4s linear infinite'
          }}></div>
        </div>
        
        {/* Medical cross watermark */}
        <div className="absolute opacity-5 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl font-bold text-blue-500 pointer-events-none animate-breathe">
          +
        </div>
        
        {/* Success icon with heartbeat animation */}
        <div className={`flex justify-center mb-6 ${animationComplete ? 'item-visible' : 'animate-card-item'}`} style={{ transitionDelay: '0.1s' }}>
          <div className="rounded-full bg-blue-100 p-3 relative">
            <div 
              className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-4"
              style={{ animation: 'heartbeat 2s infinite' }}
            >
              <div className="relative">
                <Check size={32} className="text-white" />
                {pulse && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-white opacity-70"></span>
                )}
              </div>
            </div>
            <div className="absolute inset-0 rounded-full animate-ping bg-blue-500 opacity-20"></div>
          </div>
        </div>
        
        {/* Hospital Logo */}
        <div className={`flex justify-center mb-2 ${animationComplete ? 'item-visible' : 'animate-card-item'}`} style={{ transitionDelay: '0.15s' }}>
          <div className="flex items-center">
            <div className="text-blue-600 mr-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-lg text-blue-700">MediCare Hospital</span>
          </div>
        </div>
        
        {/* Success message */}
        <div className={`text-center ${animationComplete ? 'item-visible' : 'animate-card-item'}`} style={{ transitionDelay: '0.2s' }}>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <div className="flex items-center justify-center mb-1">
            <Heart className="text-red-500 mr-2" size={18} fill="red" />
            <p className="text-blue-600 font-medium">Welcome to Our Healthcare Team</p>
          </div>
          <p className="text-gray-600 mb-4">
            Your medical practice is now fully activated and ready to serve patients.
          </p>
        </div>

        {/* Animated progress timeline */}
        <div className={`flex justify-between items-center mb-5 px-2 ${animationComplete ? 'item-visible' : 'animate-card-item'}`} style={{ transitionDelay: '0.25s' }}>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mb-1">
              <FileText size={16} className="text-white" />
            </div>
            <span className="text-xs text-green-700 font-medium">Registration</span>
          </div>
          <div className="flex-1 h-1 bg-green-200 mx-1"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mb-1">
              <AlertCircle size={16} className="text-white" />
            </div>
            <span className="text-xs text-green-700 font-medium">Verification</span>
          </div>
          <div className="flex-1 h-1 bg-green-200 mx-1"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mb-1">
              <Check size={16} className="text-white" />
            </div>
            <span className="text-xs text-green-700 font-medium">Payment</span>
          </div>
          <div className="flex-1 h-1 bg-blue-200 mx-1"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-dashed border-blue-400 flex items-center justify-center mb-1 animate-pulse">
              <Stethoscope size={16} className="text-blue-500" />
            </div>
            <span className="text-xs text-blue-500 font-medium">Start Practice</span>
          </div>
        </div>
        
        {/* Payment details with hospital themed design */}
        <div className={`rounded-lg mb-6 overflow-hidden ${animationComplete ? 'item-visible' : 'animate-card-item'}`} style={{ transitionDelay: '0.3s' }}>
          <div className="bg-blue-600 text-white p-3 flex items-center">
            <svg className="mr-2" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M2 10H22" stroke="white" strokeWidth="2"/>
              <path d="M7 16H13" stroke="white" strokeWidth="2"/>
            </svg>
            <span className="font-semibold">Payment Information</span>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 border border-blue-200">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-blue-200">
              <span className="text-gray-600 flex items-center">
                <span className="w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
                Transaction ID
              </span>
              <span className="font-semibold text-blue-800 font-mono">TXN-2025042912</span>
            </div>
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-blue-200">
              <span className="text-gray-600 flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-400 mr-2"></span>
                Amount paid
              </span>
              <span className="font-semibold text-blue-800">10000.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center">
                <span className="w-3 h-3 rounded-full bg-purple-400 mr-2"></span>
                Date
              </span>
              <div className="flex items-center">
                <Clock size={14} className="text-blue-600 mr-1" />
                <span className="font-semibold text-blue-800">April 29, 2025</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Next steps with hospital-themed design */}
        <div 
          className={`mb-6 relative overflow-hidden border border-blue-200 rounded-lg ${animationComplete ? 'item-visible' : 'animate-card-item'}`}
          style={{ transitionDelay: '0.4s' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 flex items-center">
            <PlusCircle size={18} className="mr-2" />
            <span className="font-semibold">What's Next?</span>
          </div>
          
          <div className="p-4 bg-blue-50">
            {/* Hospital-themed message */}
            <div className="flex">
              <div className="mr-3 mt-1">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-300">
                  <Stethoscope size={16} className="text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-blue-800 mb-2">
                  <span className="font-semibold">Dr,</span> your medical credentials have been verified and your practice is ready to begin!
                </p>
                <p className="text-blue-700 text-sm">
                  Access your doctor dashboard to start treating patients. Your schedule has been synchronized with the hospital system, and patient records are now available for your review.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hospital features with medical-themed icons */}
        <div className={`grid grid-cols-2 gap-3 mb-6 ${animationComplete ? 'item-visible' : 'animate-card-item'}`} style={{ transitionDelay: '0.5s' }}>
          <div className="relative overflow-hidden bg-white border border-blue-200 rounded-lg transition-all duration-300 group cursor-pointer hover:shadow-md">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="p-3 flex items-center">
              <div className="bg-blue-100 rounded-full p-2 mr-3 group-hover:bg-blue-200 transition-colors duration-300">
                <UserRound size={18} className="text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Patient Management</span>
            </div>
          </div>
          <div className="relative overflow-hidden bg-white border border-blue-200 rounded-lg transition-all duration-300 group cursor-pointer hover:shadow-md">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <div className="p-3 flex items-center">
              <div className="bg-green-100 rounded-full p-2 mr-3 group-hover:bg-green-200 transition-colors duration-300">
                <Calendar size={18} className="text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Appointment Scheduling</span>
            </div>
          </div>
          <div className="relative overflow-hidden bg-white border border-blue-200 rounded-lg transition-all duration-300 group cursor-pointer hover:shadow-md">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
            <div className="p-3 flex items-center">
              <div className="bg-purple-100 rounded-full p-2 mr-3 group-hover:bg-purple-200 transition-colors duration-300">
                <Clipboard size={18} className="text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Medical Records</span>
            </div>
          </div>
          <div className="relative overflow-hidden bg-white border border-blue-200 rounded-lg transition-all duration-300 group cursor-pointer hover:shadow-md">
            <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
            <div className="p-3 flex items-center">
              <div className="bg-teal-100 rounded-full p-2 mr-3 group-hover:bg-teal-200 transition-colors duration-300">
                <Phone size={18} className="text-teal-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700">24/7 Support</span>
            </div>
          </div>
        </div>
        
        {/* Dashboard button with hospital-themed design */}
        <div className={`${animationComplete ? 'item-visible' : 'animate-card-item'}`} style={{ transitionDelay: '0.6s' }}>
          <button 
            onClick={navigateToDashboard}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-200 active:scale-95 flex items-center justify-center relative overflow-hidden group"
          >
            {/* Button EKG line animation */}
            <div className="absolute inset-0 w-full h-full opacity-10 overflow-hidden">
              <svg viewBox="0 0 120 20" preserveAspectRatio="none" className="w-full h-full">
                <path 
                  d="M0,10 L10,10 L15,10 L20,10 L25,5 L30,15 L35,2 L40,18 L45,10 L50,10 L55,10 L60,10 L65,10 L70,10 L75,10 L80,5 L85,15 L90,2 L95,18 L100,10 L105,10 L110,10 L115,10 L120,10" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="1"
                  className="animate-dash"
                />
              </svg>
            </div>
            
            {/* Subtle pulse animation on button */}
            <div className="absolute inset-0 rounded-lg animate-ping bg-white opacity-0 group-hover:opacity-5"></div>
            
            <Stethoscope size={18} className="mr-2" />
            <span>Go To Login Page Login As a Doctor </span>
            <ArrowRight size={18} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
        
        {/* Hospital certification badge */}
        <div className={`flex justify-center mt-6 ${animationComplete ? 'item-visible' : 'animate-card-item'}`} style={{ transitionDelay: '0.7s' }}>
          <div className="bg-blue-50 px-4 py-2 rounded-full border border-blue-200 flex items-center shadow-sm">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-xs text-blue-700">
              <span className="font-semibold">Certified Healthcare Provider</span> • Secure Payment • <span className="text-green-600 font-semibold">Verified ✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPaymentSuccessComponent;