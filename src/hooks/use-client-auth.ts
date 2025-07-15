import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const useClientAuth = () => {
  const [mounted, setMounted] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,
      login: () => {},
      logout: () => {},
      register: () => {},
      error: null,
      errorType: null,
    };
  }

  return auth;
};
