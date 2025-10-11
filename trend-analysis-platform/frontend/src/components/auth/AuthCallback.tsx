import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthCallbackProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({
  onSuccess,
  onError,
  redirectTo = '/dashboard'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        console.log('AuthCallback: Starting OAuth callback processing...');

        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        console.log('AuthCallback: Session data:', { data: !!data, session: !!data?.session, error });

        if (error) {
          console.error('AuthCallback: Supabase session error:', error);
          throw error;
        }

        if (data.session) {
          console.log('AuthCallback: Session found, processing user data...');
          const user = data.session.user;
          setUser(user);
          
          // Store user data in localStorage for the app
          const userData = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
            avatar: user.user_metadata?.avatar_url,
            provider: 'google'
          };
          
          localStorage.setItem('trendtap_user', JSON.stringify(userData));
          localStorage.setItem('trendtap_token', data.session.access_token);
          
          // Set a flag to indicate successful OAuth
          localStorage.setItem('oauth_success', 'true');
          
          onSuccess?.(user);

          // Force a page reload to refresh the auth state
          console.log('OAuth successful, redirecting to:', redirectTo);
          console.log('Stored user data:', userData);
          console.log('Stored token:', data.session.access_token);
          
          // Use a more reliable redirect method
          setTimeout(() => {
            window.location.replace(redirectTo);
          }, 2000);
        } else {
          console.warn('AuthCallback: No session found, waiting for session...');
          // Wait a bit and try again in case the session is still being processed
          setTimeout(async () => {
            try {
              const { data: retryData, error: retryError } = await supabase.auth.getSession();
              console.log('AuthCallback: Retry session data:', { data: !!retryData, session: !!retryData?.session, error: retryError });
              
              if (retryError) {
                throw retryError;
              }
              
              if (retryData.session) {
                console.log('AuthCallback: Session found on retry, processing...');
                const user = retryData.session.user;
                setUser(user);
                
                const userData = {
                  id: user.id,
                  email: user.email,
                  name: user.user_metadata?.full_name || user.email,
                  avatar: user.user_metadata?.avatar_url,
                  provider: 'google'
                };
                
                localStorage.setItem('trendtap_user', JSON.stringify(userData));
                localStorage.setItem('trendtap_token', retryData.session.access_token);
                localStorage.setItem('oauth_success', 'true');
                
                onSuccess?.(user);
                console.log('AuthCallback: OAuth successful on retry, redirecting to:', redirectTo);
                setTimeout(() => {
                  window.location.replace(redirectTo);
                }, 1000);
              } else {
                throw new Error('No session found after retry');
              }
            } catch (retryErr: any) {
              console.error('AuthCallback: Retry failed:', retryErr);
              setError(retryErr.message || 'Authentication failed after retry');
              onError?.(retryErr.message || 'Authentication failed after retry');
            }
          }, 2000);
          return;
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        const errorMessage = err.message || 'Authentication failed';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, onSuccess, onError, redirectTo]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Completing sign in...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we set up your account.
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2,
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ mb: 2, maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>
            Sign in failed
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
        
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  if (user) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2,
        }}
      >
        <Typography variant="h5" color="success.main">
          ✅ Successfully signed in!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome, {user.user_metadata?.full_name || user.email}!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Redirecting to dashboard...
        </Typography>
      </Box>
    );
  }

  return null;
};

export default AuthCallback;


