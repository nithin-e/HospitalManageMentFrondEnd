import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { UserfetchingAppointMents } from '@/store/userSideApi/UserfetchingAppointMents';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/redux/store';
import Navbar from './Navbar';
import Footer from './Footer';

interface Appointment {
  id: string;
  adminAmount: string;
  amount: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorAmount: string;
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
  userRefoundAmount: string;
}

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending';
  appointmentId?: string;
  specialty?: string;
  doctorName?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalAppointments: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

const UserWalletComponent: React.FC = () => {
  const [totalBalance, setTotalBalance] = useState(0); 
  const [showBalance, setShowBalance] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 0,
    totalAppointments: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 2
  });

  const user = useSelector((state: RootState) => state.user);
  const userData = user?.user || user?.user || null;
  const userEmail = userData?.email || '';

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === 0) return 'Today';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Helper function to get transaction description
  const getTransactionDescription = (appointment: Appointment, type: 'sent' | 'received'): string => {
    const doctorName = appointment.doctorName || 'Doctor';
    const specialty = appointment.specialty || 'Medical';
    
    if (type === 'received') {
      if (appointment.status === 'cancelled') {
        return `Refund - ${specialty} Consultation`;
      }
      return `Payment Received - ${specialty}`;
    } else {
      return `${specialty} Consultation - ${doctorName}`;
    }
  };

  // Process appointments into transactions - for current page display
  const processAppointmentsToTransactions = (appointmentData: Appointment[]): Transaction[] => {
    const processedTransactions: Transaction[] = [];
    
    appointmentData.forEach(appointment => {
      // Add original payment transaction (sent) - only if amount exists
      if (appointment.amount && parseFloat(appointment.amount) > 0) {
        processedTransactions.push({
          id: `payment-${appointment.id}`,
          type: 'sent',
          amount: parseFloat(appointment.amount),
          description: getTransactionDescription(appointment, 'sent'),
          date: formatDate(appointment.appointmentDate),
          status: appointment.paymentStatus === 'paid' ? 'completed' : 'pending',
          appointmentId: appointment.id,
          specialty: appointment.specialty,
          doctorName: appointment.doctorName
        });
      }

      // Add refund transaction if appointment is cancelled and refund amount exists
      if (appointment.status === 'cancelled' && appointment.userRefoundAmount && parseFloat(appointment.userRefoundAmount) > 0) {
        processedTransactions.push({
          id: `refund-${appointment.id}`,
          type: 'received',
          amount: parseFloat(appointment.userRefoundAmount),
          description: getTransactionDescription(appointment, 'received'),
          date: formatDate(appointment.appointmentDate),
          status: 'completed',
          appointmentId: appointment.id,
          specialty: appointment.specialty,
          doctorName: appointment.doctorName
        });
      }
    });

    // Sort transactions by date (newest first)
    return processedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Calculate total balance from ALL appointments (not paginated)
  const calculateTotalBalance = (allAppointmentsData: Appointment[]): number => {
    return allAppointmentsData.reduce((total, appointment) => {
      let balance = total;
      
      // Subtract payment amount (money spent)
      if (appointment.amount && parseFloat(appointment.amount) > 0) {
        balance -= parseFloat(appointment.amount);
      }
      
      // Add refund amount (money received back)
      if (appointment.status === 'cancelled' && appointment.userRefoundAmount && parseFloat(appointment.userRefoundAmount) > 0) {
        balance += parseFloat(appointment.userRefoundAmount);
      }
      
      return balance;
    }, 0);
  };

  // Fetch all appointments for balance calculation (without pagination)
  const fetchAllAppointmentsForBalance = async () => {
    if (!userEmail) return [];

    try {
      // Fetch a large number to get all appointments for balance calculation
      // You might want to create a separate API endpoint for this, but for now using a high limit
      const res = await UserfetchingAppointMents(userEmail, 1, 1000); // Assuming 1000 is enough to get all
      
      if (res.success && res.appointments) {
        return res.appointments;
      }
      return [];
    } catch (error) {
      console.error('Error fetching all appointments for balance:', error);
      return [];
    }
  };

  useEffect(() => {
    if (userEmail) {
      // Fetch both paginated appointments and all appointments for balance
      Promise.all([
        fetchUserAppoinMents(1),
        fetchAllAppointmentsForBalance()
      ]).then(([_, allAppts]) => {
        if (allAppts && allAppts.length > 0) {
          setAllAppointments(allAppts);
          const calculatedTotalBalance = calculateTotalBalance(allAppts);
          setTotalBalance(calculatedTotalBalance);
        }
      });
    }
  }, [userEmail]);

  const fetchUserAppoinMents = async (page: number = paginationInfo.currentPage) => {
    if (!userEmail) {
      setError('User email not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Call API with limit of 2 per page
      const res = await UserfetchingAppointMents(userEmail, page, 2);
      console.log('Fetched appointments.................:', res);
      
      if (res.success && res.appointments) {
        setAppointments(res.appointments);
        
        // Update pagination info using backend response
        setPaginationInfo({
          currentPage: res.currentPage || page,
          totalPages: res.totalPages || 1,
          totalAppointments: res.totalAppointments || 0,
          hasNextPage: res.hasNextPage || false,
          hasPrevPage: res.hasPrevPage || false,
          limit: res.limit || 2
        });
        
        // Process appointments into transactions for current page
        const processedTransactions = processAppointmentsToTransactions(res.appointments);
        setTransactions(processedTransactions);
        
        // If this is the first load or we don't have all appointments yet, fetch them for balance
        if (allAppointments.length === 0 || page === 1) {
          const allAppts = await fetchAllAppointmentsForBalance();
          if (allAppts && allAppts.length > 0) {
            setAllAppointments(allAppts);
            const calculatedTotalBalance = calculateTotalBalance(allAppts);
            setTotalBalance(calculatedTotalBalance);
          }
        }
        
      } else {
        setError(res.message || 'Failed to fetch appointments');
        // Reset states when there's an error
        setAppointments([]);
        setTransactions([]);
        setPaginationInfo({
          currentPage: 1,
          totalPages: 0,
          totalAppointments: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 2
        });
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to fetch appointment data');
      // Reset states when there's an error
      setAppointments([]);
      setTransactions([]);
      setPaginationInfo({
        currentPage: 1,
        totalPages: 0,
        totalAppointments: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 2
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationInfo.totalPages && newPage !== paginationInfo.currentPage) {
      fetchUserAppoinMents(newPage);
    }
  };

  const handleNextPage = () => {
    if (paginationInfo.hasNextPage) {
      handlePageChange(paginationInfo.currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (paginationInfo.hasPrevPage) {
      handlePageChange(paginationInfo.currentPage - 1);
    }
  };

  useEffect(() => {
    // Add floating medical symbols effect
    const addMedicalSymbols = () => {
      const symbolsContainer = document.getElementById('medical-symbols-container');
      if (!symbolsContainer) return;

      const symbols = ['⚕️', '+', '🩺', '💊', '🏥', '🫀', '🧠', '🦴', '💉', '🧬', '⚕️'];
      const count = 24;
      
      for (let i = 0; i < count; i++) {
        const symbol = document.createElement('div');
        symbol.className = 'medical-symbol';
        symbol.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        
        const size = Math.random() * 22 + 14;
        const isPlus = symbol.innerText === '+';
        
        symbol.style.position = 'absolute';
        symbol.style.fontSize = `${isPlus ? size * 2 : size}px`;
        symbol.style.color = isPlus ? 'rgba(59, 130, 246, 0.3)' : 'rgba(46, 204, 113, 0.3)';
        symbol.style.left = `${Math.random() * 90 + 5}%`;
        symbol.style.top = `${Math.random() * 70 + 15}%`;
        symbol.style.opacity = '0';
        symbol.style.transform = 'translateY(20px) rotate(0deg)';
        symbol.style.transition = 'all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        symbol.style.animation = `float ${Math.random() * 8 + 12}s ease-in-out infinite`;
        symbol.style.animationDelay = `${Math.random() * 5}s`;
        symbol.style.zIndex = '0';
        
        symbolsContainer.appendChild(symbol);
        
        setTimeout(() => {
          symbol.style.opacity = '1';
          symbol.style.transform = `translateY(0) rotate(${Math.random() * 20 - 10}deg)`;
        }, Math.random() * 1200 + 500);
      }
    };

    // Add CSS keyframes for float animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        25% { transform: translateY(-10px) rotate(2deg); }
        50% { transform: translateY(-20px) rotate(-2deg); }
        75% { transform: translateY(-10px) rotate(1deg); }
      }
    `;
    document.head.appendChild(style);

    addMedicalSymbols();

    return () => {
      const symbolsContainer = document.getElementById('medical-symbols-container');
      if (symbolsContainer) {
        symbolsContainer.innerHTML = '';
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const formatAmount = (amount: number) => {
    const formattedAmount = amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return showBalance ? `₹${formattedAmount}` : '••••••';
  };

  // Get page numbers to display in pagination
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const { currentPage, totalPages } = paginationInfo;
    
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const pages: number[] = [];
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push(-1); // Ellipsis indicator
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(-1); // Ellipsis indicator
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'rgb(0, 59, 115)' }} />
          <span className="text-lg" style={{ color: 'rgb(0, 59, 115)' }}>Loading wallet data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white mt-[70px]">
      <Navbar/>
      {/* Medical symbols background */}
      <div id="medical-symbols-container" className="fixed inset-0 pointer-events-none" />
      
      {/* Main container */}
      <div className="relative z-10 min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
              <button 
                onClick={() => fetchUserAppoinMents(1)}
                className="mt-2 text-red-600 text-sm hover:text-red-800 underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Balance Card */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Balance (All Appointments)</p>
                <div className="flex items-center gap-3">
                  <h2 className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(totalBalance)}
                  </h2>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {showBalance ? <Eye className="w-5 h-5 text-gray-600" /> : <EyeOff className="w-5 h-5 text-gray-600" />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs">
                  {paginationInfo.totalAppointments} total appointment{paginationInfo.totalAppointments !== 1 ? 's' : ''}
                </p>
                <p className="text-gray-500 text-xs">
                  {appointments.length} current appointment{appointments.length !== 1 ? 's' : ''}
                </p>
                <p className="text-gray-500 text-xs">
                  {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} this page
                </p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'rgb(0, 59, 115)' }}>
                Transaction History
                {paginationInfo.totalAppointments > 0 && (
                  <span className="ml-2 text-sm text-gray-500 font-normal">
                    (Page {paginationInfo.currentPage} of {paginationInfo.totalPages})
                  </span>
                )}
              </h3>
              <button 
                onClick={() => fetchUserAppoinMents(paginationInfo.currentPage)}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No transactions found</p>
                <p className="text-gray-400 text-xs mt-1">
                  Your appointment transactions will appear here
                </p>
              </div>
            ) : (
              <>
                {/* Transactions List */}
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'received' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {tx.type === 'received' ? 
                            <ArrowDownLeft className="w-5 h-5 text-green-600" /> :
                            <ArrowUpRight className="w-5 h-5 text-red-600" />
                          }
                        </div>
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{tx.date}</span>
                            {tx.specialty && (
                              <>
                                <span>•</span>
                                <span>{tx.specialty}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          tx.type === 'received' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.type === 'received' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Pagination Controls */}
                {paginationInfo.totalPages > 1 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    {/* Results Summary */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div className="text-sm text-gray-600">
                        Showing {((paginationInfo.currentPage - 1) * paginationInfo.limit) + 1} to{' '}
                        {Math.min(paginationInfo.currentPage * paginationInfo.limit, paginationInfo.totalAppointments)} of{' '}
                        {paginationInfo.totalAppointments} appointments
                      </div>
                      
                      {/* Quick page jump for large datasets */}
                      {paginationInfo.totalPages > 10 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Go to page:</span>
                          <input
                            type="number"
                            min="1"
                            max={paginationInfo.totalPages}
                            value={paginationInfo.currentPage}
                            onChange={(e) => {
                              const page = parseInt(e.target.value);
                              if (page >= 1 && page <= paginationInfo.totalPages) {
                                handlePageChange(page);
                              }
                            }}
                            className="w-16 px-2 py-1 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-600">of {paginationInfo.totalPages}</span>
                        </div>
                      )}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={handlePrevPage}
                        disabled={!paginationInfo.hasPrevPage || loading}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) => (
                          <React.Fragment key={index}>
                            {page === -1 ? (
                              <span className="px-3 py-2 text-gray-400">...</span>
                            ) : (
                              <button
                                onClick={() => handlePageChange(page)}
                                disabled={loading}
                                className={`min-w-[40px] h-10 text-sm font-medium rounded-lg transition-colors ${
                                  page === paginationInfo.currentPage
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                } disabled:opacity-50`}
                              >
                                {page}
                              </button>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      
                      {/* Next Button */}
                      <button
                        onClick={handleNextPage}
                        disabled={!paginationInfo.hasNextPage || loading}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mobile-friendly pagination info */}
                    <div className="mt-3 text-center text-xs text-gray-500 sm:hidden">
                      Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Appointment Summary */}
          {appointments.length > 0 && (
            <div className="mt-6 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(0, 59, 115)' }}>
                Current Page Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {appointments.filter(apt => apt.status === 'confirmed' || apt.status === 'completed').length}
                  </p>
                  <p className="text-sm text-blue-600">Completed</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {appointments.filter(apt => apt.status === 'cancelled').length}
                  </p>
                  <p className="text-sm text-red-600">Cancelled</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {appointments.filter(apt => apt.status === 'pending').length}
                  </p>
                  <p className="text-sm text-yellow-600">Pending</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    ₹{appointments.reduce((total, apt) => {
                      return total + (apt.userRefoundAmount ? parseFloat(apt.userRefoundAmount) : 0);
                    }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-green-600">Total Refunds</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default UserWalletComponent;