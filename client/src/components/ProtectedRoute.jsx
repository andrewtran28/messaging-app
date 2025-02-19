import { Navigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const ProtectedRoute = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Optionally render a loading spinner
  }

  return user ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
