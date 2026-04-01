import React, { createContext, useContext, useState, useEffect } from 'react';
const API_URL = 'http://localhost:8000';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [office, setOffice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedToken = localStorage.getItem('medtree_token');
    const storedOfficeToken = localStorage.getItem('medtree_office_token');

    if (!storedToken && !storedOfficeToken) {
      setLoading(false);
      return;
    }

    if (storedOfficeToken) {
      const storedOffice = localStorage.getItem('medtree_office');
      if (storedOffice) setOffice(JSON.parse(storedOffice));
      if (!storedToken) { setLoading(false); return; }
    }

    // Re-fetch the full user from the server so we always have fresh data
    fetch(`${API_URL}/account/me`, {
      headers: { Authorization: `Bearer ${storedToken}` }
    })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setUser(data);
            localStorage.setItem('medtree_user', JSON.stringify(data));
          } else {
            // Token expired or invalid — clear session
            localStorage.removeItem('medtree_token');
            localStorage.removeItem('medtree_user');
          }
        })
        .catch(() => {
          // Server unreachable — fall back to stored user
          const storedUser = localStorage.getItem('medtree_user');
          if (storedUser) setUser(JSON.parse(storedUser));
        })
        .finally(() => setLoading(false));
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

  const loginOffice = async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/office/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'Login failed' };
      setOffice(data.office);
      localStorage.setItem('medtree_office_token', data.access_token);
      localStorage.setItem('medtree_office', JSON.stringify(data.office));
      return { success: true };
    } catch {
      return { success: false, error: 'Could not connect to server' };
    }
  };

  const signupOffice = async (officeData) => {
    try {
      const res = await fetch(`${API_URL}/office/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(officeData),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'Signup failed' };
      setOffice(data.office);
      localStorage.setItem('medtree_office_token', data.access_token);
      localStorage.setItem('medtree_office', JSON.stringify(data.office));
      return { success: true };
    } catch {
      return { success: false, error: 'Could not connect to server' };
    }
  };

  const logoutOffice = () => {
    setOffice(null);
    localStorage.removeItem('medtree_office_token');
    localStorage.removeItem('medtree_office');
  };

  const value = {
    user,
    setUser,
    office,
    loading,
    login,
    signup,
    logout,
    loginOffice,
    signupOffice,
    logoutOffice,
    isAuthenticated: !!user,
    isOfficeAuthenticated: !!office,
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
