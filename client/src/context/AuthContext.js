import React, { createContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi } from '../api';
import client from '../api/client';

export const AuthContext = createContext();

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('mh_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('mh_token') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('mh_refresh_token') || null);

  useEffect(() => {
    if (token) localStorage.setItem('mh_token', token); else localStorage.removeItem('mh_token');
    if (refreshToken) localStorage.setItem('mh_refresh_token', refreshToken); else localStorage.removeItem('mh_refresh_token');
    if (user) localStorage.setItem('mh_user', JSON.stringify(user)); else localStorage.removeItem('mh_user');
  }, [token, refreshToken, user]);

  const login = async ({ email, password }) => {
    try {
      const data = await authApi.login(email, password);
      setToken(data.token || data.accessToken);
      setRefreshToken(data.refreshToken || null);
      setUser(data.user || null);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to login'));
    }
  };

  const register = async ({ name, email, password }) => {
    try {
      const data = await authApi.register(name, email, password);
      setToken(data.token || data.accessToken);
      setRefreshToken(data.refreshToken || null);
      setUser(data.user || null);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to register'));
    }
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (_ignore) {
      // local logout remains authoritative
    }
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  /**
   * authFetch - Helper for one-off requests using the centralized client.
   * Interceptors handle token injection and refresh automatically.
   */
  const authFetch = useCallback((url, opts = {}) => {
    return client.request({
      url,
      ...opts
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login, register, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};
