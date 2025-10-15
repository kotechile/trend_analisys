# Data Model: User Authentication System

## 1. Entity: User
Represents a platform user with authentication and profile information.

### Fields
- **id** (UUID, Primary Key): Unique identifier for the user
- **email** (String, Unique, Not Null): User's email address (login identifier)
- **password_hash** (String, Not Null): Bcrypt hashed password
- **first_name** (String, Not Null): User's first name
- **last_name** (String, Not Null): User's last name
- **role** (Enum: "user", "admin", Not Null): User's role for access control
- **is_active** (Boolean, Default: true): Whether the user account is active
- **is_verified** (Boolean, Default: false): Whether the user's email is verified
- **email_verification_token** (String, Nullable): Token for email verification
- **email_verification_expires** (Timestamp, Nullable): Expiration time for verification token
- **last_login** (Timestamp, Nullable): Timestamp of last successful login
- **failed_login_attempts** (Integer, Default: 0): Number of consecutive failed login attempts
- **locked_until** (Timestamp, Nullable): Account lockout expiration time
- **created_at** (Timestamp, Not Null): Account creation timestamp
- **updated_at** (Timestamp, Not Null): Last update timestamp

### Validation Rules
- Email must be valid format and unique
- Password must meet strength requirements (8+ chars, mixed case, numbers, symbols)
- First name and last name must be 1-50 characters
- Role must be one of: "user", "admin"
- Failed login attempts must be 0-5
- Locked until must be in the future if set

### State Transitions
- **Registration**: is_active=true, is_verified=false, role="user"
- **Email Verification**: is_verified=true, email_verification_token=null
- **Account Lockout**: locked_until set, failed_login_attempts=5
- **Account Unlock**: locked_until=null, failed_login_attempts=0
- **Account Deactivation**: is_active=false

## 2. Entity: UserSession
Represents an active user session with JWT token information.

### Fields
- **id** (UUID, Primary Key): Unique identifier for the session
- **user_id** (UUID, Foreign Key to User): Associated user
- **token_jti** (String, Unique, Not Null): JWT ID for token identification
- **refresh_token** (String, Unique, Not Null): Refresh token for session renewal
- **device_info** (JSON, Nullable): Device and browser information
- **ip_address** (String, Nullable): IP address of the session
- **user_agent** (String, Nullable): User agent string
- **is_active** (Boolean, Default: true): Whether the session is active
- **expires_at** (Timestamp, Not Null): Session expiration time
- **created_at** (Timestamp, Not Null): Session creation timestamp
- **last_accessed** (Timestamp, Not Null): Last activity timestamp

### Validation Rules
- Token JTI must be unique across all sessions
- Refresh token must be unique and secure
- Expires at must be in the future
- User must exist and be active

### State Transitions
- **Session Creation**: is_active=true, expires_at set
- **Session Refresh**: last_accessed updated, expires_at extended
- **Session Logout**: is_active=false
- **Session Expiry**: is_active=false (handled by cleanup job)

## 3. Entity: PasswordReset
Represents a password reset request with secure token.

### Fields
- **id** (UUID, Primary Key): Unique identifier for the reset request
- **user_id** (UUID, Foreign Key to User): Associated user
- **token** (String, Unique, Not Null): Secure reset token
- **is_used** (Boolean, Default: false): Whether the token has been used
- **expires_at** (Timestamp, Not Null): Token expiration time
- **created_at** (Timestamp, Not Null): Request creation timestamp
- **used_at** (Timestamp, Nullable): When the token was used

### Validation Rules
- Token must be unique and cryptographically secure
- Expires at must be in the future (typically 1 hour)
- User must exist and be active
- Token can only be used once

### State Transitions
- **Reset Request**: is_used=false, expires_at set
- **Reset Used**: is_used=true, used_at set
- **Reset Expired**: Automatically invalidated after expires_at

## 4. Entity: AuthenticationLog
Represents a log entry for authentication events and security monitoring.

### Fields
- **id** (UUID, Primary Key): Unique identifier for the log entry
- **user_id** (UUID, Foreign Key to User, Nullable): Associated user (null for failed attempts)
- **event_type** (Enum, Not Null): Type of authentication event
  - "login_success"
  - "login_failed"
  - "logout"
  - "password_reset_requested"
  - "password_reset_used"
  - "account_locked"
  - "account_unlocked"
  - "email_verified"
  - "role_changed"
  - "account_deactivated"
- **ip_address** (String, Nullable): IP address of the request
- **user_agent** (String, Nullable): User agent string
- **device_info** (JSON, Nullable): Device and browser information
- **success** (Boolean, Not Null): Whether the event was successful
- **error_message** (String, Nullable): Error message if unsuccessful
- **metadata** (JSON, Nullable): Additional event-specific data
- **created_at** (Timestamp, Not Null): Event timestamp

### Validation Rules
- Event type must be one of the defined enum values
- Success must be boolean
- Error message required if success=false
- Created at must be current timestamp

### State Transitions
- **Event Logging**: Created with appropriate event type and metadata
- **No State Changes**: This is a log entity, no state transitions

## Relationships

### User ↔ UserSession (One-to-Many)
- One user can have multiple active sessions
- Each session belongs to exactly one user
- Cascade delete when user is deleted

### User ↔ PasswordReset (One-to-Many)
- One user can have multiple password reset requests
- Each reset request belongs to exactly one user
- Cascade delete when user is deleted

### User ↔ AuthenticationLog (One-to-Many)
- One user can have multiple log entries
- Each log entry belongs to one user (nullable for failed attempts)
- Cascade delete when user is deleted

## Database Constraints

### Unique Constraints
- User.email (unique)
- UserSession.token_jti (unique)
- UserSession.refresh_token (unique)
- PasswordReset.token (unique)

### Foreign Key Constraints
- UserSession.user_id → User.id
- PasswordReset.user_id → User.id
- AuthenticationLog.user_id → User.id

### Check Constraints
- User.role IN ('user', 'admin')
- User.failed_login_attempts >= 0 AND <= 5
- AuthenticationLog.event_type IN (defined enum values)
- PasswordReset.expires_at > PasswordReset.created_at
- UserSession.expires_at > UserSession.created_at

## Indexes

### Performance Indexes
- User.email (unique index for login lookups)
- UserSession.token_jti (unique index for token validation)
- UserSession.user_id (index for user session queries)
- PasswordReset.token (unique index for reset lookups)
- PasswordReset.user_id (index for user reset queries)
- AuthenticationLog.user_id (index for user audit queries)
- AuthenticationLog.created_at (index for time-based queries)
- AuthenticationLog.event_type (index for event filtering)

### Composite Indexes
- (User.email, User.is_active) for active user lookups
- (UserSession.user_id, UserSession.is_active) for active session queries
- (AuthenticationLog.user_id, AuthenticationLog.created_at) for user audit history

## Data Retention Policies

### User Data
- **Retention**: Indefinite (with user consent)
- **Deletion**: Soft delete (is_active=false) with 30-day grace period
- **Anonymization**: After 30 days, replace PII with anonymized data

### UserSession Data
- **Retention**: 30 days after expiration
- **Cleanup**: Automated job removes expired sessions
- **Archival**: Move to cold storage after 90 days

### PasswordReset Data
- **Retention**: 24 hours after expiration
- **Cleanup**: Automated job removes expired tokens
- **Security**: Immediate deletion after use

### AuthenticationLog Data
- **Retention**: 2 years for compliance
- **Archival**: Move to cold storage after 1 year
- **Anonymization**: IP addresses anonymized after 6 months

## Security Considerations

### Data Encryption
- Password hashes: bcrypt with cost factor 12
- Sensitive tokens: AES-256 encryption at rest
- PII fields: Field-level encryption for GDPR compliance

### Access Control
- Row Level Security (RLS) policies for user data isolation
- Admin users can only access user data within their scope
- Regular users can only access their own data

### Audit Trail
- All data modifications logged with user and timestamp
- Failed authentication attempts logged with IP and user agent
- Sensitive operations require additional verification
