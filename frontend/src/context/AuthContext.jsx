import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('hireflow_access_token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          localStorage.setItem('hireflow_user', JSON.stringify(userData));
        } catch (err) {
          console.warn('Initial session validation failed:', err);
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleExternalLogout = () => {
      setUser(null);
    };

    window.addEventListener('hireflow_logout', handleExternalLogout);
    return () => window.removeEventListener('hireflow_logout', handleExternalLogout);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const registerCandidate = async (formData) => {
    const data = await authService.registerCandidate(formData);
    // After register, auto login
    const loginData = await authService.login(formData.email, formData.password);
    setUser(loginData.user);
    return loginData;
  };

  const registerRecruiter = async (formData) => {
    const data = await authService.registerRecruiter(formData);
    // After register, auto login
    const loginData = await authService.login(formData.email, formData.password);
    setUser(loginData.user);
    return loginData;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (newUserData) => {
    setUser((prev) => ({ ...prev, ...newUserData }));
    localStorage.setItem('hireflow_user', JSON.stringify({ ...user, ...newUserData }));
  };

  const isCandidate = user?.role === 'CANDIDATE';
  const isRecruiter = user?.role === 'RECRUITER';
  const isAdmin = user?.role === 'ADMIN';

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      role: user?.role || null,
      isCandidate,
      isRecruiter,
      isAdmin,
      login,
      registerCandidate,
      registerRecruiter,
      logout,
      updateUser,
    }),
    [user, loading, isCandidate, isRecruiter, isAdmin]
  );

  return (
    <AuthContext.Provider value={contextValue}>
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

export default AuthContext;
