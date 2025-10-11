/**
 * Main Layout Component
 * Provides the main layout structure for the application
 */

import React from 'react';
import { Box } from '@mui/material';
import MainLayout from './MainLayout';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
      <MainLayout>
        {children}
      </MainLayout>
    </Box>
  );
};

export default Layout;


