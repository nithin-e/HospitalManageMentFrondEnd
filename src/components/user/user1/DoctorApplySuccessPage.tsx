import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from '@/components/user/user1/Footer';

const DoctorApplySuccessPage = () => {
  useEffect(() => {
    // Pulse animation effect for the medical icons
    const pulseMedicalIcons = () => {
      const icons = document.querySelectorAll('.medical-icon');
      icons.forEach((icon, index) => {
        setTimeout(() => {
          icon.classList.add('active');
        }, 300 * index);
      });
    };
    
    // Animate the progress steps sequentially
    const animateProgress = () => {
      const steps = document.querySelectorAll('.step-item');
      steps.forEach((step, index) => {
        setTimeout(() => {
          step.classList.add('active');
        }, 400 * index);
      });
    };
    
    // Animate counter for application ID
    const animateCounter = () => {
      const counterElement = document.getElementById('application-number');
      const targetNumber = parseInt(counterElement.getAttribute('data-value'));
      const duration = 1500;
      const frameDuration = 1000/60;
      const totalFrames = Math.round(duration / frameDuration);
      let frame = 0;
      
      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const currentCount = Math.floor(targetNumber * progress);
        
        counterElement.textContent = currentCount.toString().padStart(6, '0');
        
        if (frame === totalFrames) {
          clearInterval(counter);
        }
      }, frameDuration);
    };
    
    setTimeout(pulseMedicalIcons, 300);
    setTimeout(animateProgress, 800);
    setTimeout(animateCounter, 500);
    
    // Add floating medical symbols effect
    const addMedicalSymbols = () => {
      const symbolsContainer = document.getElementById('medical-symbols-container');
      const symbols = ['⚕️', '+', '🩺', '💊', '🏥'];
      const count = 12;
      
      for (let i = 0; i < count; i++) {
        const symbol = document.createElement('div');
        symbol.className = 'medical-symbol';
        symbol.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        
        // Random positions and animations
        const size = Math.random() * 20 + 10;
        const isPlus = symbol.innerText === '+';
        
        symbol.style.position = 'absolute';
        symbol.style.fontSize = `${isPlus ? size * 2 : size}px`;
        symbol.style.color = isPlus ? 'rgba(52, 152, 219, 0.15)' : 'rgba(46, 204, 113, 0.15)';
        symbol.style.left = `${Math.random() * 90 + 5}%`;
        symbol.style.top = `${Math.random() * 70 + 15}%`;
        symbol.style.opacity = '0';
        symbol.style.transform = 'translateY(20px)';
        symbol.style.transition = 'all 1s ease-out';
        symbol.style.animationDuration = `${Math.random() * 5 + 10}s`;
        symbol.style.animationDelay = `${Math.random() * 5}s`;
        symbol.style.zIndex = '0';
        
        symbolsContainer.appendChild(symbol);
        
        setTimeout(() => {
          symbol.style.opacity = '1';
          symbol.style.transform = 'translateY(0)';
        }, Math.random() * 1000 + 500);
      }
    };
    
    addMedicalSymbols();
    
    // Clean up function
    return () => {
      // Clean up code if needed
    };
  }, []);

  return (
    // <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white mt-8">

      <div id="medical-symbols-container" className="fixed inset-0 pointer-events-none overflow-hidden"></div>
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center px-4 py-12 relative">
        {/* Background pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        
        <div className="w-full max-w-2xl relative z-10">
          {/* Medical themed decorative elements */}
          <div className="absolute -top-16 -left-16 w-32 h-32 rounded-full border-4 border-blue-100 opacity-30 hidden md:block"></div>
          <div className="absolute -bottom-8 -right-8 w-16 h-16 rounded-full border-4 border-green-100 opacity-30 hidden md:block"></div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all animate-fadeIn border border-gray-100">
            {/* Success header with pulse effect */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-medical-pattern opacity-10"></div>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-6 px-8 relative">
                <div className="medical-heartbeat-bg absolute inset-0 opacity-10"></div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-25"></div>
                    <div className="relative bg-white/30 w-12 h-12 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h2 className="font-bold text-white text-xl">Application Successfully Submitted</h2>
                    <p className="text-blue-100 text-sm mt-1">Thank you for your interest in joining our medical team</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main content */}
            <div className="p-8">
              {/* Application ID and date section */}
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 rounded-lg mb-8 border border-gray-100">
                <div className="flex items-center mb-3 sm:mb-0">
                  <svg className="w-5 h-5 text-blue-600 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12H15M9 16H15M9 8H15M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Application ID</p>
                    <p className="font-mono font-medium text-blue-800" id="application-number" data-value="284576">000000</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Submission Date</p>
                    <p className="font-medium text-blue-800">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
              
              {/* Success message with medical style */}
              <div className="flex items-start mb-8">
                <div className="flex-shrink-0 mt-1">
                  <div className="p-2 bg-green-100 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-800">Thank you for applying!</h3>
                  <p className="text-gray-600 mt-2">
                    Your application to join our healthcare team has been successfully submitted. We appreciate your interest in becoming part of our medical professionals community.
                  </p>
                </div>
              </div>
              
              {/* Medical icons section */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                <div className="medical-icon flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg opacity-0 transform translate-y-4">
                  <svg className="w-8 h-8 text-blue-600 mb-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.8 15H7.2V16.8H9V14.4H6.6V12.6H4.8V15ZM16.8 12.6H19.2V10.2H21V7.8H19.2V5.4H16.8V7.8H14.4V10.2H16.8V12.6ZM7.2 10.2H9V7.8H11.4V6H9V3.6H7.2V6H4.8V7.8H7.2V10.2ZM15 21V19.2H12.6V16.8H10.8V19.2H8.4V21H10.8V23.4H12.6V21H15Z" fill="currentColor"/>
                  </svg>
                  <p className="text-xs text-blue-800 font-medium">Doctor Profile</p>
                </div>
                <div className="medical-icon flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg opacity-0 transform translate-y-4">
                  <svg className="w-8 h-8 text-blue-600 mb-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-xs text-blue-800 font-medium">Medical Records</p>
                </div>
                <div className="medical-icon flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg opacity-0 transform translate-y-4">
                  <svg className="w-8 h-8 text-blue-600 mb-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 10V14M12 14L10 12M12 14L14 12M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-xs text-blue-800 font-medium">Verification</p>
                </div>
                <div className="medical-icon flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg opacity-0 transform translate-y-4">
                  <svg className="w-8 h-8 text-blue-600 mb-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 17V15M12 17V13M15 17V11M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-xs text-blue-800 font-medium">Credentials</p>
                </div>
              </div>
              
              {/* Application progress with labels */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Application Progress</h4>
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">Stage 2 of 5</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div className="bg-blue-600 h-2 rounded-full animate-grow" style={{ width: '40%' }}></div>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  <div className="step-item flex flex-col items-center opacity-0 transform translate-y-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-green-500 rounded-full mb-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 text-center">Profile Submission</p>
                  </div>
                  <div className="step-item flex flex-col items-center opacity-0 transform translate-y-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-green-500 rounded-full mb-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 text-center">Document Upload</p>
                  </div>
                  <div className="step-item flex flex-col items-center opacity-0 transform translate-y-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-500 rounded-full mb-2 animate-pulse">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 text-center font-medium">Internal Review</p>
                  </div>
                  <div className="step-item flex flex-col items-center opacity-0 transform translate-y-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-300 rounded-full mb-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <p className="text-xs text-gray-400 text-center">Interview</p>
                  </div>
                  <div className="step-item flex flex-col items-center opacity-0 transform translate-y-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-300 rounded-full mb-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                    </div>
                    <p className="text-xs text-gray-400 text-center">Onboarding</p>
                  </div>
                </div>
              </div>
              
              {/* Important information box */}
              <div className="p-5 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-blue-800">What happens next?</h3>
                    <div className="mt-2 text-sm text-blue-700 space-y-1">
                      <p>• Our medical team will review your application within 5-7 business days</p>
                      <p>• You'll receive an email notification when your status changes</p>
                      <p>• If your credentials meet our requirements, we'll schedule an interview</p>
                      <p>• You can track your application status using the button below</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-800 text-white font-medium rounded-lg shadow-lg flex items-center justify-center transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  Return to Dashboard
                </a>
                <button
                  className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-700 font-medium rounded-lg flex items-center justify-center transform transition-all duration-200 hover:bg-blue-50 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                  Track Application
                </button>
              </div>
              
              {/* Contact information */}
              <div className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center">
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                A confirmation email has been sent to your registered email address
              </div>
              
              {/* Mobile app prompt */}
              <div className="mt-6 flex items-center justify-center">
                <div className="text-xs text-gray-500 mr-2">Get updates on our mobile app</div>
                <div className="flex space-x-2">
                  <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.7074 2.22138C12.4889 2.1481 12.2466 2.1481 12.0281 2.22138C9.91837 2.92402 4.07351 5.53739 4.07351 13.3815C4.07351 19.9746 9.96128 22.2186 11.8278 22.8635C12.2014 22.9833 12.5336 22.9833 12.9073 22.8635C14.7737 22.2186 20.6615 19.9746 20.6615 13.3815C20.6615 5.53739 14.8167 2.92417 12.7074 2.22138Z" stroke="#1F2937" strokeWidth="1.5"/>
                    <path d="M10.4229 12.5L13.7229 15.8" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.4229 12.5L13.7229 15.8" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13.7229 12.5L10.4229 15.8" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.0414 10.1717L16.668 8.54504C17.0557 8.15735 17.0557 7.52418 16.668 7.13649L15.0414 5.5098C14.6537 5.12211 14.0205 5.12211 13.6328 5.5098L12.0062 7.13649" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.59484 13.982L9.22807 17.6152" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9.22817 13.982L5.59494 17.6152" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.41186 20.5859C10.7983 20.5859 13.552 17.8324 13.552 14.4457C13.552 11.0593 10.7983 8.30567 7.41186 8.30567C4.02539 8.30567 1.27173 11.0593 1.27173 14.4457C1.27173 17.8324 4.02539 20.5859 7.41186 20.5859Z" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.2065 20.5859C19.9889 20.5859 21.4323 19.1425 21.4323 17.3601C21.4323 15.5777 19.9889 14.1343 18.2065 14.1343C16.4241 14.1343 14.9807 15.5777 14.9807 17.3601C14.9807 19.1425 16.4241 20.5859 18.2065 20.5859Z" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DoctorApplySuccessPage