// import React, { useEffect, useState } from 'react';
// import { Navigate, Outlet } from 'react-router-dom';
// import { useSocket } from '@/context/socketContext';
// import { toast } from "@/components/user/ui/use-toast";
// import { useSelector } from 'react-redux';
// import { RootState } from '@/store/redux/store';

// const AuthGuard = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(true);
//   const [isActive, setIsActive] = useState(true);
//   const [isLoading, setIsLoading] = useState(true);
//   const { socket } = useSocket();

//   useEffect(() => {
//     // Check authentication status
//     const checkAuth = async () => {
//       try {
//         // Get user data from your auth service or localStorage
//          const userData = JSON.parse(localStorage.getItem('userData'));
//         // const user = useSelector((state: RootState) => state.user);
//         // console.log('check mone check',user);
//         // const userData = user?.user?.user?.name || user?.user?.name || '';
        
//         if (!userData) {
//           setIsAuthenticated(false);
//           setIsLoading(false);
//           return;
//         }
        
//         // Check if user is active
//         setIsActive(userData.isActive !== false);
//         setIsAuthenticated(true);
        
//         // Listen for user blocked event
//         if (socket) {
//           socket.on('user_blocked', () => {
//             setIsActive(false);
//             toast({
//               variant: "destructive",
//               title: "Account Blocked",
//               description: "Your account has been blocked by an administrator.",
//               duration: 5000,
//             });
//           });
//         }
//       } catch (error) {
//         console.error('Auth check failed:', error);
//         setIsAuthenticated(false);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkAuth();
    
//     return () => {
//       if (socket) {
//         socket.off('user_blocked');
//       }
//     };
//   }, [socket]);

//   if (isLoading) {
//     return <div>Loading...</div>; // Or a nicer loading spinner
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" />;
//   }

//   if (!isActive) {
//     return <Navigate to="/register" />;
//   }

//   return <Outlet />;
// };

// export default AuthGuard;