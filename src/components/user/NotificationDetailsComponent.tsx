import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  Calendar, 
  Clock, 
  FileText, 
  CreditCard, 
  Mail, 
  CheckCircle, 
  ExternalLink,
  AlertCircle,
  Activity,
  Heart
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from '@/components/user/Footer';

// Types
interface Notification {
  id: string;
  user_id?: string;
  userId?: string;
  title: string;
  message: string;
  isRead?: boolean;
  is_read?: boolean;
  timestamp?: { seconds: any; nanos: number } | string;
  created_at?: { seconds: any; nanos: number } | string;
  createdAt?: { seconds: any; nanos: number } | string;
  type?: string | number;
  date?: string;
  time?: string;
  doctor?: string;
  location?: string;
  additionalInfo?: string;
  payment_amount?: string | number;
  paymentAmount?: { low: number; high: number; unsigned: boolean } | string | number;
  payment_link?: string;
  payment_status?: string | number;
  paymentStatus?: string | number;
}

const NotificationDetailsComponent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add floating medical symbols effect
  useEffect(() => {
    const addMedicalSymbols = () => {
      const symbolsContainer = document.createElement('div');
      symbolsContainer.id = 'medical-symbols-container';
      symbolsContainer.className = 'fixed inset-0 pointer-events-none overflow-hidden';
      document.body.appendChild(symbolsContainer);
      
      const symbols = ['⚕️', '+', '🩺', '💊', '🏥'];
      const count = 12;
      
      for (let i = 0; i < count; i++) {
        const symbol = document.createElement('div');
        symbol.className = 'medical-symbol';
        symbol.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        
        // Random positions and animations
        const size = Math.random() * 20 + 10;
        const isPlus = symbol.innerText === '+';
        
        symbol.style.position = 'absolute';
        symbol.style.fontSize = `${isPlus ? size * 2 : size}px`;
        symbol.style.color = isPlus ? 'rgba(52, 152, 219, 0.15)' : 'rgba(46, 204, 113, 0.15)';
        symbol.style.left = `${Math.random() * 90 + 5}%`;
        symbol.style.top = `${Math.random() * 70 + 15}%`;
        symbol.style.opacity = '0';
        symbol.style.transform = 'translateY(20px)';
        symbol.style.transition = 'all 1s ease-out';
        symbol.style.animationDuration = `${Math.random() * 5 + 10}s`;
        symbol.style.animationDelay = `${Math.random() * 5}s`;
        symbol.style.zIndex = '0';
        
        symbolsContainer.appendChild(symbol);
        
        setTimeout(() => {
          symbol.style.opacity = '1';
          symbol.style.transform = 'translateY(0)';
        }, Math.random() * 1000 + 500);
      }
    };
    
    addMedicalSymbols();
    
    // Add background grid pattern
    const addGridPattern = () => {
      const gridPattern = document.createElement('div');
      gridPattern.className = 'absolute inset-0 opacity-5 pointer-events-none';
      gridPattern.style.backgroundImage = 'radial-gradient(circle, #3498db 1px, transparent 1px)';
      gridPattern.style.backgroundSize = '30px 30px';
      document.body.appendChild(gridPattern);
    };
    
    addGridPattern();
    
    // Circle decorative elements
    const addDecorativeElements = () => {
      const circle1 = document.createElement('div');
      circle1.className = 'absolute top-20 left-20 w-32 h-32 rounded-full border-4 border-blue-100 opacity-30 hidden md:block';
      document.body.appendChild(circle1);
      
      const circle2 = document.createElement('div');
      circle2.className = 'absolute bottom-32 right-32 w-16 h-16 rounded-full border-4 border-green-100 opacity-30 hidden md:block';
      document.body.appendChild(circle2);
    };
    
    addDecorativeElements();
    
    // Clean up function
    return () => {
      const symbolsContainer = document.getElementById('medical-symbols-container');
      if (symbolsContainer) {
        document.body.removeChild(symbolsContainer);
      }
      
      // Remove other elements
      document.querySelectorAll('.absolute').forEach(el => {
        if (el.classList.contains('border-blue-100') || el.classList.contains('border-green-100') || el.classList.contains('opacity-5')) {
          document.body.removeChild(el);
        }
      });
    };
  }, []);

  useEffect(() => {
    try {
      if (location.state?.notification) {
        const notificationData = location.state.notification as Notification;
        console.log('Notification details page data:', notificationData);
        
        // Normalize data to match our interface
        const normalizedNotification: Notification = {
          id: notificationData.id,
          userId: notificationData.user_id || notificationData.userId,
          title: notificationData.title || '',
          message: notificationData.message,
          isRead: notificationData.isRead || notificationData.is_read || false,
          timestamp: notificationData.timestamp,
          createdAt: notificationData.created_at || notificationData.createdAt,
          type: notificationData.type,
          date: notificationData.date,
          time: notificationData.time,
          doctor: notificationData.doctor,
          location: notificationData.location,
          additionalInfo: notificationData.additionalInfo,
          paymentAmount: notificationData.payment_amount || notificationData.paymentAmount,
          payment_link: notificationData.payment_link,
          paymentStatus: notificationData.payment_status || notificationData.paymentStatus
        };
        
        setNotification(normalizedNotification);
      } else {
        setError("Notification details not found.");
      }
    } catch (err) {
      setError("Error loading notification details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [location.state]);

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      let date;
      
      if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else if (timestamp.seconds) {
        // Handle Firestore timestamp
        const seconds = typeof timestamp.seconds === 'object' && timestamp.seconds._seconds ? 
          timestamp.seconds._seconds : 
          timestamp.seconds;
        
        date = new Date(typeof seconds === 'string' ? parseInt(seconds) * 1000 : seconds * 1000);
      } else {
        return 'Invalid Date';
      }
      
      // Check if date is valid before formatting
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'N/A';
    }
  };

  const getPaymentAmount = (amount: any) => {
    if (!amount) return 'N/A';
    
    try {
      let value: number;
      
      if (typeof amount === 'string') {
        value = parseInt(amount);
      } else if (typeof amount === 'number') {
        value = amount;
      } else if (amount.low !== undefined) {
        value = amount.low;
      } else {
        return 'N/A';
      }
      
      return value.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      });
    } catch (error) {
      console.error('Error formatting payment amount:', error);
      return 'N/A';
    }
  };
  
  const getPaymentStatusText = (status: string | number | undefined) => {
    if (typeof status === 'string') {
      switch (status.toUpperCase()) {
        case 'PENDING': return 'Pending';
        case 'AWAITING_PAYMENT': return 'Awaiting Payment';
        case 'PAID': return 'Paid';
        case 'FAILED': return 'Failed';
        default: return 'Unknown';
      }
    } else if (typeof status === 'number') {
      switch (status) {
        case 0: return 'Pending';
        case 1: return 'Awaiting Payment';
        case 2: return 'Paid';
        case 3: return 'Failed';
        default: return 'Unknown';
      }
    }
    return 'Unknown';
  };

  const getPaymentStatusColor = (status: string | number | undefined) => {
    const statusText = typeof status === 'string' ? status.toUpperCase() : '';
    
    if (
      status === 0 || 
      statusText === 'PENDING'
    ) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (
      status === 1 || 
      statusText === 'AWAITING_PAYMENT'
    ) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (
      status === 2 || 
      statusText === 'PAID'
    ) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (
      status === 3 || 
      statusText === 'FAILED'
    ) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get appropriate icon based on notification type
  const getNotificationIcon = (type?: string | number) => {
    const typeString = typeof type === 'string' ? type : '';
    
    if (
      type === 1 || 
      typeString.includes('APPOINTMENT')
    ) {
      return <Calendar size={24} className="text-blue-500" />;
    } else if (
      type === 2 || 
      typeString.includes('PRESCRIPTION')
    ) {
      return <FileText size={24} className="text-green-500" />;
    } else if (
      type === 3 || 
      typeString.includes('PAYMENT')
    ) {
      return <CreditCard size={24} className="text-orange-500" />;
    } else if (
      type === 4 || 
      typeString.includes('TEST')
    ) {
      return <Activity size={24} className="text-purple-500" />;
    }
    
    return <Bell size={24} className="text-indigo-500" />;
  };

  // Get background color based on notification type
  const getIconBgColor = (type?: string | number) => {
    const typeString = typeof type === 'string' ? type : '';
    
    if (
      type === 1 || 
      typeString.includes('APPOINTMENT')
    ) {
      return "bg-blue-100";
    } else if (
      type === 2 || 
      typeString.includes('PRESCRIPTION')
    ) {
      return "bg-green-100";
    } else if (
      type === 3 || 
      typeString.includes('PAYMENT')
    ) {
      return "bg-orange-100";
    } else if (
      type === 4 || 
      typeString.includes('TEST')
    ) {
      return "bg-purple-100";
    }
    
    return "bg-indigo-100";
  };

  // Get border color based on notification type
  const getBorderColor = (type?: string | number) => {
    const typeString = typeof type === 'string' ? type : '';
    
    if (
      type === 1 || 
      typeString.includes('APPOINTMENT')
    ) {
      return "border-blue-500";
    } else if (
      type === 2 || 
      typeString.includes('PRESCRIPTION')
    ) {
      return "border-green-500";
    } else if (
      type === 3 || 
      typeString.includes('PAYMENT')
    ) {
      return "border-orange-500";
    } else if (
      type === 4 || 
      typeString.includes('TEST')
    ) {
      return "border-purple-500";
    }
    
    return "border-indigo-500";
  };

  // Get header gradient based on notification type
  const getHeaderGradient = (type?: string | number) => {
    const typeString = typeof type === 'string' ? type : '';
    
    if (
      type === 1 || 
      typeString.includes('APPOINTMENT')
    ) {
      return "from-blue-600 to-blue-500";
    } else if (
      type === 2 || 
      typeString.includes('PRESCRIPTION')
    ) {
      return "from-green-600 to-green-500";
    } else if (
      type === 3 || 
      typeString.includes('PAYMENT')
    ) {
      return "from-orange-600 to-orange-500";
    } else if (
      type === 4 || 
      typeString.includes('TEST')
    ) {
      return "from-purple-600 to-purple-500";
    }
    
    return "from-indigo-600 to-indigo-500";
  };

  // Convert type to string for display purposes
  const getNotificationTypeText = (type?: string | number) => {
    const typeString = typeof type === 'string' ? type : '';
    
    if (
      type === 1 || 
      typeString.includes('APPOINTMENT')
    ) {
      return 'Appointment';
    } else if (
      type === 2 || 
      typeString.includes('PRESCRIPTION')
    ) {
      return 'Prescription';
    } else if (
      type === 3 || 
      typeString.includes('PAYMENT')
    ) {
      return 'Payment';
    } else if (
      type === 4 || 
      typeString.includes('TEST')
    ) {
      return 'Test Result';
    }
    
    return 'General';
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex justify-center items-center">
        <div className="p-20 text-center text-gray-500">
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute animate-ping h-16 w-16 rounded-full bg-blue-200 opacity-50"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
          <p className="mt-6 font-medium text-gray-600">Loading notification details...</p>
        </div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <div className="max-w-4xl mx-auto pt-28 px-4 sm:px-6 lg:px-8 pb-10">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="h-1 bg-red-500"></div>
            <div className="py-20 text-center">
              <div className="bg-red-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <p className="text-red-500 font-medium text-lg">Notification Not Found</p>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">{error || "The notification you're looking for doesn't exist or was deleted."}</p>
              <button
                onClick={handleBack}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg flex items-center mx-auto"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Notifications
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Determine if this is a payment notification
  const isPaymentNotification = 
    notification.payment_link || 
    notification.paymentAmount || 
    notification.payment_amount || 
    (typeof notification.type === 'string' && notification.type.includes('PAYMENT'));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto pt-28 px-4 sm:px-6 lg:px-8 pb-10">
        <button 
          onClick={handleBack}
          className="flex items-center mb-6 text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Notifications
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-2xl relative">
          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full border-4 border-blue-50 opacity-30"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full border-4 border-green-50 opacity-30"></div>
          
          {/* Decorative top border */}
          <div className={`h-1 ${getBorderColor(notification.type)}`}></div>
          
          {/* Header */}
          <div className={`bg-gradient-to-r ${getHeaderGradient(notification.type)} text-white p-6`}>
            <div className="flex items-center">
              <div className={`h-14 w-14 rounded-lg flex items-center justify-center shadow-md bg-white bg-opacity-20 mr-4`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div>
                <span className="text-sm font-medium text-white text-opacity-80">
                  {getNotificationTypeText(notification.type)}
                </span>
                <h1 className="text-2xl font-bold">
                  {notification.title || getNotificationTypeText(notification.type) + " Notification"}
                </h1>
                <div className="flex items-center mt-1 text-white text-opacity-80 text-sm">
                  <Clock className="mr-1" size={14} />
                  <span>
                    {formatTimestamp(notification.timestamp || notification.createdAt || notification.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <div className={`bg-opacity-10 ${getIconBgColor(notification.type)} p-5 rounded-lg border-l-4 ${getBorderColor(notification.type)} mb-6`}>
              <p className="text-gray-700 whitespace-pre-line">{notification.message}</p>
            </div>

            {/* Details Section */}
            {(notification.doctor || notification.date || notification.time || notification.location) && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Calendar className="mr-2 text-blue-500" size={20} />
                  Details
                </h2>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notification.doctor && (
                      <div className="flex items-start">
                        <Heart className="text-red-500 mr-3 mt-1" size={18} />
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Doctor</p>
                          <p className="text-base font-medium text-gray-800">{notification.doctor}</p>
                        </div>
                      </div>
                    )}
                    {notification.date && (
                      <div className="flex items-start">
                        <Calendar className="text-blue-500 mr-3 mt-1" size={18} />
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Date</p>
                          <p className="text-base font-medium text-gray-800">{notification.date}</p>
                        </div>
                      </div>
                    )}
                    {notification.time && (
                      <div className="flex items-start">
                        <Clock className="text-green-500 mr-3 mt-1" size={18} />
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Time</p>
                          <p className="text-base font-medium text-gray-800">{notification.time}</p>
                        </div>
                      </div>
                    )}
                    {notification.location && (
                      <div className="flex items-start">
                        <AlertCircle className="text-purple-500 mr-3 mt-1" size={18} />
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                          <p className="text-base font-medium text-gray-800">{notification.location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info Section */}
            {notification.additionalInfo && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <FileText className="mr-2 text-green-500" size={20} />
                  Additional Information
                </h2>
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <p className="text-gray-700 whitespace-pre-line">{notification.additionalInfo}</p>
                </div>
              </div>
            )}

            {/* Payment Section */}
            {isPaymentNotification && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <CreditCard className="mr-2 text-orange-500" size={20} /> 
                  Payment Details
                </h2>
                
                <div className="bg-white rounded-lg shadow-lg border border-orange-100 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="bg-orange-50 p-6 flex-1">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-500">Amount Due</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(notification.payment_status || notification.paymentStatus)}`}>
                          {getPaymentStatusText(notification.payment_status || notification.paymentStatus)}
                        </span>
                      </div>
                      
                      <p className="text-3xl font-bold text-gray-800">
                        {getPaymentAmount(notification.payment_amount || notification.paymentAmount)}
                      </p>
                      
                      <p className="text-sm flex items-center mt-4 text-gray-500">
                        <Mail className="mr-2 text-gray-400" size={14} />
                        {notification.userId || notification.user_id}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-b from-blue-50 to-white p-6 flex-1 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-200">
                      <div className="text-center mb-4">
                        <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="text-green-500" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800">Ready to Complete</h3>
                        <p className="text-sm text-gray-500 mt-1">Secure payment processing</p>
                      </div>
                      
                      {notification.payment_link && (
                        <a 
                          href={notification.payment_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 text-center font-medium transition duration-200 shadow-md hover:shadow-lg"
                        >
                          Complete Payment <ExternalLink size={14} className="inline ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-6 bg-blue-50 border-t border-gray-100 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Notification ID: {notification.id}
            </p>
            <button 
              onClick={handleBack}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <ArrowLeft size={14} className="mr-1" />
              Back to Notifications
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotificationDetailsComponent;