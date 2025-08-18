import { logoutAdmin } from "@/store/redux/slices/authSlice";
import { 
    LayoutDashboard, 
    Clock, 
    Users, 
    BellRing, 
    MessageSquare, 
    CalendarDays,
    Wallet, 
    LogOut
  } from "lucide-react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/DoctorDashboard" },
  { icon: Clock, label: "Appointments", path: "/AppointListing" },
  // { icon: Users, label: "Patients", path: "/patients" },
  // { icon: BellRing, label: "Reminders", path: "/reminders" },
  // { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: CalendarDays, label: "Set Dates", path: "/AppointmentScheduler" },
  { icon: Wallet, label: "Payments", path: "/ListPaymentDoctor" },
];

interface SidebarProps {
  doctorName: string;
}

const Sidebar = ({ doctorName }: SidebarProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    // Set loading state
    setIsLoggingOut(true);
    
    // Log for debugging
    console.log('Admin logout initiated');
    
    try {
    
      dispatch(logoutAdmin());
      
      
      localStorage.removeItem('AccessToken');
      localStorage.removeItem('RefreshToken');
      
      console.log('Admin logout successful');
      
     
      setTimeout(() => {
       
        navigate('/login');
      }, 800);
    } catch (error) {
      console.error('Error during logout:', error);
      setIsLoggingOut(false);
   
    }
  };

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col">
      <div className="p-6">
        <h2 className="text-lg font-medium">Dr. {doctorName}</h2>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {sidebarLinks.map((link) => (
            <li key={link.label}>
              <Link
                to={link.path}
                className="flex items-center gap-3 px-3 py-3 text-gray-700 rounded-md hover:bg-gray-100"
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 px-3 py-2 w-full text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut size={20} />
          <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;