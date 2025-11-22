import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('gp_user');
    const storedToken = localStorage.getItem('gp_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = (payload) => {
    setUser(payload.user);
    setToken(payload.token);
    localStorage.setItem('gp_user', JSON.stringify(payload.user));
    localStorage.setItem('gp_token', payload.token);
  };

  const setProfile = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem('gp_user', JSON.stringify(nextUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('gp_user');
    localStorage.removeItem('gp_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setProfile }}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
