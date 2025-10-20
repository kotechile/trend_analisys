import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography, AppBar, Toolbar, Tabs, Tab, Paper } from '@mui/material';
import { Rocket } from '@mui/icons-material';

// Simple page components
const Dashboard = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>🚀 TrendTap Dashboard</Typography>
    <Typography variant="body1">
      Welcome to the AI Research Workspace! This system features advanced LLM-powered semantic analysis for affiliate research.
    </Typography>
  </Box>
);

const AffiliateResearch = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>🔍 Affiliate Research</Typography>
    <Typography variant="body1">
      Search for affiliate programs and analyze their potential.
    </Typography>
  </Box>
);

const EnhancedWorkflow = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>⚡ Enhanced Workflow</Typography>
    <Typography variant="body1">
      Complete research workflow with AI-powered analysis.
    </Typography>
  </Box>
);

const TrendValidation = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>📈 Trend Validation</Typography>
    <Typography variant="body1">
      Validate and analyze trending topics.
    </Typography>
  </Box>
);

const IdeaBurst = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>💡 Idea Burst</Typography>
    <Typography variant="body1">
      Generate creative content ideas.
    </Typography>
  </Box>
);

const Calendar = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>📅 Calendar</Typography>
    <Typography variant="body1">
      Content planning and scheduling.
    </Typography>
  </Box>
);

const Settings = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>⚙️ Settings</Typography>
    <Typography variant="body1">
      Configure your application preferences.
    </Typography>
  </Box>
);

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Main App Content Component
function AppContent() {
  const [currentTab, setCurrentTab] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const renderCurrentContent = () => {
    switch (currentTab) {
      case 0:
        return <Dashboard />;
      case 1:
        return <AffiliateResearch />;
      case 2:
        return <EnhancedWorkflow />;
      case 3:
        return <TrendValidation />;
      case 4:
        return <IdeaBurst />; // Keywords Armoury
      case 5:
        return <IdeaBurst />; // Idea Burst
      case 6:
        return <Calendar />;
      case 7:
        return <Settings />;
      default:
        return <Dashboard />;
    }
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
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab label="Dashboard" />
          <Tab label="Affiliate Research" />
          <Tab label="Enhanced Workflow" icon={<Rocket />} />
          <Tab label="Trend Validation" />
          <Tab label="Keywords Armoury" />
          <Tab label="Idea Burst" />
          <Tab label="Calendar" />
          <Tab label="Settings" />
        </Tabs>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5' }}>
        <Paper sx={{ p: 3, minHeight: '70vh' }}>
          {renderCurrentContent()}
        </Paper>
      </Box>
    </Box>
  );
}

// Main App Component
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;