import { useMemo, useState } from "react";
import { loginUser, registerUser } from "../services/authService";
import {
  clearAuthStorage,
  getStoredUser,
  storeAuthData,
} from "../utils/helpers";

export function useAuth() {
  const [user, setUser] = useState(getStoredUser());
  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  const login = async (payload) => {
    const data = await loginUser(payload);
    storeAuthData(data);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const data = await registerUser(payload);
    storeAuthData(data);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
  };
}
