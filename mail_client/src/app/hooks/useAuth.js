import { useState, useEffect } from 'react';
import apiClient from '../api/client';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedEmail = localStorage.getItem('userEmail');
    if (storedToken && storedEmail) {
      setUserEmail(storedEmail);
      setIsLoggedIn(true);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiClient.post('/login', { email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('userEmail', email);
      setUserEmail(email);
      setIsLoggedIn(true);
      setAuthMessage('Logged in successfully!');
      return { success: true, message: 'Logged in successfully!' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed!';
      setAuthMessage(msg);
      console.error('Login error:', err);
      return { success: false, message: msg };
    }
  };

  // Modified 'register' function to accept 'name' and 'confirmPassword'
  const register = async (name, email, password, confirmPassword) => {
    try {
      const res = await apiClient.post('/register', { name, email, password, confirmPassword });
      setAuthMessage(res.data.message);
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed!';
      setAuthMessage(msg);
      console.error('Registration error:', err);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setUserEmail('');
    setAuthMessage('Logged out.');
  };

  return {
    isLoggedIn,
    userEmail,
    authMessage,
    login,
    register,
    logout,
    setAuthMessage
  };
}