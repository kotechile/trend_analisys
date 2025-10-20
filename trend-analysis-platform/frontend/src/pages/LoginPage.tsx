/**
 * LoginPage Component for the Trend Analysis Platform.
 * 
 * This page provides the main login interface for users to authenticate
 * and access the platform. It integrates with the LoginForm component
 * and handles routing after successful authentication.
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';
import { ErrorType } from '../types/errors';
import { errorHandler } from '../services/errorHandler';
import './LoginPage.css';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface LoginPageProps {
  redirectTo?: string;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  customTitle?: string;
  customSubtitle?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function LoginPage({
  redirectTo,
  className = '',
  showHeader = true,
  showFooter = true,
  customTitle,
  customSubtitle
}: LoginPageProps) {
  // =============================================================================
  // HOOKS
  // =============================================================================

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth();
  
  console.log('🔑 LoginPage rendered - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = redirectTo || location.state?.from?.pathname || '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, redirectTo, location.state]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleLoginSuccess = () => {
    // Navigation is handled by the useEffect above
    // This callback can be used for additional success actions
  };

  const handleLoginError = (error: string) => {
    // Error handling is managed by the LoginForm component
    // This callback can be used for additional error actions
    console.error('Login error:', error);
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <header className="login-page__header">
        <div className="login-page__header-content">
          <h1 className="login-page__logo">
            Trend Analysis Platform
          </h1>
          <p className="login-page__tagline">
            Advanced analytics for market trends and insights
          </p>
        </div>
      </header>
    );
  };

  const renderFooter = () => {
    if (!showFooter) return null;

    return (
      <footer className="login-page__footer">
        <div className="login-page__footer-content">
          <p className="login-page__copyright">
            © 2024 Trend Analysis Platform. All rights reserved.
          </p>
          <div className="login-page__footer-links">
            <a href="/privacy" className="login-page__footer-link">
              Privacy Policy
            </a>
            <a href="/terms" className="login-page__footer-link">
              Terms of Service
            </a>
            <a href="/support" className="login-page__footer-link">
              Support
            </a>
          </div>
        </div>
      </footer>
    );
  };

  const renderLoadingState = () => {
    return (
      <div className="login-page__loading">
        <div className="login-page__loading-spinner" />
        <p className="login-page__loading-text">
          Checking authentication status...
        </p>
      </div>
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className={`login-page ${className}`}>
        {renderLoadingState()}
      </div>
    );
  }

  // Don't render if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={`login-page ${className}`}>
      {renderHeader()}
      
      <main className="login-page__main">
        <div className="login-page__container">
          <div className="login-page__content">
            <div className="login-page__form-section">
              <div className="login-page__form-header">
                <h2 className="login-page__title">
                  {customTitle || 'Welcome Back'}
                </h2>
                <p className="login-page__subtitle">
                  {customSubtitle || 'Sign in to your account to continue'}
                </p>
              </div>

              <div className="login-page__form-container">
                <LoginForm
                  onSuccess={handleLoginSuccess}
                  onError={handleLoginError}
                  redirectTo={redirectTo}
                  showForgotPassword={true}
                  showRegisterLink={true}
                  autoFocus={true}
                />
              </div>
            </div>

            <div className="login-page__info-section">
              <div className="login-page__info-content">
                <h3 className="login-page__info-title">
                  Why Choose Our Platform?
                </h3>
                <ul className="login-page__info-list">
                  <li className="login-page__info-item">
                    <div className="login-page__info-icon">📊</div>
                    <div className="login-page__info-text">
                      <strong>Advanced Analytics</strong>
                      <span>Comprehensive trend analysis tools</span>
                    </div>
                  </li>
                  <li className="login-page__info-item">
                    <div className="login-page__info-icon">🔒</div>
                    <div className="login-page__info-text">
                      <strong>Secure & Private</strong>
                      <span>Enterprise-grade security</span>
                    </div>
                  </li>
                  <li className="login-page__info-item">
                    <div className="login-page__info-icon">⚡</div>
                    <div className="login-page__info-text">
                      <strong>Real-time Insights</strong>
                      <span>Live data and instant updates</span>
                    </div>
                  </li>
                  <li className="login-page__info-item">
                    <div className="login-page__info-icon">🎯</div>
                    <div className="login-page__info-text">
                      <strong>Customizable</strong>
                      <span>Tailored to your needs</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {renderFooter()}
    </div>
  );
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default LoginPage;
