import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";

function RoleRedirect() {
  const { currentUser, loadingUser, authError } = useCurrentUser();

  if (loadingUser) return <p>Loading dashboard...</p>;

  if (authError) return <Navigate to="/unauthorized" replace />;

  if (currentUser?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (currentUser?.role === "student") {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Navigate to="/unauthorized" replace />;
}

export default RoleRedirect;