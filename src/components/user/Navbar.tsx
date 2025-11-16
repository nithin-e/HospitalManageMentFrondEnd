import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  LogOut,
  User,
  Settings,
  Loader,
  Bell,
  Check,
  Home,
  Info,
  Stethoscope,
  Users,
  Heart,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Logo from "../navbar/Logo";
import NavItem from "../navbar/NavItem";
import AuthButtons from "../navbar/AuthButton";
import { RootState } from "../../store/redux/store";
import { logoutUser } from "@/store/redux/slices/authSlice";
import { useSocket } from "@/context/socketContext";

interface User {
  name?: string;
  email?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  type?: number;
  date?: string;
  time?: string;
  doctor?: string;
  location?: string;
  additionalInfo?: string;
  createdAt?: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  navItems: { name: string; href: string; icon: React.ReactNode }[];
  onItemClick: () => void;
  user: User | null;
  userInitial: string;
  isAuthenticated: boolean;
  onLogout: () => Promise<void>;
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  hasNotifications: boolean;
  isBeeping: boolean;
  userName: string;
  userEmail: string;
  avatarColor: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  navItems,
  onItemClick,
  user,
  userInitial,
  isAuthenticated,
  onLogout,
  notifications,
  markAsRead,
  markAllAsRead,
  hasNotifications,
  isBeeping,
  userName,
  userEmail,
  avatarColor,
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const handleMobileLogout = async () => {
    setIsLoggingOut(true);
    await onLogout();
    onItemClick();
    setIsLoggingOut(false);
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    setExpandedNotification(expandedNotification === id ? null : id);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } catch {
      return "Just now";
    }
  };

  const getNotificationIcon = (type?: number) => {
    switch (type) {
      case 1:
        return <Calendar className="w-5 h-5" />;
      case 2:
        return <Heart className="w-5 h-5" />;
      case 3:
        return <Bell className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const renderNotificationDetails = (notification: Notification) => {
    if (!expandedNotification || expandedNotification !== notification.id) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2"
      >
        <p className="text-xs text-gray-700 leading-relaxed">
          {notification.message}
        </p>
        {notification.date && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="w-3 h-3" />
            <span className="font-medium">Date:</span> {notification.date}
          </div>
        )}
        {notification.time && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            <span className="font-medium">Time:</span> {notification.time}
          </div>
        )}
        {notification.doctor && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Stethoscope className="w-3 h-3" />
            <span className="font-medium">Doctor:</span> {notification.doctor}
          </div>
        )}
        {notification.location && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="w-3 h-3" />
            <span className="font-medium">Location:</span> {notification.location}
          </div>
        )}
        {notification.additionalInfo && (
          <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
            {notification.additionalInfo}
          </div>
        )}
        <button
          onClick={() => {
            navigate("/NotificationList", { state: { notifications } });
            onItemClick();
          }}
          className="w-full mt-2 px-3 py-2 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
        >
          View Full Details
        </button>
      </motion.div>
    );
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsNotificationsOpen(false);
      setExpandedNotification(null);
    }
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onItemClick}
          />

          <motion.div
            ref={menuRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">HealNova</h2>
                <motion.button
                  onClick={onItemClick}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </motion.button>
              </div>

              {/* User Profile Section */}
              {isAuthenticated && (
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
                  {isBeeping && (
                    <motion.div
                      className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  )}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {userInitial && userInitial !== "?" ? userInitial : (
                          <User className="w-8 h-8" />
                        )}
                      </div>
                      {hasNotifications && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-gray-800 truncate">
                        {userName || "User"}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {userEmail || ""}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <nav className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    onClick={onItemClick}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-gray-600 group-hover:text-blue-600 transition-colors">
                      {item.icon}
                    </span>
                    <span className="text-base font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </span>
                  </motion.a>
                ))}
              </nav>

              {/* Authenticated User Menu */}
              {isAuthenticated && (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  {/* Notifications Section */}
                  {hasNotifications && (
                    <>
                      <motion.button
                        onClick={() =>
                          setIsNotificationsOpen(!isNotificationsOpen)
                        }
                        className="flex items-center justify-between w-full p-4 rounded-2xl bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-all duration-200 shadow-sm"
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-orange-600" />
                          <span className="font-medium text-gray-800">
                            Notifications
                          </span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </motion.button>

                      {/* Notifications List */}
                      {isNotificationsOpen && (
                        <motion.div
                          ref={notificationsRef}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-3 max-h-96 overflow-y-auto"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-800">
                              Recent Alerts
                            </h3>
                            {unreadCount > 0 && (
                              <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                Mark all read
                              </button>
                            )}
                          </div>

                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <motion.div
                                key={notification.id}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                  notification.isRead
                                    ? "bg-white border-gray-200"
                                    : "bg-blue-50 border-blue-300 shadow-sm"
                                }`}
                                onClick={() =>
                                  handleNotificationClick(notification.id)
                                }
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`p-2 rounded-lg ${
                                      notification.isRead
                                        ? "bg-gray-100 text-gray-600"
                                        : "bg-blue-100 text-blue-600"
                                    }`}
                                  >
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">
                                        {notification.title || "Notification"}
                                      </h4>
                                      <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {formatTimestamp(
                                          notification.timestamp
                                        )}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    {!notification.isRead && (
                                      <div className="mt-2 inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                        NEW
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Expanded Notification Details */}
                                {renderNotificationDetails(notification)}
                              </motion.div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500 text-sm">
                              No notifications yet
                            </div>
                          )}
                        </motion.div>
                      )}
                    </>
                  )}

                  {/* Profile & Settings */}
                  <div className="space-y-2">
                    <motion.button
                      onClick={() => {
                        navigate("/profile");
                        onItemClick();
                      }}
                      className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-gray-100 transition-all duration-200"
                      whileTap={{ scale: 0.95 }}
                    >
                      {isBeeping && (
                        <motion.div
                          className="absolute w-2 h-2 bg-red-500 rounded-full -top-1 -right-1"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [1, 0, 1],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                        />
                      )}
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="text-base font-medium text-gray-700">
                        My Profile
                      </span>
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        navigate("/wallet");
                        onItemClick();
                      }}
                      className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-gray-100 transition-all duration-200"
                      whileTap={{ scale: 0.95 }}
                    >
                      <Settings className="w-5 h-5 text-gray-600" />
                      <span className="text-base font-medium text-gray-700">
                        Wallet
                      </span>
                    </motion.button>

                    {/* Logout Button */}
                    <motion.button
                      onClick={handleMobileLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-3 w-full p-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all duration-200 disabled:opacity-50"
                      whileTap={{ scale: 0.95 }}
                    >
                      {isLoggingOut ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <LogOut className="w-5 h-5" />
                      )}
                      <span className="text-base font-medium">
                        {isLoggingOut ? "Logging out..." : "Logout"}
                      </span>
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Auth Buttons for Non-authenticated */}
              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-200">
                  <AuthButtons />
                </div>
              )}

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 pt-6 border-t border-gray-200">
                © 2025 HealNova. All rights reserved.
              </div>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
};

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [isBeeping, setIsBeeping] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  // Extract user data with fallback chain
  const userData = user?.user || null;
  const userName = userData?.name || "";
  const userEmail = userData?.email || "";
  
  // Calculate user initial - ensure it's always a single character or empty
  const userInitial = userName && userName.trim() 
    ? userName.trim().charAt(0).toUpperCase() 
    : "";

  // Navigation items with icons
  const navItems = [
    { name: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
    { name: "About", href: "/history", icon: <Info className="w-5 h-5" /> },
    {
      name: "Services",
      href: "/services",
      icon: <Stethoscope className="w-5 h-5" />,
    },
    { name: "Doctors", href: "#doctors", icon: <Users className="w-5 h-5" /> },
  ];

  useEffect(() => {
    if (socket && connected) {
      const handleDoctorAlert = (response: any) => {
        if (response.type === "appointment_update") {
          setIsBeeping(true);
          setTimeout(() => setIsBeeping(false), 60000);
        }
      };

      socket.on("user_alert", handleDoctorAlert);

      return () => {
        socket.off("user_alert", handleDoctorAlert);
      };
    }
  }, [socket, connected]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    if (userData?.email && socket) {
      setIsLoading(true);

      socket.emit("fetchNotifications", { email: userData.email });

      socket.on("notificationsResponse", (response) => {
        setIsLoading(false);
        if (
          response?.notification &&
          Array.isArray(response.notification) &&
          response.notification.length > 0
        ) {
          setNotifications(response.notification);
          setHasNotifications(true);
          setIsBeeping(
            response.notification.some((n: Notification) => !n.isRead)
          );
        } else {
          setNotifications([]);
          setHasNotifications(false);
          setIsBeeping(false);
        }
      });

      socket.on("newNotification", (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev]);
        setHasNotifications(true);
        setIsBeeping(true);
        setTimeout(() => setIsBeeping(false), 60000);
      });

      return () => {
        socket.off("notificationsResponse");
        socket.off("newNotification");
      };
    }
  }, [userData?.email, socket]);

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300 },
    },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2 },
    },
  };

  const isAuthenticated =
    !!userData || !!localStorage.getItem("userAccessToken") || user?.isUserAuthenticated;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      localStorage.removeItem("AccessToken");
      localStorage.removeItem("RefreshToken");
      dispatch(logoutUser());

      setIsDropdownOpen(false);
      setIsMenuOpen(false);
      setNotifications([]);
      setHasNotifications(false);
      setIsBeeping(false);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigateToProfile = () => {
    setIsDropdownOpen(false);
    navigate("/profile");
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );

    if (notifications.every((n) => n.isRead || n.id === id)) {
      setIsBeeping(false);
    }
  };

  const handleNavigateToNotifications = () => {
    setIsDropdownOpen(false);
    navigate("/NotificationList", { state: { notifications } });
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
    setIsBeeping(false);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getAvatarColor = (name: string) => {
    if (!name) return "#003B73";
    const colors = [
      "#003B73",
      "#2C74B3",
      "#0A2647",
      "#144272",
      "#205295",
      "#0E6BA8",
    ];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  const avatarColor = getAvatarColor(userName);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-gray-600 group-hover:text-blue-600 transition-colors">
                  {item.icon}
                </span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {item.name}
                </span>
              </motion.a>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="relative" ref={dropdownRef}>
                  {isBeeping && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full z-10"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [1, 0, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  )}
                  <motion.button
                    className="relative flex items-center space-x-3 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md group"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    whileTap={{ scale: 0.95 }}
                    variants={itemVariants}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md transition-transform group-hover:scale-105"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {userInitial && userInitial !== "?" ? userInitial : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    {hasNotifications && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                        {unreadCount}
                      </span>
                    )}
                  </motion.button>

                  {isDropdownOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                    >
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-200">
                        {isBeeping && (
                          <motion.div
                            className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [1, 0, 1],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatType: "reverse",
                            }}
                          />
                        )}
                        <div className="flex items-center gap-3">
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg"
                            style={{ backgroundColor: avatarColor }}
                          >
                            {userInitial && userInitial !== "?" ? userInitial : (
                              <User className="w-7 h-7" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-gray-800 truncate">
                              {userName || "User"}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {userEmail || "No email"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        {isBeeping && (
                          <motion.div
                            className="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [1, 0, 1],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatType: "reverse",
                            }}
                          />
                        )}
                        <button
                          onClick={handleNavigateToProfile}
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                        >
                          <User className="w-5 h-5 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            View Profile
                          </span>
                        </button>

                        {hasNotifications && (
                          <button
                            onClick={handleNavigateToNotifications}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <Bell className="w-5 h-5 text-gray-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Notifications
                              </span>
                            </div>
                            {unreadCount > 0 && (
                              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                {unreadCount}
                              </span>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate("/wallet");
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                        >
                          <Settings className="w-5 h-5 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            User Wallet
                          </span>
                        </button>
                      </div>

                      <div className="p-2 border-t border-gray-200">
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                        >
                          {isLoggingOut ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            <LogOut className="w-5 h-5" />
                          )}
                          <span className="text-sm font-medium">
                            {isLoggingOut ? "Logging out..." : "Logout"}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <AuthButtons />
            )}
          </div>

          <motion.button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            whileTap={{ scale: 0.9 }}
            variants={itemVariants}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </motion.button>
        </div>
      </div>

      <MobileMenu
        isOpen={isMenuOpen}
        navItems={navItems}
        onItemClick={() => setIsMenuOpen(false)}
        user={userData}
        userInitial={userInitial}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        notifications={notifications}
        markAsRead={markAsRead}
        markAllAsRead={markAllAsRead}
        hasNotifications={hasNotifications}
        isBeeping={isBeeping}
        userName={userName}
        userEmail={userEmail}
        avatarColor={avatarColor}
      />
    </motion.nav>
  );
};

export default Navbar;