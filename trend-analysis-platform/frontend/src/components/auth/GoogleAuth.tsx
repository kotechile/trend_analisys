import React, { useState } from 'react';
import { Button, Box, Alert, CircularProgress } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { supabase } from '../../lib/supabase';

interface GoogleAuthProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
}

export const GoogleAuth: React.FC<GoogleAuthProps> = ({
  onSuccess: _onSuccess,
  onError,
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use explicit localhost URL for development, or current origin for production
      // For development, always use localhost with the port from Vite (usually 5173)
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.includes('localhost');
      
      // Get port from current URL or default to 3000 (current frontend port)
      const port = window.location.port || '3000';
      const redirectUrl = isDevelopment 
        ? `http://localhost:${port}/auth/callback`
        : `${window.location.origin}/auth/callback`;

      // Store redirect URL in localStorage as fallback (for oauth-redirect.html)
      localStorage.setItem('oauth_redirect_url', redirectUrl.replace('/auth/callback', ''));

      console.log('GoogleAuth: Redirect URL set to:', redirectUrl);
      console.log('GoogleAuth: Current origin:', window.location.origin);
      console.log('GoogleAuth: Current hostname:', window.location.hostname);
      console.log('GoogleAuth: Current port:', window.location.port);
      console.log('GoogleAuth: Is development:', isDevelopment);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      // Note: The actual user data will be available in the callback
      // This is just for immediate feedback
      console.log('Google OAuth initiated:', data);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in with Google';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Google OAuth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled || loading}
        onClick={handleGoogleSignIn}
        startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
        sx={{
          backgroundColor: variant === 'contained' ? '#4285f4' : 'transparent',
          color: variant === 'contained' ? 'white' : '#4285f4',
          borderColor: '#4285f4',
          '&:hover': {
            backgroundColor: variant === 'contained' ? '#3367d6' : 'rgba(66, 133, 244, 0.04)',
          },
          textTransform: 'none',
          fontWeight: 500,
          py: 1.5,
        }}
      >
        {loading ? 'Signing in...' : 'Continue with Google'}
      </Button>
    </Box>
  );
};

export default GoogleAuth;
