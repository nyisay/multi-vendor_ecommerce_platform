import { useEffect, useState } from "react";
import { authApi, TOKEN_KEY } from "../services/api";
import { AuthContext } from "./authContextObject";

const USER_KEY = "mve_user";

function toStoredUser(profile) {
  return {
    _id: profile._id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    vendorStatus: profile.vendorStatus,
    shopName: profile.shopName,
    phone: profile.phone,
    address: profile.address,
    defaultShippingAddress: profile.defaultShippingAddress,
    defaultPaymentMethod: profile.defaultPaymentMethod,
    profileImageUrl: profile.profileImageUrl,
    profileTheme: profile.profileTheme,
    profileCardBackgroundUrl: profile.profileCardBackgroundUrl,
  };
}

function getInitialAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);

  if (!token || !rawUser) {
    return { token: null, user: null, bootstrapped: true };
  }

  let user = null;
  try {
    user = JSON.parse(rawUser);
  } catch {
    user = null;
  }

  return {
    token,
    user,
    bootstrapped: false,
  };
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(getInitialAuth);

  const setSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setAuthState({ token, user, bootstrapped: true });
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthState({ token: null, user: null, bootstrapped: true });
  };

  const refreshProfile = async () => {
    const profile = await authApi.getProfile();
    const nextUser = toStoredUser(profile);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setAuthState((prev) => ({ ...prev, user: nextUser, bootstrapped: true }));
    return nextUser;
  };

  const login = async (payload) => {
    const data = await authApi.login(payload);
    // Save token before loading profile so auth header is present.
    localStorage.setItem(TOKEN_KEY, data.token);
    const profile = await authApi.getProfile();
    setSession(data.token, toStoredUser(profile));
    return data;
  };

  const register = async (payload) => {
    return authApi.register(payload);
  };

  const updateProfile = async (payload) => {
    const updated = await authApi.updateProfile(payload);
    const nextUser = toStoredUser(updated);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setAuthState((prev) => ({ ...prev, user: nextUser }));
    return updated;
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!authState.token || authState.bootstrapped) {
        return;
      }
      try {
        await refreshProfile();
      } catch {
        clearSession();
      }
    };
    bootstrap();
  }, [authState.token, authState.bootstrapped]);

  const value = {
    token: authState.token,
    user: authState.user,
    authReady: authState.bootstrapped,
    isAuthenticated: Boolean(authState.token),
    login,
    register,
    updateProfile,
    refreshProfile,
    logout: clearSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
