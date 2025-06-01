import { useState, useEffect } from 'react';
import { 
  User, Clock, Calendar, Phone, Mail, MapPin, Clipboard, Activity, 
  Heart, FileText, Shield, Lock, Eye, EyeOff, Edit3, Check, AlertCircle, 
  ArrowRight, Stethoscope, Pill, Syringe, Thermometer, ClipboardCheck
} from 'lucide-react';
import Navbar from './Navbar';
import { RootState } from '@/store/redux/store';
import { useSelector } from 'react-redux';
import { fetchUserProfileData } from '@/store/userSideApi/fetchUserProfile';
import { changing_UserPassWord } from '@/store/userSideApi/changing_userPassword';

// TypeScript interface for user data
interface UserProfile {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  bloodType?: string;
  contactNumber?: string;
  phoneNumber?: string;
  email: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string[];
  upcomingAppointments?: Appointment[];
  recentVitals?: Vitals;
  insuranceProvider?: string;
  insuranceNumber?: string;
  registrationDate?: string;
  profileImage?: string;
  role?: string;
  isActive?: boolean;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  department: string;
  purpose: string;
}




const sampleAppointments: Appointment[] = [
  {
    id: "A-5642",
    date: "June 15, 2025",
    time: "10:30 AM",
    doctor: "Dr. Emily Chen",
    department: "Cardiology",
    purpose: "Annual heart checkup"
  },
  {
    id: "A-5698",
    date: "July 02, 2025",
    time: "2:15 PM",
    doctor: "Dr. Robert Miller",
    department: "General Medicine",
    purpose: "Follow-up consultation"
  }
];

const sampleMedicalHistory: string[] = [
  "Hypertension diagnosed 2018",
  "Allergic to penicillin",
  "Appendectomy in 2010",
  "Gestational diabetes during pregnancy (2015)"
];

const UserProfileComponent = () => {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);



  const user = useSelector((state: RootState) => state.user);
  
  console.log('......Navuser.......',user);
  const userDataa = user?.checkUserEmailAndPhone?.user || user?.user?.user || user?.user || null;
  const userEmail = userDataa?.email || '';

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    
    // Client-side validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }
    
    try {

        

        const response = await changing_UserPassWord({
            email: userEmail,
            password: passwordData.newPassword
          });
        
          console.log('new.....password changed check the res',response)
    
      
      if (!response) {
        setPasswordError( "Failed to update password. Please try again.");
        return;
      }
      
      // Handle successful password change
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Hide success message and close password form after delay
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowChangePassword(false);
      }, 3000);
      
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordError("An error occurred. Please try again later.");
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setPasswordVisible({
      ...passwordVisible,
      [field]: !passwordVisible[field]
    });
  };

 

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await fetchUserProfileData(userEmail);
      console.log('/////////////////userProfileData\\\\\\\\\\\\\\\\', res.user);
      
      if (res.user) {
        // Create a merged profile with API data and sample data for missing fields
        const profile: UserProfile = {
          ...res.user,
          contactNumber: res.user.phoneNumber || "Not provided",
          age: 42, // Default until API provides this
          gender: "Not specified", // Default until API provides this
          bloodType: "Not specified", // Default until API provides this
          address: "Not provided", // Default until API provides this
          emergencyContact: "Not provided", // Default until API provides this
          medicalHistory: sampleMedicalHistory,
          upcomingAppointments: sampleAppointments,
          registrationDate: "January 12, 2022", // Default until API provides this
          insuranceProvider: "HealthGuard Insurance", // Default until API provides this
          insuranceNumber: "HG-957834261" // Default until API provides this
        };
        
        setUserData(profile);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading your medical profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile Unavailable</h2>
          <p className="text-gray-600 mb-6">We're unable to load your medical profile at this time.</p>
          <button 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <Navbar />
      
      {/* Hospital Banner */}
      <div className="max-w-6xl mx-auto p-6 mt-[90px]">
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden border border-blue-100">
          <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-6 text-white relative">
            {/* Medical ID Ribbon */}
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-md">
              MEDICAL ID
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start">
              <div className="relative">
                {userData.profileImage ? (
                  <img 
                    src={userData.profileImage} 
                    alt={userData.name} 
                    className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <User size={56} className="text-blue-600" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-green-500 p-1 rounded-full shadow-md">
                  <Check className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-8 text-center md:text-left">
                <h1 className="text-3xl font-bold">{userData.name}</h1>
                <div className="flex flex-wrap gap-3 mt-3 text-xs justify-center md:justify-start">
                  <div className="flex items-center bg-blue-600 bg-opacity-20 rounded-full px-3 py-1 backdrop-blur-sm">
                    <Clipboard className="w-3 h-3 mr-1" />
                    <span>ID: {userData.id.substring(0, 8)}</span>
                  </div>
                  <div className="flex items-center bg-blue-600 bg-opacity-20 rounded-full px-3 py-1 backdrop-blur-sm">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Age: {userData.age || 'N/A'}</span>
                  </div>
                  <div className="flex items-center bg-blue-600 bg-opacity-20 rounded-full px-3 py-1 backdrop-blur-sm">
                    <User className="w-3 h-3 mr-1" />
                    <span>{userData.gender || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center bg-blue-600 bg-opacity-20 rounded-full px-3 py-1 backdrop-blur-sm">
                    <Heart className="w-3 h-3 mr-1" />
                    <span>Blood: {userData.bloodType || 'Not specified'}</span>
                  </div>
                </div>
                
                {/* Quick Action Buttons */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  <button className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs px-3 py-1 rounded-full transition-all border border-white border-opacity-30">
                    <ClipboardCheck className="w-3 h-3 mr-1" />
                    Request Records
                  </button>
                  <button className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs px-3 py-1 rounded-full transition-all border border-white border-opacity-30">
                    <Phone className="w-3 h-3 mr-1" />
                    Contact Doctor
                  </button>
                  <button className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs px-3 py-1 rounded-full transition-all border border-white border-opacity-30">
                    <Pill className="w-3 h-3 mr-1" />
                    Refill Prescription
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Navigation Tabs */}
        <div className="mb-6 bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="flex overflow-x-auto scrollbar-hide">
            <button
              className={`px-5 py-3 font-medium text-sm flex-shrink-0 border-b-2 transition-all flex items-center ${
                activeTab === "personal" 
                  ? "border-blue-600 text-blue-600 bg-blue-50" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("personal")}
            >
              <User className="w-4 h-4 mr-2" />
              Personal
            </button>
            <button
              className={`px-5 py-3 font-medium text-sm flex-shrink-0 border-b-2 transition-all flex items-center ${
                activeTab === "medical" 
                  ? "border-blue-600 text-blue-600 bg-blue-50" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("medical")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Medical History
            </button>
            <button
              className={`px-5 py-3 font-medium text-sm flex-shrink-0 border-b-2 transition-all flex items-center ${
                activeTab === "appointments" 
                  ? "border-blue-600 text-blue-600 bg-blue-50" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("appointments")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Appointments
            </button>
            <button
              className={`px-5 py-3 font-medium text-sm flex-shrink-0 border-b-2 transition-all flex items-center ${
                activeTab === "security" 
                  ? "border-blue-600 text-blue-600 bg-blue-50" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("security")}
            >
              <Lock className="w-4 h-4 mr-2" />
              Security
            </button>
          </div>
        </div>

        {/* Medical Content Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          {/* Personal Information Tab */}
          {activeTab === "personal" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <User className="w-6 h-6 mr-2 text-blue-600" />
                  Personal Information
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center text-gray-600 mb-2">
                      <Phone className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Contact Number</span>
                    </div>
                    <p className="text-gray-900 font-medium">{userData.phoneNumber || userData.contactNumber || "Not provided"}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center text-gray-600 mb-2">
                      <Mail className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Email Address</span>
                    </div>
                    <p className="text-gray-900 font-medium">{userData.email}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Address</span>
                    </div>
                    <p className="text-gray-900 font-medium">{userData.address || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center text-gray-600 mb-2">
                      <Phone className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Emergency Contact</span>
                    </div>
                    <p className="text-gray-900 font-medium">{userData.emergencyContact || "Not provided"}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Registration Date</span>
                    </div>
                    <p className="text-gray-900 font-medium">{userData.registrationDate || "Not provided"}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center text-gray-600 mb-2">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">User Role</span>
                    </div>
                    <p className="text-gray-900 font-medium capitalize">{userData.role || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medical History Tab */}
          {activeTab === "medical" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-blue-600" />
                  Medical History
                </h2>
                <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Records
                </button>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                  <ClipboardCheck className="w-5 h-5 mr-2 text-blue-600" />
                  Medical Conditions & History
                </h3>
                
                <ul className="space-y-3">
                  {userData.medicalHistory && userData.medicalHistory.length > 0 ? (
                    userData.medicalHistory.map((item, index) => (
                      <li key={index} className="flex items-start bg-white p-3 rounded-lg border border-blue-100 hover:shadow-sm transition-shadow">
                        <div className="mt-1 mr-3 bg-blue-100 rounded-full p-2 flex-shrink-0">
                          {item.toLowerCase().includes("allerg") ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <span className="text-gray-800">{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-center justify-center p-4 text-gray-500">
                      No medical history records available
                    </li>
                  )}
                </ul>
                
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-amber-800">Medical Records Notice</h4>
                      <p className="mt-1 text-amber-700 text-sm">
                        To add or update your medical history records, please visit the hospital or contact your physician.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === "appointments" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                  Upcoming Appointments
                </h2>
                <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule New
                </button>
              </div>
              
              <div className="space-y-5">
                {userData.upcomingAppointments && userData.upcomingAppointments.length > 0 ? (
                  userData.upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{appointment.purpose}</h3>
                          <p className="text-gray-600 mt-1">
                            <span className="text-blue-700 font-medium">{appointment.doctor}</span> • {appointment.department}
                          </p>
                        </div>
                        <div className="mt-3 md:mt-0 md:text-right">
                          <div className="inline-flex items-center bg-white border border-blue-200 text-blue-800 rounded-lg px-4 py-2 font-medium shadow-sm">
                            <Clock className="w-4 h-4 mr-2 text-blue-600" />
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center text-gray-700 bg-white p-3 rounded-lg border border-blue-100">
                        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                        <span className="font-medium">{appointment.date}</span>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button className="text-sm font-medium px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors shadow-sm">
                          Reschedule
                        </button>
                        <button className="text-sm font-medium px-4 py-2 bg-white text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors shadow-sm">
                          Cancel
                        </button>
                        <button className="text-sm font-medium px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm ml-auto">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 bg-blue-50 rounded-lg border border-blue-100">
                    <Calendar className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Upcoming Appointments</h3>
                    <p className="text-gray-500 mb-4">You don't have any scheduled appointments at this time.</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                      Schedule Your First Appointment
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Appointment Instructions
                </h3>
                <p className="text-gray-600 text-sm">
                  Please arrive 15 minutes before your scheduled time. Bring your insurance card, photo ID, 
                  and any relevant medical records. Fasting may be required for some tests.
                </p>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Lock className="w-6 h-6 mr-2 text-blue-600" />
                  Account Security
                </h2>
                <button 
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  onClick={() => setShowChangePassword(!showChangePassword)}
                >
                  <Lock className="w-4 h-4 mr-1" />
                  {showChangePassword ? "Cancel" : "Change Password"}
                </button>
              </div>

              {showChangePassword ? (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <form onSubmit={handlePasswordChange}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={passwordVisible.current ? "text" : "password"}
                            id="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => togglePasswordVisibility('current')}
                          >
                            {passwordVisible.current ? (
                              <EyeOff className="w-5 h-5 text-gray-500" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={passwordVisible.new ? "text" : "password"}
                            id="newPassword"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => togglePasswordVisibility('new')}
                          >
                            {passwordVisible.new ? (
                              <EyeOff className="w-5 h-5 text-gray-500" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={passwordVisible.confirm ? "text" : "password"}
                            id="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => togglePasswordVisibility('confirm')}
                          >
                            {passwordVisible.confirm ? (
                              <EyeOff className="w-5 h-5 text-gray-500" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      {passwordError && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                          <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {passwordError}
                          </div>
                        </div>
                      )}

                      {passwordSuccess && (
                        <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">
                          <div className="flex items-center">
                            <Check className="w-4 h-4 mr-2" />
                            Password changed successfully!
                          </div>
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-md"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-start">
                    <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-sm mr-4">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">Account Security Status</h3>
                      <p className="mt-1 text-gray-600">
                        Your account is secured with industry-standard encryption. For optimal security, 
                        we recommend changing your password every 90 days and enabling two-factor authentication.
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          Last password change: May 15, 2025
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          Secure login enabled
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <AlertCircle className="w-4 h-4 text-amber-500 mr-2" />
                          Two-factor authentication not enabled
                        </div>
                      </div>
                      <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Enable Two-Factor Authentication
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Hospital Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 py-4 border-t border-gray-200">
          <p>Metropolitan General Hospital Patient Portal • 24/7 Support: (555) 987-6543</p>
          <p className="mt-1">For medical emergencies, please call 911 or visit the nearest emergency room.</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileComponent;