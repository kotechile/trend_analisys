/**
 * Authentication components for the Trend Analysis Platform.
 * 
 * This module exports all authentication-related components
 * for easy importing and use throughout the application.
 */

// =============================================================================
// MAIN COMPONENTS
// =============================================================================

export { default as LoginForm } from './LoginForm';
export { default as RegisterForm } from './RegisterForm';
export { default as UserProfile } from './UserProfile';
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as GoogleAuth } from './GoogleAuth';
export { default as AuthCallback } from './AuthCallback';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export type { LoginFormProps } from './LoginForm';
export type { RegisterFormProps } from './RegisterForm';
export type { UserProfileProps } from './UserProfile';
export type { ProtectedRouteProps } from './ProtectedRoute';

// =============================================================================
// HIGHER-ORDER COMPONENTS
// =============================================================================

// Note: Higher-order components and role-specific components
// will be implemented as needed

// =============================================================================
// STYLES
// =============================================================================

// Import CSS files for bundling
import './LoginForm.css';
import './RegisterForm.css';
import './UserProfile.css';
import './ProtectedRoute.css';
