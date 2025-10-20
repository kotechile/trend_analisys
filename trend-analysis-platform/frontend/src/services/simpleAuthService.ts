/**
 * Simple Authentication Service using Supabase
 * This service provides basic authentication functionality for the AuthContext
 */

import { supabase } from '../lib/supabase';
import { User, LoginRequest, RegisterRequest } from '../types/auth';

export interface AuthResponse {
  user: User;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export class SimpleAuthService {
  private userStorageKey = 'trendtap_user';
  private tokenStorageKey = 'trendtap_token';

  // Get current user from localStorage
  getCurrentUser(): User | null {
    try {
      const storedUser = localStorage.getItem(this.userStorageKey);
      console.log('🔐 AuthService getCurrentUser:', { storedUser: !!storedUser });
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Failed to parse stored user:', error);
    }
    return null;
  }

  // Get current token
  getToken(): string | null {
    const token = localStorage.getItem(this.tokenStorageKey);
    console.log('🔐 AuthService getToken:', { token: !!token });
    return token;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    const token = this.getToken();
    const isAuth = !!(user && token);
    console.log('🔐 AuthService isAuthenticated check:', { user: !!user, token: !!token, isAuth });
    return isAuth;
  }

  // Login with email and password
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user || !data.session) {
        throw new Error('Login failed - no user or session returned');
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.full_name || data.user.email || '',
        avatar: data.user.user_metadata?.avatar_url || '',
        role: 'user',
        created_at: data.user.created_at,
        updated_at: data.user.updated_at || data.user.created_at,
        is_verified: data.user.email_confirmed_at ? true : false,
        last_login: new Date().toISOString(),
      };

      // Store user and token
      localStorage.setItem(this.userStorageKey, JSON.stringify(user));
      localStorage.setItem(this.tokenStorageKey, data.session.access_token);

      return {
        user,
        tokens: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        },
      };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 AuthService register - starting registration for:', userData.email);
      console.log('🔐 AuthService register - userData:', { 
        email: userData.email, 
        firstName: userData.firstName, 
        lastName: userData.lastName 
      });
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: `${userData.firstName} ${userData.lastName}`.trim(),
          },
        },
      });
      
      console.log('🔐 AuthService register - Supabase response:', { data: !!data, error: !!error });

      if (error) {
        console.error('🔐 AuthService register - Supabase error:', error);
        throw new Error(error.message);
      }

      if (!data.user) {
        console.error('🔐 AuthService register - No user returned from Supabase');
        throw new Error('Registration failed - no user returned');
      }
      
      console.log('🔐 AuthService register - User created successfully:', data.user.id);

      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        avatar: '',
        role: 'user',
        created_at: data.user.created_at,
        updated_at: data.user.updated_at || data.user.created_at,
        is_verified: false,
        last_login: new Date().toISOString(),
      };

      // Store user (no token yet as email verification might be required)
      localStorage.setItem(this.userStorageKey, JSON.stringify(user));
      console.log('🔐 AuthService register - User stored in localStorage');

      return { user };
    } catch (error: any) {
      console.error('🔐 AuthService register - Registration failed:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      console.log('🔐 AuthService logout started');
      
      // Try Supabase logout with timeout
      const supabaseLogoutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Supabase logout timeout')), 3000)
      );
      
      try {
        const { error } = await Promise.race([supabaseLogoutPromise, timeoutPromise]);
        if (error) {
          console.error('Supabase logout error:', error);
        } else {
          console.log('🔐 Supabase logout successful');
        }
      } catch (timeoutError) {
        console.warn('Supabase logout timed out, continuing with local cleanup');
      }
      
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw the error, just log it and continue with cleanup
    } finally {
      // Always clear local storage regardless of Supabase status
      console.log('🔐 Clearing local storage');
      localStorage.removeItem(this.userStorageKey);
      localStorage.removeItem(this.tokenStorageKey);
      console.log('🔐 Local storage cleared');
    }
  }

  // Refresh user data
  async refreshUser(): Promise<User> {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('No user found');
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.full_name || data.user.email || '',
        avatar: data.user.user_metadata?.avatar_url || '',
        role: 'user',
        created_at: data.user.created_at,
        updated_at: data.user.updated_at || data.user.created_at,
        is_verified: data.user.email_confirmed_at ? true : false,
        last_login: new Date().toISOString(),
      };

      // Update stored user
      localStorage.setItem(this.userStorageKey, JSON.stringify(user));

      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to refresh user');
    }
  }

  // Refresh token
  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw new Error(error.message);
      }

      if (!data.session) {
        throw new Error('No session returned');
      }

      // Update stored token
      localStorage.setItem(this.tokenStorageKey, data.session.access_token);

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to refresh token');
    }
  }

  // Clear auth data
  clearAuth(): void {
    localStorage.removeItem(this.userStorageKey);
    localStorage.removeItem(this.tokenStorageKey);
  }
}

// Create and export a singleton instance
export const authService = new SimpleAuthService();
