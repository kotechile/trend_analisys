/**
 * Main layout component with navigation and content area
 */
import React from 'react';
import { Box, useTheme } from '@mui/material';
import Navigation from './Navigation';
import { useAuth } from '../../hooks/useAuth';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      console.log('MainLayout: Logout initiated');
      await logout();
      console.log('MainLayout: Logout completed');
    } catch (error) {
      console.error('MainLayout: Logout failed:', error);
      // Even if logout fails, the useAuth hook will handle the redirect
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navigation onLogout={handleLogout} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 240px)` },
          ml: { md: '240px' },
          mt: '64px', // Account for AppBar height
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
