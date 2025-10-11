import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '@/services/authService'

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}))

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should call login API with correct data', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      }
      
      const mockResponse = {
        data: {
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          token_type: 'bearer',
          expires_in: 3600,
          user: {
            id: '1',
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            role: 'user',
            is_active: true,
            is_verified: true
          }
        }
      }

      const { default: axios } = await import('axios')
      vi.mocked(axios.post).mockResolvedValue(mockResponse)

      const result = await authService.login(loginData)

      expect(axios.post).toHaveBeenCalledWith('/api/v1/auth/login', loginData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle login errors', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      const { default: axios } = await import('axios')
      vi.mocked(axios.post).mockRejectedValue({
        response: {
          status: 401,
          data: { message: 'Invalid credentials' }
        }
      })

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('register', () => {
    it('should call register API with correct data', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        first_name: 'John',
        last_name: 'Doe'
      }
      
      const mockResponse = {
        data: {
          message: 'User registered successfully. Please check your email for verification.',
          user: {
            id: '1',
            email: 'newuser@example.com',
            first_name: 'John',
            last_name: 'Doe',
            role: 'user',
            is_active: true,
            is_verified: false
          }
        }
      }

      const { default: axios } = await import('axios')
      vi.mocked(axios.post).mockResolvedValue(mockResponse)

      const result = await authService.register(registerData)

      expect(axios.post).toHaveBeenCalledWith('/api/v1/auth/register', registerData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle registration errors', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        first_name: 'John',
        last_name: 'Doe'
      }

      const { default: axios } = await import('axios')
      vi.mocked(axios.post).mockRejectedValue({
        response: {
          status: 409,
          data: { message: 'Email already exists' }
        }
      })

      await expect(authService.register(registerData)).rejects.toThrow('Email already exists')
    })
  })

  describe('logout', () => {
    it('should call logout API', async () => {
      const mockResponse = {
        data: {
          message: 'Logout successful'
        }
      }

      const { default: axios } = await import('axios')
      vi.mocked(axios.post).mockResolvedValue(mockResponse)

      const result = await authService.logout()

      expect(axios.post).toHaveBeenCalledWith('/api/v1/auth/logout')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('refreshToken', () => {
    it('should call refresh token API', async () => {
      const refreshToken = 'mock_refresh_token'
      
      const mockResponse = {
        data: {
          access_token: 'new_access_token',
          refresh_token: 'new_refresh_token',
          token_type: 'bearer',
          expires_in: 3600,
          user: {
            id: '1',
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            role: 'user',
            is_active: true,
            is_verified: true
          }
        }
      }

      const { default: axios } = await import('axios')
      vi.mocked(axios.post).mockResolvedValue(mockResponse)

      const result = await authService.refreshToken(refreshToken)

      expect(axios.post).toHaveBeenCalledWith('/api/v1/auth/refresh', {
        refresh_token: refreshToken
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('verifyEmail', () => {
    it('should call verify email API', async () => {
      const token = 'verification_token'
      
      const mockResponse = {
        data: {
          message: 'Email verified successfully'
        }
      }

      const { default: axios } = await import('axios')
      vi.mocked(axios.post).mockResolvedValue(mockResponse)

      const result = await authService.verifyEmail(token)

      expect(axios.post).toHaveBeenCalledWith('/api/v1/auth/verify-email', {
        token
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('requestPasswordReset', () => {
    it('should call request password reset API', async () => {
      const email = 'test@example.com'
      
      const mockResponse = {
        data: {
          message: 'Password reset email sent'
        }
      }

      const { default: axios } = await import('axios')
      vi.mocked(axios.post).mockResolvedValue(mockResponse)

      const result = await authService.requestPasswordReset(email)

      expect(axios.post).toHaveBeenCalledWith('/api/v1/auth/request-password-reset', {
        email
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('resetPassword', () => {
    it('should call reset password API', async () => {
      const resetData = {
        token: 'reset_token',
        new_password: 'NewSecurePass123!'
      }
      
      const mockResponse = {
        data: {
          message: 'Password reset successfully'
        }
      }

      const { default: axios } = await import('axios')
      vi.mocked(axios.post).mockResolvedValue(mockResponse)

      const result = await authService.resetPassword(resetData)

      expect(axios.post).toHaveBeenCalledWith('/api/v1/auth/reset-password', resetData)
      expect(result).toEqual(mockResponse.data)
    })
  })
})
