import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { TOKEN_KEY } from '../services/api';
import * as authApi from '../services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);

  const save = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const onLogout = () => logout();
    window.addEventListener('veloop:logout', onLogout);
    return () => window.removeEventListener('veloop:logout', onLogout);
  }, [logout]);

  useEffect(() => {
    if (token && !user) authApi.getMe().then(setUser).catch(() => {});
  }, [token, user]);

  const value = {
    token,
    user,
    login: async (email, password) => save(await authApi.login(email, password)),
    register: async (name, email, password) => save(await authApi.register(name, email, password)),
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
