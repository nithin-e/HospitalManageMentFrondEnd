import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../Doctor/layout/Sidebar";
import AppointmentCard from "../../Doctor/components/AppointmentCard";
import AvailableTimeCard from "../../Doctor/components/AvailableTimeCard";
import StatsCard from "../../Doctor/components/StatusCard";
import { fetchDoctorDashBoardData } from "@/store/DoctorSideApi/fetchDoctorDashBoardData";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/redux/store";
import { fetchDoctorDashBoardDatas } from "@/store/redux/slices/DoctorSlice";

// Default avatar as fallback
const defaultAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

// Define interfaces for our data types
interface DoctorData {
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  profileImageUrl: string;
  qualifications: string;
  phoneNumber: string;
  medicalLicenseNumber: string;
  licenseNumber: string;
  status: string;
  // Add other properties as needed
}

interface AppointmentData {
  patientName: string;
  startTime: string;
  endTime: string;
  patientAvatar?: string;
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

interface DashboardData {
  doctor: DoctorData;
  appointments: AppointmentData[];
  availableTimes: AvailableTimeData[];
  stats: StatsData;
}

const DoctorDashBoard: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email || "";
  console.log('controller before res', email);
  const dispatch: AppDispatch = useDispatch();
  
  // Get doctor data from Redux store
  const doctor = useSelector((state: RootState) => state.doctor?.data?.doctor);
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

  // Determine greeting based on time of day
  const currentHour = new Date().getHours();
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon";
  } else if (currentHour >= 18) {
    greeting = "Good evening";
  }


 

  useEffect(() => {
    if(email){
      fetchDoctorData(email);
    }else{
      fetchDoctorData(doctor.email);
    }
  
  },[]);  
  



    

    




     const fetchDoctorData = async (email:string) => {
      try {
        setLoading(true);
      
        
        // Call API to fetch doctor data
        await dispatch(fetchDoctorDashBoardDatas(email));
        
        // Set temporary data for other dashboard components
        const tempAppointments = [
          {
            patientName: "Jane Smith",
            startTime: "09:00 AM",
            endTime: "09:30 AM",
            patientAvatar: defaultAvatar
          },
          {
            patientName: "John Doe",
            startTime: "10:15 AM",
            endTime: "10:45 AM",
            patientAvatar: defaultAvatar
          }
        ];
        
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
        setAppointments(tempAppointments);
        setAvailableTimes(tempAvailableTimes);
        setStats(tempStats);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching doctor data:", err);
        setError("Failed to load doctor data. Please try again later.");
        setLoading(false);
      }
    };




    




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

  // Show error state
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

  // Show error if doctor data is not available
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

  // Get full name for display
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
                  {appointments.map((appointment, index) => (
                    <AppointmentCard
                      key={index}
                      name={appointment.patientName}
                      startTime={appointment.startTime}
                      endTime={appointment.endTime}
                      avatarUrl={appointment.patientAvatar || defaultAvatar}
                    />
                  ))}
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