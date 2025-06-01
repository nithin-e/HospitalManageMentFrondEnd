import React, { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from '@/components/user/ui/toaster';
import { TooltipProvider } from '@/components/user/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { RootState, store } from './store/redux/store';
import { SocketProvider, useSocket } from './context/socketContext';

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
import {   logoutUser } from './store/redux/slices/authSlice';
import NotificationList from './pages/user/user1/NotificationList';
import NotificationDetails from './pages/user/user1/NotificationDetails';
import DoctorPaymentSucces from './pages/user/user1/DoctorPaymentSucces';
import DoctorDash from './pages/user/doctor/DoctorDash';
import SetUpSlotes from './pages/user/doctor/setUpSlotes';
import AppointMent from './pages/user/user1/AppointMent';
import UserProfile from './components/user/user1/userProfileComponent';

const queryClient = new QueryClient();

const BlockStatusChecker = () => {
  // Access user data from Redux store with proper null checking
  const authState = useSelector((state: RootState) => state.user);
  console.log('Auth state data:', authState);
  
  // Early return if auth state is not properly initialized
  if (!authState) {
    console.log('Auth state not initialized yet. Skipping block check.');
    return null;
  }
  
  // IMPORTANT: Get the correct user data path
  const userData = authState.user?.user || authState.user;
  const adminData = authState.admin;
  
  console.log('User data:', userData);
  console.log('Admin data:', adminData);
  
  // Determine if we're dealing with an admin session or a regular user session
  const isAdminAuthenticated = authState.isAdminAuthenticated === true;
  const isUserAuthenticated = authState.isUserAuthenticated === true;
  
  const { isUserBlocked, userBlockStatus } = useSocket();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get current path for conditional navigation
  const currentPath = window.location.pathname;
  
  // Check if the user is an admin (either by role or authentication state)
  const isAdmin = isAdminAuthenticated || (adminData?.role === 'admin');
  
  // Check if current path is an admin page
  const isAdminPage = [
    '/adminDash',
    '/users',
    '/Doctors',
    '/adminDetails',
    '/admin'
  ].some(path => currentPath.includes(path));
  
  // Check if current path is a public route that should always be accessible
  const isPublicRoute = [
    '/',
    '/login',
    '/register', 
    '/resetPass',
    '/adminLogin'
  ].some(path => currentPath === path || currentPath.startsWith(path));
  
  // Extract current user ID for block checks
  const getCurrentUserId = React.useMemo(() => {
    if (!userData) return null;
    
    // Handle different possible structures
    if (typeof userData === 'object') {
      if (userData.id) return userData.id;
      if (userData._id) return userData._id;
      if (userData.user?.id) return userData.user.id;
      if (userData.user?._id) return userData.user._id;
    }
    
    return null;
  }, [userData]);
  
  // Check if THIS specific user is blocked - IMPROVED FUNCTION
  const isRegularUserBlocked = React.useMemo(() => {
    const userId = getCurrentUserId;
    
    // Skip if no user ID
    if (!userId) return false;
    
    console.log('Checking block status for user ID:', userId);
    
    // Only check if THIS user is blocked - not any user
    let thisUserIsBlocked = false;
    
    // Method 1: Check using isUserBlocked function specifically for THIS user
    if (typeof isUserBlocked === 'function') {
      thisUserIsBlocked = isUserBlocked(userId);
    }
    
    // Method 2: Check userBlockStatus object specifically for THIS user
    if (!thisUserIsBlocked && userBlockStatus && typeof userBlockStatus === 'object') {
      thisUserIsBlocked = userBlockStatus[userId] === true;
    }
    
    console.log('THIS user block check:', {
      userId,
      thisUserIsBlocked,
      userBlockStatus: userBlockStatus ? (userId in userBlockStatus ? userBlockStatus[userId] : 'Not in block list') : 'No block status'
    });
    
    return thisUserIsBlocked;
  }, [userData, isUserBlocked, userBlockStatus]);
  
  console.log('Inside BlockStatusChecker - userData ID:', userData?.id || userData?._id);
  console.log('Inside BlockStatusChecker - adminData ID:', adminData?.id || adminData?._id);
  console.log('Inside BlockStatusChecker **-** isUserAuthenticated:', isUserAuthenticated);
  console.log('Inside BlockStatusChecker **-** isAdminAuthenticated:', isAdminAuthenticated);
  console.log('Inside BlockStatusChecker **-** isRegularUserBlocked:', isRegularUserBlocked);
  console.log('Inside BlockStatusChecker - currentPath:', currentPath);
  console.log('Inside BlockStatusChecker - isAdmin:', isAdmin);
  console.log('Inside BlockStatusChecker - isAdminPage:', isAdminPage);
  console.log('Inside BlockStatusChecker - isPublicRoute:', isPublicRoute);

  useEffect(() => {
    // Get this user's ID for precise blocking
    const currentUserId = getCurrentUserId;
    
    // CRITICAL: Check if THIS SPECIFIC user is blocked, regardless of route
    if (isUserAuthenticated && currentUserId && isRegularUserBlocked) {
      console.log(`ALERT: Current user ${currentUserId} is BLOCKED. Logging out THIS user and redirecting.`);
      
      // Log exactly which user we're logging out
      console.log('Logging out blocked user with ID:', currentUserId);
      
      dispatch(logoutUser());
      
      navigate('/register', { 
        state: { message: "Your account has been blocked. Please contact support." } 
      });
      
      return;
    }
    
    // If we're on a public route, allow access (but only AFTER block check)
    if (isPublicRoute) {
      console.log('On public route. Skipping further checks.');
      return;
    }
    
    // Admin protection: If on admin page but not an admin, redirect
    if (isAdminPage && !isAdmin) {
      console.log('Non-admin trying to access admin page. Redirecting to login.');
      navigate('/login');
      return;
    }
    
    // If no user is authenticated and this is a protected route, redirect to login
    if (!isUserAuthenticated && !isAdminAuthenticated && !isPublicRoute) {
      console.log('No user authenticated but on protected route. Redirecting to login.');
      navigate('/login');
      return;
    }
  }, [
    userData, 
    adminData, 
    isUserAuthenticated, 
    isAdminAuthenticated, 
    isAdmin, 
    isAdminPage, 
    isRegularUserBlocked, 
    navigate, 
    dispatch, 
    currentPath, 
    isPublicRoute
  ]);

  return null; 
};




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

                  {/* Protected routes */}
                  <Route path="/services" element={<Services2 />} />
                  <Route path="/applyAsDoctor" element={<Apply />} />
                  <Route path="/resetPass" element={<ResetPassword />} />
                  <Route path="/NotificationList" element={<NotificationList />} />
                  <Route path="/NotificationDetails/:id" element={<NotificationDetails />} />
                  <Route path="/payment-success" element={<DoctorPaymentSucces />} />
                  <Route path="/AppointMent" element={<AppointMent />} />
                  <Route path="/userprofile" element={<UserProfile />} />

                  
                  {/* Admin routes */}
                  <Route path="/adminDash" element={<AdminDashboard />} />
                  <Route path="/users" element={<AdminUsers />} />
                  <Route path="/successForDoctorApplication" element={<SuccesForDoctorApply />} />
                  <Route path="/Doctors" element={<DoctorListing/>} />
                  <Route path="/adminDetails/:id" element={<DoctorDetailsPage />} />

                  {/* Doctor routes */}
                  <Route path="/DoctorDashboard" element={<DoctorDash />}/>
                  <Route path="/AppointmentScheduler" element={<SetUpSlotes />}/>
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