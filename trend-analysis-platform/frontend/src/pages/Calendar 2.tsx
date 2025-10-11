/**
 * Calendar Page
 * Placeholder component for calendar functionality
 */

import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';

const Calendar: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CalendarToday sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          📅 Calendar
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom>
          Coming Soon!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          The Calendar feature will help you schedule content, track deadlines,
          and manage your content marketing workflow.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" disabled>
            View Calendar
          </Button>
          <Button variant="outlined" disabled>
            Add Event
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Calendar;