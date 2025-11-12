import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, User, Settings, Loader, Bell, Check } from 'lucide-react';
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

interface AuthButtonsProps {
  onItemClick?: () => void;
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
  navItems: { name: string; href: string }[];
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="md:hidden fixed inset-0 bg-white z-50 flex flex-col"
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <Logo />
            <button
              onClick={onItemClick}
              className="text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="p-6">
              {isAuthenticated && (
                <div className="w-full mb-6 flex flex-col items-center">
                  <div className="relative w-16 h-16 mb-3">
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
                      className="w-full h-full rounded-full flex items-center justify-center text-white text-2xl font-semibold relative z-10 shadow-md"
                      style={{ backgroundColor: '#003B73' }}
                    >
                      {userInitial || '?'}
                    </div>
                    {hasNotifications && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center shadow-sm z-20 border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-gray-800 text-center mb-1">{user?.name || 'User'}</p>
                  <p className="text-sm text-gray-500 text-center">{user?.email || ''}</p>
                </div>
              )}

              <nav className="space-y-2 mb-6">
                {navItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="block w-full py-3 px-4 text-lg font-medium text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200"
                    onClick={onItemClick}
                  >
                    {item.name}
                  </a>
                ))}
              </nav>

              {isAuthenticated && (
                <div className="space-y-2">
                  {hasNotifications && (
                    <>
                      <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="w-full flex justify-between items-center py-3 px-4 text-lg font-medium text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200 relative"
                      >
                        <div className="flex items-center">
                          <Bell size={20} className="mr-3" />
                          <span>Notifications</span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] border border-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>

                      {isNotificationsOpen && (
                        <div className="mt-2 mb-4 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                          <div className="flex justify-between items-center p-3 bg-gray-100">
                            <h3 className="font-medium text-gray-800">Notifications</h3>
                            {unreadCount > 0 && (
                              <button 
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium"
                              >
                                <Check size={16} className="mr-1" />
                                Mark all read
                              </button>
                            )}
                          </div>
                          
                          <div className="max-h-48 overflow-y-auto">
                            {notifications.length > 0 ? (
                              notifications.map(notification => (
                                <div 
                                  key={notification.id} 
                                  className={`p-3 border-t border-gray-200 cursor-pointer transition-colors ${
                                    notification.isRead ? 'bg-white' : 'bg-red-50'
                                  }`}
                                  onClick={() => handleNotificationClick(notification.id)}
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="font-medium text-sm text-gray-900 flex-1">
                                      {notification.title || 'Notification'}
                                    </h4>
                                    <span className="text-xs text-gray-500 flex-shrink-0 mt-0.5">
                                      {formatTimestamp(notification.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-2">
                                    {notification.message}
                                  </p>
                                  {!notification.isRead && (
                                    <div className="mt-2">
                                      <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-gray-500 text-sm">
                                No notifications yet
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <a
                    href="/userprofile"
                    className="w-full flex items-center py-3 px-4 text-lg font-medium text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200 relative"
                    onClick={onItemClick}
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
                      <User size={20} className="relative z-10" />
                    </div>
                    <span>Profile</span>
                  </a>

                  <a
                    href="/settings"
                    className="w-full flex items-center py-3 px-4 text-lg font-medium text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200"
                    onClick={onItemClick}
                  >
                    <Settings size={20} className="mr-3" />
                    <span>Settings</span>
                  </a>

                  <button
                    onClick={handleMobileLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center py-3 px-4 text-lg font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {isLoggingOut ? (
                      <Loader size={20} className="mr-3 animate-spin" />
                    ) : (
                      <LogOut size={20} className="mr-3" />
                    )}
                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="mt-6">
                  <AuthButtons onItemClick={onItemClick} />
                </div>
              )}
            </div>
          </div>
        </motion.div>
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

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '/services' },
    { name: 'Doctors', href: '#doctors' },
  ];

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
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/95 backdrop-blur-md md:bg-transparent'
        }`}
        initial="hidden"
        animate="visible"
        variants={navVariants}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.div className="flex items-center flex-shrink-0" variants={itemVariants}>
              <Logo />
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 xl:space-x-4">
              {navItems.map((item, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <NavItem name={item.name} href={item.href} />
                </motion.div>
              ))}

              <motion.div variants={itemVariants} className="relative" ref={dropdownRef}>
                {isAuthenticated ? (
                  <>
                    <div className="relative ml-2">
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
                        <button
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer transition-all duration-200 hover:scale-105 shadow-md relative z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          style={{ backgroundColor: avatarColor }}
                          title={userName || 'User Profile'}
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          aria-label="User menu"
                          aria-expanded={isDropdownOpen}
                        >
                          {userInitial || '?'}
                        </button>
                      </div>
                      {hasNotifications && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-sm z-20 border border-white min-w-[20px]">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200"
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                            <div className="flex items-center">
                              <div className="relative flex-shrink-0">
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
                                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-md relative z-10"
                                  style={{ backgroundColor: avatarColor }}
                                >
                                  {userInitial || '?'}
                                </div>
                              </div>
                              <div className="ml-3 overflow-hidden">
                                <div className="text-sm font-semibold text-gray-900 truncate">
                                  {userName || 'User'}
                                </div>
                                <div className="text-xs text-gray-600 truncate">{userEmail || 'No email'}</div>
                              </div>
                            </div>
                          </div>

                          <div className="py-1">
                            <a
                              href="/userprofile"
                              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-200 group"
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
                                <User size={16} className="relative z-10 text-blue-500 group-hover:text-blue-600 transition-colors" />
                              </div>
                              <span>View Profile</span>
                            </a>

                            {hasNotifications && (
                              <button
                                onClick={handleNavigateToNotifications}
                                className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-200 group text-left"
                              >
                                <Bell size={16} className="mr-3 text-blue-500 group-hover:text-blue-600 transition-colors" />
                                <span>Notifications</span>
                                {unreadCount > 0 && (
                                  <span className="ml-auto bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                  </span>
                                )}
                              </button>
                            )}

                            <a
                              href="/userWallet"
                              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-200 group"
                            >
                              <Settings
                                size={16}
                                className="mr-3 text-blue-500 group-hover:text-blue-600 transition-colors"
                              />
                              <span>User Wallet</span>
                            </a>
                          </div>

                          <div className="border-t border-gray-200"></div>

                          <div className="py-1">
                            <button
                              onClick={handleLogout}
                              disabled={isLoggingOut}
                              className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoggingOut ? (
                                <Loader size={16} className="mr-3 animate-spin" />
                              ) : (
                                <LogOut size={16} className="mr-3 group-hover:text-red-700 transition-colors" />
                              )}
                              <span className="font-medium group-hover:text-red-700 transition-colors">
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                              </span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="ml-2">
                    <AuthButtons />
                  </div>
                )}
              </motion.div>
            </nav>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden text-gray-700 z-50 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              whileTap={{ scale: 0.9 }}
              variants={itemVariants}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </motion.header>

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

      {/* Backdrop for mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;