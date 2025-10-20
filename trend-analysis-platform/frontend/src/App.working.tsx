import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, AppBar, Toolbar, Tabs, Tab, Paper } from '@mui/material';
import { LLMTestSuite } from './pages/LLMTestSuite';
import { IdeaBurst } from './pages/IdeaBurst';

// Simple Dashboard component
const Dashboard = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>🚀 TrendTap Dashboard</Typography>
    <Typography variant="body1" sx={{ mb: 3}}>
      Welcome to the AI Research Workspace! This system now features advanced LLM-powered semantic analysis for affiliate research.
    </Typography>
    
    <Paper sx={{ p: 3, backgroundColor: '#e3f2fd', mb: 3 }}>
      <Typography variant="h6" gutterBottom>✨ New Features:</Typography>
      <Typography variant="body2" component="div">
        • <strong>AI-Powered Category Detection</strong> - Automatically detects topic categories<br/>
        • <strong>Semantic Analysis</strong> - Generates relevant subtopics and content opportunities<br/>
        • <strong>Smart Affiliate Programs</strong> - AI-recommended programs based on topic analysis<br/>
        • <strong>Comprehensive Testing</strong> - Test suite to verify LLM functionality
      </Typography>
    </Paper>
    
    <Typography variant="body1">
      Navigate to <strong>"LLM Test Suite"</strong> to test the AI capabilities or <strong>"Affiliate Research"</strong> to use the full interface.
    </Typography>
  </Box>
);

// Simple Affiliate Research component
const AffiliateResearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/affiliate-research/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_term: searchTerm,
          niche: niche || null,
          budget_range: 'any',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        const errorData = await response.json();
        setError(`Search failed: ${errorData.detail || response.statusText}`);
      }
    } catch (error) {
      setError(`Search error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>🔍 Affiliate Research</Typography>
      
      {/* Search Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Search for Affiliate Programs</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <input
            type="text"
            placeholder="Enter search term (e.g., weekend by the lake)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Niche (optional)"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
            sx={{ minWidth: 150 }}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#ffebee' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {/* Results */}
      {result && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Results for "{result.data.search_term}"
          </Typography>
          
          {/* Category Detection */}
          <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
            <Typography variant="subtitle1" gutterBottom>
              🧠 AI Analysis
            </Typography>
            <Typography variant="body2">
              <strong>Category:</strong> {result.data.analysis.category}<br/>
              <strong>Target Audience:</strong> {result.data.analysis.target_audience}<br/>
              <strong>Competition Level:</strong> {result.data.analysis.competition_level}
            </Typography>
          </Paper>

          {/* Content Opportunities */}
          <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
            <Typography variant="subtitle1" gutterBottom>
              📊 Content Opportunities
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {result.data.analysis.content_opportunities?.map((opp: string, index: number) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: '#e3f2fd',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    margin: '2px'
                  }}
                >
                  {opp}
                </span>
              ))}
            </Box>
          </Paper>

          {/* AI-Generated Subtopics */}
          <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
            <Typography variant="subtitle1" gutterBottom>
              🎯 AI-Generated Subtopics
            </Typography>
            {result.data.analysis.related_areas?.map((area: any, index: number) => (
              <Box key={index} sx={{ mb: 1, p: 1, backgroundColor: 'white', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {area.area}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {area.description} • {Math.round(area.relevance_score * 100)}% relevant
                </Typography>
              </Box>
            ))}
          </Paper>

          {/* Affiliate Programs */}
          <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
            <Typography variant="subtitle1" gutterBottom>
              💰 Affiliate Programs ({result.data.total_programs} found)
            </Typography>
            {result.data.programs?.map((program: any, index: number) => (
              <Box key={program.id || index} sx={{ mb: 2, p: 2, backgroundColor: 'white', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {program.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {program.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: '#4caf50', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '12px' }}>
                    {program.commission}
                  </span>
                  <span style={{ backgroundColor: '#2196f3', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '12px' }}>
                    {program.difficulty}
                  </span>
                  <span style={{ backgroundColor: '#ff9800', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '12px' }}>
                    {program.affiliate_network}
                  </span>
                </Box>
              </Box>
            ))}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

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
  const [, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
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
          <Tab label="Keywords Armoury" />
          <Tab label="Idea Burst" />
          <Tab label="Calendar" />
          <Tab label="Settings" />
        </Tabs>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5' }}>
        <Paper sx={{ p: 3, minHeight: '70vh' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/affiliate-research" element={<AffiliateResearch />} />
            <Route path="/llm-test-suite" element={<LLMTestSuite />} />
            <Route path="/trend-validation" element={<PlaceholderPage title="Trend Validation" />} />
            <Route path="/keywords_armoury" element={<IdeaBurst />} />
            <Route path="/idea-burst" element={<IdeaBurst />} />
            <Route path="/keyword-armoury" element={<PlaceholderPage title="Idea Burst" />} />
            <Route path="/calendar" element={<PlaceholderPage title="Calendar" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          </Routes>
        </Paper>
      </Box>
    </Box>
  );
}

export default App;