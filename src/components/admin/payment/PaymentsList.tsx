import React, { useEffect, useState } from 'react';
import { Wallet, Calendar, DollarSign, Filter, Search, Loader2, Plus, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, ChevronDown, ChevronUp } from 'lucide-react';
import { FetchingAllUserAppointsMentsAdmin } from '@/store/AdminSideApi/FetchingAllUserAppointsMentsAdmin';

interface Payment {
  id: string;
  amount: number;
  adminAmount: number;
  doctorAmount: number; 
  userRefoundAmount: number; 
  currency: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  appointmentStatus: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'; 
  method: 'card' | 'bank' | 'paypal' | 'crypto' | 'online';
  recipient: string;
  patientName?: string;
  doctorName?: string;
  specialty?: string;
  appointmentTime?: string;
  notes?: string;
  cancellationNote?: string; 
}

interface Appointment {
  id: string;
  amount: string;
  adminAmount: string;
  doctorAmount: string; 
  userRefoundAmount: string; 
  appointmentDate: string;
  appointmentTime: string;
  doctorEmail: string;
  doctorName: string;
  message: string;
  notes: string;
  patientEmail: string;
  patientName: string;
  patientPhone: string;
  paymentStatus: string;
  payment_method: string;
  specialty: string;
  status: string; 
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface FilterOptions {
  amountRange: {
    min: number | '';
    max: number | '';
  };
  paymentStatus: string[];
  appointmentStatus: string[];
  showRefundedOnly: boolean;
  showCancelledOnly: boolean;
  searchTerm: string;
}

const PaymentList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    amountRange: { min: '', max: '' },
    paymentStatus: [],
    appointmentStatus: [],
    showRefundedOnly: false,
    showCancelledOnly: false,
    searchTerm: ''
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 8,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Summary states for all data (not just current page)
  const [totalAdminWalletAmount, setTotalAdminWalletAmount] = useState(0);
  const [totalRefundedAmount, setTotalRefundedAmount] = useState(0);
  const [cancelledAppointmentsCount, setCancelledAppointmentsCount] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  
  // Flag to track if summary data has been loaded (to prevent overwriting on pagination)
  const [summaryDataLoaded, setSummaryDataLoaded] = useState(false);
  
  useEffect(() => {
    fetchUserFullAppointments(currentPage);
  }, [currentPage]);

  // Apply filters whenever filters change or payments data changes
  useEffect(() => {
    applyFilters();
  }, [payments, filters]);

  const transformAppointmentToPayment = (appointment: Appointment): Payment => {
    // Map payment status from API to our status type
    const getPaymentStatus = (status: string): Payment['status'] => {
      const normalizedStatus = status.toLowerCase();
      if (normalizedStatus === 'success' || normalizedStatus === 'suceess') return 'completed';
      if (normalizedStatus === 'pending') return 'pending';
      return 'failed';
    };

    // Map appointment status
    const getAppointmentStatus = (status: string): Payment['appointmentStatus'] => {
      const normalizedStatus = status.toLowerCase();
      if (normalizedStatus === 'cancelled') return 'cancelled';
      if (normalizedStatus === 'completed') return 'completed';
      if (normalizedStatus === 'rescheduled') return 'rescheduled';
      return 'scheduled'; // default for active appointments
    };

    // Map payment method
    const getPaymentMethod = (method: string): Payment['method'] => {
      const normalizedMethod = method.toLowerCase();
      if (normalizedMethod === 'online') return 'online' as Payment['method'];
      if (normalizedMethod === 'card') return 'card';
      if (normalizedMethod === 'bank') return 'bank';
      if (normalizedMethod === 'paypal') return 'paypal';
      if (normalizedMethod === 'crypto') return 'crypto';
      return 'card'; // default
    };

    // Generate cancellation note if appointment is cancelled
    const getCancellationNote = (appointmentStatus: string): string | undefined => {
      if (appointmentStatus.toLowerCase() === 'cancelled') {
        return 'User cancelled the appointment slot, so the admin share will be refunded.';
      }
      return undefined;
    };

    const appointmentStatus = getAppointmentStatus(appointment.status);

    return {
      id: appointment.id,
      amount: parseFloat(appointment.amount || '0'),
      adminAmount: parseFloat(appointment.adminAmount || '0'),
      doctorAmount: parseFloat(appointment.doctorAmount || '0'),
      userRefoundAmount: parseFloat(appointment.userRefoundAmount || '0'), // Convert string to number
      currency: 'INR', // Changed to Indian Rupees
      description: `Medical Appointment - ${appointment.specialty}`,
      date: appointment.appointmentDate, // Fixed: Use appointmentDate instead of date
      status: getPaymentStatus(appointment.paymentStatus),
      appointmentStatus: appointmentStatus,
      method: getPaymentMethod(appointment.payment_method),
      recipient: appointment.doctorName,
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      specialty: appointment.specialty,
      appointmentTime: appointment.appointmentTime,
      notes: appointment.notes,
      cancellationNote: getCancellationNote(appointment.status)
    };
  };

  // const fetchUserFullAppointments = async (page: number = 1) => {
  //   try {
  //     setLoading(true);
  //     setError(null);
      
  //     const response = await FetchingAllUserAppointsMentsAdmin({ page, limit: 8 });
  //     console.log('check this response while the fecting payments',response);
      
  //     if (response.appointments) {
  //       const transformedPayments = response.appointments.map(transformAppointmentToPayment);
  //       setPayments(transformedPayments);
        
        
  //       if (response.appointments) {
  //         setPagination({
  //           currentPage: response.appointments.currentPage || page,
  //           totalPages: response.appointments.totalPages || 1,
  //           totalItems: response.appointments.totalItems || transformedPayments.length,
  //           itemsPerPage: response.appointments.itemsPerPage || 8,
  //           hasNextPage: response.appointments.hasNextPage || false,
  //           hasPrevPage: response.appointments.hasPrevPage || false
  //         });
  //       }
        
        
  //       if (!summaryDataLoaded) {
  //         if (response.appointments.summary) {
  //           console.log('API.............. Response:', response);
          
  //           setTotalAdminWalletAmount(response.appointments.summary.totalAdminWalletAmount || 0);
  //           setTotalRefundedAmount(response.result.appointments.totalRefundedAmount || 0);
  //           setCancelledAppointmentsCount(response.appointments.summary.cancelledAppointmentsCount || 0);
  //           setTotalTransactions(response.appointments.summary.totalTransactions || response.appointments.totalItems || transformedPayments.length);
  //         } else {

  //           console.warn("No summary data available in API response, fetching all data to calculate totals");
  //           await fetchAllDataForSummary();
  //         }
  //         setSummaryDataLoaded(true);
  //       }
  //     } else {
  //       // If no appointments, set empty array
  //       setPayments([]);
  //       setPagination({
  //         currentPage: 1,
  //         totalPages: 1,
  //         totalItems: 0,
  //         itemsPerPage: 8,
  //         hasNextPage: false,
  //         hasPrevPage: false
  //       });
        
  //       // Only reset summary values if this is the first load or a refresh
  //       if (!summaryDataLoaded) {
  //         setTotalAdminWalletAmount(0);
  //         setTotalRefundedAmount(0);
  //         setCancelledAppointmentsCount(0);
  //         setTotalTransactions(0);
  //         setSummaryDataLoaded(true);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error fetching appointments:', error);
  //     setError('Failed to load payment data. Please try again.');
  //     setPayments([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Function to fetch all data for summary calculation when API doesn't provide summary
  
  const fetchUserFullAppointments = async (page: number = 1) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await FetchingAllUserAppointsMentsAdmin({ page, limit: 8 });
    console.log('API Response:', response);
    
    if (response && response.appointments) {
      const transformedPayments = response.appointments.map(transformAppointmentToPayment);
      setPayments(transformedPayments);
      
      // Set pagination data
      if (response.appointments) {
        setPagination({
          currentPage: response.appointments.currentPage || page,
          totalPages: response.appointments.totalPages || 1,
          totalItems: response.appointments.totalItems || transformedPayments.length,
          itemsPerPage: response.appointments.itemsPerPage || 8,
          hasNextPage: response.appointments.hasNextPage || false,
          hasPrevPage: response.appointments.hasPrevPage || false
        });
      }
      
      // Handle summary data - FIXED THIS PART
      if (!summaryDataLoaded) {
        console.log('Raw API response for summary:', response);
        
        // Try different possible locations for summary data
        let summaryData = null;
        
        // Check various possible locations in the response
        if (response.summary) {
          summaryData = response.summary;
        } else if (response.appointments.summary) {
          summaryData = response.appointments.summary;
        } else if (response.result?.summary) {
          summaryData = response.result.summary;
        } else if (response.data?.summary) {
          summaryData = response.data.summary;
        }
        
        if (summaryData) {
          console.log('Found summary data:', summaryData);
          setTotalAdminWalletAmount(summaryData.totalAdminWalletAmount || 0);
          setTotalRefundedAmount(summaryData.totalRefundedAmount || 0);
          setCancelledAppointmentsCount(summaryData.cancelledAppointmentsCount || 0);
          setTotalTransactions(summaryData.totalTransactions || response.appointments.totalItems || transformedPayments.length);
        } else {
          // If no summary data in API, calculate from current data as fallback
          console.warn("No summary data available in API response, calculating from current page data");
          calculateSummaryFromPayments(transformedPayments);
        }
        setSummaryDataLoaded(true);
      }
    } else {
      // If no appointments, set empty array
      setPayments([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 8,
        hasNextPage: false,
        hasPrevPage: false
      });
      
      // Only reset summary values if this is the first load or a refresh
      if (!summaryDataLoaded) {
        setTotalAdminWalletAmount(0);
        setTotalRefundedAmount(0);
        setCancelledAppointmentsCount(0);
        setTotalTransactions(0);
        setSummaryDataLoaded(true);
      }
    }
  } catch (error) {
    console.error('Error fetching appointments:', error);
    setError('Failed to load payment data. Please try again.');
    setPayments([]);
  } finally {
    setLoading(false);
  }
};
  

const calculateSummaryFromPayments = (paymentsData: Payment[]) => {
  let totalAdminAmount = 0;
  let totalRefunded = 0;
  let cancelledCount = 0;
  
  paymentsData.forEach(payment => {
    // Only add admin amount if appointment is not cancelled
    if (payment.appointmentStatus !== 'cancelled') {
      totalAdminAmount += payment.adminAmount;
    }
    
    if (payment.appointmentStatus === 'cancelled') {
      cancelledCount++;
      totalRefunded += payment.userRefoundAmount;
    }
  });
  
  setTotalAdminWalletAmount(totalAdminAmount);
  setTotalRefundedAmount(totalRefunded);
  setCancelledAppointmentsCount(cancelledCount);
  setTotalTransactions(paymentsData.length);
};
// 
// Also update your refresh function to recalculate summary
const handleRefresh = () => {
  setSummaryDataLoaded(false); // Reset flag to allow summary data to be updated
  setCurrentPage(1); // Reset to first page
  fetchUserFullAppointments(1);
};



  const fetchAllDataForSummary = async () => {
    try {
      // Fetch first page to get total pages
      const firstPageResponse = await FetchingAllUserAppointsMentsAdmin({ page: 1, limit: 8 });
      
      if (firstPageResponse?.result) {
        const totalPages = firstPageResponse.result.totalPages || 1;
        const allAppointments: Appointment[] = [];
        
        // Fetch all pages
        const fetchPromises = [];
        for (let i = 1; i <= totalPages; i++) {
          fetchPromises.push(FetchingAllUserAppointsMentsAdmin({ page: i, limit: 8 }));
        }
        
        const allResponses = await Promise.all(fetchPromises);
        
        // Collect all appointments
        allResponses.forEach(response => {
          if (response?.result?.appointments) {
            allAppointments.push(...response.result.appointments);
          }
        });
        
        // Calculate totals
        let totalAdminAmount = 0;
        let totalRefunded = 0;
        let cancelledCount = 0;
        
        allAppointments.forEach(appointment => {
          const adminAmount = parseFloat(appointment.adminAmount || '0');
          const userRefundAmount = parseFloat(appointment.userRefoundAmount || '0');
          const status = appointment.status.toLowerCase();
          
          // Only add admin amount if appointment is not cancelled
          if (status !== 'cancelled') {
            totalAdminAmount += adminAmount;
          }
          
          if (status === 'cancelled') {
            cancelledCount++;
            totalRefunded += userRefundAmount;
          }
        });
        
        // Update summary states
        setTotalAdminWalletAmount(totalAdminAmount);
        setTotalRefundedAmount(totalRefunded);
        setCancelledAppointmentsCount(cancelledCount);
        setTotalTransactions(allAppointments.length);
      }
    } catch (error) {
      console.error('Error fetching all data for summary:', error);
      // Fallback to current page data if fetching all fails
      const currentPageAdminTotal = payments.reduce((sum, payment) => {
        return payment.appointmentStatus !== 'cancelled' ? sum + payment.adminAmount : sum;
      }, 0);
      setTotalAdminWalletAmount(currentPageAdminTotal);
      setTotalTransactions(payments.length);
    }
  };

  // Filter application function
  const applyFilters = () => {
    let filtered = [...payments];

    // Amount range filter
    if (filters.amountRange.min !== '' || filters.amountRange.max !== '') {
      filtered = filtered.filter(payment => {
        const amount = payment.amount;
        const minAmount = filters.amountRange.min === '' ? 0 : Number(filters.amountRange.min);
        const maxAmount = filters.amountRange.max === '' ? Infinity : Number(filters.amountRange.max);
        return amount >= minAmount && amount <= maxAmount;
      });
    }

    // Payment status filter
    if (filters.paymentStatus.length > 0) {
      filtered = filtered.filter(payment => 
        filters.paymentStatus.includes(payment.status)
      );
    }

    // Appointment status filter
    if (filters.appointmentStatus.length > 0) {
      filtered = filtered.filter(payment => 
        filters.appointmentStatus.includes(payment.appointmentStatus)
      );
    }

    // Show refunded only filter
    if (filters.showRefundedOnly) {
      filtered = filtered.filter(payment => payment.userRefoundAmount > 0);
    }

    // Show cancelled only filter
    if (filters.showCancelledOnly) {
      filtered = filtered.filter(payment => payment.appointmentStatus === 'cancelled');
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.patientName?.toLowerCase().includes(searchTerm) ||
        payment.doctorName?.toLowerCase().includes(searchTerm) ||
        payment.specialty?.toLowerCase().includes(searchTerm) ||
        payment.notes?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredPayments(filtered);
  };

  // Filter update functions
  const updateAmountRange = (field: 'min' | 'max', value: string) => {
    setFilters(prev => ({
      ...prev,
      amountRange: {
        ...prev.amountRange,
        [field]: value === '' ? '' : Number(value)
      }
    }));
  };

  const togglePaymentStatus = (status: Payment['status']) => {
    setFilters(prev => ({
      ...prev,
      paymentStatus: prev.paymentStatus.includes(status)
        ? prev.paymentStatus.filter(s => s !== status)
        : [...prev.paymentStatus, status]
    }));
  };

  const toggleAppointmentStatus = (status: Payment['appointmentStatus']) => {
    setFilters(prev => ({
      ...prev,
      appointmentStatus: prev.appointmentStatus.includes(status)
        ? prev.appointmentStatus.filter(s => s !== status)
        : [...prev.appointmentStatus, status]
    }));
  };

  const clearFilters = () => {
    setFilters({
      amountRange: { min: '', max: '' },
      paymentStatus: [],
      appointmentStatus: [],
      showRefundedOnly: false,
      showCancelledOnly: false,
      searchTerm: ''
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.amountRange.min !== '' || filters.amountRange.max !== '') count++;
    if (filters.paymentStatus.length > 0) count++;
    if (filters.appointmentStatus.length > 0) count++;
    if (filters.showRefundedOnly) count++;
    if (filters.showCancelledOnly) count++;
    if (filters.searchTerm) count++;
    return count;
  };

  // Modified refresh function to reset summary data
  // const handleRefresh = () => {
  //   setSummaryDataLoaded(false); // Reset flag to allow summary data to be updated
  //   setCurrentPage(1); // Reset to first page
  //   fetchUserFullAppointments(1);
  // };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePrevious = () => {
    if (pagination.hasPrevPage) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (pagination.hasNextPage) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    handlePageChange(1);
  };

  const handleLast = () => {
    handlePageChange(pagination.totalPages);
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAppointmentStatusColor = (status: Payment['appointmentStatus']) => {
    switch (status) {
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-indigo-100 text-indigo-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: Payment['method']) => {
    switch (method) {
      case 'card': return <span className="text-lg">₹</span>;
      case 'bank': return <span className="text-lg">₹</span>;
      case 'paypal': return <div className="w-4 h-4 bg-blue-500 rounded-full" />;
      case 'crypto': return <div className="w-4 h-4 bg-orange-500 rounded" />;
      case 'online': return <span className="text-lg">₹</span>;
      default: return <span className="text-lg">₹</span>;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0 // Remove decimal places for Indian currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    // Handle time format that might come as "10:46 AM" from API
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    // If it's in 24-hour format, convert it
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading wallet data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <Wallet className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Wallet</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wallet className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Wallet</h1>
                <p className="text-gray-600">Manage all payment transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${
                  showFilters ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getActiveFilterCount()}
                  </span>
                )}
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Patient, doctor, specialty..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range (₹)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.amountRange.min}
                    onChange={(e) => updateAmountRange('min', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.amountRange.max}
                    onChange={(e) => updateAmountRange('max', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <div className="space-y-2">
                  {(['completed', 'pending', 'failed'] as Payment['status'][]).map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.paymentStatus.includes(status)}
                        onChange={() => togglePaymentStatus(status)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Appointment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Status</label>
                <div className="space-y-2">
                  {(['scheduled', 'completed', 'cancelled', 'rescheduled'] as Payment['appointmentStatus'][]).map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.appointmentStatus.includes(status)}
                        onChange={() => toggleAppointmentStatus(status)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Filters</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.showRefundedOnly}
                      onChange={(e) => setFilters(prev => ({ ...prev, showRefundedOnly: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show Refunded Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.showCancelledOnly}
                      onChange={(e) => setFilters(prev => ({ ...prev, showCancelledOnly: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show Cancelled Only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Total Admin Wallet Amount Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">Total Earnings</h2>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(totalAdminWalletAmount)}
            </p>
            <p className="text-gray-500 mt-2 text-sm">
              Admin share from all completed transactions
            </p>
          </div>

          {/* Total Transactions Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">Total Transactions</h2>
            <p className="text-3xl font-bold text-blue-600">
              {totalTransactions}
            </p>
            <p className="text-gray-500 mt-2 text-sm">
              All appointment transactions
            </p>
          </div>
          
          {/* Cancelled Appointments Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">Cancelled Appointments</h2>
            <p className="text-3xl font-bold text-red-600">
              {cancelledAppointmentsCount}
            </p>
            <p className="text-gray-500 mt-2 text-sm">
              Total refunded: {formatCurrency(totalRefundedAmount)}
            </p>
          </div>

          {/* Current Page Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">Filtered Results</h2>
            <p className="text-3xl font-bold text-indigo-600">
              {filteredPayments.length}
            </p>
            <p className="text-gray-500 mt-2 text-sm">
              {getActiveFilterCount() > 0 ? 'Matching filters' : `Page ${currentPage} of ${pagination.totalPages}`}
            </p>
          </div>
        </div>

        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Active Filters:</span>
                <span className="text-sm text-blue-700">
                  {filteredPayments.length} of {payments.length} transactions shown
                </span>
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Payments Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Refund
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-48">
                          {payment.specialty}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-48">
                          {payment.patientName} → {payment.doctorName}
                        </div>
                        {payment.notes && (
                          <div className="text-xs text-gray-400 mt-1 truncate max-w-48">
                            {payment.notes}
                          </div>
                        )}
                        {payment.cancellationNote && (
                          <div className="text-xs text-red-600 mt-1 p-1 bg-red-50 rounded flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span className="truncate">Refund due to cancellation</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-sm font-semibold text-gray-600">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        {getMethodIcon(payment.method)}
                        {payment.method}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className={`text-sm font-semibold ${
                        payment.appointmentStatus === 'cancelled' ? 'text-red-600 line-through' : 'text-green-600'
                      }`}>
                        {formatCurrency(payment.adminAmount, payment.currency)}
                      </div>
                      {payment.appointmentStatus === 'cancelled' && (
                        <div className="text-xs text-red-500">Refunded</div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-sm font-semibold text-blue-600">
                        {formatCurrency(payment.doctorAmount, payment.currency)}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {payment.appointmentStatus === 'cancelled' && payment.userRefoundAmount > 0 ? (
                        <div className="text-sm font-semibold text-red-600">
                          {formatCurrency(payment.userRefoundAmount, payment.currency)}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">-</div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-sm text-gray-700">
                        {formatDate(payment.date)}
                      </div>
                      {payment.appointmentTime && (
                        <div className="text-xs text-gray-500">
                          {formatTime(payment.appointmentTime)}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getAppointmentStatusColor(payment.appointmentStatus)}`}>
                          {payment.appointmentStatus.charAt(0).toUpperCase() + payment.appointmentStatus.slice(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPayments.length === 0 && !loading && (
            <div className="text-center py-8">
              <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {getActiveFilterCount() > 0 ? 'No results found' : 'No payments found'}
              </h3>
              <p className="text-gray-500">
                {getActiveFilterCount() > 0 
                  ? 'Try adjusting your filters to see more results.' 
                  : 'No appointment payments available yet.'
                }
              </p>
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Pagination - Only show if we have data and no filters are active */}
          {pagination.totalPages > 1 && getActiveFilterCount() === 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={handlePrevious}
                    disabled={!pagination.hasPrevPage}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!pagination.hasNextPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {Math.min((currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{pagination.totalItems}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      {/* First Page */}
                      <button
                        onClick={handleFirst}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronsLeft className="h-5 w-5" />
                      </button>
                      
                      {/* Previous Page */}
                      <button
                        onClick={handlePrevious}
                        disabled={!pagination.hasPrevPage}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      {/* Page Numbers */}
                      {generatePageNumbers().map((pageNumber) => (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNumber === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      ))}

                      {/* Next Page */}
                      <button
                        onClick={handleNext}
                        disabled={!pagination.hasNextPage}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      
                      {/* Last Page */}
                      <button
                        onClick={handleLast}
                        disabled={currentPage === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronsRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentList;