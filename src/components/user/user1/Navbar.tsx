import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, User, Settings, Loader, Bell, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Added import for navigation
import Logo from '../navbar/Logo';
import NavItem from '../navbar/NavItem';
import AuthButtons from '../navbar/AuthButton';
import { RootState } from '../../../store/redux/store';
import { logoutUser } from '@/store/redux/slices/authSlice';
import { GetFetchNotifications } from '@/store/userSideApi/GetNotificationApi';


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
}

// Separate MobileMenu component
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

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <motion.div
      className="md:hidden fixed inset-0 bg-white z-40 flex flex-col"
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <Logo />
        <button
          onClick={onItemClick}
          className="text-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start p-8 overflow-y-auto">
        {isAuthenticated && (
          <div className="w-full mb-6 flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-semibold mb-2"
              style={{ backgroundColor: '#003B73' }}
            >
              {userInitial || '?'}
            </div>
            <p className="text-lg font-medium text-gray-800">{user?.name || 'User'}</p>
            <p className="text-sm text-gray-500">{user?.email || ''}</p>
          </div>
        )}

        {navItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="w-full py-3 text-xl font-medium text-gray-800 hover:text-primary transition-colors border-b border-gray-100"
            onClick={onItemClick}
          >
            {item.name}
          </a>
        ))}

        {isAuthenticated && (
          <>
            {hasNotifications && (
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-full py-3 flex justify-between items-center text-xl font-medium text-gray-800 hover:text-primary transition-colors border-b border-gray-100 relative"
              >
                <div className="flex items-center">
                  <Bell size={20} className="mr-2" />
                  <span>Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {isNotificationsOpen && hasNotifications && (
              <div className="w-full mt-2 mb-4 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <div className="flex justify-between items-center p-3 bg-gray-100">
                  <h3 className="font-medium">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Check size={16} className="mr-1" />
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border-t border-gray-200 ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex justify-between">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <span className="text-xs text-gray-500">{notification.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No notifications yet
                    </div>
                  )}
                </div>
              </div>
            )}

            <a
              href="/profile"
              className="w-full py-3 flex items-center text-xl font-medium text-gray-800 hover:text-primary transition-colors border-b border-gray-100"
              onClick={onItemClick}
            >
              <User size={20} className="mr-2" />
              <span>Profile</span>
            </a>

            <a
              href="/settings"
              className="w-full py-3 flex items-center text-xl font-medium text-gray-800 hover:text-primary transition-colors border-b border-gray-100"
              onClick={onItemClick}
            >
              <Settings size={20} className="mr-2" />
              <span>Settings</span>
            </a>

            <button
              onClick={handleMobileLogout}
              disabled={isLoggingOut}
              className="w-full mt-4 py-3 flex items-center text-xl font-medium text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader size={20} className="mr-2 animate-spin" />
              ) : (
                <LogOut size={20} className="mr-2" />
              )}
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </>
        )}

        {!isAuthenticated && (
          <div className="mt-6 w-full flex flex-col items-center">
            <AuthButtons />
          </div>
        )}
      </div>
    </motion.div>
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Get auth and user data from Redux store
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

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

  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (userData?.email) {
      fetchNotifications();
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await GetFetchNotifications(userData?.email || '');
      
      if (response && response.notification && response.notification.notification) {
        // Process the data from your backend response structure
        const notificationsData = response.notification.notification.map((notification: any) => ({
          ...notification,
          isRead: notification.isRead || false,
          timestamp: notification.createdAt || new Date().toISOString(),
        }));
        
        setNotifications(notificationsData);
        setHasNotifications(true);
      } else if (response && response.res === false) {
        // No notifications found
        setNotifications([]);
        setHasNotifications(false);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setNotifications([]);
      setHasNotifications(false);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Simplified user data extraction with fallback
  const userData = user?.checkUserEmailAndPhone?.user || user?.user?.user || user?.user || null;
  const userName = userData?.name || '';
  const userEmail = userData?.email || '';
  const userInitial = userName.charAt(0)?.toUpperCase() || '';

  // Robust authentication check: use user data or token presence
  const isAuthenticated =
    !!userData || !!localStorage.getItem('userAccessToken') || user?.isUserAuthenticated;

  // Logout handler function
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Clear user tokens
      localStorage.removeItem('userAccessToken');
      localStorage.removeItem('userRefreshToken');

      dispatch(logoutUser());
      console.log('User logged out successfully');

      // Reset UI states
      setIsDropdownOpen(false);
      setIsMenuOpen(false);
      setNotifications([]);
      setHasNotifications(false);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handler for navigating to profile
  const handleNavigateToProfile = () => {
    console.log('Navigating to profile');
    setIsDropdownOpen(false);
  };

  // Handler for marking a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
    
    // Here you would also call your API to mark as read on the server
    // Example: updateNotificationReadStatus(id, true);
  };

  // Handler for navigating to notifications page
  const handleNavigateToNotifications = () => {
    console.log('Navigating to notifications');
    setIsDropdownOpen(false);
    // Pass notifications data to the NotificationListing component via navigation state
    navigate('/NotificationList', { state: { notifications } });
  };

  // Handler for marking all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    
    // Here you would also call your API to mark all as read on the server
    // Example: updateAllNotificationsReadStatus(userData?.email, true);
  };

  // Calculate unread notifications count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Generate a random color based on the user's name for the avatar background
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
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20 md:h-24">
          <motion.div className="flex items-center" variants={itemVariants}>
            <Logo />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div key={index} variants={itemVariants}>
                <NavItem name={item.name} href={item.href} />
              </motion.div>
            ))}

            <motion.div variants={itemVariants} className="relative" ref={dropdownRef}>
              {isAuthenticated ? (
                <>
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer transition-transform hover:scale-105 shadow-md"
                      style={{ backgroundColor: avatarColor }}
                      title={userName || 'User Profile'}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      {userInitial || '?'}
                    </div>
                    {/* Notification badge on avatar - only show if has notifications with unread count */}
                    {hasNotifications && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Enhanced User Profile Dropdown */}
                  {isDropdownOpen && (
                    <motion.div
                      className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-100"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {/* Header with user info */}
                      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-100">
                        <div className="flex items-center">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold mr-3 shadow-md relative"
                            style={{ backgroundColor: avatarColor }}
                          >
                            {userInitial || '?'}
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-base font-semibold text-gray-900 truncate">
                              {userName || 'User'}
                            </div>
                            <div className="text-sm text-gray-500 truncate">{userEmail || 'No email'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <a
                          href="/profile"
                          className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors group"
                          onClick={handleNavigateToProfile}
                        >
                          <User size={18} className="mr-3 text-blue-500 group-hover:text-blue-600 transition-colors" />
                          <span>View Profile</span>
                        </a>

                        {/* Only show notification menu item if there are notifications */}
                        {hasNotifications && (
                          <button
                            onClick={handleNavigateToNotifications}
                            className="w-full flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors group relative text-left"
                          >
                            <Bell size={18} className="mr-3 text-blue-500 group-hover:text-blue-600 transition-colors" />
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                              <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount}
                              </span>
                            )}
                          </button>
                        )}

                        <a
                          href="/settings"
                          className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors group"
                        >
                          <Settings
                            size={18}
                            className="mr-3 text-blue-500 group-hover:text-blue-600 transition-colors"
                          />
                          <span>Account Settings</span>
                        </a>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-100"></div>

                      {/* Logout button */}
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

          {/* Mobile Menu Toggle */}
          <motion.button
            className="md:hidden text-gray-700 z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            whileTap={{ scale: 0.9 }}
            variants={itemVariants}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
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
      />
    </motion.header>
  );
};

export default Navbar;