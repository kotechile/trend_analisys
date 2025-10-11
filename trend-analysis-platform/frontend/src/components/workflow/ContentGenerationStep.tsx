/**
 * Content Generation Step Component
 * Handles content idea generation based on trends and affiliate offers
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
  FormControl as MuiFormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Article, ArrowForward, ArrowBack } from '@mui/icons-material';
import { useContentGeneration } from '../../hooks/useWorkflow';
import { WorkflowStepProps } from '../../types/workflow';

const ContentGenerationStep: React.FC<WorkflowStepProps> = React.memo(({
  onNext,
  onBack,
  data,
  loading = false,
  error,
}) => {
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [contentType, setContentType] = useState<'blog_post' | 'software_idea' | 'both'>('both');

  const contentGenerationMutation = useContentGeneration();

  const handleGenerate = () => {
    if (!data?.selectedTrends || data.selectedTrends.length === 0) return;

    contentGenerationMutation.mutate({
      trendIds: data.selectedTrends,
      affiliateOfferIds: data?.selectedOffers || [],
      contentType: contentType === 'both' ? undefined : contentType,
      sessionId: data?.sessionId || 'temp-session',
    });
  };

  const handleIdeaToggle = (ideaId: string) => {
    setSelectedIdeas(prev =>
      prev.includes(ideaId)
        ? prev.filter(id => id !== ideaId)
        : [...prev, ideaId]
    );
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // Auto-trigger generation when component mounts if we have trends
  React.useEffect(() => {
    if (data?.selectedTrends && data.selectedTrends.length > 0) {
      handleGenerate();
    }
  }, [data?.selectedTrends]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Article sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          ✍️ Content Generation
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Generating content ideas based on your selected trends and affiliate offers...
      </Typography>

      {/* Content Type Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Content Type
          </Typography>
          <MuiFormControl fullWidth sx={{ maxWidth: 300 }}>
            <InputLabel>Content Type</InputLabel>
            <Select
              value={contentType}
              label="Content Type"
              onChange={(e) => setContentType(e.target.value as any)}
            >
              <MenuItem value="blog_post">Blog Posts</MenuItem>
              <MenuItem value="software_idea">Software Ideas</MenuItem>
              <MenuItem value="both">Both</MenuItem>
            </Select>
          </MuiFormControl>
        </CardContent>
      </Card>

      {/* Loading State */}
      {contentGenerationMutation.isPending && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
              <CircularProgress sx={{ mr: 2 }} />
              <Typography>Generating content ideas...</Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {(error || contentGenerationMutation.isError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || contentGenerationMutation.error?.message || 'Failed to generate content ideas. Please try again.'}
        </Alert>
      )}

      {/* Results */}
      {contentGenerationMutation.isSuccess && contentGenerationMutation.data && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generated {contentGenerationMutation.data.contentIdeas.length} Content Ideas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select the ideas you want to develop further:
            </Typography>

            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <FormGroup>
                <Grid container spacing={2}>
                  {contentGenerationMutation.data.contentIdeas.map((idea) => (
                    <Grid item xs={12} md={6} key={idea.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedIdeas.includes(idea.id)}
                            onChange={() => handleIdeaToggle(idea.id)}
                          />
                        }
                        label={
                          <Paper sx={{ p: 2, width: '100%' }}>
                            <Typography variant="subtitle1" gutterBottom>
                              {idea.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {idea.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                              <Chip
                                label={idea.contentType}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Chip
                                label={idea.priority}
                                size="small"
                                color={
                                  idea.priority === 'high' ? 'error' :
                                  idea.priority === 'medium' ? 'warning' : 'success'
                                }
                                variant="outlined"
                              />
                              <Chip
                                label={idea.status}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              <strong>Target Audience:</strong> {idea.targetAudience}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {idea.keywords.slice(0, 5).map((keyword, index) => (
                                <Chip
                                  key={index}
                                  label={keyword}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                              {idea.keywords.length > 5 && (
                                <Chip
                                  label={`+${idea.keywords.length - 5} more`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Paper>
                        }
                        sx={{ width: '100%', alignItems: 'flex-start' }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>
            </FormControl>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForward />}
          onClick={handleNext}
          disabled={loading || selectedIdeas.length === 0}
        >
          Continue to Keyword Clustering
        </Button>
      </Box>
    </Box>
  );
});

ContentGenerationStep.displayName = 'ContentGenerationStep';

export default ContentGenerationStep;