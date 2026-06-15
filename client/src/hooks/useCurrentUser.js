import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/authService";

const UNVERIFIED_USER_MESSAGES = [
  "Your account is not registered as a student.",
  "Your student account is inactive.",
  "This student record is already linked to another account.",
];

const isUnverifiedUserError = (error) => {
  const status = error.response?.status;
  const message = error.response?.data?.message;

  return status === 403 && UNVERIFIED_USER_MESSAGES.includes(message);
};

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [authError, setAuthError] = useState("");
  const [isUnverifiedUser, setIsUnverifiedUser] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        setAuthError("");
        setIsUnverifiedUser(false);
      } catch (error) {
        setAuthError(
          error.response?.data?.message || "Unable to verify account."
        );
        setIsUnverifiedUser(isUnverifiedUserError(error));
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
    isUnverifiedUser,
  };
};
