import { useState, useEffect, useRef } from "react";
import {
  User,
  Clock,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clipboard,
  
  Heart,
  FileText,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Edit3,
  Check,
  AlertCircle,
  Pill,
  Syringe,
  Thermometer,
  ClipboardCheck,
  X,
  MessageCircle,
  ArrowLeft,
  Smile,
  Mic,
  Paperclip,
  Camera,
  Send,
  Download,
} from "lucide-react";
import Navbar from "./Navbar";
import { RootState } from "@/store/redux/store";
import { useSelector } from "react-redux";
import { fetchUserProfileData } from "@/store/userSideApi/fetchUserProfile";
import { changing_UserPassWord } from "@/store/userSideApi/changing_userPassword";
import { UserfetchingAppointMents } from "@/store/userSideApi/UserfetchingAppointMents";
import Footer from "./Footer";
import { ChangingUserInfo } from "@/store/userSideApi/ChangingUserInfo";
import { CancelingUserAppointMent } from "@/store/userSideApi/CancelingUserAppointMent";
import { useSocket } from "@/context/socketContext";
import { fetchUserConversations } from "@/store/userSideApi/fetchUserConversations";
import { useNavigate } from "react-router-dom";
import { fetchingPrescription } from "@/store/DoctorSideApi/fetchingPrescription";
import { generatePrescriptionPDF } from "@/util/generatePrescriptionPDF";

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
  status?: string;
  message?: string;
  doctorEmail?: string;
  doctorId: string;
  Prescription: string;
  userId:string;
}

interface Prescription {
  prescriptionDetails: string;
  date: string;
  time: string;
  patientEmail: string;
  doctorEmail: string;
}


const UserProfileComponent = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phoneNumber: "",
  });
  const [editFormErrors, setEditFormErrors] = useState({
    name: "",
    phoneNumber: "",
  });
  const [editSuccess, setEditSuccess] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [showCallModal, setShowCallModal] = useState(false);

  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [appointmentsLimit] = useState(3); 
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(0);

  // Chat state variables
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatAppointment, setChatAppointment] = useState<Appointment | null>(
    null
  );
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [callData, setCallData] = useState(null);
  const [hasConversations, setHasConversations] = useState<
    Record<string, boolean>
  >({});
  const [pdfData, setPdfData] = useState(null);

  // Prescription view state
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState<Prescription | null>(null);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);

  const appointmentsPerPage = 1;

  const user = useSelector((state: RootState) => state.user);
  const userDataa =
    // user?.checkUserEmailAndPhone?.user ||
    user?.user ||
    user?.user || null;

  console.log("dey check Here For UserDataa", userDataa);

  const userEmail = userDataa?.email || "";
  const userIdd = userDataa._id;

  const { socket, connected } = useSocket();

  const totalAppointments = userData?.upcomingAppointments?.length || 0;
  const totalPages = Math.ceil(totalAppointments / appointmentsPerPage);

  // Get current appointments
  const currentAppointments =
    userData?.upcomingAppointments?.slice(
      (currentPage - 1) * appointmentsPerPage,
      currentPage * appointmentsPerPage
    ) || [];

  useEffect(() => {
    const addMedicalSymbols = () => {
      const symbolsContainer = document.getElementById(
        "medical-symbols-container"
      );
      if (!symbolsContainer) return;

      const symbols = [
        "⚕️",
        "+",
        "🩺",
        "💊",
        "🏥",
        "🫀",
        "🧠",
        "🦴",
        "💉",
        "🧬",
        "⚕️",
      ];
      const count = 24;

      for (let i = 0; i < count; i++) {
        const symbol = document.createElement("div");
        symbol.className = "medical-symbol";
        symbol.innerText = symbols[Math.floor(Math.random() * symbols.length)];

        // Random positions and animations
        const size = Math.random() * 22 + 14;
        const isPlus = symbol.innerText === "+";

        symbol.style.position = "absolute";
        symbol.style.fontSize = `${isPlus ? size * 2 : size}px`;
        symbol.style.color = isPlus
          ? "rgba(0, 59, 115, 0.2)"
          : "rgba(255, 255, 255, 0.2)";
        symbol.style.left = `${Math.random() * 90 + 5}%`;
        symbol.style.top = `${Math.random() * 70 + 15}%`;
        symbol.style.opacity = "0";
        symbol.style.transform = "translateY(20px) rotate(0deg)";
        symbol.style.transition = "all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
        symbol.style.animation = `float ${
          Math.random() * 8 + 12
        }s ease-in-out infinite`;
        symbol.style.animationDelay = `${Math.random() * 5}s`;
        symbol.style.zIndex = "0";

        symbolsContainer.appendChild(symbol);

        setTimeout(() => {
          symbol.style.opacity = "1";
          symbol.style.transform = `translateY(0) rotate(${
            Math.random() * 20 - 10
          }deg)`;
        }, Math.random() * 1200 + 500);
      }
    };

    addMedicalSymbols();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
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
        password: passwordData.newPassword,
      });

      if (!response) {
        setPasswordError("Failed to update password. Please try again.");
        return;
      }

      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setPasswordSuccess(false);
        setShowChangePassword(false);
      }, 3000);
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordError("An error occurred. Please try again later.");
    }
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setPasswordVisible({
      ...passwordVisible,
      [field]: !passwordVisible[field],
    });
  };

  const handleEditClick = () => {
    setShowEditModal(true);
    setEditFormData({
      name: userData?.name || "",
      phoneNumber: userData?.phoneNumber || userData?.contactNumber || "",
    });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
    setEditFormErrors({
      ...editFormErrors,
      [name]: "",
    });
  };

  const validateEditForm = () => {
    let valid = true;
    const newErrors = {
      name: "",
      phoneNumber: "",
    };

    if (!editFormData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!editFormData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
      valid = false;
    } else if (!/^\d{10,15}$/.test(editFormData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
      valid = false;
    }

    setEditFormErrors(newErrors);
    return valid;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEditForm()) return;

    try {
      setUserData((prev) => ({
        ...prev!,
        name: editFormData.name,
        phoneNumber: editFormData.phoneNumber,
        contactNumber: editFormData.phoneNumber,
      }));

      const response = await ChangingUserInfo({
        email: userEmail,
        name: editFormData.name,
        phoneNumber: editFormData.phoneNumber,
      });
      console.log("just check the responce", response);
      if (response.success == true) {
        setEditSuccess(true);
        setTimeout(() => {
          setEditSuccess(false);
          setShowEditModal(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      setEditFormErrors({
        ...editFormErrors,
        name: "Failed to update. Please try again.",
      });
    }
  };

  const callTimeoutRef = useRef(null);
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data) => {
      const incomingCallData = data.data;
      setIncomingCall(incomingCallData);
      setCallData(incomingCallData);
      setShowCallModal(true);

      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
      }

      callTimeoutRef.current = setTimeout(() => {
        setShowCallModal(false);
        setIncomingCall(null);
        setCallData(null);

        socket.emit("AppointmentCancelled", {
          AppointmentInfo: incomingCallData,
        });
      }, 60000);
    };

    socket.on("incomingConsultation", handleIncomingCall);

    return () => {
      socket.off("incomingConsultation", handleIncomingCall);

      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
      }
    };
  }, [socket]);

  const acceptCall = () => {
    if (!socket || !connected) {
      console.error("Socket is not connected");
      return;
    }

    if (callData) {
      // Prepare data to send to backend
      const callInfo = {
        appointmentId: callData.appointmentId,
        doctorId: callData.doctorId,
        patientId: callData.patientId,
        roomId: callData.roomId,
        doctorName: callData.doctorName,
      };

      console.log("Emitting userInformationForVideoCall with:", callData);
      if (callData.url) {
        window.location.href = callData.url;
      }

      setShowCallModal(false);
      setIncomingCall(null);
      setCallData(null);
    } else {
      console.error(
        "No roomId available in incoming call or call data missing"
      );
    }
  };

  // const rejectCall = () => {
  //   if (socket && incomingCall) {
  //     socket.emit("rejectConsultation", {
  //       appointmentId: incomingCall.appointmentId,
  //       doctorId: incomingCall.doctorId,
  //     });
  //     setShowCallModal(false);
  //   }
  // };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await fetchUserProfileData(userEmail);

      console.log('check this data after fecthing user profile',res);
      

      if (res.user) {
        const profile = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phoneNumber: res.user.phoneNumber || "Not provided",
          contactNumber: res.user.phoneNumber || "Not provided",
          role: res.user.role,
          isActive: res.user.isActive,
          age: 42,
          gender: "Not specified",
          bloodType: "Not specified",
          address: "Not provided",
          emergencyContact: "Not provided",
          registrationDate: "January 12, 2022",
          insuranceProvider: "HealthGuard Insurance",
          insuranceNumber: "HG-957834261",
        };

        setUserData(profile);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAppoinMents();
  }, []);

  const fetchUserAppoinMents = async () => {
    try {
      setLoading(true);

      const res = await UserfetchingAppointMents(userEmail);

      if (res.success && res.appointments) {
        const transformedAppointments = res.appointments.map((appointment) => ({
          id: appointment.id,
          date: new Date(appointment.appointmentDate).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          ),
          time: appointment.appointmentTime,
          doctor: appointment.doctorName,
          department: appointment.specialty,
          purpose: appointment.notes || "General consultation",
          status: appointment.status,
          message: appointment.message,
          doctorEmail: appointment.doctorEmail,
          doctorId: appointment.doctorId,
          Prescription: appointment.Prescription,
        }));

        setUserData((prevData) => ({
          ...(prevData || {
            id: "",
            name: "",
            email: userEmail,
            upcomingAppointments: [],
          }),
          upcomingAppointments: transformedAppointments,
        }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPrescription = async (appointment) => {
    try {
      const prescription = {
        doctorId: appointment.doctorId,
        userIdd: userIdd,
        appointmentId: appointment.id,
        date: appointment.date,
        time: appointment.time,
      };

      const res = await fetchingPrescription(prescription);
      console.log('check bro check fetchingPrescription',res);
      

      await generatePrescriptionPDF(res.data);
    } catch (error) {
      console.error("Error while downloading prescription:", error);
    }
  };


  const handleViewPrescription = async (appointment) => {
  try {
    setPrescriptionLoading(true);
    const prescription = {
      doctorId: appointment.doctorId,
      userIdd: userIdd,
      appointmentId: appointment.id,
      date: appointment.date,
      time: appointment.time,
    };

    const res = await fetchingPrescription(prescription);
    const data = res.data;

    console.log('Prescription data from backend:', data);
    
    setPrescriptionData(data);
    setShowPrescriptionModal(true);
  } catch (error) {
    console.error("Error while fetching prescription:", error);
  } finally {
    setPrescriptionLoading(false);
  }
};


  useEffect(() => {
    const fetchInitialConversations = async () => {
      if (userData?.upcomingAppointments) {
        const newHasConversations: Record<string, boolean> = {};

        for (const appointment of userData.upcomingAppointments) {
          const res = await fetchUserConversations(
            userIdd,
            appointment.doctorId
          );
          console.log('chekc this user conversation......................',res);
          

          if (res.success && res.result?.conversations?.length > 0) {
            newHasConversations[appointment.id] = true;
          }
        }

        setHasConversations(newHasConversations);
      }
    };

    fetchInitialConversations();
  }, [userData?.upcomingAppointments]);

  const fetchUserConversation = async (userId: string, doctorId: string) => {
    try {
      
      const res = await fetchUserConversations(userIdd, doctorId);

      if (res.success) {
       

        const messages = res.conversations[0].messages.map((msg) => ({
          id: msg.messageId,
          text: msg.content,
          sender: msg.senderType === "doctor" ? "doctor" : "user",
          timestamp:
            msg.timestamp ||
            new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          type: msg.messageType,
          fileUrl: msg.fileUrl,
          fileName: msg.fileUrl ? msg.fileUrl.split("/").pop() : null,
        }));

        setChatMessages(messages);
        return true;
      }
      return false; 
    } catch (error) {
      console.log("while the fething conversations", error);
      return false;
    }
  };

  const cancelAppointment = async (
    time: string,
    date: string,
    doctorEmail: string
  ) => {
    try {
      const res = await CancelingUserAppointMent(time, date, doctorEmail);
      if (res.success) {
        setShowCancelModal(false);
        setAppointmentToCancel(null);

        setSuccessMessage("Appointment cancelled successfully!");
        setShowSuccessMessage(true);

        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);

        fetchUserAppoinMents();
      } else {
        setSuccessMessage("Failed to cancel appointment. Please try again.");
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
      }
    } catch (error) {
      console.log(error);
      setSuccessMessage("An error occurred while cancelling the appointment.");
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }
  };

  const handleCancelClick = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const handleChatWithDoctor = async (appointment: Appointment) => {
    setChatAppointment(appointment);
    setShowChatModal(true);

    const hasPreviousMessages = await fetchUserConversation(
      appointment.id,
      appointment.doctorId
    );

    if (!hasPreviousMessages) {
      setChatMessages([
        {
          id: 1,
          text: "Hello! I'm here to help with any questions about your upcoming appointment.",
          sender: "doctor",
          timestamp: "Jun 4, 2025, 10:37 AM",
          unavailable: true,
        },
      ]);
    }
  };

  const sendMessage = (messageType = "text", content = null) => {
    if (messageType === "text" && !newMessage.trim()) return;

    const message = {
      id: Date.now(),
      type: messageType,
      text: messageType === "text" ? newMessage : "",
      content: content,
      fileName: content?.name || null,
      fileSize: content?.size || null,
      sender: "user",
      timestamp: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      unavailable: false,
    };

    const updatedMessages = [...chatMessages, message];
    setChatMessages(updatedMessages);

    if (messageType === "text") {
      setNewMessage("");
    }

    console.log("Sending messages to backend:", message);

    sendMessageToBackend(message);
  };

  useEffect(() => {
    if (!socket || !connected) return;

    const handleReceiveMessage = (messageData: any) => {
      if (messageData.type === "msgReceive" && messageData.data) {
        const data = messageData.data;

        const newMessage = {
          id: Date.now(),
          text: data.text || "",
          sender: data.sender === "doctor" ? "doctor" : "user",
          timestamp:
            data.timestamp ||
            new Date().toLocaleString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
          unavailable: false,

          type: data.type || "text",
          fileUrl: data.fileUrl || null,
          fileName: data.fileName || null,
          fileSize: data.fileSize || null,
          mimeType: data.mimeType || null,
          fileContent: data.fileContent || null,
        };

        setChatMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("receive", handleReceiveMessage);

    return () => {
      socket.off("receive", handleReceiveMessage);
    };
  }, [socket, connected]);

  const sendMessageToBackend = async (message) => {
    try {
      interface MessageData {
        type: string;
        text: string;
        sender: string;
        senderId: string;
        timestamp: string;
        appointmentId: string;
        fileContent?: any;
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
        receverId?: string;
      }

      const messageData: MessageData = {
        type: message.type,
        text: message.text,
        sender: message.sender,
        senderId: chatAppointment.userId||"",
        timestamp: message.timestamp,
        appointmentId: chatAppointment?.id || "",
        receverId: chatAppointment.doctorId,
      };

      if (
        message.content &&
        (message.type === "image" ||
          message.type === "voice" ||
          message.type === "file")
      ) {
        if (
          message.content instanceof File ||
          message.content instanceof Blob
        ) {
          const base64 = await convertToBase64(message.content);
          messageData.fileContent = base64;
          messageData.fileName = message.fileName;
          messageData.fileSize = message.fileSize;
          messageData.mimeType = message.content.type;
        } else {
          messageData.fileContent = message.content;
          messageData.fileName = message.fileName;
          messageData.fileSize = message.fileSize;
        }
      }

      console.log("Message data to emit:", messageData);

      socket.emit("sendMessage", messageData);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleTextMessage = () => {
    sendMessage("text");
  };

  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      sendMessage("image", file);
    }
  };

  const handleVoiceMessage = (audioBlob) => {
    sendMessage("voice", audioBlob);
  };


  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      sendMessage("file", file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading your medical profile...
          </p>
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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Profile Unavailable
          </h2>
          <p className="text-gray-600 mb-6">
            We're unable to load your medical profile at this time.
          </p>
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
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen relative overflow-hidden">
      <div
        id="medical-symbols-container"
        className="fixed inset-0 pointer-events-none z-0"
      ></div>

      <Navbar />

      <div className="max-w-6xl mx-auto p-6 mt-[90px] relative z-10">
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden border border-blue-100">
          <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-6 text-white relative">
            <div className="absolute top-0 right-0 bg-white text-blue-800 text-xs font-bold px-3 py-1 rounded-bl-lg shadow-md">
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
                <div className="absolute -bottom-2 -right-2 bg-blue-600 p-1 rounded-full shadow-md">
                  <Check className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="mt-4 md:mt-0 md:ml-8 text-center md:text-left">
                <h1 className="text-3xl font-bold">{userData.name}</h1>
                <div className="flex flex-wrap gap-3 mt-3 text-xs justify-center md:justify-start">
                  <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1 backdrop-blur-sm">
                    <Clipboard className="w-3 h-3 mr-1" />
                    <span>ID: {userData.id.substring(0, 8)}</span>
                  </div>
                  <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1 backdrop-blur-sm">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Age: {userData.age || "N/A"}</span>
                  </div>
                  <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1 backdrop-blur-sm">
                    <User className="w-3 h-3 mr-1" />
                    <span>{userData.gender || "Not specified"}</span>
                  </div>
                  <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1 backdrop-blur-sm">
                    <Heart className="w-3 h-3 mr-1" />
                    <span>Blood: {userData.bloodType || "Not specified"}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  <button className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs px-3 py-1 rounded-full transition-all border border-white border-opacity-30">
                    <ClipboardCheck className="w-3 h-3 mr-1" />
                    Request Records
                  </button>
                  <button className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs px-3 py-1 rounded-full transition-all border border-white border-opacity-30">
                    <Phone className="w-3 h-3 mr-1" />
                    Contact Doctor
                  </button>
                  <button
                    className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs px-3 py-1 rounded-full transition-all border border-white border-opacity-30"
                    onClick={handleEditClick}
                  >
                    <Pill className="w-3 h-3 mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

       
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    Edit Profile Information
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditFormChange}
                        className={`w-full px-4 py-2 border ${
                          editFormErrors.name
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm`}
                        placeholder="Enter your full name"
                      />
                      {editFormErrors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {editFormErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="phoneNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={editFormData.phoneNumber}
                        onChange={handleEditFormChange}
                        className={`w-full px-4 py-2 border ${
                          editFormErrors.phoneNumber
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm`}
                        placeholder="Enter your phone number"
                      />
                      {editFormErrors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {editFormErrors.phoneNumber}
                        </p>
                      )}
                    </div>

                    {editSuccess && (
                      <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">
                        <div className="flex items-center">
                          <Check className="w-4 h-4 mr-2" />
                          Profile updated successfully!
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showSuccessMessage && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center max-w-sm">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">{successMessage}</span>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="ml-3 text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

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

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
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
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Full Name</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {userData.name || "Not provided"}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center text-gray-600 mb-2">
                      <Phone className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">
                        Contact Number
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {userData.phoneNumber || "Not provided"}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center text-gray-600 mb-2">
                      <Mail className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Email Address</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {userData.email || "Not provided"}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Address</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {userData.address || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center text-gray-600 mb-2">
                      <Phone className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">
                        Emergency Contact
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {userData.emergencyContact || "Not provided"}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">
                        Registration Date
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {userData.registrationDate || "Not provided"}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center text-gray-600 mb-2">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">User Role</span>
                    </div>
                    <p className="text-gray-900 font-medium capitalize">
                      {userData.role || "Not specified"}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center text-gray-600 mb-2">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          userData.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-sm font-medium">
                        Account Status
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {userData.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showSuccessMessage && (
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div
                id="success-animation"
                className="bg-blue-600 text-white px-8 py-6 rounded-xl shadow-2xl flex flex-col items-center justify-center transform transition-all duration-300"
              >
                {/* Checkmark circle */}
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-10 h-10 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>

                <span className="text-lg font-semibold">{successMessage}</span>

                {/* Progress bar */}
                <div className="w-full bg-white bg-opacity-30 h-1 mt-4 rounded-full overflow-hidden">
                  <div
                    className="bg-white h-full animate-progress"
                    style={{ animationDuration: "3s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

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
                  {userData.medicalHistory &&
                  userData.medicalHistory.length > 0 ? (
                    userData.medicalHistory.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start bg-white p-3 rounded-lg border border-blue-100 hover:shadow-sm transition-shadow"
                      >
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

                <div className="mt-6 bg-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800">
                        Medical Records Notice
                      </h4>
                      <p className="mt-1 text-blue-700 text-sm">
                        To add or update your medical history records, please
                        visit the hospital or contact your physician.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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

              {currentAppointments.some((a) => a.status === "completed") && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Completed Appointments
                  </h3>
                  <div className="space-y-4">
                    {currentAppointments
                      .filter(
                        (appointment) => appointment.status === "completed"
                      )
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="border border-gray-200 bg-green-50 rounded-xl p-5"
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                              <h3 className="font-bold text-lg text-gray-700">
                                {appointment.purpose}
                              </h3>
                              <p className="text-gray-600 mt-1">
                                <span className="text-green-700 font-medium">
                                  {appointment.doctor}
                                </span>{" "}
                                • {appointment.department}
                              </p>

                              {appointment.message && (
                                <p className="text-sm text-gray-500 mt-2 italic">
                                  📝 {appointment.message}
                                </p>
                              )}

                              {/* Prescription Ready Indicator */}
                              {appointment?.Prescription === "done" && (
                                <div className="mt-2 inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  Prescription Ready
                                </div>
                              )}
                            </div>
                            <div className="mt-3 md:mt-0 md:text-right">
                              <div className="inline-flex items-center bg-white border border-green-200 text-gray-600 rounded-lg px-4 py-2 font-medium">
                                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="line-through">
                                  {appointment.time}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center text-gray-600 bg-white p-3 rounded-lg border border-green-100">
                            <Calendar className="w-5 h-5 mr-2 text-green-600" />
                            <span className="font-medium">
                              {appointment.date}
                            </span>
                            <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Completed
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              onClick={() => handleChatWithDoctor(appointment)}
                              className="text-sm font-medium px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors shadow-sm flex items-center"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Chat with Doctor
                            </button>

                            {/* Download Prescription Button - Only show when prescription is done */}
                            {appointment?.Prescription === "done" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleDownloadPrescription(appointment)
                                  }
                                  className="text-sm font-medium px-4 py-2 bg-green-600 hover:bg-green-700 text-white border border-green-600 rounded-lg transition-colors shadow-sm flex items-center"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Download Prescription
                                </button>
                                <button
                                  onClick={() =>
                                    handleViewPrescription(appointment)
                                  }
                                  className="text-sm font-medium px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded-lg transition-colors shadow-sm flex items-center"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View 
                                </button>
                              </>
                            )}

                        
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            
              {currentAppointments.some((a) => a.status === "cancelled") && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Cancelled Appointments
                  </h3>
                  <div className="space-y-4">
                    {currentAppointments
                      .filter(
                        (appointment) => appointment.status === "cancelled"
                      )
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="border border-gray-200 bg-gray-50 rounded-xl p-5"
                        >
                          <div className="flex flex-col md:flex-Row justify-between items-start md:items-center">
                            <div>
                              <h3 className="font-bold text-lg text-gray-600 line-through">
                                {appointment.purpose}
                              </h3>
                              <p className="text-gray-500 mt-1">
                                <span className="text-gray-600 font-medium">
                                  {appointment.doctor}
                                </span>{" "}
                                • {appointment.department}
                              </p>

                              {appointment.message && (
                                <p className="text-sm text-gray-500 mt-2 italic">
                                  📝 {appointment.message}
                                </p>
                              )}
                            </div>
                            <div className="mt-3 md:mt-0 md:text-right">
                              <div className="inline-flex items-center bg-gray-100 border border-gray-200 text-gray-600 rounded-lg px-4 py-2 font-medium">
                                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="line-through">
                                  {appointment.time}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center text-gray-500 bg-gray-100 p-3 rounded-lg border border-gray-200">
                            <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                            <span className="font-medium">
                              {appointment.date}
                            </span>
                            <span className="ml-4 px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                              Cancelled
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Active Appointments Section */}
              <div className="space-y-5">
                {currentAppointments.filter(
                  (a) => a.status !== "cancelled" && a.status !== "completed"
                ).length > 0
                  ? currentAppointments
                      .filter(
                        (appointment) =>
                          appointment.status !== "cancelled" &&
                          appointment.status !== "completed"
                      )
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 hover:shadow-md transition-all"
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                              <h3 className="font-bold text-lg text-gray-800">
                                {appointment.purpose}
                              </h3>
                              <p className="text-gray-600 mt-1">
                                <span className="text-blue-700 font-medium">
                                  {appointment.doctor}
                                </span>{" "}
                                • {appointment.department}
                              </p>
                              {appointment.message && (
                                <p className="text-sm text-gray-500 mt-2 italic">
                                  📝 {appointment.message}
                                </p>
                              )}
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
                            <span className="font-medium">
                              {appointment.date}
                            </span>
                            {appointment.status === "confirmed" && (
                              <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                Confirmed
                              </span>
                            )}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              onClick={() => handleCancelClick(appointment)}
                              className="text-sm font-medium px-4 py-2 bg-white text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors shadow-sm"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleChatWithDoctor(appointment)}
                              className="text-sm font-medium px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors shadow-sm flex items-center"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Chat with Doctor
                            </button>
                          </div>
                        </div>
                      ))
                  : !currentAppointments.some(
                      (a) =>
                        a.status === "cancelled" || a.status === "completed"
                    ) && (
                      <div className="text-center p-8 bg-blue-50 rounded-lg border border-blue-100">
                        <Calendar className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">
                          No Upcoming Appointments
                        </h3>
                        <p className="text-gray-500 mb-4">
                          You don't have any scheduled appointments at this
                          time.
                        </p>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                          Schedule Your First Appointment
                        </button>
                      </div>
                    )}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (number) => (
                        <button
                          key={number}
                          onClick={() => setCurrentPage(number)}
                          className={`px-3 py-2 border-t border-b border-gray-300 text-sm font-medium ${
                            currentPage === number
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {number}
                        </button>
                      )
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}

              <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Appointment Instructions
                </h3>
                <p className="text-gray-600 text-sm">
                  Please arrive 15 minutes before your scheduled time. Bring
                  your insurance card, photo ID, and any relevant medical
                  records. Fasting may be required for some tests.
                </p>
              </div>

              {/* Cancel Confirmation Modal */}
              {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Cancel Appointment
                      </h3>
                      <button
                        onClick={() => setShowCancelModal(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {appointmentToCancel && (
                      <div className="mb-6">
                        <p className="text-gray-600 mb-4">
                          Are you sure you want to cancel your appointment?
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 border">
                          <p className="font-medium text-gray-800">
                            {appointmentToCancel.purpose}
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            <span className="font-medium">
                              {appointmentToCancel.doctor}
                            </span>{" "}
                            • {appointmentToCancel.department}
                          </p>
                          <p className="text-gray-600 text-sm mt-2">
                            📅 {appointmentToCancel.date} at{" "}
                            {appointmentToCancel.time}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setShowCancelModal(false)}
                        className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Keep Appointment
                      </button>
                      <button
                        onClick={() =>
                          cancelAppointment(
                            appointmentToCancel.time,
                            appointmentToCancel.date,
                            appointmentToCancel.doctorEmail ||
                              appointmentToCancel.doctor
                          )
                        }
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        Yes, Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
                        <label
                          htmlFor="currentPassword"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={passwordVisible.current ? "text" : "password"}
                            id="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                currentPassword: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => togglePasswordVisibility("current")}
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
                        <label
                          htmlFor="newPassword"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={passwordVisible.new ? "text" : "password"}
                            id="newPassword"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => togglePasswordVisibility("new")}
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
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={passwordVisible.confirm ? "text" : "password"}
                            id="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => togglePasswordVisibility("confirm")}
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
                      <h3 className="text-lg font-medium text-gray-800">
                        Account Security Status
                      </h3>
                      <p className="mt-1 text-gray-600">
                        Your account is secured with industry-standard
                        encryption. For optimal security, we recommend changing
                        your password every 90 days and enabling two-factor
                        authentication.
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

        {/* Prescription View Modal */}
       {showPrescriptionModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Prescription Details
          </h3>
          <button
            onClick={() => {
              setShowPrescriptionModal(false);
              setPrescriptionData(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {prescriptionLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600">Loading prescription...</span>
          </div>
        ) : prescriptionData ? (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2">Appointment Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">
                    {new Date(prescriptionData.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-medium">{prescriptionData.time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Doctor Email</p>
                  <p className="font-medium">{prescriptionData.doctorEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Patient Email</p>
                  <p className="font-medium">{prescriptionData.patientEmail}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2">Prescription Details</h4>
              <div className="bg-white p-4 rounded border border-blue-200">
                <p className="whitespace-pre-wrap">{prescriptionData.prescriptionDetails}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No prescription data available.</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}

        {showChatModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-end pr-4">
            <div className="w-full max-w-md h-[70vh] max-h-[600px] min-h-[400px]">
              <div className="bg-white h-full shadow-xl flex flex-col rounded-lg overflow-hidden">
                {/* Chat Header */}
                <div className="bg-blue-600 p-4 flex items-start justify-between flex-shrink-0">
                  <div className="flex items-center">
                    <button
                      onClick={() => setShowChatModal(false)}
                      className="text-white hover:text-blue-200 mr-3 -mt-1"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        {chatAppointment?.doctor || "Dr. Smith"}
                      </h3>
                      <p className="text-blue-200 text-xs">
                        {chatAppointment?.department || "General Medicine"}
                      </p>
                      <p className="text-blue-100 text-xs mt-1">
                        {chatAppointment?.date &&
                          `Appointment: ${chatAppointment.date} at ${chatAppointment.time}`}
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

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                  {chatMessages.length > 0 ? (
                    chatMessages.map((message) => (
                      <div key={message.id} className="flex flex-col">
                        {message.sender === "doctor" ? (
                          <div className="flex items-start">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              {message.unavailable ? (
                                <div className="bg-blue-50 rounded-lg p-3 max-w-xs">
                                  <p className="text-blue-800 font-medium text-sm mb-1">
                                    Message unavailable
                                  </p>
                                  <p className="text-blue-600 text-xs">
                                    This content may have been deleted by its
                                    owner or hidden by their privacy settings.
                                  </p>
                                </div>
                              ) : (
                                <div className="bg-blue-50 rounded-lg p-3 max-w-xs">
                                  {/* Handle different message types */}
                                  {message.type === "image" ? (
                                    <div className="space-y-2">
                                      <div className="relative">
                                        <img
                                          src={
                                            message.fileUrl ||
                                            message.fileContent
                                          }
                                          alt={
                                            message.fileName || "Received image"
                                          }
                                          className="max-w-full h-auto rounded max-h-48 object-contain"
                                        />
                                      </div>
                                      {message.text && (
                                        <p className="text-blue-800 text-sm">
                                          {message.text}
                                        </p>
                                      )}
                                    </div>
                                  ) : message.type === "file" ? (
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2 bg-white rounded-lg p-2 border border-blue-200">
                                        <Paperclip className="w-4 h-4 text-blue-600" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-blue-800 text-sm font-medium truncate">
                                            {message.fileName || "File"}
                                          </p>
                                          {message.fileSize && (
                                            <p className="text-blue-600 text-xs">
                                              {(
                                                message.fileSize / 1024
                                              ).toFixed(1)}{" "}
                                              KB
                                            </p>
                                          )}
                                        </div>
                                        <button
                                          onClick={() => {
                                            if (message.fileUrl) {
                                              window.open(
                                                message.fileUrl,
                                                "_blank"
                                              );
                                            }
                                          }}
                                          className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded bg-blue-100"
                                        >
                                          Open
                                        </button>
                                      </div>
                                      {message.text && (
                                        <p className="text-blue-800 text-sm">
                                          {message.text}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    // Regular text message
                                    <p className="text-blue-800 text-sm">
                                      {message.text}
                                    </p>
                                  )}
                                </div>
                              )}
                              <p className="text-blue-400 text-xs mt-1 text-center">
                                {message.timestamp}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <div className="flex flex-col items-end max-w-xs">
                              <div className="bg-blue-600 rounded-lg p-3">
                                {/* Handle different message types for user messages */}
                                {message.type === "image" ? (
                                  <div className="space-y-2">
                                    <div className="relative">
                                      <img
                                        src={
                                          message.fileContent || message.fileUrl
                                        }
                                        alt={message.fileName || "Shared image"}
                                        className="w-full h-auto rounded-lg max-w-[250px] cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => {
                                          window.open(
                                            message.fileContent ||
                                              message.fileUrl,
                                            "_blank"
                                          );
                                        }}
                                      />
                                      {message.fileName && (
                                        <p className="text-blue-100 text-xs mt-1 truncate">
                                          {message.fileName}
                                        </p>
                                      )}
                                    </div>
                                    {message.text && (
                                      <p className="text-white text-sm">
                                        {message.text}
                                      </p>
                                    )}
                                  </div>
                                ) : message.type === "file" ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2 bg-blue-700 rounded-lg p-2">
                                      <Paperclip className="w-4 h-4 text-white" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">
                                          {message.fileName || "File"}
                                        </p>
                                        {message.fileSize && (
                                          <p className="text-blue-100 text-xs">
                                            {(message.fileSize / 1024).toFixed(
                                              1
                                            )}{" "}
                                            KB
                                          </p>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => {
                                          if (message.fileUrl) {
                                            window.open(
                                              message.fileUrl,
                                              "_blank"
                                            );
                                          }
                                        }}
                                        className="text-white hover:text-blue-100 text-xs px-2 py-1 rounded bg-blue-500"
                                      >
                                        {message.fileUrl ? "Open" : "Open"}
                                      </button>
                                    </div>
                                    {message.text && (
                                      <p className="text-white text-sm">
                                        {message.text}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  // Regular text message
                                  <p className="text-white text-sm">
                                    {message.text}
                                  </p>
                                )}
                              </div>
                              <p className="text-blue-400 text-xs mt-1">
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
                      <p className="text-sm">
                        Start the conversation with your doctor
                      </p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="bg-white p-4 border-t border-blue-100 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-400 hover:text-blue-600">
                      <Smile className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleTextMessage()
                        }
                        placeholder="Type your message..."
                        className="w-full bg-blue-50 text-blue-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      className="text-blue-400 hover:text-blue-600"
                      // onClick={startVoiceRecording}
                    >
                      <Mic className="w-5 h-5" />
                    </button>

                    {/* File Upload */}
                    <label className="text-blue-400 hover:text-blue-600 cursor-pointer">
                      <Paperclip className="w-5 h-5" />
                      <input
                        type="file"
                        hidden
                        onChange={handleFileUpload}
                        accept="*/*"
                      />
                    </label>

                    {/* Image Upload */}
                    <label className="text-blue-400 hover:text-blue-600 cursor-pointer">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        hidden
                        onChange={handleImageUpload}
                        accept="image/*"
                      />
                    </label>

                    {newMessage.trim() ? (
                      <button
                        onClick={handleTextMessage}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    ) : (
                      <button className="text-blue-400 hover:text-blue-600">
                        <Smile className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCallModal && incomingCall && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Phone className="w-8 h-8 text-blue-600" />
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Incoming Video Consultation
                </h3>

                <p className="text-gray-600 mb-1">
                  Dr. {incomingCall.doctorName} is calling...
                </p>

                <p className="text-sm text-gray-500 mb-6">
                  Appointment: {incomingCall.appointmentId}
                </p>

                <div className="flex gap-4 w-full">
                  <button
                    onClick={acceptCall}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Accept
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

<style>
  {`
    /* Slide in animation */
    @keyframes slide-in-right {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    /* Floating animation for medical symbols */
    @keyframes float {
      0% {
        transform: translateY(0) rotate(0deg);
      }
      50% {
        transform: translateY(-20px) rotate(5deg);
      }
      100% {
        transform: translateY(0) rotate(0deg);
      }
    }

    /* Success animation components */
    @keyframes fade-in-up {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes circle {
      0% {
        stroke-dashoffset: 157;
      }
      50% {
        stroke-dasharray: 157;
        stroke-dashoffset: 0;
      }
      100% {
        stroke-dasharray: 157;
      }
    }

    @keyframes check {
      0% {
        stroke-dashoffset: 36;
      }
      50% {
        stroke-dasharray: 36;
        stroke-dashoffset: 0;
      }
      100% {
        stroke-dasharray: 36;
      }
    }

    @keyframes progress {
      from {
        width: 0%;
      }
      to {
        width: 100%;
      }
    }

    @keyframes pulse {
      0%,
      100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    /* Animation classes */
    .animate-slide-in-right {
      animation: slide-in-right 0.3s ease-out forwards;
    }

    .medical-symbol {
      animation: float 8s ease-in-out infinite;
    }

    .animate-fade-in-up {
      animation: fade-in-up 0.4s ease-out forwards;
    }

    .animate-circle {
      stroke-dasharray: 157;
      stroke-dashoffset: 157;
      animation: circle 1s cubic-bezier(0.77, 0, 0.175, 1) forwards;
    }

    .animate-check {
      stroke-dasharray: 36;
      stroke-dashoffset: 36;
      animation: check 0.5s cubic-bezier(0.77, 0, 0.175, 1) 0.5s forwards;
    }

    .animate-progress {
      animation: progress linear forwards;
    }

    .animate-pulse {
      animation: pulse 1s ease-in-out;
    }

    /* Success notification specific animations */
    .success-notification {
      animation: fade-in-up 0.4s ease-out forwards;
    }

    .success-checkmark-circle {
      stroke-dasharray: 157;
      stroke-dashoffset: 157;
      animation: circle 1s cubic-bezier(0.77, 0, 0.175, 1) forwards;
    }

    .success-checkmark {
      stroke-dasharray: 36;
      stroke-dashoffset: 36;
      animation: check 0.5s cubic-bezier(0.77, 0, 0.175, 1) 0.5s forwards;
    }

    .success-progress-bar {
      animation: progress 3s linear forwards;
    }
  `}
</style>

export default UserProfileComponent;