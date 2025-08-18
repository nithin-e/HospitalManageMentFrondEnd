import React, { useEffect, useState } from 'react';
import { Wallet, Calendar, IndianRupee, Filter, Search, Loader2, Plus, Stethoscope, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { fectingAllUserAppointMents } from '@/store/DoctorSideApi/fectingFullUserAppointMents';
import Sidebar from "../layout/Sidebar";
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

const DoctorPaymentList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredDoctorPayments, setFilteredDoctorPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const doctorId = useSelector((state: RootState) => state.doctor.data.doctor);
  const doctor = useSelector((state: RootState) => state.doctor?.data?.doctor);
  const doctorName = `${doctor?.firstName || ''} Doctor`.trim();

  console.log('Doctor ID:', doctorId?.id);
  console.log('Doctor Name:', doctorName);

  useEffect(() => {
    fetchUserFullAppointments();
  }, []);

  useEffect(() => {
    if (doctorId?.id && payments.length > 0) {
      console.log('All payments:', payments);
      console.log('Filtering for doctor ID:', doctorId.id);
      
      const doctorSpecificPayments = payments.filter(payment => {
        const matchesDoctorId = payment.doctorId === doctorId.id;
        const matchesRecipient = payment.recipient === doctorName;
        const matchesDoctorName = payment.doctorName === doctorName;
        
        console.log(`Payment ${payment.id}:`, {
          paymentDoctorId: payment.doctorId,
          currentDoctorId: doctorId.id,
          matchesDoctorId,
          matchesRecipient,
          matchesDoctorName,
          willInclude: matchesDoctorId || matchesRecipient || matchesDoctorName
        });
        
        return matchesDoctorId || matchesRecipient || matchesDoctorName;
      });
      
      setFilteredDoctorPayments(doctorSpecificPayments);
      console.log('Filtered doctor payments:', doctorSpecificPayments);
    } else {
      setFilteredDoctorPayments([]);
      console.log('No doctor ID or payments available');
    }
  }, [payments, doctorId, doctorName]);

  const transformAppointmentToPayment = (appointment: Appointment): Payment => {
    const getPaymentStatus = (status: string): Payment['status'] => {
      const normalizedStatus = status.toLowerCase();
      if (normalizedStatus === 'success' || normalizedStatus === 'suceess') return 'completed';
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
      amount: parseFloat(appointment.amount),
      doctorAmount: parseFloat(appointment.doctorAmount),
      currency: 'INR', // Changed to INR
      description: `Medical Appointment - ${appointment.specialty}`,
      date: appointment.appointmentDate,
      status: getPaymentStatus(appointment.paymentStatus),
      method: getPaymentMethod(appointment.payment_method),
      recipient: appointment.doctorName,
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      specialty: appointment.specialty,
      appointmentTime: appointment.appointmentTime,
      notes: appointment.notes,
      doctorId: appointment.doctorId
    };
  };

  const fetchUserFullAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      setCurrentPage(1);
      
      console.log('Fetching appointments...');
      const response = await fectingAllUserAppointMents();
      console.log('API Response:', response);
      
      if (response?.result?.appointments && Array.isArray(response.result.appointments)) {
        const transformedPayments = response.result.appointments.map(transformAppointmentToPayment);
        console.log('Transformed payments:', transformedPayments);
        setPayments(transformedPayments);
      } else {
        console.log('No appointments found in response');
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load payment data. Please try again.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const searchFilteredPayments = filteredDoctorPayments.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (payment.patientName && payment.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (payment.specialty && payment.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalItems = searchFilteredPayments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = searchFilteredPayments.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const goToFirstPage = () => paginate(1);
  const goToLastPage = () => paginate(totalPages);
  const goToNextPage = () => currentPage < totalPages && paginate(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && paginate(currentPage - 1);

  const totalDoctorWalletAmount = filteredDoctorPayments
    .filter(payment => payment.status === 'completed')
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

  // Updated currency formatter for INR
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
    
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
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
                onClick={fetchUserFullAppointments}
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
                    Doctor ID: {doctorId?.id} | Total Appointments: {filteredDoctorPayments.length}
                  </p>
                  {filteredDoctorPayments.length === 0 && payments.length > 0 && (
                    <p className="text-sm text-red-600">
                      ⚠️ No payments found for this doctor ID. Check data matching logic.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchUserFullAppointments}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <IndianRupee className="w-4 h-4" />
                  Refresh
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Process Payment
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-6 text-center">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">My Total Earnings</h2>
            <p className="text-4xl font-bold text-blue-600">
              {formatCurrency(totalDoctorWalletAmount)}
            </p>
            <p className="text-gray-500 mt-2">
              Your share from {filteredDoctorPayments.filter(p => p.status === 'completed').length} completed appointments
            </p>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient, specialty, or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>


          {filteredDoctorPayments.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Stethoscope className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">{doctorName}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalDoctorWalletAmount)}
                  </div>
                  <div className="text-sm text-gray-500">Total Earnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredDoctorPayments.filter(p => p.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {filteredDoctorPayments.filter(p => p.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {filteredDoctorPayments.filter(p => p.status === 'failed').length}
                  </div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
              </div>
            </div>
          )}

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
                  {currentPayments.map((payment) => (
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
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-blue-600">
                          {formatCurrency(payment.doctorAmount, payment.currency)}
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
            
            {searchFilteredPayments.length === 0 && !loading && (
              <div className="text-center py-8">
                <Stethoscope className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-500">
                  {filteredDoctorPayments.length === 0 
                    ? "No appointments found for your account yet." 
                    : "Try adjusting your search or filter criteria."}
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {searchFilteredPayments.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} items
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`w-8 h-8 rounded text-sm ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="px-1">...</span>
                )}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    onClick={() => paginate(totalPages)}
                    className={`w-8 h-8 rounded text-sm ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}
                  >
                    {totalPages}
                  </button>
                )}
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Summary Statistics for Current Doctor */}
          {filteredDoctorPayments.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 text-sm font-medium">My Earnings (Completed)</div>
                <div className="text-blue-900 text-lg font-bold">
                  {formatCurrency(
                    filteredDoctorPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.doctorAmount, 0)
                  )}
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-yellow-600 text-sm font-medium">My Earnings (Pending)</div>
                <div className="text-yellow-900 text-lg font-bold">
                  {formatCurrency(
                    filteredDoctorPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.doctorAmount, 0)
                  )}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 text-sm font-medium">Total Revenue Generated</div>
                <div className="text-green-900 text-lg font-bold">
                  {formatCurrency(
                    filteredDoctorPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
                  )}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-600 text-sm font-medium">My Total Appointments</div>
                <div className="text-purple-900 text-lg font-bold">
                  {filteredDoctorPayments.length}
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