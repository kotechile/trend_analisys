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

export { withAuth } from './ProtectedRoute';

// =============================================================================
// ROLE-SPECIFIC COMPONENTS
// =============================================================================

export { 
  AdminRoute, 
  EditorRoute, 
  UserRoute 
} from './ProtectedRoute';

// =============================================================================
// PERMISSION-SPECIFIC COMPONENTS
// =============================================================================

export { 
  CanManageUsers, 
  CanViewAnalytics, 
  CanManageContent, 
  CanAccessAdminPanel 
} from './ProtectedRoute';

// =============================================================================
// STYLES
// =============================================================================

// Import CSS files for bundling
import './LoginForm.css';
import './RegisterForm.css';
import './UserProfile.css';
import './ProtectedRoute.css';
