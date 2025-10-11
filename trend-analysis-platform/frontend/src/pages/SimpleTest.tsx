import React, { useState } from 'react';
import { Box, Button, Typography, Paper, TextField } from '@mui/material';

export const SimpleTest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/affiliate-research/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_term: 'weekend by the lake',
          niche: 'outdoor recreation',
          budget_range: 'any'
        })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Simple API Test</Typography>
      <Button variant="contained" onClick={testAPI} disabled={loading}>
        {loading ? 'Testing...' : 'Test API'}
      </Button>
      
      {result && (
        <Paper sx={{ p: 2, mt: 2, maxHeight: 400, overflow: 'auto' }}>
          <Typography variant="h6">API Response:</Typography>
          <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
};
