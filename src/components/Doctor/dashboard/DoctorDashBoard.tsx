import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/redux/store";
import { fetchDoctorDashBoardDatas } from "@/store/redux/slices/DoctorSlice";
import { fectingAllUserAppointMents } from "@/store/DoctorSideApi/fectingFullUserAppointMents";
import { useNavigate } from "react-router-dom";
import { AddPrescription } from "@/store/DoctorSideApi/addPrescription";
import StatusCard from "../components/StatusCard";
import EnhancedAppointmentCard from "./EnhancedAppointmentCard";
import { useSocket } from "@/context/socketContext";
import { changeDoctorInfo } from "@/store/DoctorSideApi/changeDoctorInfo";
import { AxiosResponse } from "axios";

const defaultAvatar =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

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
  id: string;
  userId: string;
  Prescription?: any;
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

interface DoctorFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  specialty: string;
  licenseNumber: string;
  medicalLicenseNumber: string;
  qualifications: string;
  profileImageUrl: string;
  profileImage: string;
  medicalLicenseUrl: string;
  [key: string]: any;
}

interface FormErrors {
  firstName?: string;
  email?: string;
  specialty?: string;
  licenseNumber?: string;
  phoneNumber?: string;
  medicalLicenseNumber?: string;
  form?: string;
  profileImage?: string;
  [key: string]: string | undefined;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

const DoctorDashBoard: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email || "";
  const dispatch: AppDispatch = useDispatch();
  const { socket, connected } = useSocket();

  const doctor = useSelector((state: RootState) => state.doctor.data);
  const doctorEmail = doctor?.email;

  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [previousAppointments, setPreviousAppointments] = useState<
    AppointmentData[]
  >([]);
  const [availableTimes, setAvailableTimes] = useState<AvailableTimeData[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalPatients: 0,
    newPatientsThisWeek: 0,
    newPatientsTrend: 0,
    totalPatientsTrend: 0,
  });
  const [beepingAppointments, setBeepingAppointments] = useState<Set<string>>(
    new Set()
  );
  const [beepingTimers, setBeepingTimers] = useState<
    Map<string, NodeJS.Timeout>
  >(new Map());
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentData | null>(null);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [doctorFormData, setDoctorFormData] = useState<DoctorFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    specialty: "",
    licenseNumber: "",
    medicalLicenseNumber: "",
    qualifications: "",
    profileImageUrl: "",
    profileImage: "",
    medicalLicenseUrl: "",
  });
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const itemsPerPage = 5;

  const currentHour = new Date().getHours();
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon";
  } else if (currentHour >= 18) {
    greeting = "Good evening";
  }

  const getTodayDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const shortenUrl = (url: string): string => {
    if (!url) return "";
    
    try {
      const urlObj = new URL(url);
      
      if (urlObj.hostname.includes('s3') && urlObj.hostname.includes('amazonaws.com')) {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        const filename = pathParts[pathParts.length - 1] || 'document';
        return `S3://${filename}`;
      }
      
      const domain = urlObj.hostname;
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || 'document';
      
      return `${domain.replace('www.', '')}/${filename.length > 20 ? 
        filename.substring(0, 20) + '...' : filename}`;
    } catch {
      if (url.length > 30) {
        return url.substring(0, 30) + '...';
      }
      return url;
    }
  };

  const normalizeDoctorName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/^dr\.?\s*/i, "")
      .trim();
  };

  const filterTodayAppointmentsForCurrentDoctor = (appointmentsList: any[]) => {
    const todayDate = getTodayDate();
    const currentDoctorName = doctor
      ? `${doctor.firstName} ${(doctor as any).lastName || ""}`.trim()
      : "";

    return appointmentsList.filter((appointment: any) => {
      const isToday = appointment.appointmentDate === todayDate;
      const appointmentDoctorName = normalizeDoctorName(
        appointment.doctorName || ""
      );
      const currentDoctorNameNormalized =
        normalizeDoctorName(currentDoctorName);
      return isToday && appointmentDoctorName === currentDoctorNameNormalized;
    });
  };

  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const startBeeping = (appointmentId: string) => {
    setBeepingAppointments((prev) => new Set(prev).add(appointmentId));
    const timer = setTimeout(() => stopBeeping(appointmentId), 60000);
    setBeepingTimers((prev) => new Map(prev).set(appointmentId, timer));
  };

  const stopBeeping = (appointmentId: string) => {
    setBeepingAppointments((prev) => {
      const newSet = new Set(prev);
      newSet.delete(appointmentId);
      return newSet;
    });
    const timer = beepingTimers.get(appointmentId);
    if (timer) {
      clearTimeout(timer);
      setBeepingTimers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(appointmentId);
        return newMap;
      });
    }
  };

  const handleStartButtonClick = (appointment: AppointmentData) => {
    stopBeeping(appointment.id || "");
    const roomId = `consultation_${doctor?.id}_${appointment.id}_${Date.now()}`;
    if (socket) {
      socket.emit("initiateConsultation", {
        appointmentId: appointment.id,
        patientId: appointment.userId,
        url: `https://healnova.fun/Video-call/${roomId}`,
        doctorId: doctor?.id,
        doctorName: `${doctor?.firstName} ${"doctor"}`,
      });
    }
    navigate(`/Video-call/${roomId}`);
  };

  const handleAddPrescriptionClick = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setIsPrescriptionModalOpen(true);
  };

  const handleSubmitPrescription = async () => {
    try {
      if (!selectedAppointment || !doctor) return;

      const prescriptionData = {
        doctorId: doctor.id,
        patientId: selectedAppointment.userId,
        appointmentId: selectedAppointment.id,
        prescriptionDetails: prescriptionText,
        date: new Date().toISOString(),
        time: selectedAppointment.startTime,
      };

      const response = await AddPrescription(prescriptionData);
      if (response.data?.success) {
        setIsPrescriptionModalOpen(false);
        setPrescriptionText("");
        fetchUserFullAppointments();
      }
    } catch (error) {
      console.error("Failed to submit prescription:", error);
      alert("Failed to submit prescription. Please try again.");
    }
  };

  const handleOpenEditModal = () => {
    if (doctor) {
      const profileImage = (doctor as any).profileImageUrl || (doctor as any).profileImage || "";
      setDoctorFormData({
        firstName: doctor.firstName || "",
        lastName: (doctor as any).lastName || "",
        email: doctor.email || "",
        phoneNumber: doctor.phoneNumber || "",
        specialty: (doctor as any).specialty || "",
        licenseNumber: (doctor as any).licenseNumber || "",
        medicalLicenseNumber: (doctor as any).medicalLicenseNumber || "",
        qualifications: (doctor as any).qualifications || "",
        profileImageUrl: profileImage,
        profileImage: profileImage,
        medicalLicenseUrl: (doctor as any).medicalLicenseUrl || "",
      });
      setProfileImagePreview(profileImage || defaultAvatar);
      setProfileImageFile(null);
      setFormErrors({});
    }
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setProfileImageFile(null);
    setFormErrors({});
  };

  const handleDoctorFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDoctorFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({
          ...prev,
          profileImage: "File size should be less than 5MB",
        }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setFormErrors((prev) => ({
          ...prev,
          profileImage: "Please select an image file (JPG, PNG, GIF)",
        }));
        return;
      }

      setProfileImageFile(file);
      
      setFormErrors((prev) => ({
        ...prev,
        profileImage: undefined,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfileImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview(defaultAvatar);
    setDoctorFormData((prev) => ({
      ...prev,
      profileImage: "",
      profileImageUrl: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!doctorFormData.firstName.trim()) {
      errors.firstName = "First name is required";
      isValid = false;
    }

    if (!doctorFormData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(doctorFormData.email)) {
      errors.email = "Email is invalid";
      isValid = false;
    }

    if (!doctorFormData.specialty.trim()) {
      errors.specialty = "Specialty is required";
      isValid = false;
    }

    if (!doctorFormData.licenseNumber.trim()) {
      errors.licenseNumber = "License number is required";
      isValid = false;
    }

    if (doctorFormData.phoneNumber && !/^[+]?[\d\s\-()]+$/.test(doctorFormData.phoneNumber)) {
      errors.phoneNumber = "Phone number is invalid";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmitDoctorInfo = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      Object.keys(doctorFormData).forEach(key => {
        if (key === 'profileImage' && profileImageFile) {
          return; 
        }
        formData.append(key, doctorFormData[key]);
      });

      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      } else if (!doctorFormData.profileImageUrl) {
        formData.append('profileImage', '');
      }

      if (doctor?.id) {
        formData.append('doctorId', doctor.id);
      }

      const response: AxiosResponse<ApiResponse> = await changeDoctorInfo(formData);
      
      if (response.data.success) {
        handleCloseEditModal();
        
        if (doctor?.email) {
          await fetchDoctorData(doctor.email);
        }
        
        await fetchUserFullAppointments();
      } else {
        throw new Error(response.data.message || "Failed to update doctor information");
      }
    } catch (error: any) {
      console.error("Failed to update doctor information:", error);
      setFormErrors((prev) => ({
        ...prev,
        form: error.message || "Failed to update doctor information. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (email) {
      fetchDoctorData(email);
    } else if (doctor?.email) {
      fetchDoctorData(doctor.email);
    }
  }, [email, doctor?.email]);

  const fetchDoctorData = async (email: string) => {
    try {
      setLoading(true);
      await dispatch(fetchDoctorDashBoardDatas(email));

      setAvailableTimes([
        {
          title: "Regular Checkup",
          day: "Tomorrow",
          time: "9:00 AM - 10:00 AM",
        },
        { title: "Consultation", day: "Thursday", time: "2:00 PM - 3:00 PM" },
      ]);
      setStats({
        totalPatients: 157,
        newPatientsThisWeek: 8,
        totalPatientsTrend: 12,
        newPatientsTrend: 5,
      });
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
      const response = await fectingAllUserAppointMents(
        doctorEmail || "",
        1,
        500
      );

      if (response?.appointments) {
        const todayDoctorAppointments = filterTodayAppointmentsForCurrentDoctor(
          response.appointments
        );
        const formattedAppointments: AppointmentData[] =
          todayDoctorAppointments.map((appointment: any) => ({
            id: appointment._id || appointment.id,
            patientName: appointment.patientName,
            startTime: appointment.appointmentTime,
            endTime: "",
            patientAvatar: defaultAvatar,
            appointmentDate: appointment.appointmentDate,
            notes: appointment.notes,
            patientPhone: appointment.patientPhone,
            specialty: appointment.specialty,
            status: appointment.status || "scheduled",
            userId: appointment.userId,
            Prescription: appointment.Prescription,
          }));

        setPreviousAppointments(appointments);
        setAppointments(formattedAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to fetch appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctor) {
      fetchUserFullAppointments();
    }
  }, [doctor]);

  useEffect(() => {
    if (socket && connected) {
      const handleDoctorAlert = (response: any) => {
        if (response.type === "appointment_update") {
          const appointmentId =
            response.data._id ||
            `${response.data.patientName}_${response.data.appointmentTime}`;
          startBeeping(appointmentId);
          setAppointments((prevAppointments) => {
            const existingAppointment = prevAppointments.find(
              (a) => a.id === appointmentId
            );
            if (existingAppointment) {
              return prevAppointments.map((appointment) =>
                appointment.id === appointmentId
                  ? {
                      ...appointment,
                      status: response.data.status || appointment.status,
                    }
                  : appointment
              );
            }
            return [
              ...prevAppointments,
              {
                id: appointmentId,
                patientName: response.data.patientName,
                startTime: response.data.appointmentTime,
                endTime: "",
                patientAvatar: defaultAvatar,
                status: response.data.status || "scheduled",
                userId: response.data.userId || "",
              },
            ];
          });
        }
      };

      socket.on("doctor_alert", handleDoctorAlert);
      return () => {
        socket.off("doctor_alert", handleDoctorAlert);
      };
    }
  }, [socket, connected]);

  useEffect(() => {
    return () => {
      beepingTimers.forEach((timer) => clearTimeout(timer));
    };
  }, [beepingTimers]);

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
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => (window.location.href = "/login")}
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
          <svg
            className="w-16 h-16 text-yellow-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h2 className="text-xl font-bold mb-2">Doctor Data Not Found</h2>
          <p className="text-gray-600 mb-4">
            Unable to retrieve doctor information. Please try again later.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const doctorName = `${doctor.firstName || ""}`.trim();
  const firstName = doctor.firstName || "";

  const totalPages = Math.ceil(appointments.length / itemsPerPage);
  const currentAppointments = appointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar doctorName={doctorName} />
      <div className="flex-1 overflow-y-auto">
        <main className="max-w-4xl mx-auto p-8">
          {/* Doctor Profile Summary */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div 
              className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              onClick={handleOpenEditModal}
            >
              <div className="mr-4">
                <img
                  src={
                    (doctor as any).profileImageUrl ||
                    (doctor as any).profileImage ||
                    defaultAvatar
                  }
                  alt="Doctor profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {greeting}, Dr. {firstName}
                </h1>
                <p className="text-gray-600">
                  {(doctor as any).specialty || "General Practice"}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  License:{" "}
                  {(doctor as any).medicalLicenseNumber ||
                    (doctor as any).licenseNumber ||
                    "N/A"}
                </p>
                {(doctor as any).medicalLicenseUrl && (
                  <p className="text-blue-500 text-sm mt-1">
                    <a 
                      href={(doctor as any).medicalLicenseUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Medical License ↗
                    </a>
                  </p>
                )}
                <p className="text-blue-500 text-sm mt-2 font-medium">
                  Click to view/edit profile
                </p>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatusCard
                title="Total Appointments"
                value={appointments.length}
                statusType="default"
              />
              <StatusCard
                title="Scheduled"
                value={
                  appointments.filter((a) => a.status === "scheduled").length
                }
                total={appointments.length}
                statusType="scheduled"
                trendValue={calculateTrend(
                  appointments.filter((a) => a.status === "scheduled").length,
                  previousAppointments.filter((a) => a.status === "scheduled")
                    .length
                )}
              />
              <StatusCard
                title="Completed"
                value={
                  appointments.filter((a) => a.status === "completed").length
                }
                total={appointments.length}
                statusType="completed"
                trendValue={calculateTrend(
                  appointments.filter((a) => a.status === "completed").length,
                  previousAppointments.filter((a) => a.status === "completed")
                    .length
                )}
              />
              <StatusCard
                title="Cancelled"
                value={
                  appointments.filter((a) => a.status === "cancelled").length
                }
                total={appointments.length}
                statusType="cancelled"
                trendValue={calculateTrend(
                  appointments.filter((a) => a.status === "cancelled").length,
                  previousAppointments.filter((a) => a.status === "cancelled")
                    .length
                )}
              />
            </div>
          </section>

          {/* Today's appointments */}
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">Today's appointments</h2>
            <div className="bg-white rounded-lg shadow">
              {currentAppointments.length > 0 ? (
                <div className="divide-y">
                  {currentAppointments.map((appointment) => {
                    const appointmentId =
                      appointment.id ||
                      `${appointment.patientName}_${appointment.startTime}`;
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
                        prescriptionStatus={appointment.Prescription}
                        onStartClick={() => handleStartButtonClick(appointment)}
                        onAddPrescriptionClick={() =>
                          handleAddPrescriptionClick(appointment)
                        }
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
            {/* Pagination Controls */}
            {appointments.length > 0 && (
              <div className="flex justify-between mt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                >
                  Previous
                </button>
                <span className="self-center">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                >
                  Next
                </button>
              </div>
            )}
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
                  <p className="font-medium">
                    {(doctor as any).specialty || "General Practice"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">License Number</p>
                  <p className="font-medium">
                    {(doctor as any).licenseNumber ||
                      (doctor as any).medicalLicenseNumber ||
                      "N/A"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500">Medical License URL</p>
                  <p className="font-medium">
                    {(doctor as any).medicalLicenseUrl ? (
                      <>
                        <a 
                          href={(doctor as any).medicalLicenseUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline break-all"
                          title={(doctor as any).medicalLicenseUrl}
                        >
                          {shortenUrl((doctor as any).medicalLicenseUrl)}
                        </a>
                        <span className="text-xs text-gray-400 ml-2">
                          (Click to view full URL)
                        </span>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500">Qualifications</p>
                  <p className="font-medium">
                    {(doctor as any).qualifications || "N/A"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleOpenEditModal}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Edit Doctor Information
              </button>
            </div>
          </section>

          {/* Edit Doctor Information Modal */}
          {isEditModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Edit Doctor Information</h2>
                    <button
                      onClick={handleCloseEditModal}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Form-level error */}
                  {formErrors.form && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{formErrors.form}</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {/* Profile Image Section */}
                    <div className="flex flex-col items-center mb-6">
                      <img
                        src={profileImagePreview || defaultAvatar}
                        alt="Doctor profile preview"
                        className="w-32 h-32 rounded-full object-cover mb-4 border-2 border-gray-200"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="hidden"
                          id="profile-image-input"
                        />
                        <label
                          htmlFor="profile-image-input"
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer text-sm"
                        >
                          Change Profile Image
                        </label>
                        {profileImagePreview && profileImagePreview !== defaultAvatar && (
                          <button
                            type="button"
                            onClick={handleRemoveProfileImage}
                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs"
                          >
                            Remove Image
                          </button>
                        )}
                        {formErrors.profileImage && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.profileImage}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Max file size: 5MB. Supported formats: JPG, PNG, GIF
                        </p>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={doctorFormData.firstName}
                          onChange={handleDoctorFormChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          required
                        />
                        {formErrors.firstName && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={doctorFormData.lastName}
                          onChange={handleDoctorFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={doctorFormData.email}
                          onChange={handleDoctorFormChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          required
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={doctorFormData.phoneNumber}
                          onChange={handleDoctorFormChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="+1 (555) 123-4567"
                        />
                        {formErrors.phoneNumber && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialty *
                      </label>
                      <input
                        type="text"
                        name="specialty"
                        value={doctorFormData.specialty}
                        onChange={handleDoctorFormChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.specialty ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {formErrors.specialty && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.specialty}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          License Number *
                        </label>
                        <input
                          type="text"
                          name="licenseNumber"
                          value={doctorFormData.licenseNumber}
                          onChange={handleDoctorFormChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                          required
                        />
                        {formErrors.licenseNumber && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.licenseNumber}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medical License Number
                        </label>
                        <input
                          type="text"
                          name="medicalLicenseNumber"
                          value={doctorFormData.medicalLicenseNumber}
                          onChange={handleDoctorFormChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.medicalLicenseNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.medicalLicenseNumber && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.medicalLicenseNumber}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical License URL
                      </label>
                      <input
                        type="url"
                        name="medicalLicenseUrl"
                        value={doctorFormData.medicalLicenseUrl}
                        onChange={handleDoctorFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/license.pdf"
                      />
                      <div className="flex items-center mt-2">
                        <p className="text-xs text-gray-500 mr-2">
                          Current: 
                        </p>
                        {doctorFormData.medicalLicenseUrl && (
                          <a 
                            href={doctorFormData.medicalLicenseUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline text-xs flex items-center gap-1"
                            title={doctorFormData.medicalLicenseUrl}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            {shortenUrl(doctorFormData.medicalLicenseUrl)}
                          </a>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qualifications
                      </label>
                      <textarea
                        name="qualifications"
                        value={doctorFormData.qualifications}
                        onChange={handleDoctorFormChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="MD, PhD, Board Certified, etc."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={handleCloseEditModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitDoctorInfo}
                      disabled={isSubmitting}
                      className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prescription Modal */}
          {isPrescriptionModalOpen && selectedAppointment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="max-w-lg w-full mx-auto bg-white shadow-2xl rounded-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
                <div className="bg-blue-500 text-white p-3 flex items-center justify-between rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <div>
                      <h1 className="text-lg font-bold">
                        Dr. {doctor.firstName}{" "}
                      </h1>
                      <p className="text-xs opacity-90">
                        {(doctor as any).qualifications || "Medical Doctor"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsPrescriptionModalOpen(false)}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 border-b-2 border-blue-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="mb-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Patient Name:
                        </label>
                        <div className="font-medium">
                          {selectedAppointment.patientName}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Phone:
                        </label>
                        <div className="font-medium">
                          {selectedAppointment.patientPhone || "N/A"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Date:
                        </label>
                        <div className="font-medium">
                          {selectedAppointment.appointmentDate}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Time:
                        </label>
                        <div className="font-medium">
                          {selectedAppointment.startTime}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative p-4 min-h-48">
                  <div className="absolute top-2 left-4">
                    <div className="text-4xl font-bold text-blue-400 opacity-80">
                      Rx
                    </div>
                  </div>
                  <div className="pt-12">
                    <textarea
                      className="w-full h-40 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter prescription details..."
                      value={prescriptionText}
                      onChange={(e) => setPrescriptionText(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-blue-500 text-white p-3 relative">
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-1">
                        <span>📞</span>
                        <span>{doctor.phoneNumber}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>📧</span>
                        <span>{doctor.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 p-4 bg-gray-50 rounded-b-lg">
                  <button
                    onClick={() => setIsPrescriptionModalOpen(false)}
                    className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitPrescription}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashBoard;