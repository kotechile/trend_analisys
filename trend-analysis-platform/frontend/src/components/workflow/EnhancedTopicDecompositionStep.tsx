/**
 * Enhanced Topic Decomposition Step Component
 * React component for enhanced topic decomposition with Google Autocomplete integration
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Compare as CompareIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  AutoAwesome as AutoAwesomeIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { useEnhancedTopicDecomposition, useAutocompleteInput } from '../../hooks/useEnhancedTopics';
import {
  EnhancedTopicDecompositionStepProps,
  EnhancedSubtopic,
  SubtopicSource,
  MethodComparisonResponse
} from '../../../../shared/types/enhanced-topics';
import { formatRelevanceScore, formatProcessingTime } from '../../../../shared/utils/autocomplete-helpers';

/**
 * Enhanced Topic Decomposition Step Component
 */
export const EnhancedTopicDecompositionStep: React.FC<EnhancedTopicDecompositionStepProps> = ({
  onSubtopicsGenerated,
  onMethodComparison,
  initialQuery = '',
  maxSubtopics = 6,
  showMethodComparison = true,
  showRelevanceScores = true,
  showSearchVolumeIndicators = true
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const {
    decomposeTopic,
    compareMethods,
    isLoading,
    error,
    data,
    selectedSubtopics,
    selectSubtopic,
    deselectSubtopic,
    toggleSubtopic,
    clearSelectedSubtopics,
    getSubtopicsBySource,
    getHighRelevanceSubtopics,
    getFormattedProcessingTime,
    getEnhancementMethodsDisplay,
    getAutocompleteDataSummary,
    methodComparison,
    showMethodComparison: showMethodComparisonState,
    setShowMethodComparison
  } = useEnhancedTopicDecomposition();

  const {
    value: autocompleteValue,
    setValue: setAutocompleteValue,
    suggestions: autocompleteSuggestions,
    isLoading: isAutocompleteLoading,
    error: autocompleteError,
    isOpen: isAutocompleteOpen,
    highlightedIndex,
    handleInputChange,
    handleSuggestionSelect,
    handleKeyDown,
    handleBlur,
    clearSuggestions
  } = useAutocompleteInput();

  // Sync autocomplete value with query
  useEffect(() => {
    setAutocompleteValue(query);
  }, [query, setAutocompleteValue]);

  // Handle query change
  const handleQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    handleInputChange(newQuery);
  }, [handleInputChange]);

  // Handle autocomplete suggestion select
  const handleAutocompleteSelect = useCallback((suggestion: string) => {
    setQuery(suggestion);
    handleSuggestionSelect(suggestion);
  }, [handleSuggestionSelect]);

  // Handle decompose topic
  const handleDecomposeTopic = useCallback(async () => {
    if (!query.trim()) return;

    setIsDecomposing(true);
    try {
      const result = await decomposeTopic({
        search_query: query.trim(),
        user_id: 'current-user', // In real app, get from auth context
        max_subtopics: maxSubtopics,
        use_autocomplete: true,
        use_llm: true
      });

      if (result.success && onSubtopicsGenerated) {
        onSubtopicsGenerated(result.subtopics);
      }
    } catch (error) {
      console.error('Topic decomposition failed:', error);
    } finally {
      setIsDecomposing(false);
    }
  }, [query, maxSubtopics, decomposeTopic, onSubtopicsGenerated]);

  // Handle method comparison
  const handleMethodComparison = useCallback(async () => {
    if (!query.trim()) return;

    try {
      const result = await compareMethods({
        search_query: query.trim(),
        user_id: 'current-user',
        max_subtopics: maxSubtopics
      });

      if (result.success && onMethodComparison) {
        onMethodComparison(result.comparison);
      }
      setShowComparison(true);
    } catch (error) {
      console.error('Method comparison failed:', error);
    }
  }, [query, maxSubtopics, compareMethods, onMethodComparison]);

  // Handle subtopic selection
  const handleSubtopicToggle = useCallback((subtopic: EnhancedSubtopic) => {
    toggleSubtopic(subtopic);
  }, [toggleSubtopic]);

  // Get source color
  const getSourceColor = useCallback((source: SubtopicSource) => {
    switch (source) {
      case SubtopicSource.LLM:
        return 'primary';
      case SubtopicSource.AUTOCOMPLETE:
        return 'secondary';
      case SubtopicSource.HYBRID:
        return 'success';
      default:
        return 'default';
    }
  }, []);

  // Get source icon
  const getSourceIcon = useCallback((source: SubtopicSource) => {
    switch (source) {
      case SubtopicSource.LLM:
        return <AutoAwesomeIcon />;
      case SubtopicSource.AUTOCOMPLETE:
        return <SearchIcon />;
      case SubtopicSource.HYBRID:
        return <TrendingUpIcon />;
      default:
        return <InfoIcon />;
    }
  }, []);

  // Render subtopic card
  const renderSubtopicCard = useCallback((subtopic: EnhancedSubtopic) => {
    const isSelected = selectedSubtopics.some(s => s.id === subtopic.id);
    const isHighRelevance = subtopic.relevance_score >= 0.8;

    return (
      <Card
        key={subtopic.id}
        sx={{
          mb: 2,
          border: isSelected ? 2 : 1,
          borderColor: isSelected ? 'primary.main' : 'divider',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 2,
            transform: 'translateY(-2px)'
          }
        }}
        onClick={() => handleSubtopicToggle(subtopic)}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="h6" component="h3" sx={{ flex: 1 }}>
              {subtopic.title}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {isSelected && <CheckCircleIcon color="primary" />}
              {isHighRelevance && <StarIcon color="warning" fontSize="small" />}
            </Box>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            <Chip
              icon={getSourceIcon(subtopic.source)}
              label={subtopic.source.toUpperCase()}
              color={getSourceColor(subtopic.source)}
              size="small"
            />
            {showRelevanceScores && (
              <Chip
                label={`${formatRelevanceScore(subtopic.relevance_score)} relevance`}
                color={isHighRelevance ? 'success' : 'default'}
                size="small"
              />
            )}
          </Box>

          {showSearchVolumeIndicators && subtopic.search_volume_indicators.length > 0 && (
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                Search Volume Indicators:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {subtopic.search_volume_indicators.map((indicator, index) => (
                  <Chip
                    key={index}
                    label={indicator}
                    size="small"
                    variant="outlined"
                    color="info"
                  />
                ))}
              </Box>
            </Box>
          )}

          {subtopic.autocomplete_suggestions.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                Related Suggestions:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {subtopic.autocomplete_suggestions.slice(0, 3).map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    size="small"
                    variant="outlined"
                    color="secondary"
                  />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }, [
    selectedSubtopics,
    handleSubtopicToggle,
    getSourceColor,
    getSourceIcon,
    showRelevanceScores,
    showSearchVolumeIndicators
  ]);

  // Render method comparison
  const renderMethodComparison = useCallback((comparison: MethodComparisonResponse) => {
    const methods = [
      { key: 'llm_only', label: 'LLM Only', data: comparison.comparison.llm_only },
      { key: 'autocomplete_only', label: 'Autocomplete Only', data: comparison.comparison.autocomplete_only },
      { key: 'hybrid', label: 'Hybrid', data: comparison.comparison.hybrid }
    ];

    return (
      <Box mt={3}>
        <Typography variant="h5" gutterBottom>
          Method Comparison Results
        </Typography>
        
        <Grid container spacing={2}>
          {methods.map((method) => (
            <Grid item xs={12} md={4} key={method.key}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  {method.label}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {method.data.subtopics.length} subtopics
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {formatProcessingTime(method.data.processing_time)} processing time
                </Typography>
                <List dense>
                  {method.data.subtopics.slice(0, 3).map((subtopic, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={subtopic}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                  {method.data.subtopics.length > 3 && (
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={`+${method.data.subtopics.length - 3} more...`}
                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box mt={2}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Recommendation:</strong> {comparison.recommendation}
            </Typography>
          </Alert>
        </Box>
      </Box>
    );
  }, []);

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Enhanced Topic Decomposition
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Decompose your topic using Google Autocomplete + LLM hybrid approach for more accurate and trending subtopics.
      </Typography>

      {/* Search Input with Autocomplete */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box position="relative">
            <TextField
              fullWidth
              label="Enter your topic for enhanced research"
              placeholder="e.g., fitness equipment, digital marketing, cooking tools"
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              disabled={isLoading || isDecomposing}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            
            {/* Autocomplete Suggestions */}
            {isAutocompleteOpen && autocompleteSuggestions.length > 0 && (
              <Paper
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  maxHeight: 200,
                  overflow: 'auto',
                  border: 1,
                  borderColor: 'divider',
                  borderTop: 0
                }}
              >
                {autocompleteSuggestions.map((suggestion, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      backgroundColor: index === highlightedIndex ? 'action.hover' : 'transparent',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => handleAutocompleteSelect(suggestion)}
                  >
                    <Typography variant="body2">{suggestion}</Typography>
                  </Box>
                ))}
              </Paper>
            )}
          </Box>

          {/* Action Buttons */}
          <Box display="flex" gap={2} mt={2}>
            <Button
              variant="contained"
              onClick={handleDecomposeTopic}
              disabled={!query.trim() || isLoading || isDecomposing}
              startIcon={<SearchIcon />}
            >
              {isDecomposing ? 'Decomposing...' : 'Decompose Topic'}
            </Button>
            
            {showMethodComparison && (
              <Button
                variant="outlined"
                onClick={handleMethodComparison}
                disabled={!query.trim() || isLoading}
                startIcon={<CompareIcon />}
              >
                Compare Methods
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Loading State */}
      {(isLoading || isDecomposing) && (
        <Box mb={3}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {isDecomposing ? 'Decomposing topic...' : 'Loading...'}
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            {error.message || 'An error occurred while processing your request.'}
          </Typography>
        </Alert>
      )}

      {/* Warnings */}
      {data && data.warnings && data.warnings.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" component="div">
            <strong>Service Issues Detected:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              {data.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </Typography>
        </Alert>
      )}

      {/* No Results */}
      {data && !data.success && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            {data.message || 'No subtopics could be generated. Please try a different topic or check if the services are working.'}
          </Typography>
        </Alert>
      )}

      {/* Results */}
      {data && data.success && (
        <Box>
          {/* Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Decomposition Results
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {data.subtopics.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Subtopics Generated
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="secondary">
                      {getFormattedProcessingTime()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Processing Time
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {getEnhancementMethodsDisplay()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Enhancement Methods
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      {selectedSubtopics.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Selected Subtopics
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Subtopics */}
          <Typography variant="h5" gutterBottom>
            Generated Subtopics
          </Typography>
          
          {data.subtopics.map(renderSubtopicCard)}

          {/* Selected Subtopics Summary */}
          {selectedSubtopics.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Selected Subtopics ({selectedSubtopics.length})
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {selectedSubtopics.map((subtopic) => (
                    <Chip
                      key={subtopic.id}
                      label={subtopic.title}
                      onDelete={() => deselectSubtopic(subtopic)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    onClick={clearSelectedSubtopics}
                    startIcon={<CancelIcon />}
                  >
                    Clear Selection
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Method Comparison Results */}
          {showComparison && methodComparison && renderMethodComparison(methodComparison)}
        </Box>
      )}
    </Box>
  );
};

export default EnhancedTopicDecompositionStep;