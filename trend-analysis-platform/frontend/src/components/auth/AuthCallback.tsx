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
        console.log('AuthCallback: Current URL:', window.location.href);
        console.log('AuthCallback: URL hash:', window.location.hash);
        console.log('AuthCallback: URL search:', window.location.search);
        
        // Check if we have OAuth parameters in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        console.log('AuthCallback: URL params:', Object.fromEntries(urlParams));
        console.log('AuthCallback: Hash params:', Object.fromEntries(hashParams));

        // Simple approach - just get the session directly
        const { data, error } = await supabase.auth.getSession();
        console.log('AuthCallback: Session check:', { data: !!data, session: !!data?.session, error });

        if (error) {
          console.error('AuthCallback: Session error:', error);
          throw error;
        }

        if (data.session) {
          console.log('AuthCallback: Session found, processing...');
          const user = data.session.user;
          setUser(user);
          
          const userData = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
            avatar: user.user_metadata?.avatar_url,
            provider: 'google'
          };
          
          localStorage.setItem('trendtap_user', JSON.stringify(userData));
          localStorage.setItem('trendtap_token', data.session.access_token);
          localStorage.setItem('oauth_success', 'true');
          
          onSuccess?.(user);
          console.log('AuthCallback: OAuth successful, redirecting to:', redirectTo);
          
          setTimeout(() => {
            window.location.replace(redirectTo);
          }, 1000);
        } else {
          console.log('AuthCallback: No session found, waiting...');
          // Wait a bit and try again
          setTimeout(async () => {
            try {
              const { data: retryData, error: retryError } = await supabase.auth.getSession();
              if (retryError) throw retryError;
              
              if (retryData.session) {
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
                setTimeout(() => {
                  window.location.replace(redirectTo);
                }, 1000);
              } else {
                throw new Error('No session found after retry');
              }
            } catch (retryErr: any) {
              console.error('AuthCallback: Retry failed:', retryErr);
              setError(retryErr.message || 'Authentication failed');
              onError?.(retryErr.message || 'Authentication failed');
            }
          }, 2000);
        }

      } catch (err: any) {
        console.error('Auth callback error:', err);
        const errorMessage = err.message || 'Authentication failed';
        setError(errorMessage);
        onError?.(errorMessage);
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
        <Button
          variant="outlined"
          onClick={() => {
            console.log('AuthCallback: Manual bypass clicked');
            // Force redirect to login
            window.location.href = '/login';
          }}
          sx={{ mt: 2 }}
        >
          If this takes too long, click here
        </Button>
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


