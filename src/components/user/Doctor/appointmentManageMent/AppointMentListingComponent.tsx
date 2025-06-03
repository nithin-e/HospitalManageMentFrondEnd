import React, { useEffect, useState } from 'react';
import { Search, Calendar, Clock, User, Phone, Mail, FileText, Eye, Check, X, AlertCircle, UserCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/redux/store';
import Sidebar from "../../Doctor/layout/Sidebar";
import { fectingAllUserAppointMents } from '@/store/DoctorSideApi/fectingFullUserAppointMents';

// Interface for appointment data structure
interface Appointment {
  id: string;
  patientName: string;
  doctorEmail: string;
  patientPhone: string;
  patientEmail?: string;
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
  specialty: string;
  status: string;
  doctorName: string;
}

const AppointMentListingComponent = () => {
  const [selectedRequest, setSelectedRequest] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dispatch: AppDispatch = useDispatch();
  
  // Get doctor data from Redux store with proper error handling
  const doctor = useSelector((state: RootState) => state.doctor?.data?.doctor);
  console.log('Doctor data:', doctor);

  const getUrgencyColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'urgent':
      case 'emergency': 
        return 'text-red-600 bg-red-50 border-red-200';
      case 'scheduled':
      case 'confirmed': 
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': 
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'completed': 
        return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled': 
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default: 
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    // Handle different time formats
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    
    try {
      // If it's in 24-hour format, convert to 12-hour
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  useEffect(() => {
    fetchUserFullAppointments();
  }, []);

  const fetchUserFullAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fectingAllUserAppointMents();
      console.log('all Appointments', response);
      
      if (response && response.result && response.result.appointments) {
        setAppointments(response.result.appointments);
      } else {
        setError('No appointments data received');
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

  const filteredRequests = appointments.filter(appointment =>
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = (appointmentId: string) => {
    console.log('Approved appointment:', appointmentId);
    // Add approval logic here
    // You might want to call an API to update the appointment status
  };

  const handleReject = (appointmentId: string) => {
    console.log('Rejected appointment:', appointmentId);
    // Add rejection logic here
    // You might want to call an API to update the appointment status
  };

  // Safe fallback for doctor data
  const doctorName = doctor ? `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() : 'Doctor';
  const firstName = doctor?.firstName || 'Doctor';

  // Generate a placeholder profile image URL based on patient name
  const getProfileImageUrl = (patientName: string) => {
    const names = patientName.split(' ');
    const initials = names.map(name => name.charAt(0)).join('').toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(patientName)}&background=3B82F6&color=FFFFFF&size=64&bold=true`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      <div className="fixed left-0 top-0 h-full w-64 z-30 bg-white shadow-lg">
        <Sidebar doctorName={doctorName} />
      </div>
      
      {/* Main Content - With proper margin for sidebar */}
      <div className="flex-1 ml-64">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Appointment Requests
            </h1>
            <p className="text-gray-600">
              Welcome back, {firstName}! Here are your appointment requests.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading appointments...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
              <button 
                onClick={fetchUserFullAppointments}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Main Grid Layout */}
          {!loading && !error && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 min-h-[calc(100vh-200px)]">
              {/* Left Column - Appointment List */}
              <div className="xl:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
                  {/* Search Bar */}
                  <div className="p-4 lg:p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search patients, specialty, or notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Requests List */}
                  <div className="flex-1 overflow-hidden">
                    <div className="h-full overflow-y-auto">
                      {filteredRequests.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {filteredRequests.map((appointment) => (
                            <div
                              key={appointment.id}
                              className={`p-4 lg:p-6 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                                selectedRequest?.id === appointment.id 
                                  ? 'bg-blue-50 border-r-4 border-r-blue-500' 
                                  : ''
                              }`}
                              onClick={() => setSelectedRequest(appointment)}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3 lg:space-x-4 flex-1 min-w-0">
                                  <div className="relative flex-shrink-0">
                                    <img
                                      src={getProfileImageUrl(appointment.patientName)}
                                      alt={appointment.patientName}
                                      className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling?.classList.remove('hidden');
                                      }}
                                    />
                                    <div 
                                      className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gray-200 flex items-center justify-center hidden"
                                    >
                                      <UserCircle className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
                                    </div>
                                  </div>
                                  
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 truncate">
                                      {appointment.patientName}
                                    </h3>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                      <Calendar className="w-4 h-4 flex-shrink-0" />
                                      <span className="truncate">{formatDate(appointment.appointmentDate)}</span>
                                      <Clock className="w-4 h-4 flex-shrink-0 ml-2" />
                                      <span className="truncate">{formatTime(appointment.appointmentTime)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Status Badge and Specialty */}
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-medium border ${getUrgencyColor(appointment.status)}`}>
                                  {getStatusText(appointment.status)}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">
                                  {appointment.specialty}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full p-8">
                          <div className="text-center">
                            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {appointments.length === 0 ? 'No appointments found' : 'No matching appointments'}
                            </h3>
                            <p className="text-gray-500">
                              {appointments.length === 0 
                                ? 'You have no appointment requests at the moment' 
                                : 'Try adjusting your search terms'
                              }
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Appointment Details */}
              <div className="xl:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6 h-fit">
                  <div className="p-4 lg:p-6">
                    {selectedRequest ? (
                      <div>
                        {/* Patient Header */}
                        <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-100">
                          <div className="relative flex-shrink-0">
                            <img
                              src={getProfileImageUrl(selectedRequest.patientName)}
                              alt={selectedRequest.patientName}
                              className="w-14 h-14 lg:w-16 lg:h-16 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div 
                              className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gray-200 flex items-center justify-center hidden"
                            >
                              <UserCircle className="w-10 h-10 text-gray-400" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h2 className="text-xl font-bold text-gray-900 truncate">
                              {selectedRequest.patientName}
                            </h2>
                            <p className="text-gray-600">Patient</p>
                          </div>
                        </div>

                        {/* Appointment Details */}
                        <div className="space-y-4 mb-6">
                          <div className="flex items-center space-x-3">
                            <Calendar className="text-gray-400 w-5 h-5 flex-shrink-0" />
                            <span className="text-gray-700">
                              {formatDate(selectedRequest.appointmentDate)}, {formatTime(selectedRequest.appointmentTime)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <FileText className="text-gray-400 w-5 h-5 flex-shrink-0" />
                            <span className="text-gray-700">{selectedRequest.specialty}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <AlertCircle className="text-gray-400 w-5 h-5 flex-shrink-0" />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(selectedRequest.status)}`}>
                              {getStatusText(selectedRequest.status)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Phone className="text-gray-400 w-5 h-5 flex-shrink-0" />
                            <span className="text-gray-700">{selectedRequest.patientPhone}</span>
                          </div>
                          {selectedRequest.patientEmail && (
                            <div className="flex items-center space-x-3">
                              <Mail className="text-gray-400 w-5 h-5 flex-shrink-0" />
                              <span className="text-gray-700 truncate" title={selectedRequest.patientEmail}>
                                {selectedRequest.patientEmail}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Notes Section */}
                        <div className="mb-6 pb-4 border-b border-gray-100">
                          <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {selectedRequest.notes || "No notes provided"}
                          </p>
                        </div>

                        {/* Doctor Information */}
                        <div className="mb-6 pb-4 border-b border-gray-100">
                          <h3 className="font-semibold text-gray-900 mb-2">Assigned Doctor</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {selectedRequest.doctorName}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        {selectedRequest.status.toLowerCase() === 'pending' && (
                          <div className="flex space-x-3">
                            <button 
                              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                              onClick={() => handleApprove(selectedRequest.id)}
                            >
                              <Check className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                            <button 
                              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
                              onClick={() => handleReject(selectedRequest.id)}
                            >
                              <X className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Select an appointment</h3>
                        <p className="text-gray-500">Choose an appointment from the list to view details</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointMentListingComponent;