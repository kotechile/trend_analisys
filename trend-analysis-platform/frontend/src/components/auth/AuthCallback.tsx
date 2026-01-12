import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AuthCallbackProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({
  onSuccess,
  onError,
  redirectTo = '/'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        console.log('AuthCallback: Starting OAuth callback processing...');
        console.log('AuthCallback: Current URL:', window.location.href);
        console.log('AuthCallback: URL hash:', window.location.hash);
        console.log('AuthCallback: URL search:', window.location.search);
        
        // Check if we're on Supabase domain and need to redirect to app
        const currentHost = window.location.hostname;
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        let isSupabaseDomain = false;
        
        if (supabaseUrl) {
          try {
            const supabaseHostname = new URL(supabaseUrl).hostname;
            isSupabaseDomain = currentHost === supabaseHostname || currentHost.includes(supabaseHostname);
          } catch (e) {
            console.warn('AuthCallback: Could not parse Supabase URL:', e);
          }
        }
        
        // If we're on Supabase domain, try to extract auth info and redirect
        if (isSupabaseDomain) {
          console.log('AuthCallback: On Supabase domain');
          console.log('AuthCallback: Full URL:', window.location.href);
          console.log('AuthCallback: Hash:', window.location.hash);
          console.log('AuthCallback: Search:', window.location.search);
          
          // Extract hash or search parameters (OAuth tokens might be in either)
          const hash = window.location.hash;
          const search = window.location.search;
          const params = hash || search;
          
          // Get the app origin from localStorage (set by GoogleAuth) or default
          const storedAppOrigin = localStorage.getItem('oauth_redirect_url');
          const isDevelopment = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1';
          
          // Default to current port if stored, otherwise use common dev ports
          const defaultPort = window.location.port || '3001';
          const appOrigin = storedAppOrigin 
            ? (storedAppOrigin.startsWith('http') ? storedAppOrigin : `http://${storedAppOrigin}`)
            : (isDevelopment ? `http://localhost:${defaultPort}` : window.location.origin);
          
          if (params) {
            // We have auth parameters (hash or search), redirect to app
            const appCallbackUrl = `${appOrigin}/auth/callback${params}`;
            console.log('AuthCallback: App origin:', appOrigin);
            console.log('AuthCallback: Redirecting to app callback URL:', appCallbackUrl);
            
            window.location.replace(appCallbackUrl);
            return;
          } else {
            // No hash/search params - check if there's a code parameter that needs exchange
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            
            if (code) {
              // We have an OAuth code, redirect to frontend to handle exchange
              const appCallbackUrl = `${appOrigin}/auth/callback?code=${code}`;
              console.log('AuthCallback: Found OAuth code, redirecting to app:', appCallbackUrl);
              window.location.replace(appCallbackUrl);
              return;
            }
            
            // No auth parameters at all - Supabase might be showing a login page
            console.error('AuthCallback: On Supabase domain but no auth parameters found!');
            console.error('AuthCallback: This means Supabase is not configured to redirect to localhost.');
            console.error('AuthCallback: Please configure Supabase to allow:', appOrigin);
            setError(`Supabase configuration required. Please add ${appOrigin} to Supabase redirect URLs.`);
            setLoading(false);
            return;
          }
        }
        
        // Check if we have OAuth parameters in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        console.log('AuthCallback: URL params:', Object.fromEntries(urlParams));
        console.log('AuthCallback: Hash params:', Object.fromEntries(hashParams));
        
        // First, try to get session from URL hash (implicit flow)
        // This works even if PKCE code verifier is missing
        if (hashParams.has('access_token') || hashParams.has('code')) {
          console.log('AuthCallback: Found tokens/code in URL hash, letting Supabase handle automatically');
          // Supabase should automatically process the hash
          const { data: hashSessionData, error: hashSessionError } = await supabase.auth.getSession();
          if (!hashSessionError && hashSessionData?.session) {
            console.log('AuthCallback: Session found from URL hash');
            const user = hashSessionData.session.user;
            setUser(user);
            
            const userData = {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.full_name || user.email || 'User',
              avatar: user.user_metadata?.avatar_url || '',
              role: 'user',
              created_at: user.created_at,
              updated_at: user.updated_at || user.created_at,
              is_verified: !!user.email_confirmed_at,
              last_login: new Date().toISOString(),
            };
            
            localStorage.setItem('trendtap_user', JSON.stringify(userData));
            localStorage.setItem('trendtap_token', hashSessionData.session.access_token);
            
            onSuccess?.(user);
            setTimeout(() => {
              navigate(redirectTo, { replace: true });
              window.location.reload();
            }, 500);
            return;
          }
        }
        
        // Handle code parameter (OAuth authorization code that needs exchange)
        const code = urlParams.get('code');
        if (code && !hashParams.has('access_token')) {
          console.log('AuthCallback: Found OAuth code, attempting to exchange...');
          console.log('AuthCallback: Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
          console.log('AuthCallback: Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
          
          // Verify Supabase is configured
          if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            const errorMsg = 'Supabase configuration missing. Please check your .env file.';
            console.error('AuthCallback:', errorMsg);
            setError(errorMsg);
            setLoading(false);
            return;
          }
          
          // Try to exchange code for session using Supabase
          try {
            // Get the redirect URL that was used in the original OAuth request
            // This should match what was passed to signInWithOAuth
            const currentOrigin = window.location.origin;
            const redirectUrl = `${currentOrigin}/auth/callback`;
            
            console.log('AuthCallback: Exchanging code with redirect URL:', redirectUrl);
            
            // For PKCE flow, the code verifier should be in sessionStorage
            // If it's missing, try to get session from URL hash instead
            // First, try the exchange
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              console.error('AuthCallback: Code exchange error:', exchangeError);
              console.error('AuthCallback: Error details:', {
                message: exchangeError.message,
                status: exchangeError.status,
                name: exchangeError.name
              });
              
              // If PKCE code verifier is missing, this is a configuration issue
              if (exchangeError.message?.includes('code verifier') || exchangeError.message?.includes('non-empty')) {
                console.error('AuthCallback: PKCE code verifier missing - this indicates a Supabase configuration issue');
                console.error('AuthCallback: The redirect URL might not match exactly, or Supabase is using PKCE but the verifier was lost');
                console.error('AuthCallback: Try configuring Supabase to use implicit flow, or ensure redirect URL matches exactly');
                
                // Try one more time to get session from URL (in case Supabase processed it)
                await new Promise(resolve => setTimeout(resolve, 1000));
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                if (!sessionError && sessionData?.session) {
                  console.log('AuthCallback: Session found after delay, using that');
                  const user = sessionData.session.user;
                  setUser(user);
                  
                  const userData = {
                    id: user.id,
                    email: user.email || '',
                    name: user.user_metadata?.full_name || user.email || 'User',
                    avatar: user.user_metadata?.avatar_url || '',
                    role: 'user',
                    created_at: user.created_at,
                    updated_at: user.updated_at || user.created_at,
                    is_verified: !!user.email_confirmed_at,
                    last_login: new Date().toISOString(),
                  };
                  
                  localStorage.setItem('trendtap_user', JSON.stringify(userData));
                  localStorage.setItem('trendtap_token', sessionData.session.access_token);
                  
                  onSuccess?.(user);
                  setTimeout(() => {
                    navigate(redirectTo, { replace: true });
                    window.location.reload();
                  }, 500);
                  return;
                }
                
                // If we still don't have a session, show a helpful error
                const errorMsg = 'OAuth authentication failed: PKCE code verifier is missing. This usually means the redirect URL in Supabase doesn\'t match exactly, or there\'s a configuration issue. Please check your Supabase OAuth settings and ensure the redirect URL matches: ' + redirectUrl;
                setError(errorMsg);
                setLoading(false);
                onError?.(errorMsg);
                return;
              }
              
              // If it's a 401, it's likely an authentication issue
              if (exchangeError.status === 401) {
                const errorMsg = 'Authentication failed. Please check your Supabase configuration. Make sure VITE_SUPABASE_ANON_KEY is set correctly in your .env file.';
                setError(errorMsg);
                setLoading(false);
                onError?.(errorMsg);
                return;
              }
              
              throw exchangeError;
            }
            
            if (exchangeData.session) {
              console.log('AuthCallback: Code exchanged successfully, session created');
              const user = exchangeData.session.user;
              setUser(user);
              
              const userData = {
                id: user.id,
                email: user.email || '',
                name: user.user_metadata?.full_name || user.email || 'User',
                avatar: user.user_metadata?.avatar_url || '',
                role: 'user',
                created_at: user.created_at,
                updated_at: user.updated_at || user.created_at,
                is_verified: !!user.email_confirmed_at,
                last_login: new Date().toISOString(),
              };
              
              localStorage.setItem('trendtap_user', JSON.stringify(userData));
              localStorage.setItem('trendtap_token', exchangeData.session.access_token);
              
              onSuccess?.(user);
              setTimeout(() => {
                navigate(redirectTo, { replace: true });
                window.location.reload();
              }, 500);
              return;
            } else {
              console.warn('AuthCallback: Code exchange succeeded but no session returned');
            }
          } catch (exchangeErr: any) {
            console.error('AuthCallback: Failed to exchange code:', exchangeErr);
            // Don't fall through - show error to user
            const errorMsg = exchangeErr.message || 'Failed to complete authentication. Please try again.';
            setError(errorMsg);
            setLoading(false);
            onError?.(errorMsg);
            return;
          }
        }

        // Try to get session - Supabase should handle the hash automatically
        // Also try to get the session from the URL if there's a code
        const { data, error } = await supabase.auth.getSession();
        console.log('AuthCallback: Session check:', { data: !!data, session: !!data?.session, error });
        
        // If we have a code but no session yet, Supabase might need to process it
        // Try calling getSession again after a brief delay to let Supabase process the URL
        if (code && !data?.session) {
          console.log('AuthCallback: Code present but no session, waiting for Supabase to process...');
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: retryData, error: retryError } = await supabase.auth.getSession();
          if (!retryError && retryData?.session) {
            console.log('AuthCallback: Session found on retry');
            const user = retryData.session.user;
            setUser(user);
            
            const userData = {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.full_name || user.email || 'User',
              avatar: user.user_metadata?.avatar_url || '',
              role: 'user',
              created_at: user.created_at,
              updated_at: user.updated_at || user.created_at,
              is_verified: !!user.email_confirmed_at,
              last_login: new Date().toISOString(),
            };
            
            localStorage.setItem('trendtap_user', JSON.stringify(userData));
            localStorage.setItem('trendtap_token', retryData.session.access_token);
            
            onSuccess?.(user);
            setTimeout(() => {
              navigate(redirectTo, { replace: true });
              window.location.reload();
            }, 500);
            return;
          }
        }

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
            email: user.email || '',
            name: user.user_metadata?.full_name || user.email || 'User',
            avatar: user.user_metadata?.avatar_url || '',
            role: 'user',
            created_at: user.created_at,
            updated_at: user.updated_at || user.created_at,
            is_verified: !!user.email_confirmed_at,
            last_login: new Date().toISOString(),
          };
          
          // Store in localStorage (for simpleAuthService)
          localStorage.setItem('trendtap_user', JSON.stringify(userData));
          localStorage.setItem('trendtap_token', data.session.access_token);
          
          // Update AuthContext by refreshing the auth state
          // The AuthContext will pick up the session on next check
          console.log('AuthCallback: Stored user data, updating auth context...');
          
          // Trigger a page reload to refresh auth state, or navigate
          onSuccess?.(user);
          console.log('AuthCallback: OAuth successful, redirecting to:', redirectTo);
          
          // Use navigate instead of window.location.replace for SPA navigation
          setTimeout(() => {
            navigate(redirectTo, { replace: true });
            // Also trigger a page reload to refresh auth state
            window.location.reload();
          }, 500);
        } else {
          console.log('AuthCallback: No session found, waiting...');
          // Wait a bit and try again - sometimes Supabase needs a moment
          setTimeout(async () => {
            try {
              const { data: retryData, error: retryError } = await supabase.auth.getSession();
              if (retryError) throw retryError;
              
              if (retryData.session) {
                const user = retryData.session.user;
                setUser(user);
                
                const userData = {
                  id: user.id,
                  email: user.email || '',
                  name: user.user_metadata?.full_name || user.email || 'User',
                  avatar: user.user_metadata?.avatar_url || '',
                  role: 'user',
                  created_at: user.created_at,
                  updated_at: user.updated_at || user.created_at,
                  is_verified: !!user.email_confirmed_at,
                  last_login: new Date().toISOString(),
                };
                
                localStorage.setItem('trendtap_user', JSON.stringify(userData));
                localStorage.setItem('trendtap_token', retryData.session.access_token);
                
                onSuccess?.(user);
                setTimeout(() => {
                  navigate(redirectTo, { replace: true });
                  window.location.reload();
                }, 500);
              } else {
                throw new Error('No session found after retry');
              }
            } catch (retryErr: any) {
              console.error('AuthCallback: Retry failed:', retryErr);
              setError(retryErr.message || 'Authentication failed');
              onError?.(retryErr.message || 'Authentication failed');
              setLoading(false);
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
  }, [navigate, onSuccess, onError, redirectTo, login]);

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


