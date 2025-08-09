// components/ProtectedRoute.jsx
import { RootState } from '@/store/redux/store';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  
  

  const accessToken = localStorage.getItem('AccessToken');
  
 
  console.log('access token:', accessToken);



  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  
  
  return children;
};

export default ProtectedRoute;