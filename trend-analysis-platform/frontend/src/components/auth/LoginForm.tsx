/**
 * LoginForm Component for the Trend Analysis Platform.
 * 
 * This component provides a complete login form with validation,
 * error handling, and integration with the authentication system.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginRequest, FormErrors } from '../../types/auth';
import { GoogleAuth } from './GoogleAuth';
import './LoginForm.css';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  className?: string;
  showForgotPassword?: boolean;
  showRegisterLink?: boolean;
  autoFocus?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function LoginForm({
  onSuccess,
  onError,
  redirectTo,
  className = '',
  showForgotPassword = true,
  showRegisterLink = true,
  autoFocus = true
}: LoginFormProps) {
  // =============================================================================
  // STATE
  // =============================================================================

  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors<LoginRequest>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  useEffect(() => {
    if (autoFocus) {
      const emailInput = document.getElementById('email-input');
      if (emailInput) {
        emailInput.focus();
      }
    }
  }, [autoFocus]);

  // =============================================================================
  // VALIDATION
  // =============================================================================

  const validateForm = (): boolean => {
    const newErrors: FormErrors<LoginRequest> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof LoginRequest]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear global error
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      await login(formData);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    // This would typically open a forgot password modal or navigate to forgot password page
    console.log('Forgot password clicked');
  };

  const handleRegisterClick = () => {
    // This would typically navigate to registration page
    console.log('Register clicked');
  };

  const handleGoogleSuccess = (user: any) => {
    console.log('Google sign-in successful:', user);
    onSuccess?.();
  };

  const handleGoogleError = (error: string) => {
    console.error('Google sign-in error:', error);
    onError?.(error);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className={`login-form-container ${className}`}>
      <form onSubmit={handleSubmit} className="login-form" noValidate>
        <div className="login-form-header">
          <h2 className="login-form-title">Welcome Back</h2>
          <p className="login-form-subtitle">Sign in to your account</p>
        </div>

        <div className="login-form-body">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email-input" className="form-label">
              Email Address
            </label>
            <input
              id="email-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              placeholder="Enter your email"
              disabled={isSubmitting || isLoading}
              autoComplete="email"
              required
            />
            {errors.email && (
              <span className="form-error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password-input" className="form-label">
              Password
            </label>
            <div className="password-input-container">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                placeholder="Enter your password"
                disabled={isSubmitting || isLoading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isSubmitting || isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <span className="form-error" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          {/* Global Error */}
          {error && (
            <div className="form-global-error" role="alert">
              {error}
            </div>
          )}

          {/* Forgot Password Link */}
          {showForgotPassword && (
            <div className="form-actions">
              <button
                type="button"
                className="forgot-password-link"
                onClick={handleForgotPassword}
                disabled={isSubmitting || isLoading}
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? (
              <span className="button-loading">
                <span className="spinner" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Divider */}
          <div className="form-divider">
            <span className="divider-text">or</span>
          </div>

          {/* Google Authentication */}
          <div className="google-auth-container">
            <GoogleAuth
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              variant="outlined"
              size="medium"
              fullWidth={true}
              disabled={isSubmitting || isLoading}
            />
          </div>

          {/* Register Link */}
          {showRegisterLink && (
            <div className="form-footer">
              <p className="register-text">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="register-link"
                  onClick={handleRegisterClick}
                  disabled={isSubmitting || isLoading}
                >
                  Sign up
                </button>
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default LoginForm;
