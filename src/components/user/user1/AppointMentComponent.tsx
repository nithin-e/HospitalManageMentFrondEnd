
import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, Check, Heart, Activity, Shield, Stethoscope } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { UserfetchingDoctors } from '@/store/userSideApi/UserfetchingDoctors';
import { fectingAppointMentSlotes } from '@/store/DoctorSideApi/fectingAppointMentSlotes';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/redux/store';
import { makingAppointMent } from '@/store/DoctorSideApi/makingAppointMent';
import { UserFectingAppointMentSlote } from '@/store/userSideApi/UserFectingAppointMentSlote';

// Background Symbol component with enhanced animations
const FloatingSymbol = ({ symbol, delay }) => {
  const isPlus = symbol === '+';
  const size = Math.random() * 20 + 10;
  const left = `${Math.random() * 90 + 5}%`;
  const top = `${Math.random() * 70 + 15}%`;
  const duration = `${Math.random() * 5 + 10}s`;
  const rotate = Math.random() * 360;
  
  return (
    <div 
      className="medical-symbol absolute"
      style={{
        fontSize: `${isPlus ? size * 2 : size}px`,
        color: isPlus ? 'rgba(52, 152, 219, 0.15)' : 'rgba(46, 204, 113, 0.15)',
        left: left,
        top: top,
        transform: `rotate(${rotate}deg)`,
        animationDuration: duration,
        animationDelay: `${delay}s`,
        zIndex: 0,
      }}
    >
      {symbol}
    </div>
  );
};

// Pulsing Circle Animation
const PulsingCircle = ({ size, color, delay, top, left }) => (
  <div 
    className="absolute rounded-full pulse-animation"
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      top: top,
      left: left,
      opacity: 0.1,
      animationDelay: `${delay}s`,
      zIndex: 0,
    }}
  ></div>
);

// Healthcare info card component
const HealthcareInfoCard = ({ icon, title, description }) => {
  const Icon = icon;
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300 flex group">
      <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition-colors duration-300">
        <Icon size={20} className="text-blue-600" />
      </div>
      <div>
        <h3 className="font-medium text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};



export default function AppointmentBooking() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    notes: '',
    doctor: '',
    specialty: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [symbols, setSymbols] = useState([]);
  const [circles, setCircles] = useState([]);
  const [doctorsBySpecialty, setDoctorsBySpecialty] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);

  const specialties = [
    { name: 'Cardiology', icon: '❤️', description: 'Heart and cardiovascular system specialists' },
    { name: 'Neurology', icon: '🧠', description: 'Brain and nervous system specialists' },
    { name: 'Psychiatry', icon: '🧘', description: 'Mental health specialists' },
    { name: 'Dermatology', icon: '🧬', description: 'Skin, hair and nail specialists' },
    { name: 'Pediatrics', icon: '👶', description: 'Children\'s healthcare specialists' },
    { name: 'Orthopedics', icon: '🦴', description: 'Bone and joint specialists' }
  ];
  
  // Background design effect
  useEffect(() => {
    // Create floating medical symbols
    const symbolChars = ['⚕️', '+', '🩺', '💊', '🏥', '🫀', '🫁', '🧠', '👨‍⚕️', '👩‍⚕️'];
    const count = 15;
    const newSymbols = [];
    
    for (let i = 0; i < count; i++) {
      const symbol = symbolChars[Math.floor(Math.random() * symbolChars.length)];
      const delay = Math.random() * 5;
      newSymbols.push({ id: `sym-${i}`, symbol, delay });
    }
    
    // Create pulsing circles
    const newCircles = [];
    for (let i = 0; i < 5; i++) {
      newCircles.push({
        id: `circle-${i}`,
        size: `${Math.random() * 300 + 100}px`,
        color: i % 2 === 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
        delay: Math.random() * 4,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      });
    }
    
    setSymbols(newSymbols);
    setCircles(newCircles);
  }, []);

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const response = await UserfetchingDoctors();
      console.log('doctor listing table', response);
  
      // Group doctors by specialty
      const groupedDoctors = {};
      
      // Process the API response data
      if (response && response.doctors) {
        response.doctors.forEach(doctor => {
          if(doctor.status === 'completed') {
            console.log('....doctor......', doctor.status);
            
            const email = doctor.email;
            const specialty = doctor.specialty;
            const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
            
            if (!groupedDoctors[specialty]) {
              groupedDoctors[specialty] = [];
            }
            
            // Store both name and email for each doctor
            groupedDoctors[specialty].push({
              name: doctorName,
              email: email
            });
          }
        });
      } else {
        // Fallback data if API fails or returns unexpected format
        specialties.forEach(spec => {
          groupedDoctors[spec.name] = [
            { name: `Dr. ${spec.name.substring(0, 3)} Smith`, email: `smith@example.com` }, 
            { name: `Dr. ${spec.name.substring(0, 3)} Johnson`, email: `johnson@example.com` }
          ];
        });
      }
      
      console.log('Doctors grouped by specialty:', groupedDoctors);
      setDoctorsBySpecialty(groupedDoctors);
      setLoading(false);
      
    } catch (error) {
      console.error("Error fetching doctors:", error);
      // Fallback data if API fails
      const fallbackDoctors = {};
      specialties.forEach(spec => {
        fallbackDoctors[spec.name] = [
          { name: `Dr. ${spec.name.substring(0, 3)} Smith`, email: `smith@example.com` }, 
          { name: `Dr. ${spec.name.substring(0, 3)} Johnson`, email: `johnson@example.com` }
        ];
      });
      setDoctorsBySpecialty(fallbackDoctors);
      setLoading(false);
    }
  };

  
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // When date changes, reset time selection
    if (name === 'date') {
      setFormData(prev => ({ ...prev, [name]: value, time: '' }));
    }
  };



  const user = useSelector((state: RootState) => state.user)
  const userData = user?.checkUserEmailAndPhone?.user || user?.user?.user || user?.user || null;
  const userEmail = userData?.email || '';

  const handleSubmit = async(e) => {
    if (e) e.preventDefault();
    
   
    const appointmentData = {
      ...formData,
      userEmail: userEmail 
    };
    
    console.log('Appointment booked:', appointmentData);
    
    
   const res= await makingAppointMent(appointmentData);

   console.log('check responce bro',res);
   if(res.result.success){
    setSubmitted(true);
   }
   
    
    // setSubmitted(true);
  };
  
  const selectSpecialty = (specialty) => {
    if (doctorsBySpecialty[specialty] && doctorsBySpecialty[specialty].length > 0) {
      setFormData({
        ...formData,
        specialty: specialty,
        doctor: doctorsBySpecialty[specialty][0].name,
        email: doctorsBySpecialty[specialty][0].email
      });
    } else {
      setFormData({
        ...formData,
        specialty: specialty,
        doctor: '',
        email: ''
      });
    }
  };
  

  async function nextStep(email) {
    console.log('Processing with email:', email);
    
    if (step === 1) {
      try {
        setLoading(true);
        const response = await UserFectingAppointMentSlote(email);
        console.log('API response:', response);
        
        if (response && response.result && response.result.time_slots) {
          setTimeSlots(response.result.time_slots);
          
          // Also set available dates for reference
          if (response.result.dates && response.result.dates.length > 0) {
            setAvailableDates(response.result.dates);
          }
          
          console.log('Time slots set:', response.result.time_slots);
        } else {
          console.log('No time slots available');
          setTimeSlots([]);
        }
        
        setLoading(false);
        setStep(step + 1);
      } catch (error) {
        console.error('Error fetching time slots:', error);
        setTimeSlots([]);
        setLoading(false);
        setStep(step + 1);
      }
    } else {
      setStep(step + 1);
    }
  }
  

  const prevStep = () => setStep(step - 1);
  
  const isDateSelected = Boolean(formData.date);
  const isTimeSelected = Boolean(formData.time);
  const isPersonalInfoComplete = Boolean(formData.name && formData.email && formData.phone);
  
  // Get slots for the selected date
  const getSlotsForSelectedDate = () => {
    if (!formData.date) return [];
    
    const dateSlots = timeSlots.find(slot => slot.date === formData.date);
    return dateSlots ? dateSlots.slots : [];
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-50 relative">
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
        
        <Navbar />
        
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-50 relative">
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
      
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 w-full">
       
      </div>
      
      <Navbar />

      <div className="flex-grow container mx-auto px-4 py-8 mt-[60px] relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">Schedule Your Appointment</h1>
            <p className="text-gray-600 text-lg">Book your visit with our specialists in just a few simple steps</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left side - Appointment Form */}
            <div className="w-full md:w-2/3">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-blue-100 transition-all duration-300 hover:shadow-blue-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Calendar size={24} className="mr-3 text-blue-600" />
                  Book an Appointment
                </h2>
                
                {/* Progress Steps */}
                <div className="flex mb-10 justify-between relative">
                  <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-10"></div>
                  <div className={`flex-1 relative text-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-12 h-12 mx-auto flex items-center justify-center rounded-full transition-all
                      ${step >= 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-200 text-gray-500'}`}>
                      1
                    </div>
                    <div className="text-xs mt-2 font-medium">Select Specialist</div>
                    {step > 1 && <div className="absolute top-5 left-1/2 w-full h-1 bg-blue-600 -z-10"></div>}
                  </div>
                  <div className={`flex-1 relative text-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-12 h-12 mx-auto flex items-center justify-center rounded-full transition-all
                      ${step >= 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-200 text-gray-500'}`}>
                      2
                    </div>
                    <div className="text-xs mt-2 font-medium">Date & Time</div>
                    {step > 2 && <div className="absolute top-5 left-1/2 w-full h-1 bg-blue-600 -z-10"></div>}
                  </div>
                  <div className={`flex-1 text-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-12 h-12 mx-auto flex items-center justify-center rounded-full transition-all
                      ${step >= 3 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-200 text-gray-500'}`}>
                      3
                    </div>
                    <div className="text-xs mt-2 font-medium">Your Details</div>
                  </div>
                </div>
                
                <div>
                  {/* Step 1: Select Specialty */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-gray-700 mb-5 font-medium text-lg flex items-center">
                          <Stethoscope size={20} className="mr-2 text-blue-600" />
                          Select Medical Specialty
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                          {specialties.map((specialty) => (
                            <div 
                              key={specialty.name}
                              onClick={() => selectSpecialty(specialty.name)}
                              className={`p-5 border rounded-xl cursor-pointer transition-all hover:shadow-md text-center transform hover:scale-105 duration-200
                                ${formData.specialty === specialty.name 
                                  ? 'border-blue-500 bg-gradient-to-b from-blue-50 to-blue-100 shadow-md' 
                                  : 'border-gray-200 hover:border-blue-200'}`}
                              >
                                <div className="text-3xl mb-3">{specialty.icon}</div>
                                <div className="font-medium text-gray-800">{specialty.name}</div>
                                <div className="text-xs text-gray-500 mt-1">{specialty.description}</div>
                              </div>
                            ))}
                          </div>
                          
                        {formData.specialty && doctorsBySpecialty[formData.specialty] && (
                          <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <label className="text-sm text-gray-700 mb-2 flex items-center">
                              <User size={16} className="mr-1 text-blue-600" />
                              Select Doctor
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {doctorsBySpecialty[formData.specialty].map(doctor => (
                                <div
                                  key={doctor.email}
                                  onClick={() => setFormData({
                                    ...formData, 
                                    doctor: doctor.name,
                                    email: doctor.email // Store the doctor's email in the form data
                                  })}
                                  className={`p-2 border rounded-lg flex items-center cursor-pointer hover:bg-white
                                    ${formData.doctor === doctor.name 
                                      ? 'border-blue-500 bg-white shadow-sm' 
                                      : 'border-gray-200'}`}
                                >
                                  <User size={16} className="text-blue-600 mr-2" />
                                  <div>
                                    <div className="text-sm font-medium">{doctor.name}</div>
                                    <div className="text-xs text-gray-500">{formData.specialty}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        </div>
                        
                        <div className="pt-6 flex justify-end">
                          <button
                            type="button"
                            onClick={() => nextStep(formData.email)}
                            disabled={!formData.specialty || !formData.doctor}
                            className={`flex items-center px-6 py-3 rounded-xl transition-all font-medium shadow-md
                              ${formData.specialty && formData.doctor
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                          >
                            Continue
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Step 2: Select Date and Time */}
                
{step === 2 && (
  <div className="space-y-6">
    <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
      <label className="block text-gray-700 mb-3 font-medium flex items-center">
        <Calendar size={18} className="mr-2 text-blue-600" />
        Select Date
      </label>
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        min={new Date().toISOString().split('T')[0]} // Only allow future dates
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />
    </div>
    
    {isDateSelected && (
      <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
        <label className="block text-gray-700 mb-3 font-medium flex items-center">
          <Clock size={18} className="mr-2 text-blue-600" />
          Available Time Slots
        </label>
        {(() => {
          // Find the slots for the selected date
          const dateSlots = timeSlots.find(slot => slot.date === formData.date);
          
          if (dateSlots && dateSlots.slots && dateSlots.slots.length > 0) {
            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {dateSlots.slots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => !slot.is_booked && setFormData({...formData, time: slot.time})}
                    className={`p-3 text-center border rounded-lg cursor-pointer transition-all transform hover:scale-105 duration-200
                      ${formData.time === slot.time 
                        ? 'border-blue-500 bg-blue-50 shadow-md text-blue-600 font-medium' 
                        : slot.is_booked 
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'}`}
                    title={slot.is_booked ? 'This slot is already booked' : ''}
                  >
                    {slot.time}
                    {slot.is_booked && <span className="block text-xs text-red-500">Booked</span>}
                  </div>
                ))}
              </div>
            );
          } else {
            return (
              <div className="text-center py-4 text-gray-500">
                No available time slots for this date. Please select another date.
              </div>
            );
          }
        })()}
      </div>
    )}
    
    <div className="pt-6 flex justify-between">
      <button
        type="button"
        onClick={prevStep}
        className="flex items-center border border-gray-300 px-5 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Back
      </button>
      <button
        type="button"
        onClick={() => nextStep(formData.email)}
        disabled={!isDateSelected || !formData.time}
        className={`flex items-center px-6 py-3 rounded-xl transition-all font-medium shadow-md
          ${isDateSelected && formData.time 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
      >
        Continue
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
)}

                    
                    {/* Step 3: Personal Details */}
                    {step === 3 && (
                      <div className="space-y-5">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 mb-6">
                          <p className="text-sm text-blue-700 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Please provide your personal details to complete your appointment booking.
                          </p>
                        </div>
                        
                        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                          <label className="block text-gray-700 mb-2 font-medium flex items-center">
                            <User size={18} className="mr-2 text-blue-600" />
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                        </div>
                        
                        {/* <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                          <label className="block text-gray-700 mb-2 font-medium flex items-center">
                            <Mail size={18} className="mr-2 text-blue-600" />
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                        </div> */}
                        
                        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                          <label className="block text-gray-700 mb-2 font-medium flex items-center">
                            <Phone size={18} className="mr-2 text-blue-600" />
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(123) 456-7890"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                        </div>
                        
                        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                          <label className="block text-gray-700 mb-2 font-medium flex items-center">
                            <MessageSquare size={18} className="mr-2 text-blue-600" />
                            Additional Notes (Optional)
                          </label>
                          <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Any special requests or information the doctor should know..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 transition-all"
                          ></textarea>
                        </div>
                        
                        <div className="pt-6 flex justify-between">
                          <button
                            type="button"
                            onClick={prevStep}
                            className="flex items-center border border-gray-300 px-5 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!isPersonalInfoComplete}
                            className={`flex items-center px-6 py-3 rounded-xl transition-all font-medium shadow-md
                              ${isPersonalInfoComplete 
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-lg' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                          >
                            <Check size={18} className="mr-2" />
                            Complete Booking
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
            </div>
            
            {/* Right side - Appointment Summary & Health tips */}
            <div className="w-full md:w-1/3">
              {/* Appointment Summary */}
              {step > 1 && (
                <div className="bg-white p-6 rounded-xl shadow-xl border border-blue-100 mb-6 transform transition-all hover:shadow-blue-100 duration-300">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Calendar size={18} className="mr-2 text-blue-600" />
                    Appointment Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start pb-3 border-b border-gray-100">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <Stethoscope size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Specialty</p>
                        <p className="font-medium text-gray-800">{formData.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-start pb-3 border-b border-gray-100">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Doctor</p>
                        <p className="font-medium text-gray-800">{formData.doctor}</p>
                      </div>
                    </div>
                    {formData.date && (
                      <div className="flex items-start pb-3 border-b border-gray-100">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <Calendar size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium text-gray-800">{formData.date}</p>
                        </div>
                      </div>
                    )}
                    {formData.time && (
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <Clock size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="font-medium text-gray-800">{formData.time}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Hospital Information */}
              <div className="bg-white p-6 rounded-xl shadow-xl border border-blue-100 mb-6 transform transition-all hover:shadow-blue-100 duration-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Hospital Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center pb-3 border-b border-gray-100">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-800">123 Medical Center Blvd</p>
                    </div>
                  </div>
                  <div className="flex items-center pb-3 border-b border-gray-100">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Working Hours</p>
                      <p className="font-medium text-gray-800">Mon-Fri: 8am - 8pm</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Emergency Contact</p>
                      <p className="font-medium text-gray-800">911</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
      
      {/* CSS styles */}
      <style jsx global>{`
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .pulse-animation {
          animation: pulse 15s infinite ease-in-out;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.2;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.1;
          }
        }

        /* For the medical symbols float animation */
        .medical-symbol {
          animation-name: float;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          opacity: 0.15;
        }

        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }

        /* EKG Animation */
        .ekg-animation {
          width: 100%;
          height: 100%;
          animation: ekg-move 15s linear infinite;
        }

        @keyframes ekg-move {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
