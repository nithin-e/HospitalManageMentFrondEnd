import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, User, Settings, Loader, Bell, Check, Home, Info, Stethoscope, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Logo from '../navbar/Logo';
import NavItem from '../navbar/NavItem';
import AuthButtons from '../navbar/AuthButton';
import { RootState } from '../../store/redux/store';
import { logoutUser } from '@/store/redux/slices/authSlice';
import { useSocket } from '@/context/socketContext';

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
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const handleMobileLogout = async () => {
    setIsLoggingOut(true);
    await onLogout();
    onItemClick();
    setIsLoggingOut(false);
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="md:hidden fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onItemClick}
          />
          
          {/* Mobile Menu */}
          <motion.div
            className="md:hidden fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white z-50 flex flex-col shadow-xl"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-3">
                <Logo />
                <span className="text-lg font-semibold text-gray-800">Menu</span>
              </div>
              <button
                onClick={onItemClick}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                <X size={20} className="text-gray-700" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* User Profile Section */}
              {isAuthenticated && (
                <div className="px-6 py-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <AnimatePresence>
                        {isBeeping && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-red-400 opacity-70 z-0"
                            initial={{ scale: 0.8, opacity: 0.5 }}
                            animate={{ 
                              scale: 1.5, 
                              opacity: 0,
                              transition: { 
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "reverse" as const
                              }
                            }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                      </AnimatePresence>
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white shadow-lg relative z-10"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                      >
                        {userInitial || '?'}
                      </div>
                      {hasNotifications && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-sm z-20 border border-white">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-semibold truncate">{user?.name || 'User'}</p>
                      <p className="text-blue-100 text-sm truncate">{user?.email || ''}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <div className="p-4 space-y-2">
                {navItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="flex items-center space-x-3 p-4 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-95"
                    onClick={onItemClick}
                  >
                    <div className="text-blue-500">
                      {item.icon}
                    </div>
                    <span className="text-base font-medium">{item.name}</span>
                  </a>
                ))}
              </div>

              {/* Authenticated User Menu */}
              {isAuthenticated && (
                <div className="p-4 space-y-2">
                  {/* Notifications Section */}
                  {hasNotifications && (
                    <>
                      <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="flex items-center justify-between w-full p-4 rounded-xl bg-orange-50 border border-orange-100 hover:bg-orange-100 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Bell size={20} className="text-orange-600" />
                            {unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          <span className="text-base font-medium text-orange-800">Notifications</span>
                        </div>
                        <motion.div
                          animate={{ rotate: isNotificationsOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      </button>

                      {/* Notifications List */}
                      <AnimatePresence>
                        {isNotificationsOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                              <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
                                <h3 className="font-medium text-gray-700">Recent Notifications</h3>
                                {unreadCount > 0 && (
                                  <button 
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                  >
                                    <Check size={16} />
                                    <span>Mark all read</span>
                                  </button>
                                )}
                              </div>
                              
                              <div className="max-h-64 overflow-y-auto">
                                {notifications.length > 0 ? (
                                  notifications.map(notification => (
                                    <div 
                                      key={notification.id} 
                                      className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                                        notification.isRead ? 'bg-white' : 'bg-blue-50 border-l-4 border-l-blue-500'
                                      }`}
                                      onClick={() => handleNotificationClick(notification.id)}
                                    >
                                      <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-medium text-sm text-gray-900">
                                          {notification.title || 'Notification'}
                                        </h4>
                                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                          {formatTimestamp(notification.timestamp)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600 leading-relaxed">
                                        {notification.message}
                                      </p>
                                      {!notification.isRead && (
                                        <div className="flex items-center mt-2 space-x-1">
                                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                          <span className="text-xs text-blue-600 font-medium">New</span>
                                        </div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-4 text-center text-gray-500">
                                    No notifications yet
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}

                  {/* Profile & Settings */}
                  <a
                    href="/userprofile"
                    className="flex items-center space-x-3 p-4 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-95"
                    onClick={onItemClick}
                  >
                    <div className="relative">
                      <AnimatePresence>
                        {isBeeping && (
                          <motion.div
                            className="absolute -inset-1 rounded-full bg-red-400 opacity-30 z-0"
                            initial={{ scale: 0.8, opacity: 0.5 }}
                            animate={{ 
                              scale: 1.5, 
                              opacity: 0,
                              transition: { 
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "reverse" as const
                              }
                            }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                      </AnimatePresence>
                      <User size={20} className="relative z-10" />
                    </div>
                    <span className="text-base font-medium">My Profile</span>
                  </a>

                  <a
                    href="/settings"
                    className="flex items-center space-x-3 p-4 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-95"
                    onClick={onItemClick}
                  >
                    <Settings size={20} />
                    <span className="text-base font-medium">Settings</span>
                  </a>

                  {/* Logout Button */}
                  <button
                    onClick={handleMobileLogout}
                    disabled={isLoggingOut}
                    className="flex items-center space-x-3 w-full p-4 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-200 active:scale-95 disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <Loader size={20} className="animate-spin" />
                    ) : (
                      <LogOut size={20} />
                    )}
                    <span className="text-base font-medium">
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </span>
                  </button>
                </div>
              )}

              {/* Auth Buttons for Non-authenticated */}
              {!isAuthenticated && (
                <div className="p-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <AuthButtons />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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

  // Get auth and user data from Redux store
  const user = useSelector((state: RootState) => state.user)
  
  const userData = user.user || user?.user|| user?.user || null;
  const userName = userData?.name || '';
  const userEmail = userData?.email || '';
  const userInitial = userName.charAt(0)?.toUpperCase() || '';

  const dispatch = useDispatch();

  // Navigation items with icons
  const navItems = [
    { name: 'Home', href: '/', icon: <Home size={20} /> },
    { name: 'About', href: '#about', icon: <Info size={20} /> },
    { name: 'Services', href: '/services', icon: <Stethoscope size={20} /> },
    { name: 'Doctors', href: '#doctors', icon: <Users size={20} /> },
  ];

  useEffect(() => {
    if (socket && connected) {
      const handleDoctorAlert = (response: any) => {
        console.log("Doctor alert received:", response);
        
        if (response.type === "appointment_update") {
          console.log("Appointment update received:", response.data);
          setIsBeeping(true);
          setTimeout(() => setIsBeeping(false), 60000);
        }
      };

      socket.on('user_alert', handleDoctorAlert);

      return () => {
        socket.off('user_alert', handleDoctorAlert);
      };
    }
  }, [socket, connected]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    if (userData?.email && socket) {
      setIsLoading(true);
      
      socket.emit('fetchNotifications', { email: userData.email });
      
      socket.on('notificationsResponse', (response) => {
        setIsLoading(false);
        console.log('check here kittando responce', response);
        
        if (response?.notification && Array.isArray(response.notification) && response.notification.length > 0) {
          setNotifications(response.notification);
          setHasNotifications(true);
          setIsBeeping(response.notification.some((n: Notification) => !n.isRead));
        } else {
          setNotifications([]);
          setHasNotifications(false);
          setIsBeeping(false);
        }
      });
      
      socket.on('newNotification', (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        setHasNotifications(true);
        setIsBeeping(true);
        setTimeout(() => setIsBeeping(false), 60000);
      });
      
      return () => {
        socket.off('notificationsResponse');
        socket.off('newNotification');
      };
    }
  }, [userData?.email, socket]);

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
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
      transition: { type: 'spring', stiffness: 300 },
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
    !!userData || !!localStorage.getItem('userAccessToken') || user?.isUserAuthenticated;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      localStorage.removeItem('AccessToken');
      localStorage.removeItem('RefreshToken');

      dispatch(logoutUser());
      console.log('User logged out successfully');

      setIsDropdownOpen(false);
      setIsMenuOpen(false);
      setNotifications([]);
      setHasNotifications(false);
      setIsBeeping(false);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigateToProfile = () => {
    console.log('Navigating to profile');
    setIsDropdownOpen(false);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
    if (notifications.every(n => n.isRead || n.id === id)) {
      setIsBeeping(false);
    }
  };

  const handleNavigateToNotifications = () => {
    console.log('Navigating to notifications');
    setIsDropdownOpen(false);
    navigate('/NotificationList', { state: { notifications } });
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setIsBeeping(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getAvatarColor = (name: string) => {
    if (!name) return '#003B73';
    const colors = ['#003B73', '#2C74B3', '#0A2647', '#144272', '#205295', '#0E6BA8'];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  const avatarColor = getAvatarColor(userName);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
      }`}
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.div className="flex items-center" variants={itemVariants}>
            <Logo />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div key={index} variants={itemVariants}>
                <NavItem name={item.name} href={item.href} />
              </motion.div>
            ))}

            <motion.div variants={itemVariants} className="relative" ref={dropdownRef}>
              {isAuthenticated ? (
                <>
                  <div className="relative">
                    <div className="relative">
                      <AnimatePresence>
                        {isBeeping && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-red-600 opacity-30 z-0"
                            initial={{ scale: 0.8, opacity: 0.5 }}
                            animate={{ 
                              scale: 1.5, 
                              opacity: 0,
                              transition: { 
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "reverse" as const
                              }
                            }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                      </AnimatePresence>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer transition-transform hover:scale-105 shadow-md relative z-10"
                        style={{ backgroundColor: avatarColor }}
                        title={userName || 'User Profile'}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        {userInitial || '?'}
                      </div>
                    </div>
                    {hasNotifications && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-sm z-20">
                        {unreadCount}
                      </span>
                    )}
                  </div>

                  {isDropdownOpen && (
                    <motion.div
                      className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-100"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="relative">
                            <AnimatePresence>
                              {isBeeping && (
                                <motion.div
                                  className="absolute inset-0 rounded-full bg-red-600 opacity-30 z-0"
                                  initial={{ scale: 0.8, opacity: 0.5 }}
                                  animate={{ 
                                    scale: 1.5, 
                                    opacity: 0,
                                    transition: { 
                                      duration: 1.5,
                                      repeat: Infinity,
                                      repeatType: "reverse" as const
                                    }
                                  }}
                                  exit={{ opacity: 0 }}
                                />
                              )}
                            </AnimatePresence>
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold mr-3 shadow-md relative z-10"
                              style={{ backgroundColor: avatarColor }}
                            >
                              {userInitial || '?'}
                            </div>
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-base font-semibold text-gray-900 truncate">
                              {userName || 'User'}
                            </div>
                            <div className="text-sm text-gray-500 truncate">{userEmail || 'No email'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        <a
                          href="/userprofile"
                          className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors group relative"
                          onClick={handleNavigateToProfile}
                        >
                          <div className="relative mr-3">
                            <AnimatePresence>
                              {isBeeping && (
                                <motion.div
                                  className="absolute -inset-1 rounded-full bg-red-600 opacity-30 z-0"
                                  initial={{ scale: 0.8, opacity: 0.5 }}
                                  animate={{ 
                                    scale: 1.5, 
                                    opacity: 0,
                                    transition: { 
                                      duration: 1.5,
                                      repeat: Infinity,
                                      repeatType: "reverse" as const
                                    }
                                  }}
                                  exit={{ opacity: 0 }}
                                />
                              )}
                            </AnimatePresence>
                            <User size={18} className="relative z-10 text-blue-500 group-hover:text-blue-600 transition-colors" />
                          </div>
                          <span>View Profile</span>
                        </a>

                        {hasNotifications && (
                          <button
                            onClick={handleNavigateToNotifications}
                            className="w-full flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors group relative text-left"
                          >
                            <Bell size={18} className="mr-3 text-blue-500 group-hover:text-blue-600 transition-colors" />
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                              <span className="ml-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount}
                              </span>
                            )}
                          </button>
                        )}

                        <a
                          href="/userWallet"
                          className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors group"
                        >
                          <Settings
                            size={18}
                            className="mr-3 text-blue-500 group-hover:text-blue-600 transition-colors"
                          />
                          <span>User Wallet</span>
                        </a>
                      </div>

                      <div className="border-t border-gray-100"></div>

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex items-center w-full text-left px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoggingOut ? (
                            <Loader size={18} className="mr-3 animate-spin" />
                          ) : (
                            <LogOut size={18} className="mr-3 group-hover:text-red-700 transition-colors" />
                          )}
                          <span className="font-medium group-hover:text-red-700 transition-colors">
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <AuthButtons />
              )}
            </motion.div>
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            whileTap={{ scale: 0.9 }}
            variants={itemVariants}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
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
      />
    </motion.header>
  );
};

export default Navbar;