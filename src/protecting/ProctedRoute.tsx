import { RootState } from "@/store/redux/store";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state: RootState) => state.user||'');
  console.log('check this user state data000000000000000000000000000000>>>>>>',user);
  

  if (!user || !user.isActive) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
