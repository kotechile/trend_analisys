/**
 * UserManagement Component for the Trend Analysis Platform.
 * 
 * This component provides comprehensive user management functionality
 * for administrators, including user listing, editing, and management.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../hooks/useUser';
import { UserProfile, UserRole, UserStatus } from '../../types/user';
import { ErrorType } from '../../types/errors';
import { errorHandler } from '../../services/errorHandler';
import { apiIntegration } from '../../services/apiIntegration';
import './UserManagement.css';

// =============================================================================
// COMPONENT TYPES
// =============================================================================

export interface UserManagementProps {
  className?: string;
  enableBulkActions?: boolean;
  enableSearch?: boolean;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  enableExport?: boolean;
  enableImport?: boolean;
  enableUserCreation?: boolean;
  enableUserEditing?: boolean;
  enableUserDeletion?: boolean;
  enableRoleManagement?: boolean;
  enableStatusManagement?: boolean;
  enableSessionManagement?: boolean;
  enableActivityTracking?: boolean;
  enableAuditLogs?: boolean;
}

export interface UserManagementState {
  users: UserProfile[];
  filteredUsers: UserProfile[];
  selectedUsers: Set<string>;
  searchQuery: string;
  filterRole: UserRole | 'all';
  filterStatus: UserStatus | 'all';
  sortField: keyof UserProfile;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  showBulkActions: boolean;
  editingUser: UserProfile | null;
  deletingUser: UserProfile | null;
}

// =============================================================================
// USER MANAGEMENT COMPONENT
// =============================================================================

export function UserManagement({
  className = '',
  enableBulkActions = true,
  enableSearch = true,
  enableFiltering = true,
  enableSorting = true,
  enablePagination = true,
  pageSize = 20,
  enableExport = true,
  enableImport = true,
  enableUserCreation = true,
  enableUserEditing = true,
  enableUserDeletion = true,
  enableRoleManagement = true,
  enableStatusManagement = true,
  enableSessionManagement = true,
  enableActivityTracking = true,
  enableAuditLogs = true
}: UserManagementProps) {
  const { user: currentUser } = useAuth();
  const { user: userProfile } = useUser();

  // =============================================================================
  // STATE
  // =============================================================================

  const [state, setState] = useState<UserManagementState>({
    users: [],
    filteredUsers: [],
    selectedUsers: new Set(),
    searchQuery: '',
    filterRole: 'all',
    filterStatus: 'all',
    sortField: 'created_at',
    sortDirection: 'desc',
    currentPage: 1,
    totalPages: 1,
    loading: false,
    error: null,
    showCreateModal: false,
    showEditModal: false,
    showDeleteModal: false,
    showBulkActions: false,
    editingUser: null,
    deletingUser: null
  });

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [state.users, state.searchQuery, state.filterRole, state.filterStatus, state.sortField, state.sortDirection]);

  // =============================================================================
  // DATA LOADING
  // =============================================================================

  const loadUsers = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // This would typically call an admin API endpoint
      // For now, we'll simulate loading users
      const mockUsers: UserProfile[] = [
        {
          user_id: '1',
          email: 'admin@example.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_active: true,
          is_verified: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          last_login: '2024-01-15T10:30:00Z',
          bio: 'System administrator',
          preferences: {
            theme: 'light',
            language: 'en',
            notifications: {
              email: true,
              push: true,
              sms: false
            }
          }
        },
        {
          user_id: '2',
          email: 'user@example.com',
          first_name: 'Regular',
          last_name: 'User',
          role: 'user',
          is_active: true,
          is_verified: true,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
          last_login: '2024-01-14T15:45:00Z',
          bio: 'Regular user account',
          preferences: {
            theme: 'dark',
            language: 'en',
            notifications: {
              email: true,
              push: false,
              sms: false
            }
          }
        }
      ];

      setState(prev => ({
        ...prev,
        users: mockUsers,
        loading: false
      }));

    } catch (error) {
      const appError = errorHandler.createSystemError(
        ErrorType.INTERNAL_SERVER_ERROR,
        'Failed to load users',
        'UserManagement'
      );
      errorHandler.handleError(appError, {
        userId: currentUser?.user_id,
        component: 'UserManagement',
        action: 'loadUsers',
        timestamp: Date.now()
      });

      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load users. Please try again.'
      }));
    }
  }, [currentUser]);

  // =============================================================================
  // FILTERING AND SORTING
  // =============================================================================

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...state.users];

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(query) ||
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (state.filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === state.filterRole);
    }

    // Apply status filter
    if (state.filterStatus !== 'all') {
      filtered = filtered.filter(user => {
        if (state.filterStatus === 'active') return user.is_active;
        if (state.filterStatus === 'inactive') return !user.is_active;
        if (state.filterStatus === 'verified') return user.is_verified;
        if (state.filterStatus === 'unverified') return !user.is_verified;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[state.sortField];
      const bValue = b[state.sortField];
      
      if (aValue < bValue) return state.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return state.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / pageSize);
    const startIndex = (state.currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = filtered.slice(startIndex, endIndex);

    setState(prev => ({
      ...prev,
      filteredUsers: paginatedUsers,
      totalPages,
      currentPage: Math.min(state.currentPage, totalPages || 1)
    }));
  }, [state.users, state.searchQuery, state.filterRole, state.filterStatus, state.sortField, state.sortDirection, state.currentPage, pageSize]);

  // =============================================================================
  // USER ACTIONS
  // =============================================================================

  const handleCreateUser = useCallback(async (userData: Partial<UserProfile>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // This would typically call an admin API endpoint to create a user
      // For now, we'll simulate user creation
      const newUser: UserProfile = {
        user_id: Date.now().toString(),
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        role: userData.role || 'user',
        is_active: userData.is_active ?? true,
        is_verified: userData.is_verified ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: null,
        bio: userData.bio || '',
        preferences: userData.preferences || {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      };

      setState(prev => ({
        ...prev,
        users: [newUser, ...prev.users],
        showCreateModal: false,
        loading: false
      }));

    } catch (error) {
      const appError = errorHandler.createSystemError(
        ErrorType.INTERNAL_SERVER_ERROR,
        'Failed to create user',
        'UserManagement'
      );
      errorHandler.handleError(appError, {
        userId: currentUser?.user_id,
        component: 'UserManagement',
        action: 'createUser',
        timestamp: Date.now()
      });

      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to create user. Please try again.'
      }));
    }
  }, [currentUser]);

  const handleUpdateUser = useCallback(async (userId: string, userData: Partial<UserProfile>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // This would typically call an admin API endpoint to update a user
      // For now, we'll simulate user update
      setState(prev => ({
        ...prev,
        users: prev.users.map(user =>
          user.user_id === userId
            ? { ...user, ...userData, updated_at: new Date().toISOString() }
            : user
        ),
        showEditModal: false,
        editingUser: null,
        loading: false
      }));

    } catch (error) {
      const appError = errorHandler.createSystemError(
        ErrorType.INTERNAL_SERVER_ERROR,
        'Failed to update user',
        'UserManagement'
      );
      errorHandler.handleError(appError, {
        userId: currentUser?.user_id,
        component: 'UserManagement',
        action: 'updateUser',
        timestamp: Date.now()
      });

      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to update user. Please try again.'
      }));
    }
  }, [currentUser]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // This would typically call an admin API endpoint to delete a user
      // For now, we'll simulate user deletion
      setState(prev => ({
        ...prev,
        users: prev.users.filter(user => user.user_id !== userId),
        showDeleteModal: false,
        deletingUser: null,
        loading: false
      }));

    } catch (error) {
      const appError = errorHandler.createSystemError(
        ErrorType.INTERNAL_SERVER_ERROR,
        'Failed to delete user',
        'UserManagement'
      );
      errorHandler.handleError(appError, {
        userId: currentUser?.user_id,
        component: 'UserManagement',
        action: 'deleteUser',
        timestamp: Date.now()
      });

      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to delete user. Please try again.'
      }));
    }
  }, [currentUser]);

  const handleBulkAction = useCallback(async (action: string) => {
    if (state.selectedUsers.size === 0) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // This would typically call an admin API endpoint for bulk actions
      // For now, we'll simulate bulk actions
      const selectedUserIds = Array.from(state.selectedUsers);
      
      switch (action) {
        case 'activate':
          setState(prev => ({
            ...prev,
            users: prev.users.map(user =>
              selectedUserIds.includes(user.user_id)
                ? { ...user, is_active: true, updated_at: new Date().toISOString() }
                : user
            ),
            selectedUsers: new Set(),
            showBulkActions: false,
            loading: false
          }));
          break;
          
        case 'deactivate':
          setState(prev => ({
            ...prev,
            users: prev.users.map(user =>
              selectedUserIds.includes(user.user_id)
                ? { ...user, is_active: false, updated_at: new Date().toISOString() }
                : user
            ),
            selectedUsers: new Set(),
            showBulkActions: false,
            loading: false
          }));
          break;
          
        case 'delete':
          setState(prev => ({
            ...prev,
            users: prev.users.filter(user => !selectedUserIds.includes(user.user_id)),
            selectedUsers: new Set(),
            showBulkActions: false,
            loading: false
          }));
          break;
          
        default:
          setState(prev => ({ ...prev, loading: false }));
      }

    } catch (error) {
      const appError = errorHandler.createSystemError(
        ErrorType.INTERNAL_SERVER_ERROR,
        'Failed to perform bulk action',
        'UserManagement'
      );
      errorHandler.handleError(appError, {
        userId: currentUser?.user_id,
        component: 'UserManagement',
        action: 'bulkAction',
        timestamp: Date.now()
      });

      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to perform bulk action. Please try again.'
      }));
    }
  }, [state.selectedUsers, currentUser]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({
      ...prev,
      searchQuery: e.target.value,
      currentPage: 1
    }));
  }, []);

  const handleFilterChange = useCallback((filterType: string, value: string) => {
    setState(prev => ({
      ...prev,
      [filterType]: value,
      currentPage: 1
    }));
  }, []);

  const handleSort = useCallback((field: keyof UserProfile) => {
    setState(prev => ({
      ...prev,
      sortField: field,
      sortDirection: prev.sortField === field && prev.sortDirection === 'asc' ? 'desc' : 'asc',
      currentPage: 1
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      currentPage: page
    }));
  }, []);

  const handleUserSelect = useCallback((userId: string, selected: boolean) => {
    setState(prev => {
      const newSelectedUsers = new Set(prev.selectedUsers);
      if (selected) {
        newSelectedUsers.add(userId);
      } else {
        newSelectedUsers.delete(userId);
      }
      
      return {
        ...prev,
        selectedUsers: newSelectedUsers,
        showBulkActions: newSelectedUsers.size > 0
      };
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedUsers: selected ? new Set(state.filteredUsers.map(user => user.user_id)) : new Set(),
      showBulkActions: selected && state.filteredUsers.length > 0
    }));
  }, [state.filteredUsers]);

  const handleEditUser = useCallback((user: UserProfile) => {
    setState(prev => ({
      ...prev,
      editingUser: user,
      showEditModal: true
    }));
  }, []);

  const handleDeleteUserClick = useCallback((user: UserProfile) => {
    setState(prev => ({
      ...prev,
      deletingUser: user,
      showDeleteModal: true
    }));
  }, []);

  // =============================================================================
  // RENDER METHODS
  // =============================================================================

  const renderUserRow = useCallback((user: UserProfile) => (
    <tr key={user.user_id} className="user-row">
      <td className="user-checkbox">
        <input
          type="checkbox"
          checked={state.selectedUsers.has(user.user_id)}
          onChange={(e) => handleUserSelect(user.user_id, e.target.checked)}
          aria-label={`Select user ${user.email}`}
        />
      </td>
      <td className="user-email">{user.email}</td>
      <td className="user-name">{user.first_name} {user.last_name}</td>
      <td className="user-role">
        <span className={`role-badge role-${user.role}`}>
          {user.role}
        </span>
      </td>
      <td className="user-status">
        <span className={`status-badge status-${user.is_active ? 'active' : 'inactive'}`}>
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="user-verified">
        <span className={`verified-badge verified-${user.is_verified ? 'yes' : 'no'}`}>
          {user.is_verified ? 'Verified' : 'Unverified'}
        </span>
      </td>
      <td className="user-created">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      <td className="user-last-login">
        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
      </td>
      <td className="user-actions">
        <div className="action-buttons">
          <button
            className="action-button edit-button"
            onClick={() => handleEditUser(user)}
            title="Edit user"
            disabled={!enableUserEditing}
          >
            ✏️
          </button>
          <button
            className="action-button delete-button"
            onClick={() => handleDeleteUserClick(user)}
            title="Delete user"
            disabled={!enableUserDeletion || user.user_id === currentUser?.user_id}
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  ), [state.selectedUsers, enableUserEditing, enableUserDeletion, currentUser, handleUserSelect, handleEditUser, handleDeleteUserClick]);

  const renderPagination = useCallback(() => {
    if (!enablePagination || state.totalPages <= 1) return null;

    const pages = [];
    const startPage = Math.max(1, state.currentPage - 2);
    const endPage = Math.min(state.totalPages, state.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-button ${i === state.currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          className="pagination-button"
          onClick={() => handlePageChange(state.currentPage - 1)}
          disabled={state.currentPage === 1}
        >
          Previous
        </button>
        {pages}
        <button
          className="pagination-button"
          onClick={() => handlePageChange(state.currentPage + 1)}
          disabled={state.currentPage === state.totalPages}
        >
          Next
        </button>
      </div>
    );
  }, [enablePagination, state.totalPages, state.currentPage, handlePageChange]);

  // =============================================================================
  // RENDER
  // =============================================================================

  if (state.loading && state.users.length === 0) {
    return (
      <div className={`user-management ${className}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`user-management ${className}`}>
      <div className="user-management-header">
        <h2>User Management</h2>
        <div className="header-actions">
          {enableUserCreation && (
            <button
              className="create-user-button"
              onClick={() => setState(prev => ({ ...prev, showCreateModal: true }))}
            >
              Create User
            </button>
          )}
          {enableExport && (
            <button className="export-button">
              Export
            </button>
          )}
          {enableImport && (
            <button className="import-button">
              Import
            </button>
          )}
        </div>
      </div>

      {state.error && (
        <div className="error-message">
          {state.error}
        </div>
      )}

      <div className="user-management-filters">
        {enableSearch && (
          <div className="search-container">
            <input
              type="text"
              placeholder="Search users..."
              value={state.searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
        )}

        {enableFiltering && (
          <div className="filter-container">
            <select
              value={state.filterRole}
              onChange={(e) => handleFilterChange('filterRole', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>

            <select
              value={state.filterStatus}
              onChange={(e) => handleFilterChange('filterStatus', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        )}
      </div>

      {state.showBulkActions && (
        <div className="bulk-actions">
          <span className="bulk-actions-label">
            {state.selectedUsers.size} user(s) selected
          </span>
          <div className="bulk-action-buttons">
            <button
              className="bulk-action-button"
              onClick={() => handleBulkAction('activate')}
            >
              Activate
            </button>
            <button
              className="bulk-action-button"
              onClick={() => handleBulkAction('deactivate')}
            >
              Deactivate
            </button>
            <button
              className="bulk-action-button danger"
              onClick={() => handleBulkAction('delete')}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="user-management-table-container">
        <table className="user-management-table">
          <thead>
            <tr>
              <th className="user-checkbox">
                <input
                  type="checkbox"
                  checked={state.selectedUsers.size === state.filteredUsers.length && state.filteredUsers.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label="Select all users"
                />
              </th>
              <th 
                className={`sortable ${state.sortField === 'email' ? state.sortDirection : ''}`}
                onClick={() => enableSorting && handleSort('email')}
              >
                Email
              </th>
              <th 
                className={`sortable ${state.sortField === 'first_name' ? state.sortDirection : ''}`}
                onClick={() => enableSorting && handleSort('first_name')}
              >
                Name
              </th>
              <th 
                className={`sortable ${state.sortField === 'role' ? state.sortDirection : ''}`}
                onClick={() => enableSorting && handleSort('role')}
              >
                Role
              </th>
              <th 
                className={`sortable ${state.sortField === 'is_active' ? state.sortDirection : ''}`}
                onClick={() => enableSorting && handleSort('is_active')}
              >
                Status
              </th>
              <th 
                className={`sortable ${state.sortField === 'is_verified' ? state.sortDirection : ''}`}
                onClick={() => enableSorting && handleSort('is_verified')}
              >
                Verified
              </th>
              <th 
                className={`sortable ${state.sortField === 'created_at' ? state.sortDirection : ''}`}
                onClick={() => enableSorting && handleSort('created_at')}
              >
                Created
              </th>
              <th 
                className={`sortable ${state.sortField === 'last_login' ? state.sortDirection : ''}`}
                onClick={() => enableSorting && handleSort('last_login')}
              >
                Last Login
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.filteredUsers.map(renderUserRow)}
          </tbody>
        </table>
      </div>

      {renderPagination()}

      {/* Modals would be implemented here */}
      {state.showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create User</h3>
            <p>User creation modal would be implemented here.</p>
            <button onClick={() => setState(prev => ({ ...prev, showCreateModal: false }))}>
              Close
            </button>
          </div>
        </div>
      )}

      {state.showEditModal && state.editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit User</h3>
            <p>User editing modal would be implemented here.</p>
            <button onClick={() => setState(prev => ({ ...prev, showEditModal: false, editingUser: null }))}>
              Close
            </button>
          </div>
        </div>
      )}

      {state.showDeleteModal && state.deletingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete User</h3>
            <p>Are you sure you want to delete user {state.deletingUser.email}?</p>
            <div className="modal-actions">
              <button 
                className="confirm-button"
                onClick={() => handleDeleteUser(state.deletingUser!.user_id)}
              >
                Delete
              </button>
              <button 
                className="cancel-button"
                onClick={() => setState(prev => ({ ...prev, showDeleteModal: false, deletingUser: null }))}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default UserManagement;
