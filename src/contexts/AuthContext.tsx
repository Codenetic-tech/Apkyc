import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../utils';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (user_code: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedToken = sessionStorage.getItem('rms_token');
        const savedUser = sessionStorage.getItem('rms_user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (user_code: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      
      // Step 1: Login
      const loginResponse = await fetch(`${API_BASE_URL}/api/method/rms.apuser.ap_kyc_login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_code,
          password
        })
      });

      const loginData = await loginResponse.json();

      if (loginData.message?.status !== 'success' || !loginData.message?.token) {
        throw new Error(loginData.message?.message || 'Login failed');
      }

      const authToken = loginData.message.token;

      // Step 2: Get user data
      const userResponse = await fetch(`${API_BASE_URL}/api/method/rms.apuser.get_user_data`, {
        method: 'GET',
        headers: {
          'token': authToken
        }
      });

      const userDataResponse = await userResponse.json();

      if (!userDataResponse.message?.user_code || !userDataResponse.message?.ap_code) {
        throw new Error('Failed to fetch user data');
      }

      const userData: User = {
        user_code: userDataResponse.message.user_code,
        ap_code: userDataResponse.message.ap_code,
        role: 'employee', // Default role for compatibility
        email: '',
        employeeId: userDataResponse.message.user_code, // Use user_code as employeeId
        team: '[]' // Default empty team
      };

      // Set state
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);

      // Save to sessionStorage
      sessionStorage.setItem('rms_token', authToken);
      sessionStorage.setItem('rms_user', JSON.stringify(userData));

    } catch (error) {
      console.error('Login error:', error);
      logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('rms_token');
    sessionStorage.removeItem('rms_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      token,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};