import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";

function RoleRoute({ allowedRoles, children }) {
  const { currentUser, loadingUser, authError } = useCurrentUser();

  if (loadingUser) return <p>Checking account...</p>;

  if (authError) return <Navigate to="/unauthorized" replace />;

  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default RoleRoute;