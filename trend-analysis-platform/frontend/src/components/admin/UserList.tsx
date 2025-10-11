/**
 * UserList Component for the Trend Analysis Platform.
 * 
 * This component provides a reusable user list display with sorting, filtering,
 * and selection capabilities for admin interfaces.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { UserProfile, UserRole, UserStatus } from '../../types/user';
import { ErrorType } from '../../types/errors';
import { errorHandler } from '../../services/errorHandler';
import './UserList.css';

// =============================================================================
// COMPONENT TYPES
// =============================================================================

export interface UserListProps {
  users: UserProfile[];
  selectedUsers: Set<string>;
  onUserSelect: (userId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onUserEdit: (user: UserProfile) => void;
  onUserDelete: (user: UserProfile) => void;
  onSort: (field: keyof UserProfile) => void;
  sortField: keyof UserProfile;
  sortDirection: 'asc' | 'desc';
  enableSelection?: boolean;
  enableSorting?: boolean;
  enableActions?: boolean;
  enableUserEditing?: boolean;
  enableUserDeletion?: boolean;
  currentUserId?: string;
  className?: string;
  loading?: boolean;
  error?: string | null;
}

export interface UserListState {
  hoveredRow: string | null;
  showActionsMenu: string | null;
}

// =============================================================================
// USER LIST COMPONENT
// =============================================================================

export function UserList({
  users,
  selectedUsers,
  onUserSelect,
  onSelectAll,
  onUserEdit,
  onUserDelete,
  onSort,
  sortField,
  sortDirection,
  enableSelection = true,
  enableSorting = true,
  enableActions = true,
  enableUserEditing = true,
  enableUserDeletion = true,
  currentUserId,
  className = '',
  loading = false,
  error = null
}: UserListProps) {
  const [state, setState] = useState<UserListState>({
    hoveredRow: null,
    showActionsMenu: null
  });

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleRowHover = useCallback((userId: string | null) => {
    setState(prev => ({ ...prev, hoveredRow: userId }));
  }, []);

  const handleActionsMenuToggle = useCallback((userId: string | null) => {
    setState(prev => ({ 
      ...prev, 
      showActionsMenu: prev.showActionsMenu === userId ? null : userId 
    }));
  }, []);

  const handleUserSelect = useCallback((userId: string, selected: boolean) => {
    onUserSelect(userId, selected);
  }, [onUserSelect]);

  const handleSelectAll = useCallback((selected: boolean) => {
    onSelectAll(selected);
  }, [onSelectAll]);

  const handleUserEdit = useCallback((user: UserProfile) => {
    onUserEdit(user);
    setState(prev => ({ ...prev, showActionsMenu: null }));
  }, [onUserEdit]);

  const handleUserDelete = useCallback((user: UserProfile) => {
    onUserDelete(user);
    setState(prev => ({ ...prev, showActionsMenu: null }));
  }, [onUserDelete]);

  const handleSort = useCallback((field: keyof UserProfile) => {
    if (enableSorting) {
      onSort(field);
    }
  }, [enableSorting, onSort]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderSortIcon = useCallback((field: keyof UserProfile) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  }, [sortField, sortDirection]);

  const renderRoleBadge = useCallback((role: UserRole) => {
    return (
      <span className={`role-badge role-${role}`}>
        {role}
      </span>
    );
  }, []);

  const renderStatusBadge = useCallback((isActive: boolean) => {
    return (
      <span className={`status-badge status-${isActive ? 'active' : 'inactive'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  }, []);

  const renderVerifiedBadge = useCallback((isVerified: boolean) => {
    return (
      <span className={`verified-badge verified-${isVerified ? 'yes' : 'no'}`}>
        {isVerified ? 'Verified' : 'Unverified'}
      </span>
    );
  }, []);

  const renderUserRow = useCallback((user: UserProfile) => {
    const isSelected = selectedUsers.has(user.user_id);
    const isHovered = state.hoveredRow === user.user_id;
    const showActions = state.showActionsMenu === user.user_id;
    const canDelete = enableUserDeletion && user.user_id !== currentUserId;
    const canEdit = enableUserEditing;

    return (
      <tr 
        key={user.user_id} 
        className={`user-row ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={() => handleRowHover(user.user_id)}
        onMouseLeave={() => handleRowHover(null)}
      >
        {enableSelection && (
          <td className="user-checkbox">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleUserSelect(user.user_id, e.target.checked)}
              aria-label={`Select user ${user.email}`}
            />
          </td>
        )}
        
        <td className="user-email">
          <div className="user-email-content">
            <span className="email-text">{user.email}</span>
            {user.profileImageUrl && (
              <img 
                src={user.profileImageUrl} 
                alt={`${user.first_name} ${user.last_name}`}
                className="user-avatar"
              />
            )}
          </div>
        </td>
        
        <td className="user-name">
          <div className="user-name-content">
            <span className="name-text">
              {user.first_name} {user.last_name}
            </span>
            {user.bio && (
              <span className="user-bio">{user.bio}</span>
            )}
          </div>
        </td>
        
        <td className="user-role">
          {renderRoleBadge(user.role)}
        </td>
        
        <td className="user-status">
          {renderStatusBadge(user.is_active)}
        </td>
        
        <td className="user-verified">
          {renderVerifiedBadge(user.is_verified)}
        </td>
        
        <td className="user-created">
          <div className="date-content">
            <span className="date-text">
              {new Date(user.created_at).toLocaleDateString()}
            </span>
            <span className="time-text">
              {new Date(user.created_at).toLocaleTimeString()}
            </span>
          </div>
        </td>
        
        <td className="user-last-login">
          <div className="date-content">
            {user.last_login ? (
              <>
                <span className="date-text">
                  {new Date(user.last_login).toLocaleDateString()}
                </span>
                <span className="time-text">
                  {new Date(user.last_login).toLocaleTimeString()}
                </span>
              </>
            ) : (
              <span className="never-text">Never</span>
            )}
          </div>
        </td>
        
        {enableActions && (
          <td className="user-actions">
            <div className="action-buttons">
              <button
                className="action-button menu-button"
                onClick={() => handleActionsMenuToggle(user.user_id)}
                title="More actions"
                aria-label={`More actions for ${user.email}`}
              >
                ⋮
              </button>
              
              {showActions && (
                <div className="actions-menu">
                  {canEdit && (
                    <button
                      className="action-menu-item edit-action"
                      onClick={() => handleUserEdit(user)}
                      title="Edit user"
                    >
                      ✏️ Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className="action-menu-item delete-action"
                      onClick={() => handleUserDelete(user)}
                      title="Delete user"
                    >
                      🗑️ Delete
                    </button>
                  )}
                  <button
                    className="action-menu-item view-action"
                    onClick={() => {/* TODO: Implement view user details */}}
                    title="View user details"
                  >
                    👁️ View Details
                  </button>
                </div>
              )}
            </div>
          </td>
        )}
      </tr>
    );
  }, [
    selectedUsers,
    state.hoveredRow,
    state.showActionsMenu,
    enableSelection,
    enableActions,
    enableUserEditing,
    enableUserDeletion,
    currentUserId,
    handleRowHover,
    handleUserSelect,
    handleUserEdit,
    handleUserDelete,
    handleActionsMenuToggle,
    renderRoleBadge,
    renderStatusBadge,
    renderVerifiedBadge
  ]);

  const renderTableHeader = useCallback(() => {
    return (
      <thead>
        <tr>
          {enableSelection && (
            <th className="user-checkbox">
              <input
                type="checkbox"
                checked={selectedUsers.size === users.length && users.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                aria-label="Select all users"
              />
            </th>
          )}
          <th 
            className={`sortable ${sortField === 'email' ? sortDirection : ''}`}
            onClick={() => handleSort('email')}
          >
            Email {renderSortIcon('email')}
          </th>
          <th 
            className={`sortable ${sortField === 'first_name' ? sortDirection : ''}`}
            onClick={() => handleSort('first_name')}
          >
            Name {renderSortIcon('first_name')}
          </th>
          <th 
            className={`sortable ${sortField === 'role' ? sortDirection : ''}`}
            onClick={() => handleSort('role')}
          >
            Role {renderSortIcon('role')}
          </th>
          <th 
            className={`sortable ${sortField === 'is_active' ? sortDirection : ''}`}
            onClick={() => handleSort('is_active')}
          >
            Status {renderSortIcon('is_active')}
          </th>
          <th 
            className={`sortable ${sortField === 'is_verified' ? sortDirection : ''}`}
            onClick={() => handleSort('is_verified')}
          >
            Verified {renderSortIcon('is_verified')}
          </th>
          <th 
            className={`sortable ${sortField === 'created_at' ? sortDirection : ''}`}
            onClick={() => handleSort('created_at')}
          >
            Created {renderSortIcon('created_at')}
          </th>
          <th 
            className={`sortable ${sortField === 'last_login' ? sortDirection : ''}`}
            onClick={() => handleSort('last_login')}
          >
            Last Login {renderSortIcon('last_login')}
          </th>
          {enableActions && <th>Actions</th>}
        </tr>
      </thead>
    );
  }, [
    enableSelection,
    selectedUsers,
    users.length,
    sortField,
    sortDirection,
    enableActions,
    handleSelectAll,
    handleSort,
    renderSortIcon
  ]);

  const renderEmptyState = useCallback(() => {
    if (loading) {
      return (
        <tr>
          <td colSpan={enableSelection ? 9 : 8} className="empty-state">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading users...</p>
            </div>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={enableSelection ? 9 : 8} className="empty-state">
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <p className="error-message">{error}</p>
              <button 
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </td>
        </tr>
      );
    }

    return (
      <tr>
        <td colSpan={enableSelection ? 9 : 8} className="empty-state">
          <div className="no-users-container">
            <div className="no-users-icon">👥</div>
            <p className="no-users-message">No users found</p>
            <p className="no-users-subtitle">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </td>
      </tr>
    );
  }, [loading, error, enableSelection]);

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className={`user-list ${className}`}>
      <div className="user-list-table-container">
        <table className="user-list-table">
          {renderTableHeader()}
          <tbody>
            {users.length > 0 ? users.map(renderUserRow) : renderEmptyState()}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default UserList;
