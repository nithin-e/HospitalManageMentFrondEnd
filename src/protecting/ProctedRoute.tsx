import { RootState } from "@/store/redux/store";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = useSelector((state: RootState) => state.user.user);
  const token = localStorage.getItem("AccessToken"); 

  console.log("User in ProtectedRoute:", user);
  console.log("User Access Token:", token);

  // 🔒 Protect route logic
  if (!user || !token) {
      localStorage.removeItem('AccessToken');
      localStorage.removeItem('RefreshToken');
    console.warn("Unauthorized access: Redirecting to login...");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
