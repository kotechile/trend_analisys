/**
 * Dashboard Page
 * Main dashboard component with overview and navigation
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🚀 TrendTap Dashboard
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Welcome to the AI Research Workspace! This system now features advanced LLM-powered semantic analysis for affiliate research.
      </Typography>
      
      <Paper sx={{ p: 3, backgroundColor: '#e3f2fd', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ✨ New Features:
        </Typography>
        <Typography variant="body2" component="div">
          • <strong>AI-Powered Category Detection</strong> - Automatically detects topic categories<br/>
          • <strong>Semantic Analysis</strong> - Generates relevant subtopics and content opportunities<br/>
          • <strong>Smart Affiliate Programs</strong> - AI-recommended programs based on topic analysis<br/>
          • <strong>Comprehensive Testing</strong> - Test suite to verify LLM functionality
        </Typography>
      </Paper>
      
      <Typography variant="body1">
        Navigate to <strong>"Affiliate Research"</strong> to use the full AI-powered research interface.
      </Typography>
    </Box>
  );
};

export default Dashboard;