import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('mh_user');
    return raw ? JSON.parse(raw) : null;
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
      const res = await api.post('/auth/login', { email, password });
      setToken(res.data.token || res.data.accessToken);
      setRefreshToken(res.data.refreshToken || null);
      setUser(res.data.user || null);
      return res.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to login'));
    }
  };

  const register = async ({ name, email, password }) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      setToken(res.data.token || res.data.accessToken);
      setRefreshToken(res.data.refreshToken || null);
      setUser(res.data.user || null);
      return res.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to register'));
    }
  };

  const refreshSession = async () => {
    if (!refreshToken) return null;
    const res = await api.post('/auth/refresh', { refreshToken });
    const nextToken = res.data.token || res.data.accessToken;
    const nextRefresh = res.data.refreshToken || refreshToken;
    setToken(nextToken);
    setRefreshToken(nextRefresh);
    setUser(res.data.user || user);
    return res.data;
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (_ignore) {
      // local logout remains authoritative
    }
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const authFetch = async (url, opts = {}) => {
    return api.request({
      url,
      ...opts,
      headers: {
        ...(opts.headers || {})
      }
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login, register, refreshSession, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};
