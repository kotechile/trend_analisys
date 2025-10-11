/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import PasswordResetForm from '@/components/auth/PasswordResetForm'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

const theme = createTheme()

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('LoginForm', () => {
  it('renders login form with email and password fields', () => {
    renderWithProviders(<LoginForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    renderWithProviders(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /login/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const mockOnSubmit = jest.fn()
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'SecurePass123!'
      })
    })
  })
})

describe('RegisterForm', () => {
  it('renders registration form with all required fields', () => {
    renderWithProviders(<RegisterForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('validates password strength', async () => {
    renderWithProviders(<RegisterForm />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /register/i })
    
    fireEvent.change(passwordInput, { target: { value: 'weak' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('validates name length', async () => {
    renderWithProviders(<RegisterForm />)
    
    const firstNameInput = screen.getByLabelText(/first name/i)
    const submitButton = screen.getByRole('button', { name: /register/i })
    
    fireEvent.change(firstNameInput, { target: { value: 'A'.repeat(51) } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/first name must be 50 characters or less/i)).toBeInTheDocument()
    })
  })
})

describe('PasswordResetForm', () => {
  it('renders password reset form', () => {
    renderWithProviders(<PasswordResetForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset email/i })).toBeInTheDocument()
  })

  it('shows success message after submission', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue({ success: true })
    renderWithProviders(<PasswordResetForm onSubmit={mockOnSubmit} />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send reset email/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/reset email sent/i)).toBeInTheDocument()
    })
  })
})

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    const mockAuth = { isAuthenticated: true, user: { id: '1', email: 'test@example.com' } }
    
    renderWithProviders(
      <ProtectedRoute auth={mockAuth}>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    const mockAuth = { isAuthenticated: false, user: null }
    
    renderWithProviders(
      <ProtectedRoute auth={mockAuth}>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    // Should redirect to login page
    expect(window.location.pathname).toBe('/login')
  })

  it('shows loading state while checking authentication', () => {
    const mockAuth = { isAuthenticated: null, user: null }
    
    renderWithProviders(
      <ProtectedRoute auth={mockAuth}>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
