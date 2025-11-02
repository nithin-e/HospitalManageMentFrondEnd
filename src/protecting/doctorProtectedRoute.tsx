import { RootState } from '@/store/redux/store';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const DoctorProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const doctor = useSelector((state: RootState) => state.doctor.data?.doctor);
  const doctorEmail = doctor?.email;
  const token = localStorage.getItem('AccessToken');

  console.log('Check doctor data inside protected route:', doctor);
  console.log('Doctor Access Token:', token);

  // ✅ Protection logic
  if (!doctor || !doctor.isActive || !token) {
    console.warn('Unauthorized access: Redirecting to login...');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default DoctorProtectedRoute;
