/**
 * Affiliate Research Page
 * Updated component with React Query integration
 */

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  CircularProgress, 
  Alert, 
  Chip, 
  Link,
  Paper
} from '@mui/material';
import { Search, OpenInNew } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { apiService, API_ENDPOINTS } from '../services/api';

interface AffiliateResearchResult {
  ai_analysis: {
    detected_categories: string[];
    content_opportunities: string[];
    ai_generated_subtopics: string[];
  };
  affiliate_programs: Array<{
    id: string;
    name: string;
    description: string;
    commission: string;
    category: string;
    difficulty: string;
    link?: string;
    instructions?: string;
  }>;
  search_metadata: {
    search_term: string;
    niche?: string;
    total_programs_found: number;
    search_duration_ms: number;
  };
}

const AffiliateResearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [niche, setNiche] = useState('');

  const searchMutation = useMutation({
    mutationFn: async (data: { search_term: string; niche?: string }) => {
      return apiService.post<AffiliateResearchResult>(API_ENDPOINTS.AFFILIATE_RESEARCH, data);
    },
  });

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    searchMutation.mutate({
      search_term: searchTerm,
      niche: niche || undefined,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🔍 Affiliate Research
      </Typography>
      
      {/* Search Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Search for Affiliate Programs
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Term"
                placeholder="e.g., weekend by the lake"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={searchMutation.isPending}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Niche (Optional)"
                placeholder="e.g., outdoor recreation"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                disabled={searchMutation.isPending}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                startIcon={searchMutation.isPending ? <CircularProgress size={20} /> : <Search />}
                onClick={handleSearch}
                disabled={!searchTerm.trim() || searchMutation.isPending}
                fullWidth
                sx={{ height: '56px' }}
              >
                {searchMutation.isPending ? 'Searching...' : 'Search'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Display */}
      {searchMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {searchMutation.error?.message || 'Search failed. Please try again.'}
        </Alert>
      )}

      {/* Results */}
      {searchMutation.isSuccess && searchMutation.data && (
        <Box>
          {/* AI Analysis */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🤖 AI Analysis
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Detected Categories:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {searchMutation.data.ai_analysis.detected_categories.map((category, index) => (
                    <Chip key={index} label={category} color="primary" variant="outlined" />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Content Opportunities:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {searchMutation.data.ai_analysis.content_opportunities.map((opportunity, index) => (
                    <Chip key={index} label={opportunity} color="secondary" variant="outlined" />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  AI-Generated Subtopics:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {searchMutation.data.ai_analysis.ai_generated_subtopics.map((subtopic, index) => (
                    <Chip key={index} label={subtopic} color="info" variant="outlined" />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Affiliate Programs */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💰 Affiliate Programs ({searchMutation.data.affiliate_programs.length})
              </Typography>
              
              <Grid container spacing={2}>
                {searchMutation.data.affiliate_programs.map((program, index) => (
                  <Grid item xs={12} md={6} key={program.id || index}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Typography variant="h6" gutterBottom>
                        {program.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {program.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip 
                          label={program.category} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                        <Chip 
                          label={program.difficulty} 
                          size="small" 
                          color={program.difficulty === 'easy' ? 'success' : program.difficulty === 'medium' ? 'warning' : 'error'}
                          variant="outlined" 
                        />
                        <Chip 
                          label={program.commission} 
                          size="small" 
                          color="secondary" 
                          variant="outlined" 
                        />
                      </Box>

                      {program.link && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<OpenInNew />}
                          component={Link}
                          href={program.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Program
                        </Button>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Search Metadata */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Search Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Search Term: <strong>{searchMutation.data.search_metadata.search_term}</strong>
                {searchMutation.data.search_metadata.niche && (
                  <> | Niche: <strong>{searchMutation.data.search_metadata.niche}</strong></>
                )}
                <br />
                Programs Found: <strong>{searchMutation.data.search_metadata.total_programs_found}</strong>
                <br />
                Search Duration: <strong>{searchMutation.data.search_metadata.search_duration_ms}ms</strong>
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default AffiliateResearch;