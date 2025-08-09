import React, { useEffect, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { ArrowUp, ArrowDown, Calendar, Users, DollarSign, Activity } from "lucide-react";

// Mock API function - replace with your actual API call
const FetchingAllUserAppointsMentsAdmin = async () => {
  // This simulates your API response structure
  return {
    appointments: [
      {
        id: "688706d919fa469146440be0",
        patientName: "varun",
        doctorName: "Dr. riya dr",
        doctorEmail: "riya@gmail.com",
        specialty: "Pediatrics",
        appointmentDate: "2025-07-28",
        appointmentTime: "10:46 AM",
        status: "completed",
        paymentStatus: "success",
        amount: "500",
        doctorAmount: "350",
        adminAmount: "150"
      },
      {
        id: "6887311119fa469146440cc3",
        patientName: "varun",
        doctorName: "Dr. riya dr",
        doctorEmail: "riya@gmail.com",
        specialty: "Cardiology",
        appointmentDate: "2025-07-28",
        appointmentTime: "11:30 AM",
        status: "completed",
        paymentStatus: "success",
        amount: "600",
        doctorAmount: "420",
        adminAmount: "180"
      },
      {
        id: "688bd43c3429e78fb08df7c3",
        patientName: "nithin",
        doctorName: "Dr. salman",
        doctorEmail: "salman@gmail.com",
        specialty: "Orthopedics",
        appointmentDate: "2025-08-01",
        appointmentTime: "2:00 PM",
        status: "pending",
        paymentStatus: "success",
        amount: "450",
        doctorAmount: "315",
        adminAmount: "135"
      },
      {
        id: "688c34253c260eb2770b2717",
        patientName: "asif",
        doctorName: "Dr. riya dr",
        doctorEmail: "riya@gmail.com",
        specialty: "Dermatology",
        appointmentDate: "2025-08-01",
        appointmentTime: "3:30 PM",
        status: "cancelled",
        paymentStatus: "refunded",
        amount: "400",
        doctorAmount: "280",
        adminAmount: "120"
      }
    ],
    success: true
  };
};

const DashboardOverview = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    dailyAppointments: [],
    specialtyData: [],
    statusData: [],
    revenueData: []
  });

  useEffect(() => {
    fetchUserFullAppointments();
  }, []);

  const fetchUserFullAppointments = async () => {
    try {
      setLoading(true);
      const response = await FetchingAllUserAppointsMentsAdmin();
      console.log('API Response:', response);
      
      if (response.success && response.appointments) {
        setAppointments(response.appointments);
        processAppointmentData(response.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAppointmentData = (appointments) => {
    // Calculate stats
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;
    const totalRevenue = appointments
      .filter(apt => apt.paymentStatus === 'success')
      .reduce((sum, apt) => sum + parseInt(apt.amount || 0), 0);

    // Get unique patients and doctors
    const uniquePatients = new Set(appointments.map(apt => apt.patientName)).size;
    const uniqueDoctors = new Set(appointments.map(apt => apt.doctorEmail)).size;

    // Process daily appointments
    const dailyAppointments = appointments.reduce((acc, apt) => {
      const date = new Date(apt.appointmentDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.appointments += 1;
        existing.revenue += parseInt(apt.amount || 0);
      } else {
        acc.push({
          date,
          appointments: 1,
          revenue: parseInt(apt.amount || 0)
        });
      }
      return acc;
    }, []);

    // Process specialty data
    const specialtyData = appointments.reduce((acc, apt) => {
      const existing = acc.find(item => item.specialty === apt.specialty);
      if (existing) {
        existing.count += 1;
        existing.revenue += parseInt(apt.amount || 0);
      } else {
        acc.push({
          specialty: apt.specialty,
          count: 1,
          revenue: parseInt(apt.amount || 0)
        });
      }
      return acc;
    }, []);

    // Process status data
    const statusData = appointments.reduce((acc, apt) => {
      const existing = acc.find(item => item.status === apt.status);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({
          status: apt.status,
          count: 1
        });
      }
      return acc;
    }, []);

    // Calculate revenue breakdown
    const revenueData = [
      {
        category: 'Doctor Revenue',
        amount: appointments.reduce((sum, apt) => sum + parseInt(apt.doctorAmount || 0), 0)
      },
      {
        category: 'Admin Revenue',
        amount: appointments.reduce((sum, apt) => sum + parseInt(apt.adminAmount || 0), 0)
      }
    ];

    const stats = [
      {
        title: "Total Appointments",
        value: totalAppointments.toString(),
        change: `+${Math.round((completedAppointments / totalAppointments) * 100)}%`,
        increasing: true,
        color: "bg-blue-50 text-blue-700",
        icon: Calendar
      },
      {
        title: "Unique Patients",
        value: uniquePatients.toString(),
        change: "+12%",
        increasing: true,
        color: "bg-green-50 text-green-700",
        icon: Users
      },
      {
        title: "Active Doctors",
        value: uniqueDoctors.toString(),
        change: "+5%",
        increasing: true,
        color: "bg-purple-50 text-purple-700",
        icon: Activity
      },
      {
        title: "Total Revenue",
        value: `₹${totalRevenue.toLocaleString()}`,
        change: "+18%",
        increasing: true,
        color: "bg-emerald-50 text-emerald-700",
        icon: DollarSign
      }
    ];

    setDashboardData({
      stats,
      dailyAppointments,
      specialtyData,
      statusData,
      revenueData
    });
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Hospital Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardData.stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                  <IconComponent className="h-5 w-5 text-gray-400" />
                </div>
                <div className={`${stat.color} rounded-lg p-4`}>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="flex items-center">
                    {stat.increasing ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-sm">{stat.change}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Appointments Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Daily Appointments</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.dailyAppointments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="appointments" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Daily Revenue</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.dailyAppointments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Specialty Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Appointments by Specialty</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.specialtyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ specialty, count }) => `${specialty}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {dashboardData.specialtyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Appointment Status</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.statusData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

     

      {/* Recent Appointments Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Appointments</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Patient</th>
                <th className="px-4 py-2 text-left">Doctor</th>
                <th className="px-4 py-2 text-left">Specialty</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {appointments.slice(0, 5).map((appointment) => (
                <tr key={appointment.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{appointment.patientName}</td>
                  <td className="px-4 py-2">{appointment.doctorName}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {appointment.specialty}
                    </span>
                  </td>
                  <td className="px-4 py-2">{appointment.appointmentDate}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-semibold">₹{appointment.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;