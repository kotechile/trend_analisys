import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Link,
} from '@mui/material';
import {
  Search,
  Psychology,
  Category,
  TrendingUp,
  MonetizationOn,
  ExpandMore,
  CheckCircle,
  Error,
  OpenInNew,
} from '@mui/icons-material';

interface TestResult {
  searchTerm: string;
  category: string;
  success: boolean;
  timestamp: string;
  analysis?: any;
  error?: string;
}

const PREDEFINED_TESTS = [
  { term: "weekend by the lake", niche: "outdoor recreation", expected: "outdoor_recreation" },
  { term: "best pizza recipes", niche: "cooking", expected: "food_cooking" },
  { term: "smart home automation", niche: "technology", expected: "technology" },
  { term: "fitness apps for beginners", niche: "health", expected: "health_fitness" },
  { term: "homemade bread baking", niche: "cooking", expected: "food_cooking" },
  { term: "mountain hiking gear", niche: "outdoor", expected: "outdoor_recreation" },
  { term: "coding bootcamp reviews", niche: "education", expected: "education_learning" },
  { term: "investment strategies", niche: "finance", expected: "finance_investing" },
];

export const LLMTestSuite: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [tabValue, setTabValue] = useState(0);

  const handleSearch = async (term: string, nicheValue: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/affiliate-research/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_term: term,
          niche: nicheValue || null,
          budget_range: 'any',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        
        // Add to test results
        const testResult: TestResult = {
          searchTerm: term,
          category: data.data.analysis.category,
          success: true,
          timestamp: new Date().toLocaleTimeString(),
          analysis: data.data.analysis,
        };
        setTestResults(prev => [testResult, ...prev]);
      } else {
        const errorData = await response.json();
        setError(`Search failed: ${errorData.detail || response.statusText}`);
        
        const testResult: TestResult = {
          searchTerm: term,
          category: 'error',
          success: false,
          timestamp: new Date().toLocaleTimeString(),
          error: errorData.detail || response.statusText,
        };
        setTestResults(prev => [testResult, ...prev]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Search error: ${errorMessage}`);
      
      const testResult: TestResult = {
        searchTerm: term,
        category: 'error',
        success: false,
        timestamp: new Date().toLocaleTimeString(),
        error: errorMessage,
      };
      setTestResults(prev => [testResult, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const runPredefinedTest = async (test: typeof PREDEFINED_TESTS[0]) => {
    setSearchTerm(test.term);
    setNiche(test.niche);
    await handleSearch(test.term, test.niche);
  };

  const runAllTests = async () => {
    setTestResults([]);
    for (const test of PREDEFINED_TESTS) {
      await handleSearch(test.term, test.niche);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between tests
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      outdoor_recreation: '#4caf50',
      food_cooking: '#ff9800',
      technology: '#2196f3',
      health_fitness: '#e91e63',
      education_learning: '#9c27b0',
      home_garden: '#795548',
      travel_hospitality: '#00bcd4',
      fashion_beauty: '#f44336',
      automotive: '#607d8b',
      business_services: '#3f51b5',
      entertainment_gaming: '#ff5722',
      finance_investing: '#4caf50',
      pets_animals: '#8bc34a',
      sports_fitness: '#ffc107',
      general: '#9e9e9e',
    };
    return colors[category] || '#9e9e9e';
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Psychology color="primary" />
        LLM Integration Test Suite
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Comprehensive testing of AI-powered semantic analysis and category detection
      </Typography>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Manual Test" />
        <Tab label="Predefined Tests" />
        <Tab label="Test Results" />
      </Tabs>

      {/* Manual Test Tab */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Manual Test</Typography>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search Term"
                  placeholder="e.g., weekend by the lake"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Niche (Optional)"
                  placeholder="e.g., outdoor recreation"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => handleSearch(searchTerm, niche)}
                  disabled={loading || !searchTerm.trim()}
                  startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                >
                  {loading ? 'Testing...' : 'Test LLM'}
                </Button>
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {result && (
              <Box>
                <Typography variant="h6" gutterBottom>Test Results</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                      <Typography variant="subtitle2" gutterBottom>Category Detection:</Typography>
                      <Chip
                        label={result.data.analysis.category}
                        sx={{
                          backgroundColor: getCategoryColor(result.data.analysis.category),
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Target Audience:</strong> {result.data.analysis.target_audience}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Competition:</strong> {result.data.analysis.competition_level}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                      <Typography variant="subtitle2" gutterBottom>Content Opportunities:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {result.data.analysis.content_opportunities?.slice(0, 3).map((opp: string, index: number) => (
                          <Chip key={index} label={opp} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
                
                {/* Affiliate Programs Section */}
                {result.data.analysis.affiliate_programs && result.data.analysis.affiliate_programs.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MonetizationOn color="primary" />
                      AI-Recommended Affiliate Programs
                    </Typography>
                    <Grid container spacing={2}>
                      {result.data.analysis.affiliate_programs.slice(0, 3).map((program: any, index: number) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Paper 
                            sx={{ 
                              p: 2, 
                              backgroundColor: '#f8f9fa',
                              border: '1px solid #e0e0e0',
                              borderRadius: 2,
                              height: '100%',
                            }}
                          >
                            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Link
                                href={program.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  color: 'primary.main',
                                  textDecoration: 'none',
                                  '&:hover': {
                                    textDecoration: 'underline',
                                  },
                                }}
                              >
                                {program.name}
                              </Link>
                              <OpenInNew fontSize="small" color="action" />
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {program.description}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                              <Chip
                                label={program.commission}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                              <Chip
                                label={program.difficulty}
                                size="small"
                                sx={{
                                  backgroundColor: program.difficulty === 'Easy' ? '#4caf50' : 
                                                  program.difficulty === 'Medium' ? '#ff9800' : '#f44336',
                                  color: 'white',
                                }}
                              />
                            </Box>
                            
                            <Typography variant="caption" color="text.secondary">
                              Est. Traffic: {program.estimated_traffic?.toLocaleString()}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Predefined Tests Tab */}
      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Predefined Test Cases</Typography>
              <Button
                variant="contained"
                onClick={runAllTests}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <TrendingUp />}
              >
                {loading ? 'Running Tests...' : 'Run All Tests'}
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {PREDEFINED_TESTS.map((test, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                    onClick={() => runPredefinedTest(test)}
                  >
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        {test.term}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Niche: {test.niche}
                      </Typography>
                      <Typography variant="caption" color="primary">
                        Expected: {test.expected}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Test Results Tab */}
      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Results ({testResults.length} tests)
            </Typography>
            
            {testResults.length === 0 ? (
              <Typography color="text.secondary">No tests run yet</Typography>
            ) : (
              <List>
                {testResults.map((test, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {test.success ? (
                              <CheckCircle color="success" fontSize="small" />
                            ) : (
                              <Error color="error" fontSize="small" />
                            )}
                            <Typography variant="subtitle2">
                              {test.searchTerm}
                            </Typography>
                            <Chip
                              label={test.category}
                              size="small"
                              sx={{
                                backgroundColor: getCategoryColor(test.category),
                                color: 'white',
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {test.timestamp}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          test.error ? (
                            <Typography color="error" variant="body2">
                              Error: {test.error}
                            </Typography>
                          ) : (
                            <Typography variant="body2">
                              Target Audience: {test.analysis?.target_audience}
                            </Typography>
                          )
                        }
                      />
                    </ListItem>
                    {index < testResults.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
