import React, { useState, useEffect } from "react";
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

const DoctorDashBoard: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email || "";
  const dispatch: AppDispatch = useDispatch();
  const { socket, connected } = useSocket();

  const doctor = useSelector((state: RootState) => state.doctor.data?.doctor);
  console.log('check this doctor dataa daaaaaaaaaaaaaaaaaaa',doctor);
  
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
    socket.emit("initiateConsultation", {
      appointmentId: appointment.id,
      patientId: appointment.userId,
      url: `https://www.healnova.fun/Video-call/${roomId}`,
      doctorId: doctor?.id,
      doctorName: `${doctor?.firstName} ${"doctor"}`,
    });
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

      const res = await AddPrescription(prescriptionData);
      if (res.success) {
        setIsPrescriptionModalOpen(false);
        setPrescriptionText("");
        fetchUserFullAppointments(); 
      }
    } catch (error) {
      console.error("Failed to submit prescription:", error);
      alert("Failed to submit prescription. Please try again.");
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
      const res = await dispatch(fetchDoctorDashBoardDatas(email));
      

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
  }, []);

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

  // Client-side pagination calculations
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
            <div className="flex items-center">
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
                  <p className="text-gray-500">Qualifications</p>
                  <p className="font-medium">
                    {(doctor as any).qualifications || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </section>

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
