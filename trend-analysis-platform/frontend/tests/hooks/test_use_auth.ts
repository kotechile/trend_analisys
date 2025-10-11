import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'

// Mock auth service
vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    verifyEmail: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn()
  }
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear localStorage
    localStorage.clear()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle successful login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'user',
      is_active: true,
      is_verified: true
    }

    const mockTokens = {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      token_type: 'bearer',
      expires_in: 3600
    }

    const { authService } = await import('@/services/authService')
    vi.mocked(authService.login).mockResolvedValue({
      ...mockTokens,
      user: mockUser
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'SecurePass123!'
      })
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'SecurePass123!'
    })
  })

  it('should handle login error', async () => {
    const { authService } = await import('@/services/authService')
    vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'))

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      try {
        await result.current.login({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
      } catch (error) {
        // Expected to throw
      }
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('should handle successful registration', async () => {
    const mockUser = {
      id: '1',
      email: 'newuser@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'user',
      is_active: true,
      is_verified: false
    }

    const { authService } = await import('@/services/authService')
    vi.mocked(authService.register).mockResolvedValue({
      message: 'User registered successfully. Please check your email for verification.',
      user: mockUser
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.register({
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        first_name: 'John',
        last_name: 'Doe'
      })
    })

    expect(authService.register).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'SecurePass123!',
      first_name: 'John',
      last_name: 'Doe'
    })
  })

  it('should handle logout', async () => {
    const { authService } = await import('@/services/authService')
    vi.mocked(authService.logout).mockResolvedValue({
      message: 'Logout successful'
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    // First login
    await act(async () => {
      result.current.setUser({
        id: '1',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
        is_active: true,
        is_verified: true
      })
      result.current.setAuthenticated(true)
    })

    expect(result.current.isAuthenticated).toBe(true)

    // Then logout
    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(authService.logout).toHaveBeenCalled()
  })

  it('should handle token refresh', async () => {
    const mockTokens = {
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

    const { authService } = await import('@/services/authService')
    vi.mocked(authService.refreshToken).mockResolvedValue(mockTokens)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.refreshToken('refresh_token')
    })

    expect(authService.refreshToken).toHaveBeenCalledWith('refresh_token')
    expect(result.current.user).toEqual(mockTokens.user)
  })

  it('should handle email verification', async () => {
    const { authService } = await import('@/services/authService')
    vi.mocked(authService.verifyEmail).mockResolvedValue({
      message: 'Email verified successfully'
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.verifyEmail('verification_token')
    })

    expect(authService.verifyEmail).toHaveBeenCalledWith('verification_token')
  })

  it('should handle password reset request', async () => {
    const { authService } = await import('@/services/authService')
    vi.mocked(authService.requestPasswordReset).mockResolvedValue({
      message: 'Password reset email sent'
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.requestPasswordReset('test@example.com')
    })

    expect(authService.requestPasswordReset).toHaveBeenCalledWith('test@example.com')
  })

  it('should handle password reset', async () => {
    const { authService } = await import('@/services/authService')
    vi.mocked(authService.resetPassword).mockResolvedValue({
      message: 'Password reset successfully'
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.resetPassword({
        token: 'reset_token',
        new_password: 'NewSecurePass123!'
      })
    })

    expect(authService.resetPassword).toHaveBeenCalledWith({
      token: 'reset_token',
      new_password: 'NewSecurePass123!'
    })
  })
})
