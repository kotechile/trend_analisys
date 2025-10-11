import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Paper,
} from '@mui/material';
import { Search, Psychology } from '@mui/icons-material';

export const TestLLM: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('weekend by the lake');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setSearching(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/affiliate-research/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          search_term: searchTerm,
          niche: '',
          budget_range: 'any',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Full API Response:', data);
        setResult(data);
      } else {
        const errorData = await response.json();
        setError(`Search failed: ${errorData.detail || response.statusText}`);
      }
    } catch (error) {
      console.error('💥 Search error:', error);
      setError(`Search error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSearching(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Psychology color="primary" />
        LLM Integration Test
      </Typography>

      {/* Search Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              label="Search Term"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={searching}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={searching || !searchTerm.trim()}
              startIcon={searching ? <CircularProgress size={20} /> : <Search />}
              sx={{ minWidth: 150 }}
            >
              {searching ? 'Testing...' : 'Test LLM'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {result && (
        <Box>
          {/* API Response Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                API Response Summary
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Chip label={`Success: ${result.success}`} color={result.success ? 'success' : 'error'} />
                <Chip label={`Programs: ${result.data.total_programs}`} color="primary" />
                <Chip label={`Category: ${result.data.analysis.category}`} color="secondary" />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Search Term:</strong> {result.data.search_term}<br/>
                <strong>Niche:</strong> {result.data.niche}<br/>
                <strong>Timestamp:</strong> {result.data.timestamp}
              </Typography>
            </CardContent>
          </Card>

          {/* LLM Analysis */}
          {result.data.analysis && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🧠 LLM Analysis
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Category:</Typography>
                    <Chip label={result.data.analysis.category} color="primary" />
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Target Audience:</Typography>
                    <Typography variant="body2">{result.data.analysis.target_audience}</Typography>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Competition Level:</Typography>
                    <Typography variant="body2">{result.data.analysis.competition_level}</Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Earnings Potential:</Typography>
                    <Typography variant="body2">{result.data.analysis.earnings_potential}</Typography>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Content Opportunities:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {result.data.analysis.content_opportunities?.map((opp: string, index: number) => (
                        <Chip key={index} label={opp} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* AI-Generated Subtopics */}
          {result.data.analysis?.related_areas && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 AI-Generated Subtopics ({result.data.analysis.related_areas.length})
                </Typography>
                
                <Grid container spacing={2}>
                  {result.data.analysis.related_areas.map((area: any, index: number) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {area.area}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {area.description}
                        </Typography>
                        <Chip
                          label={`${Math.round(area.relevance_score * 100)}% relevant`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* AI-Generated Affiliate Programs */}
          {result.data.analysis?.affiliate_programs && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💰 AI-Generated Affiliate Programs ({result.data.analysis.affiliate_programs.length})
                </Typography>
                
                <Grid container spacing={2}>
                  {result.data.analysis.affiliate_programs.map((program: any, index: number) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {program.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {program.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          <Chip label={program.commission} size="small" color="success" variant="outlined" />
                          <Chip label={program.difficulty} size="small" color="default" variant="outlined" />
                          <Chip label={program.category} size="small" color="primary" variant="outlined" />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Web Search Programs */}
          {result.data.programs && result.data.programs.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🔍 Web Search Programs ({result.data.programs.length})
                </Typography>
                
                <Grid container spacing={2}>
                  {result.data.programs.map((program: any, index: number) => (
                    <Grid item xs={12} sm={6} md={4} key={program.id || index}>
                      <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {program.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {program.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          <Chip label={program.commission} size="small" color="success" variant="outlined" />
                          <Chip label={program.difficulty} size="small" color="default" variant="outlined" />
                          <Chip label={program.affiliate_network} size="small" color="primary" variant="outlined" />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
};
