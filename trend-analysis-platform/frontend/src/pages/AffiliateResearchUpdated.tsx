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
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Search,
  Psychology,
  Category,
  TrendingUp,
  MonetizationOn,
} from '@mui/icons-material';
import { LLMAnalysisDisplay } from '../components/LLMAnalysisDisplay';

interface SearchResult {
  success: boolean;
  message: string;
  data: {
    search_term: string;
    niche: string;
    budget_range: string;
    programs: any[];
    analysis: {
      topic: string;
      category: string;
      target_audience: string;
      content_opportunities: string[];
      affiliate_types: string[];
      competition_level: string;
      earnings_potential: string;
      related_areas: Array<{
        area: string;
        description: string;
        relevance_score: number;
      }>;
      affiliate_programs: Array<{
        name: string;
        commission: string;
        category: string;
        difficulty: string;
        description: string;
        link: string;
        estimated_traffic: number;
        competition_level: string;
      }>;
    };
    research_id: string | null;
    total_programs: number;
    timestamp: string;
  };
}

export const AffiliateResearchUpdated: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [niche, setNiche] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
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
          niche: niche || null,
          budget_range: 'any',
          user_id: null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Search successful:', data);
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

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Psychology color="primary" />
        AI-Powered Affiliate Research
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Discover high-converting affiliate programs and content opportunities using advanced AI analysis
      </Typography>

      {/* Search Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Term"
                placeholder="e.g., weekend by the lake, best coffee makers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={searching}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Niche (Optional)"
                placeholder="e.g., outdoor recreation, kitchen appliances"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={searching}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSearch}
                disabled={searching || !searchTerm.trim()}
                startIcon={searching ? <CircularProgress size={20} /> : <Search />}
                sx={{ height: 56 }}
              >
                {searching ? 'Analyzing...' : 'Search & Analyze'}
              </Button>
            </Grid>
          </Grid>
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
          {/* Search Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Search Results for "{result.data.search_term}"
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={`${result.data.total_programs} Programs Found`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`Category: ${result.data.analysis.category.replace('_', ' ').toUpperCase()}`}
                  color="secondary"
                  variant="outlined"
                />
                <Chip
                  label={`Competition: ${result.data.analysis.competition_level}`}
                  color="default"
                  variant="outlined"
                />
                <Chip
                  label={`Earnings: ${result.data.analysis.earnings_potential}`}
                  color="success"
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>

          {/* AI Analysis Display */}
          <LLMAnalysisDisplay analysis={result.data.analysis} />

          {/* Web Search Programs */}
          {result.data.programs.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MonetizationOn color="primary" />
                  Web Search Results ({result.data.programs.length} programs)
                </Typography>
                
                <Grid container spacing={2}>
                  {result.data.programs.map((program: any, index: number) => (
                    <Grid item xs={12} sm={6} md={4} key={program.id || index}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #e0e0e0',
                          borderRadius: 2,
                          height: '100%',
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          {program.name}
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
                            color="default"
                            variant="outlined"
                          />
                          <Chip
                            label={program.affiliate_network}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary">
                          {program.estimated_earnings} • {program.payment_terms}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Example Searches */}
      {!result && !searching && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Try These Example Searches
            </Typography>
            <Grid container spacing={2}>
              {[
                'weekend by the lake',
                'best coffee makers 2024',
                'fitness apps for beginners',
                'smart home automation',
                'homemade pizza recipes',
              ].map((example, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setSearchTerm(example);
                      setNiche('');
                    }}
                    sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                  >
                    {example}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
