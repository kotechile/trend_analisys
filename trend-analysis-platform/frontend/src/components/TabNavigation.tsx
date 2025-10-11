/**
 * Tab Navigation Component
 * Reusable tab navigation component with Material-UI Tabs
 */

import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { TabNavigationProps } from '../types/workflow';

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  tabs,
}) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'white' }}>
      <Tabs 
        value={activeTab} 
        onChange={(event, newValue) => onTabChange(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ px: 2 }}
        aria-label="navigation tabs"
      >
        {tabs.map((tab, index) => (
          <Tab
            key={tab.id}
            label={tab.label}
            disabled={tab.disabled}
            sx={{
              minHeight: 48,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: activeTab === index ? 600 : 400,
              color: activeTab === index ? 'primary.main' : 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              },
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default TabNavigation;
