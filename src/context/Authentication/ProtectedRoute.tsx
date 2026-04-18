import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";
import { toast } from "react-toastify";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!loading && !user) {
    toast.warning("User has been logged out.");
    return <Navigate to="/login" replace />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
