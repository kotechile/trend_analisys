/**
 * Trend Analysis Step Component
 * Handles trend analysis for selected subtopics
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
  LinearProgress,
} from '@mui/material';
import { TrendingUp, ArrowForward, ArrowBack } from '@mui/icons-material';
import { useTrendAnalysis } from '../../hooks/useWorkflow';
import { WorkflowStepProps } from '../../types/workflow';

const TrendAnalysisStep: React.FC<WorkflowStepProps> = React.memo(({
  onNext,
  onBack,
  data,
  loading = false,
  error,
}) => {
  const [selectedTrends, setSelectedTrends] = useState<string[]>([]);

  const trendAnalysisMutation = useTrendAnalysis();

  const handleAnalyze = () => {
    if (!data?.selectedSubtopics || data.selectedSubtopics.length === 0) return;

    trendAnalysisMutation.mutate({
      subtopicIds: data.selectedSubtopics,
      sessionId: data?.sessionId || 'temp-session',
    });
  };

  const handleTrendToggle = (trendId: string) => {
    setSelectedTrends(prev =>
      prev.includes(trendId)
        ? prev.filter(id => id !== trendId)
        : [...prev, trendId]
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

  // Auto-trigger analysis when component mounts if we have subtopics
  React.useEffect(() => {
    if (data?.selectedSubtopics && data.selectedSubtopics.length > 0) {
      handleAnalyze();
    }
  }, [data?.selectedSubtopics]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TrendingUp sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          📈 Trend Analysis
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Analyzing trends and search patterns for your selected subtopics...
      </Typography>

      {/* Loading State */}
      {trendAnalysisMutation.isPending && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
              <CircularProgress sx={{ mr: 2 }} />
              <Typography>Analyzing trends...</Typography>
            </Box>
            <LinearProgress sx={{ mt: 2 }} />
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {(error || trendAnalysisMutation.isError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || trendAnalysisMutation.error?.message || 'Failed to analyze trends. Please try again.'}
        </Alert>
      )}

      {/* Results */}
      {trendAnalysisMutation.isSuccess && trendAnalysisMutation.data && (
        <Box>
          {/* Trend Data */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trend Data
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select the trends you want to focus on:
              </Typography>

              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <FormGroup>
                  <Grid container spacing={2}>
                    {trendAnalysisMutation.data.trendData.map((trend, index) => (
                      <Grid item xs={12} md={6} key={trend.keyword}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedTrends.includes(trend.keyword)}
                              onChange={() => handleTrendToggle(trend.keyword)}
                            />
                          }
                          label={
                            <Paper sx={{ p: 2, width: '100%' }}>
                              <Typography variant="subtitle1" gutterBottom>
                                {trend.keyword}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                <Chip
                                  label={`Volume: ${trend.searchVolume.toLocaleString()}`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                <Chip
                                  label={trend.trendDirection}
                                  size="small"
                                  color={
                                    trend.trendDirection === 'rising' ? 'success' :
                                    trend.trendDirection === 'falling' ? 'error' : 'default'
                                  }
                                  variant="outlined"
                                />
                                <Chip
                                  label={trend.competition}
                                  size="small"
                                  color={
                                    trend.competition === 'low' ? 'success' :
                                    trend.competition === 'medium' ? 'warning' : 'error'
                                  }
                                  variant="outlined"
                                />
                                <Chip
                                  label={`Score: ${trend.opportunityScore}/100`}
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                />
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

          {/* Insights */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Insights
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {trendAnalysisMutation.data.insights.map((insight, index) => (
                  <Chip
                    key={index}
                    label={insight}
                    color="info"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
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
          disabled={loading || selectedTrends.length === 0}
        >
          Continue to Content Generation
        </Button>
      </Box>
    </Box>
  );
});

TrendAnalysisStep.displayName = 'TrendAnalysisStep';

export default TrendAnalysisStep;