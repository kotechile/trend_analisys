# Quickstart Guide: User Authentication System

This guide provides step-by-step instructions to test the user authentication system functionality.

## Prerequisites

- Backend API running on `http://localhost:8000`
- Frontend application running on `http://localhost:3000`
- Database and Redis services running
- Email service configured (SendGrid or similar)

## Test Scenarios

### 1. User Registration Flow

#### Step 1: Register a New User
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully. Please check your email for verification.",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "test@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "is_active": true,
    "is_verified": false,
    "created_at": "2025-01-27T09:00:00Z"
  }
}
```

#### Step 2: Verify Email Address
```bash
curl -X POST http://localhost:8000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "verification_token_from_email"
  }'
```

**Expected Response:**
```json
{
  "message": "Email verified successfully"
}
```

### 2. User Login Flow

#### Step 1: Login with Credentials
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh_token_123456789",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "test@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "is_active": true,
    "is_verified": true,
    "last_login": "2025-01-27T10:30:00Z"
  }
}
```

#### Step 2: Access Protected Resource
```bash
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "test@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user",
  "is_active": true,
  "is_verified": true,
  "last_login": "2025-01-27T10:30:00Z",
  "created_at": "2025-01-27T09:00:00Z",
  "updated_at": "2025-01-27T10:30:00Z"
}
```

### 3. Password Reset Flow

#### Step 1: Request Password Reset
```bash
curl -X POST http://localhost:8000/api/v1/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Expected Response:**
```json
{
  "message": "Password reset email sent"
}
```

#### Step 2: Reset Password with Token
```bash
curl -X POST http://localhost:8000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset_token_from_email",
    "new_password": "NewSecurePass123!"
  }'
```

**Expected Response:**
```json
{
  "message": "Password reset successfully"
}
```

### 4. User Profile Management

#### Step 1: Update Profile
```bash
curl -X PUT http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith"
  }'
```

**Expected Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "test@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "user",
  "is_active": true,
  "is_verified": true,
  "last_login": "2025-01-27T10:30:00Z",
  "created_at": "2025-01-27T09:00:00Z",
  "updated_at": "2025-01-27T11:00:00Z"
}
```

#### Step 2: Change Password
```bash
curl -X POST http://localhost:8000/api/v1/users/me/change-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "SecurePass123!",
    "new_password": "NewSecurePass456!"
  }'
```

**Expected Response:**
```json
{
  "message": "Password changed successfully"
}
```

### 5. Admin User Management (Admin Only)

#### Step 1: List All Users
```bash
curl -X GET "http://localhost:8000/api/v1/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer admin_jwt_token_here"
```

**Expected Response:**
```json
{
  "users": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "test@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "role": "user",
      "is_active": true,
      "is_verified": true,
      "last_login": "2025-01-27T10:30:00Z",
      "created_at": "2025-01-27T09:00:00Z",
      "updated_at": "2025-01-27T11:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

#### Step 2: Update User Role
```bash
curl -X PUT http://localhost:8000/api/v1/admin/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer admin_jwt_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

**Expected Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "test@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "admin",
  "is_active": true,
  "is_verified": true,
  "last_login": "2025-01-27T10:30:00Z",
  "created_at": "2025-01-27T09:00:00Z",
  "updated_at": "2025-01-27T11:30:00Z"
}
```

### 6. Session Management

#### Step 1: Refresh Access Token
```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "refresh_token_123456789"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "new_refresh_token_987654321",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "test@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "admin",
    "is_active": true,
    "is_verified": true,
    "last_login": "2025-01-27T10:30:00Z"
  }
}
```

#### Step 2: Logout
```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response:**
```json
{
  "message": "Logout successful"
}
```

## Frontend Testing

### 1. Login Page
1. Navigate to `http://localhost:3000/login`
2. Enter valid credentials
3. Verify successful login and redirect to dashboard
4. Test with invalid credentials and verify error messages

### 2. Registration Page
1. Navigate to `http://localhost:3000/register`
2. Fill out registration form
3. Verify email validation
4. Test password strength requirements
5. Verify successful registration and email verification prompt

### 3. Password Reset Flow
1. Click "Forgot Password" on login page
2. Enter email address
3. Check email for reset link
4. Click reset link and enter new password
5. Verify successful password reset

### 4. Protected Routes
1. Try to access protected pages without authentication
2. Verify redirect to login page
3. Login and verify access to protected content
4. Test role-based access (admin vs user)

### 5. User Profile Management
1. Navigate to user profile page
2. Update profile information
3. Change password
4. Verify changes are saved

## Error Scenarios

### 1. Invalid Credentials
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword"
  }'
```

**Expected Response:**
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

### 2. Account Lockout
After 5 failed login attempts:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword"
  }'
```

**Expected Response:**
```json
{
  "error": "ACCOUNT_LOCKED",
  "message": "Account locked due to multiple failed attempts. Try again in 15 minutes."
}
```

### 3. Unauthorized Access
```bash
curl -X GET http://localhost:8000/api/v1/users/me
```

**Expected Response:**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

### 4. Forbidden Access (Non-Admin)
```bash
curl -X GET http://localhost:8000/api/v1/admin/users \
  -H "Authorization: Bearer user_jwt_token_here"
```

**Expected Response:**
```json
{
  "error": "FORBIDDEN",
  "message": "Admin access required"
}
```

## Performance Testing

### 1. Response Time Validation
- All API endpoints should respond within 200ms (95th percentile)
- JWT validation should complete within 50ms
- User registration should complete within 500ms

### 2. Load Testing
- Test with 1000+ concurrent users
- Verify 10,000+ authentication requests per hour
- Monitor database and Redis performance

### 3. Security Testing
- Test rate limiting (100 requests per minute per IP)
- Verify JWT token expiration
- Test password strength validation
- Verify CORS configuration

## Monitoring and Logging

### 1. Authentication Logs
- Check logs for successful logins
- Monitor failed login attempts
- Verify account lockout events
- Track password reset requests

### 2. Performance Metrics
- Monitor API response times
- Track database query performance
- Monitor Redis cache hit rates
- Check email delivery rates

### 3. Security Alerts
- Set up alerts for suspicious login patterns
- Monitor for brute force attacks
- Track unusual IP addresses
- Alert on admin privilege escalations

## Troubleshooting

### Common Issues

1. **Email Not Received**
   - Check email service configuration
   - Verify SMTP settings
   - Check spam folder

2. **JWT Token Issues**
   - Verify token expiration
   - Check secret key configuration
   - Validate token format

3. **Database Connection Issues**
   - Check database connection string
   - Verify database permissions
   - Monitor connection pool

4. **Redis Connection Issues**
   - Check Redis server status
   - Verify connection configuration
   - Monitor memory usage

### Debug Commands

```bash
# Check API health
curl http://localhost:8000/health

# Check database connection
curl http://localhost:8000/api/v1/health/db

# Check Redis connection
curl http://localhost:8000/api/v1/health/redis

# View logs
docker logs trend-analysis-backend
```

## Success Criteria

✅ **All test scenarios pass**
✅ **API responses within performance targets**
✅ **Security requirements met**
✅ **Error handling works correctly**
✅ **Frontend integration successful**
✅ **Admin functionality operational**
✅ **Email notifications working**
✅ **Session management functional**
