/**
 * Topic Decomposition Step Component
 * Handles the first step of the enhanced workflow - decomposing search queries into subtopics
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
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Psychology, ArrowForward } from '@mui/icons-material';
import { useTopicDecomposition } from '../../hooks/useWorkflow';
import { WorkflowStepProps } from '../../types/workflow';

const TopicDecompositionStep: React.FC<WorkflowStepProps> = React.memo(({
  onNext,
  onBack,
  data,
  loading = false,
  error,
}) => {
  const [searchQuery, setSearchQuery] = useState(data?.searchQuery || '');
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);

  const topicDecompositionMutation = useTopicDecomposition();

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    topicDecompositionMutation.mutate({
      searchQuery: searchQuery.trim(),
      sessionId: data?.sessionId || 'temp-session',
    });
  };

  const handleSubtopicToggle = (subtopicId: string) => {
    setSelectedSubtopics(prev =>
      prev.includes(subtopicId)
        ? prev.filter(id => id !== subtopicId)
        : [...prev, subtopicId]
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Psychology sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          🧠 Topic Decomposition
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Enter your search query and let AI break it down into relevant subtopics for deeper analysis.
      </Typography>

      {/* Search Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Search Query
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Enter your search query"
              placeholder="e.g., Cars for the east coast"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={topicDecompositionMutation.isPending || loading}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={!searchQuery.trim() || topicDecompositionMutation.isPending || loading}
              startIcon={topicDecompositionMutation.isPending ? <CircularProgress size={20} /> : <Psychology />}
              sx={{ minWidth: 120 }}
            >
              {topicDecompositionMutation.isPending ? 'Analyzing...' : 'Analyze'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {(error || topicDecompositionMutation.isError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || topicDecompositionMutation.error?.message || 'Failed to decompose topic. Please try again.'}
        </Alert>
      )}

      {/* Results */}
      {topicDecompositionMutation.isSuccess && topicDecompositionMutation.data && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generated Subtopics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select the subtopics you want to explore further:
            </Typography>

            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <FormGroup>
                <Grid container spacing={2}>
                  {topicDecompositionMutation.data.subtopics.map((subtopic, index) => (
                    <Grid item xs={12} md={6} key={subtopic.name}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedSubtopics.includes(subtopic.name)}
                            onChange={() => handleSubtopicToggle(subtopic.name)}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle1" gutterBottom>
                              {subtopic.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {subtopic.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip
                                label={`Relevance: ${Math.round(subtopic.relevanceScore * 100)}%`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
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
          onClick={handleBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={loading || selectedSubtopics.length === 0}
          endIcon={<ArrowForward />}
        >
          Continue to Affiliate Research
        </Button>
      </Box>
    </Box>
  );
});

TopicDecompositionStep.displayName = 'TopicDecompositionStep';

export default TopicDecompositionStep;