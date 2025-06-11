import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, LoginRequest, RegisterRequest } from '@todo-app/client-common';
import { authAPI, userAPI } from '../utils/apiClient';
import apiClient from '../utils/apiClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          apiClient.setAuthToken(storedToken);
          
          // Verify token is still valid by fetching profile
          try {
            const profileResponse = await authAPI.getProfile();
            if (profileResponse.status === 'success') {
              setUser(profileResponse.data.user);
            }
          } catch (error) {
            // Token is invalid, clear auth state
            setToken(null);
            setUser(null);
            apiClient.clearAuthToken();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      // DON'T set loading state here - let the form handle its own loading
      // This prevents unnecessary re-renders that reset the form
      const response = await authAPI.login(credentials);
      
      if (response.status === 'success') {
        const { user: newUser, token: newToken } = response.data;
        
        setUser(newUser);
        setToken(newToken);
        
        // Persist to localStorage and update API clients
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        apiClient.setAuthToken(newToken);
      }
    } catch (error) {
      console.error('Login error:', error);
      // Don't change loading state on error to prevent form reset
      throw error;
    }
    // No finally block needed - form handles its own loading state
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      // DON'T set loading state here - let the form handle its own loading
      // This prevents unnecessary re-renders that reset the form
      const response = await authAPI.register(userData);
      
      if (response.status === 'success') {
        const { user: newUser, token: newToken } = response.data;
        
        setUser(newUser);
        setToken(newToken);
        
        // Persist to localStorage and update API clients
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        apiClient.setAuthToken(newToken);
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Don't change loading state on error to prevent form reset
      throw error;
    }
    // No finally block needed - form handles its own loading state
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    apiClient.clearAuthToken();
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      const response = await userAPI.updateProfile(userData);
      
      if (response.status === 'success') {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};