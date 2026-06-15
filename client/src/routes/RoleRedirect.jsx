import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";

function RoleRedirect() {
  const { currentUser, loadingUser, authError, isUnverifiedUser } =
    useCurrentUser();

  if (loadingUser) return <p>Loading dashboard...</p>;

  if (isUnverifiedUser) return <Navigate to="/unverified" replace />;

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
