import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Search,
  TrendingUp,
  Article,
  Code,
  CheckCircle,
  ExpandMore,
  OpenInNew,
  Refresh
} from '@mui/icons-material';

interface AffiliateProgram {
  id: string;
  name: string;
  description: string;
  commission: string;
  category: string;
  difficulty: string;
  link?: string;
}

interface TrendingTopic {
  id: string;
  topic: string;
  search_volume: number;
  trend_direction: string;
  competition: string;
  opportunity_score: number;
  related_keywords: string[];
  content_ideas: string[];
  trend_angle: string;
  target_audience: string;
  seasonality: string;
  difficulty: string;
}

interface ContentIdea {
  title: string;
  description: string;
  target_audience: string;
  content_angle: string;
  suggested_affiliate_programs: string[];
  estimated_word_count: number;
  difficulty_level: string;
  seo_potential_score: number;
  trending_topic_id: string;
  content_outline: string[];
}

interface SoftwareIdea {
  name: string;
  description: string;
  target_market: string;
  core_features: string[];
  technology_stack: string[];
  development_complexity: string;
  monetization_strategy: string;
  affiliate_integration: string;
  market_potential_score: number;
  development_timeline: string;
  trending_topic_id: string;
}

const IntegratedWorkflow: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [niche, setNiche] = useState('');
  const [budgetRange, setBudgetRange] = useState('any');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [activeStep, setActiveStep] = useState(0);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [selectedTrends, setSelectedTrends] = useState<string[]>([]);
  const [contentType, setContentType] = useState('both');
  const [error, setError] = useState<string | null>(null);

  const steps = [
    'Affiliate Research',
    'Trend Analysis',
    'Content Generation',
    'Review & Select'
  ];

  const handleCompleteWorkflow = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setProgress('🔍 Starting complete research workflow...');
    setActiveStep(0);

    try {
      const progressSteps = [
        '🔍 Researching affiliate programs...',
        '📊 Analyzing trends...',
        '✨ Generating content ideas...',
        '📋 Finalizing results...'
      ];

      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < progressSteps.length - 1) {
          stepIndex++;
          setProgress(progressSteps[stepIndex]);
          setActiveStep(stepIndex);
        }
      }, 2000);

      const response = await fetch('http://localhost:8000/api/workflow/complete-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_term: searchTerm,
          niche: niche || null,
          budget_range: budgetRange,
        }),
      });

      clearInterval(progressInterval);
      setProgress('✅ Workflow completed!');
      setActiveStep(3);

      if (response.ok) {
        const data = await response.json();
        setWorkflowData(data.data);
        
        // Auto-select top trends
        const trends = data.data.trend_results?.trending_topics || [];
        const topTrends = trends.slice(0, 3).map((t: TrendingTopic) => t.id);
        setSelectedTrends(topTrends);
      } else {
        const errorData = await response.json();
        setError(`Workflow failed: ${errorData.detail || response.statusText}`);
        setProgress('❌ Workflow failed');
      }
    } catch (error) {
      setError(`Workflow error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProgress('❌ Workflow failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!workflowData || selectedTrends.length === 0) return;

    setLoading(true);
    setError(null);
    setProgress('✨ Generating content for selected trends...');

    try {
      const affiliatePrograms = workflowData.affiliate_results?.data?.programs || [];
      
      const response = await fetch('http://localhost:8000/api/workflow/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_term: searchTerm,
          selected_trends: selectedTrends,
          affiliate_programs: affiliatePrograms,
          content_type: contentType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWorkflowData(prev => ({
          ...prev,
          content_results: data.data.content_results
        }));
        setProgress('✅ Content generated successfully!');
      } else {
        const errorData = await response.json();
        setError(`Content generation failed: ${errorData.detail || response.statusText}`);
      }
    } catch (error) {
      setError(`Content generation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrendSelection = (trendId: string) => {
    setSelectedTrends(prev => 
      prev.includes(trendId) 
        ? prev.filter(id => id !== trendId)
        : [...prev, trendId]
    );
  };

  const getTrendDirectionColor = (direction: string) => {
    switch (direction) {
      case 'rising': return 'success';
      case 'falling': return 'error';
      case 'volatile': return 'warning';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🚀 Integrated Research Workflow
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Complete research workflow: Affiliate Research → Trend Analysis → Content Generation
      </Typography>

      {/* Search Form */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Term"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                placeholder="e.g., outdoor hiking gear"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Niche (optional)"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                disabled={loading}
                placeholder="e.g., outdoor recreation"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Budget Range</InputLabel>
                <Select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  disabled={loading}
                >
                  <MenuItem value="any">Any</MenuItem>
                  <MenuItem value="low">Low ($0-100)</MenuItem>
                  <MenuItem value="medium">Medium ($100-500)</MenuItem>
                  <MenuItem value="high">High ($500+)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleCompleteWorkflow}
                disabled={loading || !searchTerm.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <Search />}
              >
                {loading ? (progress || 'Starting...') : 'Start Workflow'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Progress Stepper */}
      {loading && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {progress}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results Display */}
      {workflowData && (
        <Box>
          {/* Affiliate Programs */}
          {workflowData.affiliate_results?.data?.programs && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💰 Affiliate Programs Found ({workflowData.affiliate_results.data.programs.length})
                </Typography>
                <Grid container spacing={2}>
                  {workflowData.affiliate_results.data.programs.slice(0, 5).map((program: AffiliateProgram) => (
                    <Grid item xs={12} md={6} key={program.id}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {program.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {program.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label={program.commission} size="small" color="primary" />
                          <Chip label={program.category} size="small" />
                          <Chip 
                            label={program.difficulty} 
                            size="small" 
                            color={getDifficultyColor(program.difficulty) as any}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Trending Topics */}
          {workflowData.trend_results?.trending_topics && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📈 Trending Topics ({workflowData.trend_results.trending_topics.length})
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select the trends you want to generate content for:
                </Typography>
                <Grid container spacing={2}>
                  {workflowData.trend_results.trending_topics.map((topic: TrendingTopic) => (
                    <Grid item xs={12} md={6} key={topic.id}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          cursor: 'pointer',
                          border: selectedTrends.includes(topic.id) ? 2 : 1,
                          borderColor: selectedTrends.includes(topic.id) ? 'primary.main' : 'divider'
                        }}
                        onClick={() => toggleTrendSelection(topic.id)}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle1">
                            {topic.topic}
                          </Typography>
                          <Checkbox 
                            checked={selectedTrends.includes(topic.id)}
                            onChange={() => toggleTrendSelection(topic.id)}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {topic.target_audience}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            label={topic.trend_direction} 
                            size="small" 
                            color={getTrendDirectionColor(topic.trend_direction) as any}
                          />
                          <Chip label={`${topic.opportunity_score}/100`} size="small" />
                          <Chip label={topic.competition} size="small" />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Content Generation Controls */}
          {workflowData.trend_results?.trending_topics && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ✨ Content Generation
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Content Type</InputLabel>
                      <Select
                        value={contentType}
                        onChange={(e) => setContentType(e.target.value)}
                        disabled={loading}
                      >
                        <MenuItem value="blog">Blog Posts Only</MenuItem>
                        <MenuItem value="software">Software Ideas Only</MenuItem>
                        <MenuItem value="both">Both Blog & Software</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Selected Trends: {selectedTrends.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleGenerateContent}
                      disabled={loading || selectedTrends.length === 0}
                      startIcon={loading ? <CircularProgress size={20} /> : <Article />}
                    >
                      Generate Content
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Generated Content Ideas */}
          {workflowData.content_results?.content_ideas && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📝 Blog Content Ideas ({workflowData.content_results.content_ideas.length})
                </Typography>
                {workflowData.content_results.content_ideas.map((idea: ContentIdea, index: number) => (
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="subtitle1">{idea.title}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip label={`${idea.estimated_word_count} words`} size="small" />
                          <Chip 
                            label={idea.difficulty_level} 
                            size="small" 
                            color={getDifficultyColor(idea.difficulty_level) as any}
                          />
                          <Chip label={`SEO: ${idea.seo_potential_score}/10`} size="small" />
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {idea.description}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        Target Audience: {idea.target_audience}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        Content Angle: {idea.content_angle}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        Suggested Affiliate Programs:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {idea.suggested_affiliate_programs.map((program, idx) => (
                          <Chip key={idx} label={program} size="small" />
                        ))}
                      </Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Content Outline:
                      </Typography>
                      <List dense>
                        {idea.content_outline.map((point, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={`${idx + 1}. ${point}`} />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Generated Software Ideas */}
          {workflowData.content_results?.software_ideas && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💻 Software Application Ideas ({workflowData.content_results.software_ideas.length})
                </Typography>
                {workflowData.content_results.software_ideas.map((idea: SoftwareIdea, index: number) => (
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="subtitle1">{idea.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip 
                            label={idea.development_complexity} 
                            size="small" 
                            color={getDifficultyColor(idea.development_complexity) as any}
                          />
                          <Chip label={idea.development_timeline} size="small" />
                          <Chip label={`Market: ${idea.market_potential_score}/10`} size="small" />
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {idea.description}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        Target Market: {idea.target_market}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        Core Features:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {idea.core_features.map((feature, idx) => (
                          <Chip key={idx} label={feature} size="small" />
                        ))}
                      </Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Technology Stack:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {idea.technology_stack.map((tech, idx) => (
                          <Chip key={idx} label={tech} size="small" color="primary" />
                        ))}
                      </Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Monetization Strategy: {idea.monetization_strategy}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        Affiliate Integration: {idea.affiliate_integration}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
};

export default IntegratedWorkflow;

