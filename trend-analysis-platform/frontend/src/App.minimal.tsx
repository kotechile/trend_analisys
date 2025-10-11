import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, AppBar, Toolbar, Tabs, Tab, Paper } from '@mui/material';

// Simple Dashboard component
const Dashboard = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>🚀 TrendTap Dashboard</Typography>
    <Typography variant="body1">
      Welcome to the AI Research Workspace! This system features advanced LLM-powered semantic analysis for affiliate research.
    </Typography>
  </Box>
);

// Simple Idea Burst component
const IdeaBurst = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>💡 Idea Burst</Typography>
    <Typography variant="body1">
      Generate content and software ideas with AI-powered analysis.
    </Typography>
  </Box>
);

// Placeholder components for other tabs
const PlaceholderPage = ({ title }: { title: string }) => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>{title}</Typography>
    <Typography variant="body1">This feature is coming soon!</Typography>
  </Box>
);

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const routes = ['/', '/affiliate-research', '/llm-test-suite', '/trend-validation', '/idea-burst', '/keyword-armoury', '/calendar', '/settings'];
    navigate(routes[newValue]);
  };

  const getCurrentTab = () => {
    const routes = ['/', '/affiliate-research', '/llm-test-suite', '/trend-validation', '/idea-burst', '/keyword-armoury', '/calendar', '/settings'];
    return routes.indexOf(location.pathname);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🚀 TrendTap - AI Research Workspace
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'white' }}>
        <Tabs 
          value={getCurrentTab()} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab label="Dashboard" />
          <Tab label="Affiliate Research" />
          <Tab label="LLM Test Suite" />
          <Tab label="Trend Validation" />
          <Tab label="Idea Burst" />
          <Tab label="Keyword Armoury" />
          <Tab label="Calendar" />
          <Tab label="Settings" />
        </Tabs>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5' }}>
        <Paper sx={{ p: 3, minHeight: '70vh' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/affiliate-research" element={<PlaceholderPage title="Affiliate Research" />} />
            <Route path="/llm-test-suite" element={<PlaceholderPage title="LLM Test Suite" />} />
            <Route path="/trend-validation" element={<PlaceholderPage title="Trend Validation" />} />
            <Route path="/idea-burst" element={<IdeaBurst />} />
            <Route path="/keyword-armoury" element={<PlaceholderPage title="Keyword Armoury" />} />
            <Route path="/calendar" element={<PlaceholderPage title="Calendar" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          </Routes>
        </Paper>
      </Box>
    </Box>
  );
}

export default App;
