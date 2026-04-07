import React from 'react';
import { createContext, useMemo, useState } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('sonat_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('sonat_user');
    return raw ? JSON.parse(raw) : null;
  });

  const login = (nextToken, nextUser) => {
    localStorage.setItem('sonat_token', nextToken);
    localStorage.setItem('sonat_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem('sonat_token');
    localStorage.removeItem('sonat_user');
    setToken(null);
    setUser(null);
  };

  const updateProfileLocal = (profile) => {
    const updated = { ...user, ...profile };
    setUser(updated);
    localStorage.setItem('sonat_user', JSON.stringify(updated));
  };

  const value = useMemo(
    () => ({ user, token, login, logout, updateProfileLocal }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
