import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/authService";

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        setAuthError(
          error.response?.data?.message || "Unable to verify account."
        );
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  return {
    currentUser,
    loadingUser,
    authError,
  };
};