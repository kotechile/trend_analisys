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
    return localStorage.getItem(this.tokenStorageKey);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    const token = this.getToken();
    return !!(user && token);
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
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Registration failed - no user returned');
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: userData.name,
        avatar: '',
        role: 'user',
        created_at: data.user.created_at,
        updated_at: data.user.updated_at || data.user.created_at,
        is_verified: false,
        last_login: new Date().toISOString(),
      };

      // Store user (no token yet as email verification might be required)
      localStorage.setItem(this.userStorageKey, JSON.stringify(user));

      return { user };
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem(this.userStorageKey);
      localStorage.removeItem(this.tokenStorageKey);
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
