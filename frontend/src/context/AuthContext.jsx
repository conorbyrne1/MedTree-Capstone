import React, { createContext, useContext, useState, useEffect } from 'react';
const API_URL = 'http://localhost:8000';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('medtree_user');
    const storedToken = localStorage.getItem('medtree_token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({email, password}),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'Login failed' };
      setUser(data.user);
      localStorage.setItem('medtree_token', data.access_token);
      localStorage.setItem('medtree_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Could not connect to server' };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'Signup failed' };
      setUser(data.user);
      localStorage.setItem('medtree_token', data.access_token);
      localStorage.setItem('medtree_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Could not connect to server' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medtree_user');
    localStorage.removeItem('medtree_token');
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
