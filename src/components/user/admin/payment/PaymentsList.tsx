import React, { useEffect, useState } from 'react';
import { Wallet, Calendar, DollarSign, Filter, Search, Loader2, Plus } from 'lucide-react';
import { FetchingAllUserAppointsMentsAdmin } from '@/store/AdminSideApi/fetchingAllUserAppointsMentsAdmin';

interface Payment {
  id: string;
  amount: number;
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
}

interface Appointment {
  id: string;
  amount: string;
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

const PaymentList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchUserFullAppointments();
  }, []);

  const transformAppointmentToPayment = (appointment: Appointment): Payment => {
    // Map payment status from API to our status type
    const getPaymentStatus = (status: string): Payment['status'] => {
      const normalizedStatus = status.toLowerCase();
      if (normalizedStatus === 'success' || normalizedStatus === 'suceess') return 'completed';
      if (normalizedStatus === 'pending') return 'pending';
      return 'failed';
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

    return {
      id: appointment.id,
      amount: parseFloat(appointment.amount),
      currency: 'USD', // Default currency, adjust as needed
      description: `Medical Appointment - ${appointment.specialty}`,
      date: appointment.appointmentDate,
      status: getPaymentStatus(appointment.paymentStatus),
      method: getPaymentMethod(appointment.payment_method),
      recipient: appointment.doctorName,
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      specialty: appointment.specialty,
      appointmentTime: appointment.appointmentTime,
      notes: appointment.notes
    };
  };

  const fetchUserFullAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await FetchingAllUserAppointsMentsAdmin();
      console.log('API Response:', response);
      
      if (response?.result?.appointments && Array.isArray(response.result.appointments)) {
        const transformedPayments = response.result.appointments.map(transformAppointmentToPayment);
        setPayments(transformedPayments);
      } else {
        // If no appointments, set empty array
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

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (payment.patientName && payment.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (payment.specialty && payment.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate total wallet amount (all completed payments)
  const totalWalletAmount = payments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

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
      case 'card': return <DollarSign className="w-4 h-4" />;
      case 'bank': return <DollarSign className="w-4 h-4" />;
      case 'paypal': return <div className="w-4 h-4 bg-blue-500 rounded-full" />;
      case 'crypto': return <div className="w-4 h-4 bg-orange-500 rounded" />;
      case 'online': return <div className="w-4 h-4 bg-purple-500 rounded" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
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
              onClick={fetchUserFullAppointments}
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
      <div className="max-w-6xl mx-auto">
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
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchUserFullAppointments}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Refresh
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Payment
              </button>
            </div>
          </div>
        </div>

        {/* Total Wallet Amount Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 text-center">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">Total Wallet Amount</h2>
          <p className="text-4xl font-bold text-green-600">
            {formatCurrency(totalWalletAmount)}
          </p>
          <p className="text-gray-500 mt-2">
            From {payments.filter(p => p.status === 'completed').length} completed transactions
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient, doctor, or specialty..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
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
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.description}
                        </div>
                        <div className="text-sm text-gray-500">
                          Patient: {payment.patientName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Doctor: {payment.doctorName}
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
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(payment.amount, payment.currency)}
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
          
          {filteredPayments.length === 0 && !loading && (
            <div className="text-center py-8">
              <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500">
                {payments.length === 0 
                  ? "No appointment payments available yet." 
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {payments.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 text-sm font-medium">Total Completed</div>
              <div className="text-green-900 text-lg font-bold">
                {formatCurrency(
                  payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
                )}
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-yellow-600 text-sm font-medium">Total Pending</div>
              <div className="text-yellow-900 text-lg font-bold">
                {formatCurrency(
                  payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
                )}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 text-sm font-medium">Total Transactions</div>
              <div className="text-blue-900 text-lg font-bold">
                {payments.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentList;