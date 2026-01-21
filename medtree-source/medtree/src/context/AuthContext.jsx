import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../data/database';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('medtree_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const result = await api.login(email, password);
    if (result.success) {
      setUser(result.user);
      localStorage.setItem('medtree_user', JSON.stringify(result.user));
    }
    return result;
  };

  const signup = async (userData) => {
    const result = await api.signup(userData);
    if (result.success) {
      setUser(result.user);
      localStorage.setItem('medtree_user', JSON.stringify(result.user));
    }
    return result;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medtree_user');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
