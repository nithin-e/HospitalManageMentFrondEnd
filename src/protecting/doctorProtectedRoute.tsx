// components/ProtectedRoute.jsx
import { RootState } from '@/store/redux/store';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const doctorProtectedRoute = ({ children }) => {
const doctor = useSelector((state: RootState) => state.doctor.data.doctor);


console.log('check this doctor data inside the protected route',doctor)

  if (!doctor || !doctor.isActive) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default doctorProtectedRoute;
