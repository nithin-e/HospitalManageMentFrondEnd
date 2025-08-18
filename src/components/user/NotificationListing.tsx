import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Check, ChevronRight, Calendar, Clock, FileText, AlertCircle, X, Filter, RefreshCw, ArrowRight } from 'lucide-react';
import Footer from '@/components/user/Footer';

// Types
interface Notification {
  id: string;
  userId: string;
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

const NotificationList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [showNotificationPanel, setShowNotificationPanel] = useState<boolean>(true);
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Initialize notifications from navigation state
  useEffect(() => {
    try {
      if (location.state?.notifications) {
        setNotifications(location.state.notifications);

      } else {
        setError("No notification data found");
      }
      setIsLoading(false);
    } catch (err) {
      setError("Error loading notifications");
      setIsLoading(false);
    }
  }, [location.state]);



  

  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const refreshNotifications = async () => {
    try {
      setRefreshing(true);
      // In a real app, you would fetch fresh notifications here
      // For now we'll just simulate a refresh
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      setError("Failed to refresh notifications");
      setRefreshing(false);
    }
  };

  // Handle marking a single notification as read
  const handleMarkAsRead = (id: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate to notification detail view
    navigate(`/NotificationDetails/${notification.id}`, { state: { notification } });
  };

  // Handle expand/collapse for notification preview
  const handleExpandCollapse = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (expandedNotification === notificationId) {
      setExpandedNotification(null);
    } else {
      setExpandedNotification(notificationId);
    }
  };

  // View full notification detail
  const viewNotificationDetail = (notification: Notification, event: React.MouseEvent) => {
    event.stopPropagation();
    handleNotificationClick(notification);
  };

  // Helper function to check if notification has additional info
  const hasAdditionalInfo = (notification: Notification): boolean => {
    return !!(notification.doctor || notification.date || notification.time || 
              notification.location || notification.additionalInfo);
  };

  // Get border color based on notification type
  const getBorderColor = (type?: number) => {
    switch (type) {
      case 1:
        return "border-blue-500";
      case 2:
        return "border-green-500";
      case 3:
        return "border-orange-500";
      case 4:
        return "border-purple-500";
      default:
        return "border-indigo-500";
    }
  };

  // Get icon background color based on notification type
  const getIconBgColor = (type?: number) => {
    switch (type) {
      case 1:
        return "bg-blue-100";
      case 2:
        return "bg-green-100";
      case 3:
        return "bg-orange-100";
      case 4:
        return "bg-purple-100";
      default:
        return "bg-indigo-100";
    }
  };

  // Get appropriate icon based on notification type
  const getNotificationIcon = (type?: number) => {
    switch (type) {
      case 1:
        return <Calendar size={20} className="text-blue-500" />;
      case 2:
        return <FileText size={20} className="text-green-500" />;
      case 3:
        return <Clock size={20} className="text-orange-500" />;
      case 4:
        return <FileText size={20} className="text-purple-500" />;
      default:
        return <Bell size={20} className="text-indigo-500" />;
    }
  };

  // Get background color based on notification type
  const getNotificationBgColor = (type?: number, isRead?: boolean) => {
    if (isRead) return "bg-white";
    
    switch (type) {
      case 1:
        return "bg-blue-50";
      case 2:
        return "bg-green-50";
      case 3:
        return "bg-orange-50";
      case 4:
        return "bg-purple-50";
      default:
        return "bg-indigo-50";
    }
  };

  // Convert numeric type to string for display purposes
  const getNotificationTypeText = (type?: number) => {
    switch (type) {
      case 1:
        return 'Appointment';
      case 2:
        return 'Prescription';
      case 3:
        return 'Payment';
      case 4:
        return 'Test Result';
      default:
        return 'General';
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
      
      if (diffInHours < 24) {
        // Less than 24 hours ago, show relative time
        if (diffInHours < 1) {
          const minutes = Math.floor(diffInHours * 60);
          return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        } else {
          const hours = Math.floor(diffInHours);
          return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        }
      } else if (diffInHours < 48) {
        // Yesterday
        return 'Yesterday';
      } else {
        // More than 48 hours ago, show date
        return date.toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric',
          year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch (e) {
      return timestamp;
    }
  };

  // If panel is hidden, show a floating notification button
  if (!showNotificationPanel) {
    return (
      <div className="fixed bottom-6 right-6">
        <button 
          onClick={() => setShowNotificationPanel(true)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors relative"
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b bg-[hsl(var(--border))]">
      <div className="max-w-4xl mx-auto pt-28 px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
          {/* Decorative top border */}
          <div className="h-1" style={{ backgroundColor: 'rgb(32, 82, 149)' }}></div>
          
          {/* Header */}
          <div className="p-6 bg-white border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                <Bell size={22} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
                <p className="text-sm text-gray-500 mt-1">Stay updated with your medical updates</p>
              </div>
              {unreadCount > 0 && (
                <span className="ml-4 bg-indigo-500 text-white text-xs font-medium rounded-full h-6 w-6 flex items-center justify-center shadow-sm">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshNotifications}
                className={`text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition-all ${refreshing ? 'animate-spin' : ''}`}
                disabled={refreshing}
                aria-label="Refresh notifications"
              >
                <RefreshCw size={18} />
              </button>
              
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 py-2 px-3 rounded-md transition-colors flex items-center"
                >
                  <Check size={14} className="mr-1" />
                  Mark all read
                </button>
              )}
              
              <button
                onClick={() => setShowNotificationPanel(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-6 text-center font-medium text-sm transition-all relative ${
                activeTab === 'all'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              All Notifications
              {activeTab === 'all' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-md"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`py-4 px-6 text-center font-medium text-sm transition-all relative ${
                activeTab === 'unread'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Unread {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-indigo-600 bg-indigo-100 rounded-full">
                  {unreadCount}
                </span>
              )}
              {activeTab === 'unread' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-md"></span>
              )}
            </button>
            <div className="flex-grow"></div>
            <button
              className="py-4 px-4 text-center text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center"
            >
              <Filter size={14} className="mr-1" />
              Filter
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="py-20 text-center text-gray-500">
                <div className="relative mx-auto h-16 w-16">
                  <div className="absolute animate-ping h-16 w-16 rounded-full bg-indigo-200 opacity-50"></div>
                  <div className="relative animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
                </div>
                <p className="mt-6 font-medium text-gray-600">Loading your notifications...</p>
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <div className="bg-red-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
                <p className="text-red-500 font-medium text-lg">Oops! Something went wrong</p>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">{error}</p>
                <button
                  onClick={refreshNotifications}
                  className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg"
                >
                  Try again
                </button>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`group transition-all duration-200 ${
                      expandedNotification === notification.id ? 'bg-gray-50' : getNotificationBgColor(notification.type, notification.isRead)
                    }`}
                  >
                    <div
                      className={`p-5 flex cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${notification.isRead ? 'border-transparent' : getBorderColor(notification.type)}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="shrink-0 mr-4">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow transition-all ${getIconBgColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3
                              className={`text-base font-semibold ${
                                notification.isRead ? 'text-gray-700' : 'text-gray-900'
                              }`}
                            >
                              {notification.title || getNotificationTypeText(notification.type)}
                            </h3>
                            <span className="text-xs text-gray-500 block mt-1">
                              {formatTimestamp(notification.timestamp || notification.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center ml-3">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                className="ml-3 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1.5 rounded-full transition-colors"
                                aria-label="Mark as read"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleExpandCollapse(notification.id, e)}
                              className="ml-2 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
                            >
                              <ChevronRight 
                                size={18} 
                                className={`transform transition-transform duration-200 ${
                                  expandedNotification === notification.id ? 'rotate-90' : ''
                                }`} 
                              />
                            </button>
                          </div>
                        </div>
                        <p className={`text-sm mt-2 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'} ${
                          expandedNotification === notification.id ? '' : 'line-clamp-2'
                        }`}>
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    
                    {/* Expanded details */}
                    {expandedNotification === notification.id && hasAdditionalInfo(notification) && (
                      <div className="px-5 pb-5 pt-1 ml-16 animate-fadeIn">
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="grid grid-cols-2 gap-4">
                            {notification.doctor && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Doctor</p>
                                <p className="text-sm font-medium text-gray-800">{notification.doctor}</p>
                              </div>
                            )}
                            {notification.date && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Date</p>
                                <p className="text-sm font-medium text-gray-800">{notification.date}</p>
                              </div>
                            )}
                            {notification.time && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Time</p>
                                <p className="text-sm font-medium text-gray-800">{notification.time}</p>
                              </div>
                            )}
                            {notification.location && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Location</p>
                                <p className="text-sm font-medium text-gray-800">{notification.location}</p>
                              </div>
                            )}
                          </div>
                          {notification.additionalInfo && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs font-medium text-gray-500 mb-1">Additional Information</p>
                              <p className="text-sm text-gray-700">{notification.additionalInfo}</p>
                            </div>
                          )}
                          
                          {/* View full details button */}
                          <div className="mt-4 flex justify-end">
                            <button 
                              onClick={(e) => viewNotificationDetail(notification, e)}
                              className="bg-indigo-50 text-indigo-600 text-sm font-medium py-2 px-4 rounded-md hover:bg-indigo-100 transition-colors flex items-center"
                            >
                              View full details
                              <ArrowRight size={16} className="ml-2" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="bg-gray-50 p-5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Bell size={32} className="text-gray-300" />
                </div>
                <p className="font-medium text-lg text-gray-600">No notifications</p>
                <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                  {activeTab === 'unread' && notifications.length > 0 
                    ? "You've read all your notifications" 
                    : "You don't have any notifications at the moment. We'll notify you when there's an update."}
                </p>
                {activeTab === 'unread' && notifications.length > 0 && (
                  <button 
                    className="mt-6 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors text-sm font-medium"
                    onClick={() => setActiveTab('all')}
                  >
                    View all notifications
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Showing {filteredNotifications.length} {activeTab === 'unread' ? 'unread' : ''} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </p>
              <button 
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                onClick={() => navigate('/notifications')}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotificationList;