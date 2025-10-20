import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Card, CardContent, Grid, Paper, Chip, Checkbox } from '@mui/material';
import { TrendsAnalysis } from './pages/TrendsAnalysis';

const TestTrends: React.FC = () => {
  const [testData, setTestData] = useState<any>(null);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🧪 Test Trends Analysis
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        This is a test page to verify the Trends Analysis component is working correctly.
      </Typography>

      <TrendsAnalysis 
        currentResearch={testData}
        onTrendsSelected={(trends) => {
          console.log('Selected trends:', trends);
          setTestData({ trends });
        }}
        onNavigateToTab={(tabIndex) => {
          console.log('Navigate to tab:', tabIndex);
        }}
      />
    </Box>
  );
};

export default TestTrends;
