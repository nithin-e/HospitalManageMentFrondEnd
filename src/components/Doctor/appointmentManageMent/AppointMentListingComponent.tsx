import React, { useEffect, useState } from 'react';
import { 
  Search, Calendar, Clock, User, Phone, Mail, FileText, 
  MessageCircle, Check, X, AlertCircle, UserCircle, MessageSquare,
  ArrowLeft, Smile, Mic, Paperclip, Camera, Send, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/redux/store';
import Sidebar from "../../Doctor/layout/Sidebar";
import { fectingAllUserAppointMents } from '@/store/DoctorSideApi/fectingFullUserAppointMents';
import { useSocket } from "@/context/socketContext";
import { fetchUserConversations } from '@/store/userSideApi/fetchUserConversations';
import { app } from '@/store/firebase';

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
  userId: string;
  doctorId?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'patient' | 'doctor';
  senderId: string;
  receiverId: string;
  appointmentId: string;
  timestamp: string;
  patientName: string;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
  fileContent?: string;
  isImage?: boolean;
}

const AppointMentListingComponent = () => {
  const [selectedRequest, setSelectedRequest] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatAppointment, setChatAppointment] = useState<Appointment | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const appointmentsPerPage = 2;
  
  const { socket, connected } = useSocket();
  const dispatch: AppDispatch = useDispatch();
  const doctor = useSelector((state: RootState) => state.doctor.data.doctor);
  const email = useSelector((state: RootState) => state.doctor.data.doctor.email);

  useEffect(() => {
    if (!doctor) {
      console.log('Doctor not authenticated');
      setError('Please log in to view appointments');
      setLoading(false);
      return;
    }
    
    fetchUserFullAppointments();
  }, [doctor, currentPage]);

  useEffect(() => {
    if (appointments.length > 0 && doctor) {
      const filtered = filterAppointmentsByDoctor(appointments);
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments([]);
    }
  }, [appointments, doctor]);

  useEffect(() => {
    if (!socket) {
      console.log('Socket not connected yet');
      return;
    }
  
    const handleReceiveMessage = (data: any) => {
      if (data.type === "msgReceive") {
        const newMessageData = data.data;
        
        if (chatAppointment && newMessageData.appointmentId === chatAppointment.id) {
          const isImageFile = (mimeType: string) => {
            return mimeType && mimeType.startsWith('image/');
          };
          
          const newMsg: ChatMessage = {
            id: newMessageData.messageId || Date.now().toString(),
            text: newMessageData.text || newMessageData.message || '',
            sender: newMessageData.sender === 'user' ? 'patient' : 'doctor',
            senderId: newMessageData.senderId,
            receiverId: newMessageData.receiverId,
            appointmentId: newMessageData.appointmentId,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            patientName: chatAppointment.patientName,
            type: newMessageData.type || 'text',
            fileUrl: newMessageData.fileUrl,
            fileName: newMessageData.fileName,
            mimeType: newMessageData.mimeType,
            fileContent: newMessageData.fileContent,
            isImage: isImageFile(newMessageData.mimeType)
          };
          
          setChatMessages(prev => [...prev, newMsg]);
        }
      }
    };
  
    socket.on("receive", handleReceiveMessage);
  
    return () => {
      if (socket) {
        socket.off("receive", handleReceiveMessage);
      }
    };
  }, [socket, chatAppointment]);

  const fetchUserFullAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!doctor || !email) {
        throw new Error('Doctor not authenticated');
      }
      
      const response = await fectingAllUserAppointMents(email, currentPage, appointmentsPerPage);
      
      if (response && response.result && response.result.appointments) {

        console.log('edaaei check here the responce from backend',response)
        setAppointments(response.result.appointments);
        setTotalAppointments(response.result.totalAppointments || response.result.appointments.length);
        setTotalPages(Math.ceil(response.result.totalAppointments / appointmentsPerPage));
      } else {
        setError('No appointments data received');
        setAppointments([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view appointments.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(error.message || 'Failed to fetch appointments');
      }
      
      setAppointments([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointmentsByDoctor = (appointments: Appointment[]) => {
    if (!doctor) return [];
    const reduxDoctorName = `${doctor.firstName || ''}`.trim().toLowerCase();
    return appointments.filter(appointment => {
      const appointmentDoctorName = appointment.doctorName.toLowerCase().trim();
      return appointmentDoctorName === reduxDoctorName || 
             appointmentDoctorName.includes(reduxDoctorName) ||
             reduxDoctorName.includes(appointmentDoctorName);
    });
  };

  const getUrgencyColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'urgent':
      case 'emergency': return 'text-red-600 bg-red-50 border-red-200';
      case 'scheduled':
      case 'confirmed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
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
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    try {
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  const fetchUserConversation = async (userId: string, doctorId: string) => {
    try {
      const res = await fetchUserConversations(userId, doctorId);  
      
      if (res.result.success) {
        const messages = res.result.conversations[0].messages.map(msg => {
          const isImage = msg.messageType === 'file' && 
                          msg.mimeType?.startsWith('image/');
          
          return {
            id: msg.messageId,
            text: msg.content,
            sender: msg.senderType === 'doctor' ? 'doctor' : 'patient',
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            appointmentId: msg.appointmentId,
            timestamp: msg.timestamp || new Date(msg.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            type: isImage ? 'image' : msg.messageType,
            fileUrl: msg.fileUrl,
            fileName: msg.fileName,
            mimeType: msg.mimeType,
            fileContent: msg.fileUrl,
            isImage: isImage
          };
        });
  
        setChatMessages(messages);
        return true;
      }
      
      return false;
    } catch (error) {
      console.log(error);
      return false;
    } 
  };

  const handleChatClick = async (appointment: Appointment) => {
    console.log('starting chat with appoitment........',appointment)
    setChatAppointment(appointment);
    setShowChatModal(true);
    
    const hasPreviousMessages = await fetchUserConversation(appointment.userId, doctor?.id || '');
    
    if (!hasPreviousMessages) {
      setChatMessages([
        {
          id: '1',
          text: `Hello Dr. ${doctor?.firstName || 'Doctor'}, I have an appointment scheduled for ${formatDate(appointment.appointmentDate)} at ${formatTime(appointment.appointmentTime)}.`,
          sender: 'patient',
          senderId: appointment.userId,
          receiverId: doctor?.id || '',
          appointmentId: appointment.id,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          patientName: appointment.patientName,
          type: 'text'
        }
      ]);
    }
  };

  const sendMessageToBackend = async (message: any) => {

    console.log('{check this chatAppointment{} before sending to backent:}',chatAppointment);
    
    try {
      if (!socket || !connected || !chatAppointment || !doctor) {
        console.error('Socket not connected or missing data');
        return;
      }

      const messageData = {
        type: message.type || 'text',
        text: message.text || '',
        sender: 'doctor',
        senderId: doctor.id,
        timestamp: message.timestamp,
        appointmentId: chatAppointment.id,
        receiverId: chatAppointment.userId,
        fileContent: message.content,
        fileName: message.fileName,
        fileSize: message.fileSize,
        mimeType: message.mimeType
      };

      console.log('checke here also before sending message too backend',messageData);
      
  
      socket.emit('sendMessage', messageData);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendMessage = (messageType = 'text', content: File | null = null) => {
    if (messageType === 'text' && !newMessage.trim()) return;
  
    const message = {
      id: Date.now().toString(),
      type: messageType, 
      text: messageType === 'text' ? newMessage : '', 
      content: content, 
      fileName: content?.name || null,
      fileSize: content?.size || null,
      mimeType: content?.type || null,
      sender: 'doctor',
      senderId: doctor?.id || '',
      receiverId: chatAppointment?.userId || '',
      appointmentId: chatAppointment?.id || '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      doctorName: doctorName
    };
  
    const chatMessage: ChatMessage = {
      id: message.id,
      text: message.text,
      sender: 'doctor',
      senderId: message.senderId,
      receiverId: message.receiverId,
      appointmentId: message.appointmentId,
      timestamp: message.timestamp,
      patientName: chatAppointment?.patientName || '',
      type: messageType as 'text' | 'file',
      fileUrl: content ? URL.createObjectURL(content) : undefined,
      fileName: content?.name,
      mimeType: content?.type,
      isImage: content?.type.startsWith('image/')
    };
  
    setChatMessages(prev => [...prev, chatMessage]);
    
    if (messageType === 'text') {
      setNewMessage('');
    }

    console.log('check this message before sending to backent:',message)
    
    sendMessageToBackend(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileType = file.type.startsWith('image/') ? 'image' : 'file';
      sendMessage(fileType, file);
    }
    event.target.value = '';
  };

  const searchFilteredRequests = filteredAppointments.filter(appointment =>
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getProfileImageUrl = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=FFFFFF&size=64&bold=true`;
  };

  const doctorName = doctor ? `${doctor.firstName || ''}`.trim() : 'Doctor';
  const firstName = doctor?.firstName || 'Doctor';

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="fixed left-0 top-0 h-full w-64 z-30 bg-white shadow-lg">
          <Sidebar doctorName={doctorName} />
        </div>
        
        <div className="flex-1 ml-64">
          <div className="p-6 lg:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading appointments...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !doctor) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="fixed left-0 top-0 h-full w-64 z-30 bg-white shadow-lg">
          <Sidebar doctorName={doctorName} />
        </div>
        
        <div className="flex-1 ml-64">
          <div className="p-6 lg:p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed left-0 top-0 h-full w-64 z-30 bg-white shadow-lg">
        <Sidebar doctorName={doctorName} />
      </div>
      
      <div className="flex-1 ml-64">
        <div className="p-6 lg:p-8">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Appointment Requests
            </h1>
            <p className="text-gray-600">
              Welcome back, {firstName}! Here are your appointment requests.
            </p>
            {doctor && (
              <p className="text-sm text-gray-500 mt-1">
                Showing appointments for: {doctorName} ({searchFilteredRequests.length} of {totalAppointments} total)
              </p>
            )}
          </div>

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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 min-h-[calc(100vh-200px)]">
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
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

                <div className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto">
                    {searchFilteredRequests.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {searchFilteredRequests.map((appointment) => (
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
                                  />
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
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChatClick(appointment);
                                }}
                                className="ml-4 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                                title="Start chat"
                              >
                                <MessageSquare className="w-5 h-5" />
                              </button>
                            </div>
                            
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
                            {filteredAppointments.length === 0 ? 'No appointments found' : 'No matching appointments'}
                          </h3>
                          <p className="text-gray-500">
                            {filteredAppointments.length === 0 
                              ? `No appointments found for Dr. ${doctorName}` 
                              : 'Try adjusting your search terms'
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * appointmentsPerPage + 1} to{' '}
                    {Math.min(currentPage * appointmentsPerPage, totalAppointments)} of{' '}
                    {totalAppointments} appointments
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-full ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-full ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar with appointment details */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6 h-fit">
                <div className="p-4 lg:p-6">
                  {selectedRequest ? (
                    <div>
                      <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-100">
                        <div className="relative flex-shrink-0">
                          <img
                            src={getProfileImageUrl(selectedRequest.patientName)}
                            alt={selectedRequest.patientName}
                            className="w-14 h-14 lg:w-16 lg:h-16 rounded-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-xl font-bold text-gray-900 truncate">
                            {selectedRequest.patientName}
                          </h2>
                          <p className="text-gray-600">Patient</p>
                        </div>
                        <button
                          onClick={() => handleChatClick(selectedRequest)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                          title="Start chat"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                      </div>

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

                      <div className="mb-6 pb-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {selectedRequest.notes || "No notes provided"}
                        </p>
                      </div>

                      <div className="mb-6 pb-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-2">Assigned Doctor</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {selectedRequest.doctorName}
                        </p>
                      </div>
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

          {/* Chat Modal */}
          {showChatModal && chatAppointment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-end pr-4">
              <div className="w-full max-w-md h-[70vh] max-h-[600px] min-h-[400px]">
                <div className="bg-white h-full shadow-xl flex flex-col rounded-lg overflow-hidden">
                  <div className="bg-blue-600 p-4 flex items-start justify-between flex-shrink-0">
                    <div className="flex items-center">
                      <button
                        onClick={() => setShowChatModal(false)}
                        className="text-white hover:text-blue-200 mr-3 -mt-1"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <img
                          src={getProfileImageUrl(chatAppointment.patientName)}
                          alt={chatAppointment.patientName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          {chatAppointment.patientName}
                        </h3>
                        <p className="text-blue-200 text-xs">
                          {chatAppointment.specialty} • {formatDate(chatAppointment.appointmentDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 -mt-1">
                      <button className="text-white hover:text-blue-200">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setShowChatModal(false)}
                        className="text-white hover:text-blue-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {chatMessages.length > 0 ? (
                      chatMessages.map((message) => (
                        <div key={message.id} className="flex flex-col">
                          {message.sender === 'patient' ? (
                            <div className="flex items-start">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                                <img
                                  src={getProfileImageUrl(chatAppointment.patientName)}
                                  alt={chatAppointment.patientName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                {message.isImage ? (
                                  <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm">
                                    <img 
                                      src={message.fileUrl} 
                                      alt={message.fileName || "Received image"}
                                      className="max-w-full h-auto rounded max-h-48 object-contain"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = 'https://via.placeholder.com/150?text=Image+Not+Available';
                                      }}
                                    />
                                    {message.text && (
                                      <p className="text-gray-800 text-sm mt-2">{message.text}</p>
                                    )}
                                  </div>
                                ) : message.type === 'file' ? (
                                  <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm">
                                    <div className="flex items-center space-x-2">
                                      <Paperclip className="w-4 h-4 text-gray-500" />
                                      <span className="text-sm text-gray-700">{message.fileName}</span>
                                    </div>
                                    {message.text && (
                                      <p className="text-gray-800 text-sm mt-2">{message.text}</p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm">
                                    <p className="text-gray-800 text-sm">{message.text}</p>
                                  </div>
                                )}
                                <p className="text-gray-400 text-xs mt-1 ml-2">
                                  {message.timestamp}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-end">
                              <div className="flex flex-col items-end max-w-xs">
                                {message.isImage ? (
                                  <div className="bg-blue-600 rounded-lg p-3 shadow-sm">
                                    <img 
                                      src={message.fileUrl} 
                                      alt={message.fileName || "Sent image"}
                                      className="max-w-full h-auto rounded max-h-48 object-contain"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = 'https://via.placeholder.com/150?text=Image+Not+Available';
                                      }}
                                    />
                                    {message.text && (
                                      <p className="text-white text-sm mt-2">{message.text}</p>
                                    )}
                                  </div>
                                ) : message.type === 'file' ? (
                                  <div className="bg-blue-600 rounded-lg p-3 shadow-sm">
                                    <div className="flex items-center space-x-2">
                                      <Paperclip className="w-4 h-4 text-white" />
                                      <span className="text-sm text-white">{message.fileName}</span>
                                    </div>
                                    {message.text && (
                                      <p className="text-white text-sm mt-2">{message.text}</p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="bg-blue-600 rounded-lg p-3 shadow-sm">
                                    <p className="text-white text-sm">{message.text}</p>
                                  </div>
                                )}
                                <p className="text-gray-400 text-xs mt-1 mr-2">
                                  {message.timestamp}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <MessageCircle className="w-12 h-12 mb-2" />
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation with your patient</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-4 border-t border-gray-200 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <label className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <Paperclip className="w-5 h-5" />
                        <input
                          type="file"
                          hidden
                          onChange={handleFileUpload}
                          accept="*/*"
                        />
                      </label>
                      
                      <label className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <Camera className="w-5 h-5" />
                        <input
                          type="file"
                          hidden
                          onChange={handleFileUpload}
                          accept="image/*"
                        />
                      </label>

                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder={`Message ${chatAppointment.patientName}...`}
                          className="w-full bg-gray-100 text-gray-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                        />
                      </div>
                      
                      {newMessage.trim() ? (
                        <button
                          onClick={() => sendMessage('text')}
                          className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-full p-2 transition-colors"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      ) : (
                        <button className="text-gray-400 hover:text-gray-600">
                          <Mic className="w-5 h-5" />
                        </button>
                      )}
                    </div>
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