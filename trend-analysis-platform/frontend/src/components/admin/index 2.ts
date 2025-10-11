/**
 * Admin components index for the Trend Analysis Platform.
 * 
 * This module exports all admin components for easy importing
 * and use throughout the application.
 */

// =============================================================================
// ADMIN COMPONENTS
// =============================================================================

export { default as UserManagement } from './UserManagement';
export { default as UserList } from './UserList';

// =============================================================================
// COMPONENT TYPES
// =============================================================================

export type { UserManagementProps, UserManagementState } from './UserManagement';
export type { UserListProps, UserListState } from './UserList';

// =============================================================================
// COMPONENT CLASSES
// =============================================================================

export { UserManagement as UserManagementClass } from './UserManagement';
export { UserList as UserListClass } from './UserList';

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

// export default {
//   UserManagement,
//   UserList
// };
