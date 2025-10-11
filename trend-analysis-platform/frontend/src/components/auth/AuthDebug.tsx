import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  useEffect(() => {
    const checkLocalStorage = () => {
      const oauthUser = localStorage.getItem('trendtap_user');
      const oauthToken = localStorage.getItem('trendtap_token');
      const oauthSuccess = localStorage.getItem('oauth_success');
      
      setLocalStorageData({
        oauthUser: oauthUser ? JSON.parse(oauthUser) : null,
        oauthToken: oauthToken ? 'Token exists' : null,
        oauthSuccess
      });
    };

    checkLocalStorage();
    const interval = setInterval(checkLocalStorage, 1000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Auth Debug</h4>
      <div><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
      <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
      <div><strong>User:</strong> {user ? user.email : 'None'}</div>
      <div><strong>Error:</strong> {error || 'None'}</div>
      <hr />
      <div><strong>OAuth User:</strong> {localStorageData?.oauthUser?.email || 'None'}</div>
      <div><strong>OAuth Token:</strong> {localStorageData?.oauthToken || 'None'}</div>
      <div><strong>OAuth Success:</strong> {localStorageData?.oauthSuccess || 'None'}</div>
    </div>
  );
};

export default AuthDebug;
