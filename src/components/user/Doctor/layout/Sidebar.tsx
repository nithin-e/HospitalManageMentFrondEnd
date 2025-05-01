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
  import { Link } from "react-router-dom";
  
  const sidebarLinks = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Clock, label: "Appointments", path: "/appointments" },
    { icon: Users, label: "Patients", path: "/patients" },
    { icon: BellRing, label: "Reminders", path: "/reminders" },
    { icon: MessageSquare, label: "Chat", path: "/chat" },
    { icon: CalendarDays, label: "Set Dates", path: "/dates" },
    { icon: Wallet, label: "Payments", path: "/payments" },
  ];
  
  interface SidebarProps {
    doctorName: string;
  }
  
  const Sidebar = ({ doctorName }: SidebarProps) => {
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
          <button className="flex items-center gap-3 px-3 py-2 w-full text-gray-700 hover:bg-gray-100 rounded-md">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  };
  
  export default Sidebar;