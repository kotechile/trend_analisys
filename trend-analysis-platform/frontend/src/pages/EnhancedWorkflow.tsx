import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Link,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search,
  TrendingUp,
  Lightbulb,
  Code,
  OpenInNew,
  Upload,
  Download,
  CheckCircle,
  RadioButtonUnchecked,
  Analytics,
  ContentCopy
} from '@mui/icons-material';
import EnhancedTopicDecompositionStep from '../components/workflow/EnhancedTopicDecompositionStep';

interface Trend {
  trend_id: string;
  topic: string;
  search_volume: number;
  trend_direction: string;
  competition: string;
  opportunity_score: number;
  source: string;
}

interface Keyword {
  keyword: string;
  intent: string;
  difficulty: number;
  search_volume: number;
  related_keywords: string[];
  content_angles: string[];
  category: string;
}

const EnhancedWorkflow = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Workflow results
  const [affiliateResults, setAffiliateResults] = useState<any>(null);
  const [trendResults, setTrendResults] = useState<any>(null);
  const [contentResults, setContentResults] = useState<any>(null);
  const [selectedTrends, setSelectedTrends] = useState<string[]>([]);
  const [seedKeywords, setSeedKeywords] = useState<Keyword[]>([]);
  const [externalKeywords, setExternalKeywords] = useState<Keyword[]>([]);
  const [keywordClusters, setKeywordClusters] = useState<any[]>([]);

  const steps = [
    'Enhanced Topic Decomposition',
    'Affiliate Research',
    'Trend Analysis',
    'Trend Selection',
    'Content Generation',
    'Keyword Enhancement',
    'External Tool Integration',
    'Final Strategy'
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setProgress('🚀 Starting enhanced workflow...');

    try {
      // Step 1: Enhanced Topic Decomposition (handled by component)
      setActiveStep(0);
      setProgress('🧠 Analyzing topic with enhanced decomposition...');
      
      // Wait for user to complete topic decomposition
      setLoading(false);
      return;

    } catch (error) {
      setError(`Workflow error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicDecompositionComplete = async (enhancedTopic: string) => {
    setSearchTerm(enhancedTopic);
    setLoading(true);
    setError(null);
    setProgress('🔍 Performing affiliate research...');

    try {
      // Step 2: Affiliate Research
      setActiveStep(1);
      const affiliateResponse = await fetch('http://localhost:8000/api/affiliate-research/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_term: enhancedTopic,
          niche: niche || null,
          budget_range: 'any',
          user_id: 'test_user_id'
        }),
      });

      if (affiliateResponse.ok) {
        const affiliateData = await affiliateResponse.json();
        setAffiliateResults(affiliateData.data);
      }

      // Step 3: Trend Analysis
      setActiveStep(2);
      setProgress('📊 Analyzing trends...');
      const trendResponse = await fetch('http://localhost:8000/api/workflow/complete-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_term: enhancedTopic,
          niche: niche || null,
          budget_range: 'any',
          user_id: 'test_user_id'
        }),
      });

      if (trendResponse.ok) {
        const trendData = await trendResponse.json();
        setTrendResults(trendData.data);
      }

      setActiveStep(3);
      setProgress('✅ Workflow completed! Ready for trend selection.');

    } catch (error) {
      setError(`Workflow error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTrendSelection = (trendId: string) => {
    setSelectedTrends(prev => 
      prev.includes(trendId) 
        ? prev.filter(id => id !== trendId)
        : [...prev, trendId]
    );
  };

  const handleGenerateKeywords = async () => {
    if (selectedTrends.length === 0) {
      setError('Please select at least one trend');
      return;
    }

    setLoading(true);
    setProgress('🔍 Generating seed keywords...');

    try {
      const response = await fetch('http://localhost:8000/api/keywords/generate-seed-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_term: searchTerm,
          selected_trends: selectedTrends,
          content_ideas: contentResults?.content_ideas?.map((idea: any) => idea.title) || [],
          user_id: 'test_user_id'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSeedKeywords(data.data.categorized_keywords.primary || []);
        setActiveStep(4);
        setProgress('✅ Seed keywords generated!');
      }
    } catch (error) {
      setError(`Keyword generation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setProgress('📤 Uploading external keyword data...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tool_name', 'ahrefs');
      formData.append('search_term', searchTerm);
      formData.append('user_id', 'test_user_id');

      const response = await fetch('http://localhost:8000/api/keywords/upload-external-results', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setExternalKeywords(data.data.keywords_processed || []);
        setActiveStep(5);
        setProgress('✅ External keyword data processed!');
      }
    } catch (error) {
      setError(`File upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportKeywords = async (toolName: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/keywords/export-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_term: searchTerm,
          tool_name: toolName,
          user_id: 'test_user_id'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Download CSV
        const blob = new Blob([data.csv_content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      setError(`Export error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getAvailableTrends = (): Trend[] => {
    if (!trendResults?.trend_results?.trending_topics) return [];
    return trendResults.trend_results.trending_topics.map((topic: any) => ({
      trend_id: topic.id || `trend_${Math.random()}`,
      topic: topic.topic,
      search_volume: topic.search_volume || 0,
      trend_direction: topic.trend_direction || 'stable',
      competition: topic.competition || 'Medium',
      opportunity_score: topic.opportunity_score || 50,
      source: 'llm_analysis'
    }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <EnhancedTopicDecompositionStep
            initialTopic={searchTerm}
            onTopicSelected={handleTopicDecompositionComplete}
          />
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Affiliate Research Results</Typography>
            {affiliateResults?.programs ? (
              <Grid container spacing={2}>
                {affiliateResults.programs.slice(0, 6).map((program: any, index: number) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" component="div">
                          <Link href={program.link} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center' }}>
                            {program.name} <OpenInNew sx={{ fontSize: 16, ml: 0.5 }} />
                          </Link>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">{program.description}</Typography>
                        <Chip label={program.category} size="small" sx={{ mt: 1, mr: 0.5 }} />
                        <Chip label={`Commission: ${program.commission}`} size="small" sx={{ mt: 1 }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">No affiliate programs found.</Typography>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Trend Analysis Results</Typography>
            {trendResults?.trend_results?.trending_topics ? (
              <Grid container spacing={2}>
                {trendResults.trend_results.trending_topics.slice(0, 6).map((topic: any, index: number) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">{topic.topic}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Score: {topic.opportunity_score}, Direction: {topic.trend_direction}
                        </Typography>
                        <Chip label={topic.trend_angle} size="small" sx={{ mt: 1, mr: 0.5 }} />
                        <Chip label={`Competition: ${topic.competition}`} size="small" sx={{ mt: 1 }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">No trending topics found.</Typography>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Select Trends for Content Generation</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose the trends you want to focus on for content and software ideas.
            </Typography>
            <FormGroup>
              {getAvailableTrends().map((trend) => (
                <FormControlLabel
                  key={trend.trend_id}
                  control={
                    <Checkbox
                      checked={selectedTrends.includes(trend.trend_id)}
                      onChange={() => handleTrendSelection(trend.trend_id)}
                      icon={<RadioButtonUnchecked />}
                      checkedIcon={<CheckCircle />}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">{trend.topic}</Typography>
                      <Chip label={`Score: ${trend.opportunity_score}`} size="small" />
                      <Chip label={trend.trend_direction} size="small" color="primary" />
                    </Box>
                  }
                />
              ))}
            </FormGroup>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleGenerateKeywords}
                disabled={selectedTrends.length === 0}
                startIcon={<Analytics />}
              >
                Generate Keywords ({selectedTrends.length} trends selected)
              </Button>
            </Box>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Content Ideas Generated</Typography>
            {contentResults?.content_ideas ? (
              <Grid container spacing={2}>
                {contentResults.content_ideas.slice(0, 4).map((idea: any, index: number) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">{idea.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{idea.description}</Typography>
                        <Chip label={`Difficulty: ${idea.difficulty_level}`} size="small" sx={{ mt: 1, mr: 0.5 }} />
                        <Chip label={`SEO Score: ${idea.seo_potential_score}/10`} size="small" sx={{ mt: 1 }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">No content ideas generated yet.</Typography>
            )}
          </Box>
        );

      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Seed Keywords Generated</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Based on your selected trends, here are the seed keywords for external tool analysis.
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Keyword</TableCell>
                    <TableCell>Intent</TableCell>
                    <TableCell>Difficulty</TableCell>
                    <TableCell>Volume</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {seedKeywords.slice(0, 10).map((keyword, index) => (
                    <TableRow key={index}>
                      <TableCell>{keyword.keyword}</TableCell>
                      <TableCell>
                        <Chip label={keyword.intent} size="small" />
                      </TableCell>
                      <TableCell>{keyword.difficulty}</TableCell>
                      <TableCell>{keyword.search_volume.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={keyword.category} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Copy keyword">
                          <IconButton size="small" onClick={() => navigator.clipboard.writeText(keyword.keyword)}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => handleExportKeywords('ahrefs')}
              >
                Export for Ahrefs
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => handleExportKeywords('semrush')}
              >
                Export for Semrush
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => handleExportKeywords('ubersuggest')}
              >
                Export for Ubersuggest
              </Button>
            </Box>
          </Box>
        );

      case 6:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>External Tool Integration</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload your keyword analysis results from external tools (Ahrefs, Semrush, etc.)
            </Typography>
            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Upload External Results</Typography>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ marginBottom: '16px' }}
              />
              <Typography variant="caption" color="text.secondary">
                Supported formats: Ahrefs, Semrush, Ubersuggest CSV exports
              </Typography>
            </Card>
            {externalKeywords.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Processed Keywords ({externalKeywords.length})
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Keyword</TableCell>
                        <TableCell>Volume</TableCell>
                        <TableCell>Difficulty</TableCell>
                        <TableCell>Competition</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {externalKeywords.slice(0, 10).map((keyword, index) => (
                        <TableRow key={index}>
                          <TableCell>{keyword.keyword}</TableCell>
                          <TableCell>{keyword.search_volume?.toLocaleString() || 'N/A'}</TableCell>
                          <TableCell>{keyword.difficulty || 'N/A'}</TableCell>
                          <TableCell>{keyword.competition || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        );

      case 7:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Final Strategy Summary</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Selected Trends</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedTrends.length} trends selected for content generation
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Keywords Generated</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {seedKeywords.length} seed keywords + {externalKeywords.length} external keywords
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>🚀 Enhanced Research Workflow</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Complete workflow: Affiliate Research → Trend Analysis → Trend Selection → Content Generation → Keyword Enhancement → External Tool Integration
      </Typography>

      {/* Search Form */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Main Topic (e.g., 'eco-friendly homes')"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Niche (optional)"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                disabled={loading || !searchTerm.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <Search />}
              >
                {loading ? (progress || 'Running Workflow...') : 'Start Enhanced Workflow'}
              </Button>
            </Grid>
          </Grid>
          {loading && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">{progress}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Workflow Stepper */}
      {affiliateResults && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Stepper activeStep={activeStep} orientation="horizontal">
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <Divider sx={{ my: 2 }} />
            {renderStepContent(activeStep)}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EnhancedWorkflow;

