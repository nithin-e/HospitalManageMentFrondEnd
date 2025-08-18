import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet,
  Loader2
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

const UserWalletComponent: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [showBalance, setShowBalance] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.user);
  // const userData = user?.checkUserEmailAndPhone?.user || user?.user?.user || user?.user || null;
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

  // Process appointments into transactions
  const processAppointmentsToTransactions = (appointmentData: Appointment[]): Transaction[] => {
    const processedTransactions: Transaction[] = [];
    
    appointmentData.forEach(appointment => {
      // Add original payment transaction (sent)
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

      // Add doctor amount transaction if exists
      if (appointment.doctorAmount && parseFloat(appointment.doctorAmount) > 0) {
        processedTransactions.push({
          id: `doctor-${appointment.id}`,
          type: 'sent',
          amount: parseFloat(appointment.doctorAmount),
          description: `Doctor Fee - ${appointment.doctorName || 'Medical Professional'}`,
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

  // Calculate dynamic balance
  const calculateBalance = (transactionData: Transaction[]): number => {
    return transactionData.reduce((total, transaction) => {
      if (transaction.type === 'received') {
        return total + transaction.amount;
      } else {
        return total - transaction.amount;
      }
    }, 0);
  };

  useEffect(() => {
    fetchUserAppoinMents();
  }, [userEmail]);

  const fetchUserAppoinMents = async () => {
    if (!userEmail) {
      setError('User email not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await UserfetchingAppointMents(userEmail);
      console.log('Fetched appointments:', res);
      
      if (res.success && res.appointments) {
        setAppointments(res.appointments);
        
        // Process appointments into transactions
        const processedTransactions = processAppointmentsToTransactions(res.appointments);
        setTransactions(processedTransactions);
        
        // Calculate and set balance
        const calculatedBalance = calculateBalance(processedTransactions);
        setBalance(Math.max(0, calculatedBalance)); // Ensure balance is not negative
        
      } else {
        setError(res.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to fetch appointment data');
    } finally {
      setLoading(false);
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
    return showBalance ? `$${amount.toFixed(2)}` : '••••••';
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
    // <div className="min-h-screen relative overflow-hidden bg-white">
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
                onClick={fetchUserAppoinMents}
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
                <p className="text-gray-600 text-sm mb-1">Total Balance</p>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold" style={{ color: 'rgb(0, 59, 115)' }}>
                    {formatAmount(balance)}
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
                  {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                </p>
                <p className="text-gray-500 text-xs">
                  {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'rgb(0, 59, 115)' }}>
                Transaction History
              </h3>
              <button 
                onClick={fetchUserAppoinMents}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Refresh
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
                        {tx.type === 'received' ? '+' : '-'}{formatAmount(tx.amount).replace('$', '')}
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
            )}
          </div>

          {/* Appointment Summary */}
          {appointments.length > 0 && (
            <div className="mt-6 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(0, 59, 115)' }}>
                Appointment Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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