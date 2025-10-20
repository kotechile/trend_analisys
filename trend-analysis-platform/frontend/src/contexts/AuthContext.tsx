/**
 * Authentication context for global auth state management
 */
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types/auth';
import { authService } from '../services/simpleAuthService';
import { apiClient } from '../services/apiClient';
// import { useNotifications } from '../components/common/NotificationSystem';

// Types
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' };

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      console.log('🔐 AUTH_LOGOUT action dispatched');
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  // const { success, error: showError } = useNotifications();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 Auth initialization starting...');
        console.log('🔐 Supabase URL:', (import.meta as any).env.VITE_SUPABASE_URL);
        console.log('🔐 Supabase Key exists:', !!(import.meta as any).env.VITE_SUPABASE_ANON_KEY);
        
        const token = authService.getToken();
        console.log('🔐 Auth initialization - token:', token);
        if (token) {
          // Set token in API client
          apiClient.setAuthToken(token);
          
          const user = await authService.getCurrentUser();
          console.log('🔐 Auth initialization - user:', user);
          if (user) {
            console.log('🔐 Auth initialization - dispatching AUTH_SUCCESS');
            dispatch({ type: 'AUTH_SUCCESS', payload: user });
          } else {
            console.log('🔐 Auth initialization - no user found, logging out');
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          console.log('🔐 Auth initialization - no token, logging out');
          dispatch({ type: 'AUTH_LOGOUT' });
        }
        
        console.log('🔐 Auth initialization completed');
      } catch (error) {
        console.error('🔐 Auth initialization failed:', error);
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (data: LoginRequest) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.login(data);
      
      // Set token in API client
      if (response.tokens?.accessToken) {
        apiClient.setAuthToken(response.tokens.accessToken);
      }
      
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      // success('Login successful!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      // showError(errorMessage);
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterRequest) => {
    try {
      console.log('🔐 AuthContext register - starting registration');
      dispatch({ type: 'AUTH_START' });
      const response = await authService.register(data);
      
      console.log('🔐 AuthContext register - authService response:', response);
      
      // Set token in API client
      if (response.tokens?.accessToken) {
        apiClient.setAuthToken(response.tokens.accessToken);
      }
      
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      console.log('🔐 AuthContext register - registration successful');
      // success('Registration successful!');
    } catch (error: any) {
      console.error('🔐 AuthContext register - registration failed:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      // showError(errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('🔐 Logout started...');
      
      // Add timeout to prevent hanging
      const logoutPromise = authService.logout();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Logout timeout')), 5000)
      );
      
      await Promise.race([logoutPromise, timeoutPromise]);
      
      // Clear token from API client
      apiClient.clearAuthToken();
      
      console.log('🔐 Logout successful, dispatching AUTH_LOGOUT');
      dispatch({ type: 'AUTH_LOGOUT' });
      // success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout failed:', error);
      // Still clear local state even if logout fails
      apiClient.clearAuthToken();
      console.log('🔐 Logout failed, but clearing local state');
      dispatch({ type: 'AUTH_LOGOUT' });
      // showError('Logout failed, but you have been signed out locally');
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const tokens = await authService.refreshToken();
      // Update token in API client
      apiClient.setAuthToken(tokens.accessToken);
      
      // Get updated user data
      const user = await authService.refreshUser();
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
      // showError('Session expired, please log in again');
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
