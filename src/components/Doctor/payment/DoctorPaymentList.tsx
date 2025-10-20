import React, { useEffect, useState } from 'react';
import { Wallet, Calendar, IndianRupee, Filter, Loader2, Plus, Stethoscope, ChevronLeft, ChevronRight } from 'lucide-react';
import { fectingAllUserAppointMents } from '@/store/DoctorSideApi/fectingFullUserAppointMents';
import Sidebar from "../../Doctor/layout/Sidebar";
import { useSelector } from 'react-redux';
import { RootState } from '@/store/redux/store';

interface Payment {
  id: string;
  amount: number;
  doctorAmount: number;
  currency: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  method: 'card' | 'bank' | 'paypal' | 'crypto' | 'online';
  recipient: string;
  patientName?: string;
  doctorName?: string;
  specialty?: string;
  appointmentTime?: string;
  notes?: string;
  doctorId?: string;
}

interface Appointment {
  id: string;
  amount: string;
  doctorAmount: string;
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
  doctorId?: string; 
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const DoctorPaymentList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]); // Store all payments for total calculation
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });

  const doctorId = useSelector((state: RootState) => state.doctor.data.doctor);
  const email = useSelector((state: RootState) => state.doctor.data.doctor.email);
  const doctor = useSelector((state: RootState) => state.doctor?.data?.doctor);
  const doctorName = `${doctor?.firstName || ''} `.trim() || 'Doctor';

  useEffect(() => {
    if (email) {
      fetchAllAppointmentsForBalance();
      fetchUserFullAppointments(1);
    }
  }, [email]);

  useEffect(() => {
    if (payments.length > 0) {
      const doctorSpecificPayments = payments.filter(payment => {
        const isDoctorPayment = 
          payment.doctorId === doctorId?.id || 
          payment.recipient === doctorName ||
          payment.doctorName === doctorName;
        
        return isDoctorPayment;
      });
      
      setFilteredPayments(doctorSpecificPayments);
    } else {
      setFilteredPayments([]);
    }
  }, [payments, doctorId, doctorName]);

  const transformAppointmentToPayment = (appointment: Appointment): Payment => {
    const getPaymentStatus = (status: string): Payment['status'] => {
      const normalizedStatus = status.toLowerCase();
      if (normalizedStatus === 'success' || normalizedStatus === 'suceess' || normalizedStatus === 'completed') return 'completed';
      if (normalizedStatus === 'pending') return 'pending';
      return 'failed';
    };

    const getPaymentMethod = (method: string): Payment['method'] => {
      const normalizedMethod = method.toLowerCase();
      if (normalizedMethod === 'online') return 'online' as Payment['method'];
      if (normalizedMethod === 'card') return 'card';
      if (normalizedMethod === 'bank') return 'bank';
      if (normalizedMethod === 'paypal') return 'paypal';
      if (normalizedMethod === 'crypto') return 'crypto';
      return 'card';
    };

    return {
      id: appointment.id,
      amount: parseFloat(appointment.amount || '0'),
      doctorAmount: parseFloat(appointment.doctorAmount || '0'),
      currency: 'INR',
      description: `Medical Appointment - ${appointment.specialty}`,
      date: appointment.appointmentDate,
      status: getPaymentStatus(appointment.paymentStatus || appointment.status),
      method: getPaymentMethod(appointment.payment_method || 'online'),
      recipient: appointment.doctorName,
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      specialty: appointment.specialty,
      appointmentTime: appointment.appointmentTime,
      notes: appointment.notes,
      doctorId: appointment.doctorId
    };
  };

  const fetchAllAppointmentsForBalance = async () => {
    if (!email) return;

    try {
      setBalanceLoading(true);
      const response = await fectingAllUserAppointMents(email, 1, 1000);
      
      if (response?.appointments) {
        const transformedPayments = response.appointments.map(transformAppointmentToPayment);
        
        const doctorSpecificPayments = transformedPayments.filter(payment => {
          const isDoctorPayment = 
            payment.doctorId === doctorId?.id || 
            payment.recipient === doctorName ||
            payment.doctorName === doctorName;
          
          return isDoctorPayment;
        });
        
        setAllPayments(doctorSpecificPayments);
      } else {
        setAllPayments([]);
      }
    } catch (error) {
      console.error('Error fetching all appointments for balance:', error);
      setAllPayments([]);
    } finally {
      setBalanceLoading(false);
    }
  };

  const fetchUserFullAppointments = async (page: number = 1, limit: number = 3) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fectingAllUserAppointMents(email, page, limit);
      
      if (response?.appointments) {
        const transformedPayments = response.appointments.map(transformAppointmentToPayment);
        setPayments(transformedPayments);
        setPagination({
          currentPage: response.currentPage || page,
          totalPages: response.totalPages || 1,
          totalItems: response.totalAppointments || 0,
          hasNext: response.hasNextPage || false,
          hasPrev: response.hasPrevPage || false
        });
      } else {
        setPayments([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          hasNext: false,
          hasPrev: false
        });
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load payment data. Please try again.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUserFullAppointments(newPage);
    }
  };

  const statusFilteredPayments = filteredPayments.filter(payment => {
    return statusFilter === 'all' || payment.status === statusFilter;
  });

  // Calculate total doctor wallet amount from ALL appointments (not just paginated)
  const totalDoctorWalletAmount = allPayments
    
    .reduce((sum, payment) => sum + payment.doctorAmount, 0);



  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: Payment['method']) => {
    switch (method) {
      case 'card': return <IndianRupee className="w-4 h-4" />;
      case 'bank': return <IndianRupee className="w-4 h-4" />;
      case 'paypal': return <div className="w-4 h-4 bg-blue-500 rounded-full" />;
      case 'crypto': return <div className="w-4 h-4 bg-orange-500 rounded" />;
      case 'online': return <div className="w-4 h-4 bg-purple-500 rounded" />;
      default: return <IndianRupee className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
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
    if (!timeString) return '';
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;
    
    if (pagination.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= pagination.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, pagination.currentPage - 1);
      let end = Math.min(pagination.totalPages - 1, pagination.currentPage + 1);
      
      if (start > 2) {
        pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < pagination.totalPages - 1) {
        pages.push('...');
      }
      
      pages.push(pagination.totalPages);
    }
    
    return pages;
  };

  if (loading && balanceLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed left-0 top-0 h-full w-64 z-10 bg-white shadow-lg">
          <Sidebar doctorName={doctorName} />
        </div>
        <div className="ml-64 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading doctor payment data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed left-0 top-0 h-full w-64 z-10 bg-white shadow-lg">
          <Sidebar doctorName={doctorName} />
        </div>
        <div className="ml-64 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <Stethoscope className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Doctor Payments</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => {
                  fetchAllAppointmentsForBalance();
                  fetchUserFullAppointments(1);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed left-0 top-0 h-full w-64 z-10 bg-white shadow-lg">
        <Sidebar doctorName={doctorName} />
      </div>
      
      <div className="ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Stethoscope className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Payments</h1>
                  <p className="text-gray-600">Track your appointment payment transactions</p>
                  <p className="text-sm text-blue-600">
                    Doctor ID: {doctorId?.id} | Total Appointments: {pagination.totalItems}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    fetchAllAppointmentsForBalance();
                    fetchUserFullAppointments(pagination.currentPage);
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  disabled={loading || balanceLoading}
                >
                  <IndianRupee className="w-4 h-4" />
                  {(loading || balanceLoading) ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-6 text-center">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">My Total Earnings</h2>
            {balanceLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-xl text-gray-400">Calculating...</span>
              </div>
            ) : (
              <p className="text-4xl font-bold text-blue-600">
                {formatCurrency(totalDoctorWalletAmount)}
              </p>
            )}
            <p className="text-gray-500 mt-2">
              Your share from {allPayments.filter(p => p.status === 'completed').length} completed appointments
              {!balanceLoading && (
                <span className="block text-xs mt-1">
                  ({allPayments.length} total appointments processed)
                </span>
              )}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      My Share
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statusFilteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.description}
                          </div>
                          <div className="text-sm text-gray-500">
                            Patient: {payment.patientName}
                          </div>
                          {payment.notes && (
                            <div className="text-xs text-gray-400 mt-1">
                              Notes: {payment.notes}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            ID: {payment.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-600">
                          {payment.amount > 0 ? formatCurrency(payment.amount, payment.currency) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-blue-600">
                          {payment.doctorAmount > 0 ? formatCurrency(payment.doctorAmount, payment.currency) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getMethodIcon(payment.method)}
                          <span className="text-sm text-gray-700 capitalize">
                            {payment.method}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <div>{formatDate(payment.date)}</div>
                            {payment.appointmentTime && (
                              <div className="text-xs text-gray-500">
                                {formatTime(payment.appointmentTime)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {statusFilteredPayments.length === 0 && !loading && (
              <div className="text-center py-8">
                <Stethoscope className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-500">
                  {filteredPayments.length === 0 
                    ? "No appointments found for your account yet." 
                    : "Try adjusting your filter criteria."}
                </p>
              </div>
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center mt-6 space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-1 rounded-md border flex items-center border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              {generatePageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={index} className="px-3 py-1 text-gray-500">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`px-3 py-1 rounded-md ${pagination.currentPage === page ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {page}
                  </button>
                )
              ))}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1 rounded-md border flex items-center border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {allPayments.length > 0 && !balanceLoading && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 text-sm font-medium">My Earnings (Completed)</div>
                <div className="text-blue-900 text-lg font-bold">
                  {formatCurrency(
                    allPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.doctorAmount, 0)
                  )}
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-yellow-600 text-sm font-medium">My Earnings (Pending)</div>
                <div className="text-yellow-900 text-lg font-bold">
                  {formatCurrency(
                    allPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.doctorAmount, 0)
                  )}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 text-sm font-medium">Total Revenue Generated</div>
                <div className="text-green-900 text-lg font-bold">
                  {formatCurrency(
                    allPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
                  )}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-600 text-sm font-medium">My Total Appointments</div>
                <div className="text-purple-900 text-lg font-bold">
                  {allPayments.length}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorPaymentList;