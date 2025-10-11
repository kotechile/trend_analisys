/**
 * Keyword Clustering Step Component
 * Handles keyword clustering and organization
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
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Category, ArrowForward, ArrowBack } from '@mui/icons-material';
import { useKeywordClustering } from '../../hooks/useWorkflow';
import { WorkflowStepProps } from '../../types/workflow';

const KeywordClusteringStep: React.FC<WorkflowStepProps> = React.memo(({
  onNext,
  onBack,
  data,
  loading = false,
  error,
}) => {
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [algorithm, setAlgorithm] = useState<'kmeans' | 'dbscan' | 'hierarchical'>('kmeans');

  const keywordClusteringMutation = useKeywordClustering();

  const handleCluster = () => {
    if (!data?.selectedIdeas || data.selectedIdeas.length === 0) return;

    // Extract keywords from selected content ideas
    const keywords = data.selectedIdeas.flatMap(idea => 
      data.contentIdeas?.find(ci => ci.id === idea)?.keywords || []
    );

    if (keywords.length === 0) return;

    keywordClusteringMutation.mutate({
      keywords,
      algorithm,
      sessionId: data?.sessionId || 'temp-session',
    });
  };

  const handleClusterToggle = (clusterId: string) => {
    setSelectedClusters(prev =>
      prev.includes(clusterId)
        ? prev.filter(id => id !== clusterId)
        : [...prev, clusterId]
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

  // Auto-trigger clustering when component mounts if we have ideas
  React.useEffect(() => {
    if (data?.selectedIdeas && data.selectedIdeas.length > 0) {
      handleCluster();
    }
  }, [data?.selectedIdeas]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Category sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          🏷️ Keyword Clustering
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Organizing keywords from your content ideas into meaningful clusters...
      </Typography>

      {/* Algorithm Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Clustering Algorithm
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300 }}>
            <InputLabel>Algorithm</InputLabel>
            <Select
              value={algorithm}
              label="Algorithm"
              onChange={(e) => setAlgorithm(e.target.value as any)}
            >
              <MenuItem value="kmeans">K-Means</MenuItem>
              <MenuItem value="dbscan">DBSCAN</MenuItem>
              <MenuItem value="hierarchical">Hierarchical</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Loading State */}
      {keywordClusteringMutation.isPending && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
              <CircularProgress sx={{ mr: 2 }} />
              <Typography>Clustering keywords...</Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {(error || keywordClusteringMutation.isError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || keywordClusteringMutation.error?.message || 'Failed to cluster keywords. Please try again.'}
        </Alert>
      )}

      {/* Results */}
      {keywordClusteringMutation.isSuccess && keywordClusteringMutation.data && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generated {keywordClusteringMutation.data.clusters.length} Keyword Clusters
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select the clusters you want to use for your content strategy:
            </Typography>

            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <FormGroup>
                <Grid container spacing={2}>
                  {keywordClusteringMutation.data.clusters.map((cluster) => (
                    <Grid item xs={12} md={6} key={cluster.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedClusters.includes(cluster.id)}
                            onChange={() => handleClusterToggle(cluster.id)}
                          />
                        }
                        label={
                          <Paper sx={{ p: 2, width: '100%' }}>
                            <Typography variant="subtitle1" gutterBottom>
                              {cluster.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                              <Chip
                                label={`Volume: ${cluster.avgVolume.toLocaleString()}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Chip
                                label={`Difficulty: ${cluster.avgDifficulty}/100`}
                                size="small"
                                color={
                                  cluster.avgDifficulty < 30 ? 'success' :
                                  cluster.avgDifficulty < 70 ? 'warning' : 'error'
                                }
                                variant="outlined"
                              />
                              <Chip
                                label={`CPC: $${cluster.avgCPC.toFixed(2)}`}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Keywords ({cluster.keywords.length}):
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {cluster.keywords.slice(0, 8).map((keyword, index) => (
                                <Chip
                                  key={index}
                                  label={keyword}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                              {cluster.keywords.length > 8 && (
                                <Chip
                                  label={`+${cluster.keywords.length - 8} more`}
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
          disabled={loading || selectedClusters.length === 0}
        >
          Continue to External Tools
        </Button>
      </Box>
    </Box>
  );
});

KeywordClusteringStep.displayName = 'KeywordClusteringStep';

export default KeywordClusteringStep;