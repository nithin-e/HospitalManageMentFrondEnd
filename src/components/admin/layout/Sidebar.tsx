import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  Stethoscope, 
  Bell, 
  MessageSquare, 
  LogOut,
  Loader,
  Wrench
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { logoutAdmin } from "@/store/redux/slices/authSlice";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
}

const SidebarItem = ({ icon: Icon, label, href, active, onClick, isLoading }: SidebarItemProps) => {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors w-full text-left",
          active && "text-blue-600 bg-blue-50 hover:bg-blue-50",
          isLoading && "opacity-70 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <Loader className="h-5 w-5 animate-spin" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
        <span>{isLoading ? "Logging out..." : label}</span>
      </button>
    );
  }
  
  return (
    <Link
      to={href || "#"}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors",
        active && "text-blue-600 bg-blue-50 hover:bg-blue-50"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const pathname = window.location.pathname;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = () => {
    // Set loading state
    setIsLoggingOut(true);
    
    // Log for debugging
    console.log('Admin logout initiated');
    
    try {
      // Dispatch the logout admin action
      dispatch(logoutAdmin());
      
      // Clear any other related storage if needed
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminRefreshToken');
      
      console.log('Admin logout successful');
      
      // Add a small delay for user to see the loading state
      setTimeout(() => {
        // Redirect to admin login page
        navigate('/login');
      }, 800);
    } catch (error) {
      console.error('Error during logout:', error);
      setIsLoggingOut(false);
      // Consider showing an error toast or message here
    }
  };
  
  return (
    <div className="w-60 border-r h-screen flex flex-col bg-white">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Admin</h1>
      </div>
      
      <div className="flex-1 py-4 flex flex-col gap-1 px-2">
        <SidebarItem
          icon={LayoutDashboard}
          label="Dashboard"
          href="/adminDash"
          active={pathname === "/adminDash"}
        />
        <SidebarItem
          icon={Users}
          label="Users"
          href="/users"
          active={pathname === "/users"}
        />
        <SidebarItem
          icon={UserRound}
          label="Doctors"
          href="/doctors"
          active={pathname === "/doctors"}
        />

        <SidebarItem
          icon={Wrench}
          label="Services"
          href="/addServices"
          active={pathname === "/addServices"}
        />
        
        
        <SidebarItem
          icon={MessageSquare}
          label="Payments"
          href="/adminSidePayments"
          active={pathname === "/adminSidePayments"}
        />
      </div>
      
      <div className="p-4 border-t mt-auto">
        <SidebarItem
          icon={LogOut}
          label="Logout"
          onClick={handleLogout}
          isLoading={isLoggingOut}
        />
      </div>
    </div>
  );
};

export default Sidebar;