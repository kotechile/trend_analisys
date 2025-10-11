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
  showSessions: _showSessions = false,
  showStats: _showStats = false
}: UserProfileProps) {
  // =============================================================================
  // STATE
  // =============================================================================

  const { user: hookUser, updateProfile, isLoading, error, clearError } = useUser();
  const user = propUser || hookUser;
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfileUpdate>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || ''
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
    const newErrors: FormErrors = {};

    // First name validation
    if (formData.firstName && formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (formData.lastName && formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Bio validation
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    // Website validation
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
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
    if ((errors as any)[name]) {
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
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || ''
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
          {user.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt={`${user.firstName} ${user.lastName}`}
              className="avatar-image"
            />
          ) : (
            <div className="avatar-placeholder">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
          )}
        </div>
        
        <div className="user-profile-info">
          <h2 className="user-profile-name">
            {user.firstName} {user.lastName}
          </h2>
          <p className="user-profile-email">{user.email}</p>
          {user.location && (
            <p className="user-profile-location">{user.location}</p>
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
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  className={`form-input ${errors.firstName ? 'form-input-error' : ''}`}
                  placeholder="Enter your first name"
                  disabled={isSubmitting || isLoading}
                />
                {errors.firstName && (
                  <span className="form-error" role="alert">
                    {errors.firstName}
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
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  className={`form-input ${errors.lastName ? 'form-input-error' : ''}`}
                  placeholder="Enter your last name"
                  disabled={isSubmitting || isLoading}
                />
                {errors.lastName && (
                  <span className="form-error" role="alert">
                    {errors.lastName}
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
              <label htmlFor="location-input" className="form-label">
                Location
              </label>
              <input
                id="location-input"
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleInputChange}
                className={`form-input ${errors.location ? 'form-input-error' : ''}`}
                placeholder="Enter your location"
                disabled={isSubmitting || isLoading}
              />
              {errors.location && (
                <span className="form-error" role="alert">
                  {errors.location}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="website-input" className="form-label">
                Website
              </label>
              <input
                id="website-input"
                type="url"
                name="website"
                value={formData.website || ''}
                onChange={handleInputChange}
                className={`form-input ${errors.website ? 'form-input-error' : ''}`}
                placeholder="Enter your website URL"
                disabled={isSubmitting || isLoading}
              />
              {errors.website && (
                <span className="form-error" role="alert">
                  {errors.website}
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
                {user.website && (
                  <div className="contact-item">
                    <span className="contact-label">Website:</span>
                    <span className="contact-value">{user.website}</span>
                  </div>
                )}
                {user.location && (
                  <div className="contact-item">
                    <span className="contact-label">Location:</span>
                    <span className="contact-value">{user.location}</span>
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
                  <span className={`account-value ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="account-item">
                  <span className="account-label">Verified:</span>
                  <span className={`account-value ${user.isEmailVerified ? 'verified' : 'unverified'}`}>
                    {user.isEmailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="account-item">
                  <span className="account-label">Member since:</span>
                  <span className="account-value">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {user.lastLoginAt && (
                  <div className="account-item">
                    <span className="account-label">Last login:</span>
                    <span className="account-value">
                      {new Date(user.lastLoginAt).toLocaleDateString()}
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

