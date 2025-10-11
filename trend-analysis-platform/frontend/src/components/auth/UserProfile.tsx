/**
 * UserProfile Component for the Trend Analysis Platform.
 * 
 * This component provides a complete user profile management interface
 * with editing capabilities and integration with the authentication system.
 */

import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { UserProfile as UserProfileType, UserProfileUpdate, FormErrors } from '../../types/user';
import './UserProfile.css';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface UserProfileProps {
  user?: UserProfileType;
  onUpdateSuccess?: () => void;
  onUpdateError?: (error: string) => void;
  className?: string;
  showEditButton?: boolean;
  allowEdit?: boolean;
  showSessions?: boolean;
  showStats?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function UserProfile({
  user: propUser,
  onUpdateSuccess,
  onUpdateError,
  className = '',
  showEditButton = true,
  allowEdit = true,
  showSessions = false,
  showStats = false
}: UserProfileProps) {
  // =============================================================================
  // STATE
  // =============================================================================

  const { user: hookUser, updateProfile, isLoading, error, clearError } = useUser();
  const user = propUser || hookUser;
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfileUpdate>({});
  const [errors, setErrors] = useState<FormErrors<UserProfileUpdate>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        organization: user.organization || '',
        phone_number: user.phone_number || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      onUpdateError?.(error);
    }
  }, [error, onUpdateError]);

  // =============================================================================
  // VALIDATION
  // =============================================================================

  const validateForm = (): boolean => {
    const newErrors: FormErrors<UserProfileUpdate> = {};

    // First name validation
    if (formData.first_name && formData.first_name.length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (formData.last_name && formData.last_name.length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }

    // Bio validation
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    // Phone number validation
    if (formData.phone_number && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof UserProfileUpdate]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear global error
    if (error) {
      clearError();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    clearError();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      bio: user?.bio || '',
      organization: user?.organization || '',
      phone_number: user?.phone_number || ''
    });
    setErrors({});
    clearError();
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      await updateProfile(formData);
      setIsEditing(false);
      onUpdateSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
      onUpdateError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  if (!user) {
    return (
      <div className={`user-profile-container ${className}`}>
        <div className="user-profile-loading">
          <div className="spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`user-profile-container ${className}`}>
      <div className="user-profile-header">
        <div className="user-profile-avatar">
          {user.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={`${user.first_name} ${user.last_name}`}
              className="avatar-image"
            />
          ) : (
            <div className="avatar-placeholder">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
          )}
        </div>
        
        <div className="user-profile-info">
          <h2 className="user-profile-name">
            {user.first_name} {user.last_name}
          </h2>
          <p className="user-profile-email">{user.email}</p>
          {user.organization && (
            <p className="user-profile-organization">{user.organization}</p>
          )}
        </div>

        {showEditButton && allowEdit && !isEditing && (
          <button
            type="button"
            className="edit-button"
            onClick={handleEdit}
            disabled={isLoading}
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="user-profile-body">
        {isEditing ? (
          <form className="user-profile-form" noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first-name-input" className="form-label">
                  First Name
                </label>
                <input
                  id="first-name-input"
                  type="text"
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleInputChange}
                  className={`form-input ${errors.first_name ? 'form-input-error' : ''}`}
                  placeholder="Enter your first name"
                  disabled={isSubmitting || isLoading}
                />
                {errors.first_name && (
                  <span className="form-error" role="alert">
                    {errors.first_name}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="last-name-input" className="form-label">
                  Last Name
                </label>
                <input
                  id="last-name-input"
                  type="text"
                  name="last_name"
                  value={formData.last_name || ''}
                  onChange={handleInputChange}
                  className={`form-input ${errors.last_name ? 'form-input-error' : ''}`}
                  placeholder="Enter your last name"
                  disabled={isSubmitting || isLoading}
                />
                {errors.last_name && (
                  <span className="form-error" role="alert">
                    {errors.last_name}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio-input" className="form-label">
                Bio
              </label>
              <textarea
                id="bio-input"
                name="bio"
                value={formData.bio || ''}
                onChange={handleInputChange}
                className={`form-textarea ${errors.bio ? 'form-input-error' : ''}`}
                placeholder="Tell us about yourself"
                rows={3}
                disabled={isSubmitting || isLoading}
              />
              {errors.bio && (
                <span className="form-error" role="alert">
                  {errors.bio}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="organization-input" className="form-label">
                Organization
              </label>
              <input
                id="organization-input"
                type="text"
                name="organization"
                value={formData.organization || ''}
                onChange={handleInputChange}
                className={`form-input ${errors.organization ? 'form-input-error' : ''}`}
                placeholder="Enter your organization"
                disabled={isSubmitting || isLoading}
              />
              {errors.organization && (
                <span className="form-error" role="alert">
                  {errors.organization}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone-input" className="form-label">
                Phone Number
              </label>
              <input
                id="phone-input"
                type="tel"
                name="phone_number"
                value={formData.phone_number || ''}
                onChange={handleInputChange}
                className={`form-input ${errors.phone_number ? 'form-input-error' : ''}`}
                placeholder="Enter your phone number"
                disabled={isSubmitting || isLoading}
              />
              {errors.phone_number && (
                <span className="form-error" role="alert">
                  {errors.phone_number}
                </span>
              )}
            </div>

            {/* Global Error */}
            {error && (
              <div className="form-global-error" role="alert">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
                disabled={isSubmitting || isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="save-button"
                onClick={handleSave}
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? (
                  <span className="button-loading">
                    <span className="spinner" />
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="user-profile-details">
            {user.bio && (
              <div className="user-profile-section">
                <h3 className="section-title">About</h3>
                <p className="section-content">{user.bio}</p>
              </div>
            )}

            <div className="user-profile-section">
              <h3 className="section-title">Contact Information</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-label">Email:</span>
                  <span className="contact-value">{user.email}</span>
                </div>
                {user.phone_number && (
                  <div className="contact-item">
                    <span className="contact-label">Phone:</span>
                    <span className="contact-value">{user.phone_number}</span>
                  </div>
                )}
                {user.organization && (
                  <div className="contact-item">
                    <span className="contact-label">Organization:</span>
                    <span className="contact-value">{user.organization}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="user-profile-section">
              <h3 className="section-title">Account Information</h3>
              <div className="account-info">
                <div className="account-item">
                  <span className="account-label">Role:</span>
                  <span className="account-value">{user.role}</span>
                </div>
                <div className="account-item">
                  <span className="account-label">Status:</span>
                  <span className={`account-value ${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="account-item">
                  <span className="account-label">Verified:</span>
                  <span className={`account-value ${user.is_verified ? 'verified' : 'unverified'}`}>
                    {user.is_verified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="account-item">
                  <span className="account-label">Member since:</span>
                  <span className="account-value">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                {user.last_login_at && (
                  <div className="account-item">
                    <span className="account-label">Last login:</span>
                    <span className="account-value">
                      {new Date(user.last_login_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default UserProfile;
