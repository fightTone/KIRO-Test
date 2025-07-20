import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      if (token) {
        try {
          // api.get returns the data directly with our enhanced API service
          const userData = await api.get('/auth/me');
          setUser(userData);
        } catch (error) {
          console.error('Authentication error:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Using URLSearchParams for form data as required by OAuth2 password flow
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      // Use the original axios instance to get the full response
      const response = await api.axios.post('/auth/login', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Check if we have a valid response with access_token
      if (!response.data || !response.data.access_token) {
        throw new Error('Invalid response from server during login');
      }

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);

      // Get user info - api.get returns the data directly, not the response object
      const userData = await api.get('/auth/me');
      console.log('User data from /auth/me:', userData);
      console.log('User role from API:', userData.role);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      // Clear any partial authentication state
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      // Register the user
      await api.post('/auth/signup', userData);
      
      // After successful registration, log the user in
      try {
        await login(userData.username, userData.password);
      } catch (loginError) {
        console.error('Auto-login after registration failed:', loginError);
        // If auto-login fails, we still consider registration successful
        // but we'll throw a more specific error
        throw new Error('Registration successful, but automatic login failed. Please try logging in manually.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};