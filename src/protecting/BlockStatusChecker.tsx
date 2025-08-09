import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/redux/store';
import { useSocket } from '../context/socketContext';
import { logoutUser } from '../store/redux/slices/authSlice';

export const BlockStatusChecker = () => {
  const authState = useSelector((state: RootState) => state.user);
  console.log('Auth state data:', authState);
  
  if (!authState) {
    console.log('Auth state not initialized yet. Skipping block check.');
    return null;
  }
  
  
   const userData = authState.user;
  
  const adminData = authState.admin;
  
  console.log('User data:', userData);
  console.log('Admin data:', adminData);
  

  const isAdminAuthenticated = authState.isAdminAuthenticated === true;
  const isUserAuthenticated = authState.isUserAuthenticated === true;
  
  const { isUserBlocked, userBlockStatus } = useSocket();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentPath = window.location.pathname;
  
  const isAdmin = isAdminAuthenticated || (adminData?.role === 'admin');
  
  const isAdminPage = [
    '/adminDash',
    '/users',
    '/Doctors',
    '/adminDetails',
    '/admin'
  ].some(path => currentPath.includes(path));
  
  const isPublicRoute = [
    '/',
    '/login',
    '/register', 
    '/resetPass',
    '/adminLogin'
  ].some(path => currentPath === path || currentPath.startsWith(path));
  
 

  const getCurrentUserId = React.useMemo(() => {
  if (!userData) return null;
  
  if (typeof userData === 'object') {
    if ('id' in userData && userData.id) return userData.id;
    if ('_id' in userData && userData._id) return userData._id;
    
  
    if ('user' in userData && userData.user && typeof userData.user === 'object') {
      const nestedUser = userData.user as { id?: string; _id?: string };
      if (nestedUser.id) return nestedUser.id;
      if (nestedUser._id) return nestedUser._id;
    }
  }
  
  return null;
}, [userData]);
  

const isRegularUserBlocked = React.useMemo(() => {
  const userId = getCurrentUserId;
  
  if (!userId || typeof userId !== 'string') {
    console.log('No valid user ID found or userId is not a string:', userId);
    return false;
  }
  
  console.log('Checking block status for user ID:', userId);
  
  let thisUserIsBlocked = false;
  
  if (typeof isUserBlocked === 'function') {
    thisUserIsBlocked = isUserBlocked(userId);
  }
  
  if (!thisUserIsBlocked && userBlockStatus && typeof userBlockStatus === 'object') {
    thisUserIsBlocked = userBlockStatus[userId] === true;
  }
  
  console.log('THIS user block check:', {
    userId,
    thisUserIsBlocked,
    userBlockStatus: userBlockStatus ? (userId in userBlockStatus ? userBlockStatus[userId] : 'Not in block list') : 'No block status'
  });
  
  return thisUserIsBlocked;
}, [userData, isUserBlocked, userBlockStatus, getCurrentUserId]);
  


  useEffect(() => {
    const currentUserId = getCurrentUserId;
    
   
    if (isUserAuthenticated && currentUserId && isRegularUserBlocked) {
      console.log(`ALERT: Current user ${currentUserId} is BLOCKED. Logging out THIS user and redirecting.`);
      
      
      console.log('Logging out blocked user with ID:', currentUserId);
      
      dispatch(logoutUser());
      
      navigate('/register', { 
        state: { message: "Your account has been blocked. Please contact support." } 
      });
      
      return;
    }

    if (isPublicRoute) {
      console.log('On public route. Skipping further checks.');
      return;
    }
    
   
    if (isAdminPage && !isAdmin) {
      console.log('Non-admin trying to access admin page. Redirecting to login.');
      navigate('/login');
      return;
    }
    

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
    isPublicRoute,
    getCurrentUserId
  ]);

  return null; 
};