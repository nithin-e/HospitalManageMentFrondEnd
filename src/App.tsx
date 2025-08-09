import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from '@/components/user/ui/toaster';
import { TooltipProvider } from '@/components/user/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/redux/store';
import { SocketProvider } from './context/socketContext';

// Pages
import Index from './pages/user/user1/Index';
import NotFound from './pages/user/user1/NotFound';
import Login from './pages/user/user1/Login';
import Register from './pages/user/user1/Register';
import AdminDashboard from './pages/user/admin/adminDashboard';
import AdminUsers from './pages/user/admin/AdminUsers';
import Services2 from './components/user/user1/Services2';
import Apply from './components/user/user1/apply';
import ResetPassword from './pages/user/user1/forgetPass';
import SuccesForDoctorApply from './pages/user/user1/SuccesForDoctorApply';
import DoctorListing from './pages/user/admin/DoctorListing';
import DoctorDetailsPage from './pages/user/admin/DoctorDetailsPage';
import NotificationList from './pages/user/user1/NotificationList';
import NotificationDetails from './pages/user/user1/NotificationDetails';
import DoctorPaymentSucces from './pages/user/user1/DoctorPaymentSucces';
import DoctorDash from './pages/user/doctor/DoctorDash';
import SetUpSlotes from './pages/user/doctor/SetUpSlotes';
import AppointMent from './pages/user/user1/AppointMent';
import UserProfile from './components/user/user1/userProfileComponent';
import AppointMentMangemant from './pages/user/doctor/AppointMentMangemant';
import AppoinmentSuccess from './pages/user/user1/AppoinmentSuccess';
import AdminPaymentListing from './pages/user/admin/AdminPaymentListing';
import ListPayment from './pages/user/doctor/ListPayment';
import UserWallet from './pages/user/user1/UserWallet';
import VideoCallPage from './pages/user/user1/VideoCallPage';
import PrescriptionForm from './pages/user/doctor/PrescriptionForm';
import DoctorProtectedRoute from './protecting/doctorProtectedRoute';
import ProtectedRoute from './protecting/ProctedRoute';
import { BlockStatusChecker } from './protecting/BlockStatusChecker';

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
                  <Route path="/AppointMent" element={<AppointMent />} />

                  {/* Protected routes */}
                  <Route path="/services" element={<Services2 />} />
                  <Route path="/applyAsDoctor" element={<Apply />} />
                  <Route path="/resetPass" element={<ResetPassword />} />
                  <Route path="/NotificationList" element={<NotificationList />} />
                  <Route path="/NotificationDetails/:id" element={<NotificationDetails />} />
                  <Route path="/payment-success" element={<DoctorPaymentSucces />} />
                  
                  <Route path="/userprofile" element={<UserProfile />} />
                  <Route path="/success" element={<UserProfile />} />
                  <Route path="/userWallet" element={<UserWallet />} />
                  <Route path="/video-call/:roomId" element={<ProtectedRoute><VideoCallPage /></ProtectedRoute>} />
                  
                  {/* Admin routes */}
                  <Route path="/adminDash" element={<AdminDashboard />} />
                  <Route path="/users" element={<AdminUsers />} />
                  <Route path="/successForDoctorApplication" element={<SuccesForDoctorApply />} />
                  <Route path="/Doctors" element={<DoctorListing/>} />
                  <Route path="/adminDetails/:id" element={<DoctorDetailsPage />} />
                  <Route path="/adminSidePayments" element={<AdminPaymentListing />} />

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