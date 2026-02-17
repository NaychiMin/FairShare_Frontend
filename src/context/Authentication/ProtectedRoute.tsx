import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";
import { toast } from "react-toastify";

const ProtectedRoute = () => {
  const { jwtToken, user } = useAuth();

  if (!jwtToken || !user) {
    toast.warning("User has been logged out.");
    return <Navigate to="/login" replace />;
  }

  return jwtToken && user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
