
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/redux/store';
import { SocketProvider } from './context/socketContext';

// Pages
import Index from './pages/user/Index';
import NotFound from './pages/user/NotFound';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import AdminDashboard from './pages/admin/adminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import Services2 from './components/user/Services2';
import Apply from './components/user/apply';
import ResetPassword from './pages/user/forgetPass';
import SuccesForDoctorApply from './pages/user/SuccesForDoctorApply';
import DoctorListing from './pages/admin/DoctorListing';
import DoctorDetailsPage from './pages/admin/DoctorDetailsPage';
import NotificationList from './pages/user/NotificationList';
import NotificationDetails from './pages/user/NotificationDetails';
import DoctorPaymentSucces from './pages/user/DoctorPaymentSucces';
import DoctorDash from './pages/doctor/DoctorDash';
import SetUpSlotes from './pages/doctor/SetUpSlotes';
import AppointMent from './pages/user/AppointMent';
import UserProfile from './components/user/userProfileComponent';
import AppointMentMangemant from './pages/doctor/AppointMentMangemant';
import AdminPaymentListing from './pages/admin/AdminPaymentListing';
import ListPayment from './pages/doctor/ListPayment';
import UserWallet from './pages/user/UserWallet';
import VideoCallPage from './pages/user/VideoCallPage';
import PrescriptionForm from './pages/doctor/PrescriptionForm';
import DoctorProtectedRoute from './protecting/doctorProtectedRoute';
import ProtectedRoute from './protecting/ProctedRoute';
import { BlockStatusChecker } from './protecting/BlockStatusChecker';
import AdminAddService from './pages/admin/AdminAddService';
import HistoryComponent from './pages/user/History';

const queryClient = new QueryClient();

const App = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.error('Google Client ID is not defined in .env');
    return <div>Error: Google Client ID not configured. Please check your .env file.</div>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <SocketProvider>
            <BrowserRouter>
              <TooltipProvider>
                <Toaster />
                <BlockStatusChecker />
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="*" element={<NotFound />} />
                  <Route path="/" element={<Index />} />
                  <Route path="/history" element={<HistoryComponent />} />
                 <Route path="/AppointMent"  element={<ProtectedRoute><AppointMent /></ProtectedRoute>} />

                  {/* Protected routes */}
                  <Route path="/services" element={<Services2 />} />
                  <Route path="/applyAsDoctor"  element={<ProtectedRoute><Apply /></ProtectedRoute>} />
                  <Route path="/resetPass" element={<ResetPassword />} />
                  <Route path="/NotificationList" element={<NotificationList />} />
                  <Route path="/NotificationDetails/:id" element={<NotificationDetails />} />
                  <Route path="/payment-success" element={<DoctorPaymentSucces />} />
                                  
                  
                  <Route path="/userprofile"  element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                  <Route path="/success" element={<UserProfile />} />
                   <Route path="/userWallet"  element={<ProtectedRoute><UserWallet /></ProtectedRoute>} />
                  <Route path="/video-call/:roomId" element={<VideoCallPage />} />
                  
                  {/* Admin routes */}
                  <Route path="/adminDash" element={<AdminDashboard />} />
                  <Route path="/users" element={<AdminUsers />} />
                  <Route path="/successForDoctorApplication" element={<SuccesForDoctorApply />} />
                  <Route path="/Doctors" element={<DoctorListing/>} />
                  <Route path="/adminDetails/:id" element={<DoctorDetailsPage />} />
                  <Route path="/adminSidePayments" element={<AdminPaymentListing />} />
                  <Route path="/addServices" element={<AdminAddService />} />

                  {/* Doctor routes */}
                  <Route path="/DoctorDashboard" element={<DoctorDash />} />
                  <Route path="/AppointmentScheduler" element={<DoctorProtectedRoute><SetUpSlotes /></DoctorProtectedRoute>}/>
                  <Route path="/AppointListing" element={<DoctorProtectedRoute><AppointMentMangemant /></DoctorProtectedRoute>}/>
                  <Route path="/ListPaymentDoctor" element={<DoctorProtectedRoute><ListPayment/></DoctorProtectedRoute>}/>
                  <Route path="/Prescription" element={<DoctorProtectedRoute><PrescriptionForm/></DoctorProtectedRoute>}/>
                </Routes>
              </TooltipProvider>
            </BrowserRouter>
          </SocketProvider>
        </Provider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;