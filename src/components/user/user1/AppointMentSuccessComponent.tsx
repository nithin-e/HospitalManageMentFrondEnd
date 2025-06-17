import { useState } from 'react';
import { Check, Calendar } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

// Floating Symbol Component
const FloatingSymbol = ({ symbol, delay }) => {
  return (
    <div 
      className="absolute animate-bounce opacity-20 text-blue-300 text-2xl pointer-events-none"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${delay}s`,
        animationDuration: '3s'
      }}
    >
      {symbol}
    </div>
  );
};

// Pulsing Circle Component
const PulsingCircle = ({ size, left, top, delay, color }) => {
  return (
    <div 
      className={`absolute rounded-full opacity-10 animate-ping pointer-events-none ${color}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        top: `${top}%`,
        animationDelay: `${delay}s`,
        animationDuration: '4s'
      }}
    />
  );
};

const AppointMentSuccessComponent = () => {
  const [submitted, setSubmitted] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    date: 'March 15, 2024',
    time: '2:30 PM',
    notes: 'Follow-up consultation',
    doctor: 'Dr. Sarah Johnson',
    specialty: 'Cardiology'
  });

  // Background elements
  const symbols = [
    { id: 1, symbol: '🏥', delay: 0 },
    { id: 2, symbol: '⚕️', delay: 1 },
    { id: 3, symbol: '💊', delay: 2 },
    { id: 4, symbol: '🩺', delay: 0.5 },
    { id: 5, symbol: '❤️', delay: 1.5 },
    { id: 6, symbol: '🏥', delay: 2.5 },
  ];

  const circles = [
    { id: 1, size: 100, left: 10, top: 20, delay: 0, color: 'bg-blue-300' },
    { id: 2, size: 150, left: 80, top: 60, delay: 1, color: 'bg-green-300' },
    { id: 3, size: 80, left: 60, top: 10, delay: 2, color: 'bg-blue-400' },
    { id: 4, size: 120, left: 20, top: 70, delay: 1.5, color: 'bg-green-400' },
  ];

  if (submitted) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-50 relative">

        <Navbar/>
        {/* Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {symbols.map((sym) => (
            <FloatingSymbol key={sym.id} symbol={sym.symbol} delay={sym.delay} />
          ))}
          {circles.map((circle) => (
            <PulsingCircle key={circle.id} {...circle} />
          ))}
        </div>
        
        {/* Background pattern and decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        
        <div className="flex-grow container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-blue-100 transform transition-all duration-500 hover:shadow-blue-100">
            <div className="mb-8 mt-4 flex justify-center">
              <div className="bg-green-500 p-5 rounded-full animate-pulse shadow-lg shadow-green-200">
                <Check className="text-white" size={52} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">Appointment Confirmed!</h2>
            <p className="text-gray-600 mb-8 text-center text-lg">
              Thank you for booking with us. We've sent a confirmation to {formData.email}.
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-100 text-left mb-8 transform transition hover:scale-[1.02] duration-300">
              <div className="mb-3 pb-3 border-b border-blue-200">
                <span className="text-blue-700 font-semibold mr-2">Specialty:</span> 
                <span className="text-gray-700">{formData.specialty}</span>
              </div>
              <div className="mb-3 pb-3 border-b border-blue-200">
                <span className="text-blue-700 font-semibold mr-2">Doctor:</span> 
                <span className="text-gray-700">{formData.doctor}</span>
              </div>
              <div className="mb-3 pb-3 border-b border-blue-200">
                <span className="text-blue-700 font-semibold mr-2">Date:</span> 
                <span className="text-gray-700">{formData.date}</span>
              </div>
              <div className="mb-3 pb-3 border-b border-blue-200">
                <span className="text-blue-700 font-semibold mr-2">Time:</span>
                <span className="text-gray-700">{formData.time}</span>
              </div>
              <div>
                <span className="text-blue-700 font-semibold mr-2">Name:</span>
                <span className="text-gray-700">{formData.name}</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mb-8 p-5 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow-sm">
              <p className="font-medium text-yellow-800 mb-2">Important Information:</p>
              <p>Please arrive 15 minutes before your scheduled appointment time. Don't forget to bring your ID and insurance card.</p>
            </div>
            
            <button 
              onClick={() => {
                setSubmitted(false);
                setStep(1);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  date: '',
                  time: '',
                  notes: '',
                  doctor: '',
                  specialty: ''
                });
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium flex items-center justify-center shadow-lg shadow-blue-200 hover:shadow-blue-300"
            >
              <Calendar size={18} className="mr-2" />
              Book Another Appointment
            </button>
          </div>
        </div>
        <Footer/>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Ready to Book?</h2>
        <p className="text-gray-600 text-center mb-8">Click below to see your confirmation screen</p>
        <button 
          onClick={() => setSubmitted(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium"
        >
          Show Confirmation
        </button>
      </div>
    </div>
  );
};



export default AppointMentSuccessComponent;