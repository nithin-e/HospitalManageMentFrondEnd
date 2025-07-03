import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../Doctor/layout/Sidebar";
import AppointmentCard from "../../Doctor/components/AppointmentCard";
import AvailableTimeCard from "../../Doctor/components/AvailableTimeCard";
import StatsCard from "../../Doctor/components/StatusCard";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/redux/store";
import { fetchDoctorDashBoardDatas } from "@/store/redux/slices/DoctorSlice";
import { fectingAllUserAppointMents } from "@/store/DoctorSideApi/fectingFullUserAppointMents";
import { useSocket } from "@/context/socketContext";

// Default avatar as fallback
const defaultAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

interface AppointmentData {
  patientName: string;
  startTime: string;
  endTime: string;
  patientAvatar?: string;
  appointmentDate?: string;
  notes?: string;
  patientPhone?: string;
  specialty?: string;
  status?: string;
  id?: string;
}

interface AvailableTimeData {
  title: string;
  day: string;
  time: string;
}

interface StatsData {
  totalPatients: number;
  newPatientsThisWeek: number;
  totalPatientsTrend: number;
  newPatientsTrend: number;
}

// Enhanced AppointmentCard component with beeping functionality and status display
const EnhancedAppointmentCard: React.FC<{
  name: string;
  startTime: string;
  endTime: string;
  avatarUrl: string;
  isBeeping: boolean;
  status?: string;
  onStartClick: () => void;
}> = ({ name, startTime, endTime, avatarUrl, isBeeping, status, onStartClick }) => {
  // Function to determine status color and text
  const getStatusInfo = () => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { color: 'bg-green-100 text-green-800', text: 'Completed' };
      case 'confirmed':
        return { color: 'bg-blue-100 text-blue-800', text: 'Confirmed' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', text: 'Cancelled' };
      case 'no-show':
        return { color: 'bg-gray-100 text-gray-800', text: 'No Show' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'Scheduled' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex items-center justify-between p-4 relative">
      {/* Red background that pulses when beeping */}
      {isBeeping && (
        <div 
          className="absolute inset-0 bg-red-100 opacity-0 rounded-lg"
          style={{
            animation: 'pulseBackground 2s infinite',
            zIndex: 0
          }}
        />
      )}
      
      <div className="flex items-center z-10">
        <img 
          src={avatarUrl} 
          alt={name} 
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <div className="flex items-center">
            <h3 className="font-medium mr-2">{name}</h3>
            {status && (
              <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">
            {startTime} {endTime && `- ${endTime}`}
          </p>
        </div>
      </div>
      <button
        onClick={onStartClick}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 relative z-10 ${
          isBeeping
            ? 'bg-red-500 text-white shadow-lg transform scale-105'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        style={{
          animation: isBeeping ? 'beep 0.5s infinite alternate' : 'none',
        }}
        disabled={status?.toLowerCase() === 'completed' || status?.toLowerCase() === 'cancelled'}
      >
        {status?.toLowerCase() === 'completed' ? 'Completed' : 
         status?.toLowerCase() === 'cancelled' ? 'Cancelled' : 'Start'}
      </button>
      <style jsx>{`
        @keyframes beep {
          0% {
            transform: scale(1);
            background-color: #ef4444;
          }
          100% {
            transform: scale(1.05);
            background-color: #dc2626;
          }
        }
        @keyframes pulseBackground {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.1;
          }
          100% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
};

const DoctorDashBoard: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email || "";
  console.log('controller before res', email);
  const dispatch: AppDispatch = useDispatch();
  const { socket, connected } = useSocket();
  
  const doctor = useSelector((state: RootState) => state.doctor.data.doctor);
  console.log('res res res', doctor);
  
  // States for loading and error
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for other dashboard data
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [availableTimes, setAvailableTimes] = useState<AvailableTimeData[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalPatients: 0,
    newPatientsThisWeek: 0,
    newPatientsTrend: 0,
    totalPatientsTrend: 0
  });

  // New state for beeping functionality
  const [beepingAppointments, setBeepingAppointments] = useState<Set<string>>(new Set());
  const [beepingTimers, setBeepingTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // Determine greeting based on time of day
  const currentHour = new Date().getHours();
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon";
  } else if (currentHour >= 18) {
    greeting = "Good evening";
  }

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to normalize doctor name for comparison
  const normalizeDoctorName = (name: string): string => {
    return name.toLowerCase()
      .replace(/^dr\.?\s*/i, '') // Remove "Dr." or "Dr" prefix
      .trim();
  };

  // Helper function to filter today's appointments for current doctor
  const filterTodayAppointmentsForCurrentDoctor = (appointmentsList: any[]) => {
    const todayDate = getTodayDate();
    const currentDoctorName = doctor ? `${doctor.firstName} ${doctor.lastName}`.trim() : '';
    
    console.log('Today date:', todayDate);
    console.log('Current doctor name:', currentDoctorName);
    
    return appointmentsList.filter((appointment: any) => {
      const isToday = appointment.appointmentDate === todayDate;
      
      // Normalize both doctor names for comparison
      const appointmentDoctorName = normalizeDoctorName(appointment.doctorName || '');
      const currentDoctorNameNormalized = normalizeDoctorName(currentDoctorName);
      
      const isDoctorMatch = appointmentDoctorName === currentDoctorNameNormalized;
      
      return isToday && isDoctorMatch;
    });
  };

  // Function to start beeping for an appointment
  const startBeeping = (appointmentId: string) => {
    setBeepingAppointments(prev => new Set(prev).add(appointmentId));
    
    // Set timer to stop beeping after 1 minute (60000ms)
    const timer = setTimeout(() => {
      stopBeeping(appointmentId);
    }, 60000);
    
    setBeepingTimers(prev => new Map(prev).set(appointmentId, timer));
  };

  // Function to stop beeping for an appointment
  const stopBeeping = (appointmentId: string) => {
    setBeepingAppointments(prev => {
      const newSet = new Set(prev);
      newSet.delete(appointmentId);
      return newSet;
    });
    
    // Clear the timer
    const timer = beepingTimers.get(appointmentId);
    if (timer) {
      clearTimeout(timer);
      setBeepingTimers(prev => {
        const newMap = new Map(prev);
        newMap.delete(appointmentId);
        return newMap;
      });
    }
  };

  const handleStartButtonClick = (appointmentId: string) => {
    // Stop beeping when start button is clicked
    stopBeeping(appointmentId);
    
    // Update the appointment status to "completed"
    setAppointments(prevAppointments => 
      prevAppointments.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: 'completed' } 
          : appointment
      )
    );
    
    console.log(`Starting appointment: ${appointmentId}`);
    // Here you would typically also make an API call to update the status in the backend
  };

  useEffect(() => {
    if(email){
      fetchDoctorData(email);
    }else{
      fetchDoctorData(doctor?.email);
    }
  }, []);  

  useEffect(() => {
    // Only fetch appointments after doctor data is loaded
    if (doctor) {
      fetchUserFullAppointments();
    }
  }, [doctor]);

  const fetchDoctorData = async (email: string) => {
    try {
      setLoading(true);
      
      // Call API to fetch doctor data
      await dispatch(fetchDoctorDashBoardDatas(email));
      
      // Set temporary data for available times
      const tempAvailableTimes = [
        {
          title: "Regular Checkup",
          day: "Tomorrow",
          time: "9:00 AM - 10:00 AM"
        },
        {
          title: "Consultation",
          day: "Thursday", 
          time: "2:00 PM - 3:00 PM"
        }
      ];
      
      const tempStats = {
        totalPatients: 157,
        newPatientsThisWeek: 8,
        totalPatientsTrend: 12,
        newPatientsTrend: 5
      };
      
      // Update state with the fetched data
      setAvailableTimes(tempAvailableTimes);
      setStats(tempStats);
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching doctor data:", err);
      setError("Failed to load doctor data. Please try again later.");
      setLoading(false);
    }
  };

  const fetchUserFullAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fectingAllUserAppointMents();
      console.log('all Appointments', response);
      
      if (response && response.result && response.result.appointments) {
        
        const todayDoctorAppointments = filterTodayAppointmentsForCurrentDoctor(response.result.appointments);
        console.log('Today appointments for current doctor:', todayDoctorAppointments);
        
        const formattedAppointments: AppointmentData[] = todayDoctorAppointments.map((appointment: any) => ({
          id: appointment._id || `${appointment.patientName}_${appointment.appointmentTime}`,
          patientName: appointment.patientName,
          startTime: appointment.appointmentTime,
          endTime: '', 
          patientAvatar: defaultAvatar, 
          appointmentDate: appointment.appointmentDate,
          notes: appointment.notes,
          patientPhone: appointment.patientPhone,
          specialty: appointment.specialty,
          status: appointment.status || 'scheduled' 
        }));
        
        setAppointments(formattedAppointments);
      } else {
        setAppointments([]);
      }
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to fetch appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (socket && connected) {
      const handleDoctorAlert = (response: any) => {
        console.log("Doctor alert received:", response);
        
        if (response.type === "appointment_update") {
          console.log("Appointment update received:", response.data);
          
          const appointmentId = response.data._id || `${response.data.patientName}_${response.data.appointmentTime}`;
          
          // Start beeping for this appointment
          startBeeping(appointmentId);
          
          // Update the appointment status
          setAppointments(prevAppointments => {
            const existingAppointment = prevAppointments.find(a => a.id === appointmentId);
            if (existingAppointment) {
              return prevAppointments.map(appointment => 
                appointment.id === appointmentId 
                  ? { ...appointment, status: response.data.status || appointment.status }
                  : appointment
              );
            }
            
            // If it's a new appointment, add it to the list
            return [...prevAppointments, {
              id: appointmentId,
              patientName: response.data.patientName,
              startTime: response.data.appointmentTime,
              endTime: '',
              patientAvatar: defaultAvatar,
              status: response.data.status || 'scheduled'
            }];
          });
          
          console.log(`Beeping started for appointment: ${appointmentId}`);
        }
      };
  
      socket.on('doctor_alert', handleDoctorAlert);
  
      // Cleanup function to remove the listener
      return () => {
        socket.off('doctor_alert', handleDoctorAlert);
      };
    }
  }, [socket, connected]);

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      beepingTimers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 className="text-xl font-bold mb-2">Doctor Data Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to retrieve doctor information. Please try again later.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const doctorName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
  const firstName = doctor.firstName || '';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar doctorName={doctorName} />
      <div className="flex-1 overflow-y-auto">
        <main className="max-w-4xl mx-auto p-8">
          {/* Doctor Profile Summary */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center">
              <div className="mr-4">
                <img 
                  src={doctor.profileImageUrl || defaultAvatar} 
                  alt="Doctor profile" 
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {greeting}, Dr. {firstName}
                </h1>
                <p className="text-gray-600">{doctor.specialty}</p>
                <p className="text-gray-500 text-sm mt-1">License: {doctor.medicalLicenseNumber}</p>
              </div>
            </div>
          </div>

          {/* Today's appointments */}
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">Today's appointments</h2>
            <div className="bg-white rounded-lg shadow">
              {appointments.length > 0 ? (
                <div className="divide-y">
                  {appointments.map((appointment) => {
                    const appointmentId = appointment.id || `${appointment.patientName}_${appointment.startTime}`;
                    const isBeeping = beepingAppointments.has(appointmentId);
                    
                    return (
                      <EnhancedAppointmentCard
                        key={appointmentId}
                        name={appointment.patientName}
                        startTime={appointment.startTime}
                        endTime={appointment.endTime}
                        avatarUrl={appointment.patientAvatar || defaultAvatar}
                        isBeeping={isBeeping}
                        status={appointment.status}
                        onStartClick={() => handleStartButtonClick(appointmentId)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No appointments scheduled for today
                </div>
              )}
            </div>
          </section>

          {/* Next available times */}
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">Next available times</h2>
            <div className="bg-white rounded-lg shadow">
              {availableTimes && availableTimes.length > 0 ? (
                <div className="divide-y">
                  {availableTimes.map((slot, index) => (
                    <AvailableTimeCard
                      key={index}
                      title={slot.title}
                      day={slot.day}
                      time={slot.time}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No available time slots
                </div>
              )}
            </div>
          </section>

          {/* Overview */}
          <section>
            <h2 className="text-xl font-bold mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatsCard
                title="Total patients"
                value={stats.totalPatients.toLocaleString()}
                change={{ 
                  value: `${Math.abs(stats.totalPatientsTrend)}%`, 
                  positive: stats.totalPatientsTrend >= 0 
                }}
              />
              <StatsCard
                title="New patients this week"
                value={stats.newPatientsThisWeek.toLocaleString()}
                change={{ 
                  value: `${Math.abs(stats.newPatientsTrend)}%`, 
                  positive: stats.newPatientsTrend >= 0 
                }}
              />
            </div>
          </section>

          {/* Doctor Details */}
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4">Doctor Information</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{doctor.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{doctor.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Specialty</p>
                  <p className="font-medium">{doctor.specialty}</p>
                </div>
                <div>
                  <p className="text-gray-500">License Number</p>
                  <p className="font-medium">{doctor.licenseNumber}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500">Qualifications</p>
                  <p className="font-medium">{doctor.qualifications}</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashBoard;