/**
 * TrendAnalysisDataForSEO - Enhanced trend analysis page with DataForSEO integration
 * 
 * This page provides rich graphical dashboards for trend visualization and analysis
 * powered by DataForSEO APIs while preserving all existing functionality.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  TrendingUp,
  CompareArrows,
  Lightbulb,
  Refresh
} from '@mui/icons-material';
import { useTrendAnalysis } from '../hooks/useTrendAnalysis';
import { supabaseResearchTopicsService } from '../services/supabaseResearchTopicsService';
import { supabase } from '../lib/supabase';
import TrendChart from '../components/TrendAnalysis/TrendChart';
import TrendMetricsTable from '../components/TrendAnalysis/TrendMetricsTable';
import GeographicAnalysis from '../components/TrendAnalysis/GeographicAnalysis';
import SubtopicComparison from '../components/TrendAnalysis/SubtopicComparison';

interface TrendAnalysisDataForSEOProps {
  className?: string;
  currentResearch?: any;
}

const TrendAnalysisDataForSEO: React.FC<TrendAnalysisDataForSEOProps> = ({ 
  className, 
  currentResearch: propCurrentResearch, 
  onNavigateToTab // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  // State management
  const [selectedResearchId, setSelectedResearchId] = useState<string>('');
  const [researchTopics, setResearchTopics] = useState<any[]>([]);
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
  const [availableSubtopics, setAvailableSubtopics] = useState<string[]>([]);
  const [location, setLocation] = useState<string>('United States');
  const [timeRange, setTimeRange] = useState<string>('12m');
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [newSubtopic, setNewSubtopic] = useState<string>('');
  const [loadingTopics, setLoadingTopics] = useState<boolean>(false);

  // Custom hooks
  const {
    trendData,
    suggestions,
    loading,
    error,
    isFromCache,
    cacheTimestamp,
    fetchTrendData,
    checkCachedData,
    fetchSuggestions,
    compareTrends,
    clearError
  } = useTrendAnalysis();

  // Load research topics on component mount
  useEffect(() => {
    loadResearchTopics();
  }, []);

  // Handle passed research data when component first loads
  useEffect(() => {
    if (propCurrentResearch) {
      console.log('📊 Using passed research data:', propCurrentResearch);
      setSelectedResearchId('current');
      setAvailableSubtopics(propCurrentResearch.subtopics || []);
      setSelectedSubtopics(propCurrentResearch.subtopics || []);
    }
  }, [propCurrentResearch]);

  // Load research topics from database
  const loadResearchTopics = async () => {
    try {
      setLoadingTopics(true);
      console.log('🔍 Loading research topics...');
      
      // First, let's try a direct query to see what's in the database
      console.log('🔍 Direct Supabase query to research_topics...');
      const { data: directTopics, error: directError } = await supabase
        .from('research_topics')
        .select('*')
        .limit(5);
      
      console.log('📊 Direct query result:', { directTopics, directError });
      
      const response = await supabaseResearchTopicsService.listResearchTopics();
      console.log('📊 Research topics loaded:', response.items);
      console.log('📊 Response structure:', response);
      setResearchTopics(response.items);
      
      // If no current research passed and we have topics, select the first one
      if (!propCurrentResearch && response.items.length > 0) {
        const firstTopic = response.items[0];
        console.log('🎯 Auto-selecting first topic:', firstTopic);
        setSelectedResearchId(firstTopic.id);
        await loadSubtopicsForTopic(firstTopic.id);
      } else if (propCurrentResearch) {
        console.log('🎯 Using passed current research:', propCurrentResearch);
      } else {
        console.log('⚠️ No research topics found and no current research passed');
      }
    } catch (error) {
      console.error('❌ Failed to load research topics:', error);
    } finally {
      setLoadingTopics(false);
    }
  };

  // Load subtopics for a selected topic
  const loadSubtopicsForTopic = async (topicId: string) => {
    try {
      console.log('🔍 Loading subtopics for topic ID:', topicId);
      
      // Handle special case for current research
      if (topicId === 'current' && propCurrentResearch) {
        console.log('📊 Using current research subtopics:', propCurrentResearch.subtopics);
        const subtopics = propCurrentResearch.subtopics || [];
        setAvailableSubtopics(subtopics);
        setSelectedSubtopics(subtopics);
        
        // Check for cached data
        if (subtopics.length > 0) {
          await checkCachedData({
            subtopics,
            location,
            timeRange
          });
        }
        return;
      }

      // Get subtopics from topic_decompositions table
      console.log('🔍 Querying topic_decompositions table for topic:', topicId);
      
      // First, let's check what's actually in the topic_decompositions table
      console.log('🔍 Checking all topic_decompositions...');
      const { data: allDecompositions, error: allError } = await supabase
        .from('topic_decompositions')
        .select('*')
        .limit(10);
      
      console.log('📊 All decompositions:', allDecompositions);
      console.log('📊 All decompositions error:', allError);
      
      // Try with research_topic_id first (newer schema)
      let { data: decompositions, error } = await supabase
        .from('topic_decompositions')
        .select('subtopics, research_topic_id, search_query')
        .eq('research_topic_id', topicId)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('📊 Query with research_topic_id result:', { decompositions, error });

      // If no results and error suggests column doesn't exist, try without research_topic_id
      if (error && error.message.includes('research_topic_id')) {
        console.log('⚠️ research_topic_id column not found, trying without it');
        const { data: fallbackDecompositions, error: fallbackError } = await supabase
          .from('topic_decompositions')
          .select('subtopics, search_query')
          .order('created_at', { ascending: false })
          .limit(1);
        
        console.log('📊 Fallback query result:', { fallbackDecompositions, fallbackError });
        
        if (!fallbackError) {
          decompositions = fallbackDecompositions;
          error = null;
        }
      }

      if (error) {
        console.error('❌ Error loading subtopics:', error);
        // Don't return, continue with fallback
      }

      console.log('📊 Final decompositions found:', decompositions);

      let subtopics: string[] = [];
      if (decompositions && decompositions.length > 0) {
        subtopics = decompositions[0].subtopics || [];
        console.log('✅ Loaded subtopics from decompositions:', subtopics);
      } else {
        console.log('⚠️ No subtopics found in decompositions for topic:', topicId);
        // Fallback: try to get subtopics from research_topics table directly
        try {
          const { data: topicData, error: topicError } = await supabase
            .from('research_topics')
            .select('title')
            .eq('id', topicId)
            .single();
          
          console.log('📊 Topic data query result:', { topicData, topicError });
          
          if (!topicError && topicData) {
            // Use the topic title as a single subtopic
            subtopics = [topicData.title];
            console.log('📊 Using topic title as subtopic:', subtopics);
          }
        } catch (fallbackError) {
          console.error('❌ Fallback query failed:', fallbackError);
        }
        
        // No mock data - better to return blank than wrong
        if (subtopics.length === 0) {
          console.log('📊 No subtopics found, returning empty instead of mock data');
        }
      }

      // No mock data fallback - better to return blank than wrong
      if (subtopics.length <= 1) {
        console.log('📊 Limited subtopics available, not adding mock data');
      }
      
      // Note: No need to limit to 5 here - the batching logic in useTrendAnalysis will handle it
      
      setAvailableSubtopics(subtopics);
      setSelectedSubtopics(subtopics); // Default to all subtopics selected
      
      // Check for cached data
      if (subtopics.length > 0) {
        await checkCachedData({
          subtopics,
          location,
          timeRange
        });
      }
    } catch (error) {
      console.error('❌ Error loading subtopics for topic:', error);
    }
  };

  // Handle topic selection change
  const handleTopicChange = async (topicId: string) => {
    console.log('🔄 Topic changed to:', topicId);
    setSelectedResearchId(topicId);
    await loadSubtopicsForTopic(topicId);
  };

  // Time range options
  const timeRangeOptions = [
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '12m', label: '12 Months' },
    { value: '24m', label: '24 Months' }
  ];

  // Location options
  const locationOptions = [
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'Spain',
    'Italy',
    'Japan',
    'Brazil'
  ];

  // Event handlers
  const handleSubtopicToggle = (subtopic: string) => {
    setSelectedSubtopics(prev => 
      prev.includes(subtopic)
        ? prev.filter(s => s !== subtopic)
        : [...prev, subtopic]
    );
  };

  const handleAnalyzeTrends = async () => {
    console.log('🔍 Starting NEW trend analysis...');
    console.log('📝 Selected subtopics:', selectedSubtopics);
    console.log('📍 Location:', location);
    console.log('⏰ Time range:', timeRange);
    
    if (selectedSubtopics.length === 0) {
      console.log('❌ No subtopics selected');
      return;
    }
    
    try {
      console.log('🌐 Calling fetchTrendData for fresh data...');
      await fetchTrendData({
        subtopics: selectedSubtopics,
        location,
        timeRange
      });
      console.log('✅ fetchTrendData completed');
    } catch (err) {
      console.error('❌ Error fetching trend data:', err);
    }
  };

  const handleCompareTrends = async () => {
    if (selectedSubtopics.length < 2) return;
    
    try {
      await compareTrends({
        subtopics: selectedSubtopics,
        location,
        timeRange
      });
      setShowComparison(true);
    } catch (err) {
      console.error('Error comparing trends:', err);
    }
  };

  const handleGetSuggestions = async () => {
    if (selectedSubtopics.length === 0) return;
    
    try {
      await fetchSuggestions({
        baseSubtopics: selectedSubtopics,
        maxSuggestions: 10,
        location
      });
      setShowSuggestions(true);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  const handleAddSubtopic = (subtopic: string) => {
    if (subtopic && !availableSubtopics.includes(subtopic)) {
      availableSubtopics.push(subtopic);
    }
    setSelectedSubtopics(prev => [...prev, subtopic]);
    setNewSubtopic('');
  };

  // Check cache when subtopics, location, or timeRange change
  useEffect(() => {
    if (selectedSubtopics.length > 0) {
      checkCachedData({
        subtopics: selectedSubtopics,
        location,
        timeRange
      });
    }
  }, [selectedSubtopics, location, timeRange, checkCachedData]);

  return (
    <Container maxWidth="xl" className={className}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Trend Analysis - DataForSEO
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Enhanced trend analysis powered by DataForSEO APIs for data-driven content decisions
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={clearError}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Research Topic Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Research Topic
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Previous Research</InputLabel>
          <Select
            value={selectedResearchId}
            onChange={(e) => handleTopicChange(e.target.value)}
            disabled={loadingTopics}
          >
            {/* Show current research first if it exists */}
            {propCurrentResearch && (
              <MenuItem value="current">
                {propCurrentResearch.main_topic || propCurrentResearch.title} - Current Research
              </MenuItem>
            )}
            {/* Show other researches */}
            {researchTopics.map((research) => (
              <MenuItem key={research.id} value={research.id}>
                {research.title} - {new Date(research.created_at).toLocaleDateString()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {loadingTopics && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Loading research topics...
            </Typography>
          </Box>
        )}
        
        {/* Debug Button for Testing */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                console.log('🔧 Manual subtopic loading test...');
                if (selectedResearchId) {
                  loadSubtopicsForTopic(selectedResearchId);
                } else {
                  console.log('⚠️ No research ID selected');
                }
              }}
            >
              🔧 Test Load Subtopics
            </Button>
          </Box>
        )}
      </Paper>

      {/* Controls Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Analysis Configuration
        </Typography>
        
        <Grid container spacing={3} alignItems="center">
          {/* Subtopic Selection */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Select Subtopics ({availableSubtopics.length} available)
            </Typography>
            {availableSubtopics.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No subtopics available. Please select a research topic first.
              </Typography>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {availableSubtopics.map((subtopic) => (
                <Chip
                  key={subtopic}
                  label={subtopic}
                  onClick={() => handleSubtopicToggle(subtopic)}
                  color={selectedSubtopics.includes(subtopic) ? 'primary' : 'default'}
                  variant={selectedSubtopics.includes(subtopic) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
            
            {/* Add Custom Subtopic */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Add custom subtopic"
                value={newSubtopic}
                onChange={(e) => setNewSubtopic(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSubtopic(newSubtopic);
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={() => handleAddSubtopic(newSubtopic)}
                disabled={!newSubtopic.trim()}
              >
                Add
              </Button>
            </Box>
          </Grid>

          {/* Location and Time Range */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Location</InputLabel>
              <Select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                label="Location"
              >
                {locationOptions.map((loc) => (
                  <MenuItem key={loc} value={loc}>
                    {loc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Time Range"
              >
                {timeRangeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<TrendingUp />}
            onClick={() => {
              console.log('🔘 Analyze Trends button clicked');
              handleAnalyzeTrends();
            }}
            disabled={selectedSubtopics.length === 0 || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Analyze Trends'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<CompareArrows />}
            onClick={handleCompareTrends}
            disabled={selectedSubtopics.length < 2 || loading}
          >
            Compare Trends
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Lightbulb />}
            onClick={handleGetSuggestions}
            disabled={selectedSubtopics.length === 0 || loading}
          >
            Get Suggestions
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>Debug Information</Typography>
          <Typography variant="body2">
            <strong>Selected Research ID:</strong> {selectedResearchId}<br/>
            <strong>Available Subtopics:</strong> {availableSubtopics.length} items<br/>
            <strong>Selected Subtopics:</strong> {selectedSubtopics.length} items<br/>
            <strong>Research Topics:</strong> {researchTopics.length} items<br/>
            <strong>Current Research:</strong> {propCurrentResearch ? 'Yes' : 'No'}<br/>
            <strong>Available Subtopics List:</strong> {availableSubtopics.join(', ')}<br/>
            <strong>Selected Subtopics List:</strong> {selectedSubtopics.join(', ')}
          </Typography>
        </Paper>
      )}

      {/* Trend Analysis Results */}
      {(() => {
        console.log('🎨 Rendering - trendData:', trendData, 'loading:', loading, 'error:', error);
        return null;
      })()}
      {trendData && trendData.length > 0 ? (
        <>
          {/* Trend Charts */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📊 Trend Analysis Charts ({trendData.length} trends)
            </Typography>
            
            {/* Cache Indicator */}
            {isFromCache && cacheTimestamp && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>📦 Cached Data:</strong> This data was loaded from cache (last updated: {new Date(cacheTimestamp).toLocaleString()}). 
                  Click "Analyze Trends" to fetch fresh data from DataForSEO.
                </Typography>
              </Alert>
            )}
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Interactive charts showing trend progression over time for all selected subtopics
            </Typography>
            <TrendChart data={trendData} />
          </Paper>

          {/* Detailed Metrics Table */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <TrendMetricsTable data={trendData} />
          </Paper>

          {/* Geographic Analysis */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <GeographicAnalysis data={trendData} />
          </Paper>
        </>
      ) : (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {loading ? 'Loading Trend Analysis...' : 'No Trend Data Available'}
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Fetching trend data from DataForSEO...
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Error:</strong> {error}
              </Typography>
            </Alert>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select subtopics and click "Analyze Trends" to see detailed analysis with graphs and metrics
            </Typography>
          )}
        </Paper>
      )}

      {/* Comparison Dialog */}
      <Dialog
        open={showComparison}
        onClose={() => setShowComparison(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Trend Comparison</DialogTitle>
        <DialogContent>
          {trendData && trendData.length > 1 && (
            <SubtopicComparison data={trendData} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowComparison(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Suggestions Dialog */}
      <Dialog
        open={showSuggestions}
        onClose={() => setShowSuggestions(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Trending Subtopic Suggestions</DialogTitle>
        <DialogContent>
          {suggestions && suggestions.length > 0 ? (
            <Grid container spacing={2}>
              {suggestions.map((suggestion: any, index: number) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {suggestion.topic}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip
                          label={suggestion.trending_status}
                          color={
                            suggestion.trending_status === 'TRENDING' ? 'success' :
                            suggestion.trending_status === 'STABLE' ? 'default' : 'warning'
                          }
                          size="small"
                        />
                        <Chip
                          label={`${suggestion.growth_potential}% potential`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                      {suggestion.related_queries && (
                        <Typography variant="body2" color="text.secondary">
                          Related: {suggestion.related_queries.join(', ')}
                        </Typography>
                      )}
                      {suggestion.search_volume && (
                        <Typography variant="body2" color="text.secondary">
                          Search Volume: {suggestion.search_volume.toLocaleString()}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>No suggestions available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSuggestions(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!loading && (!trendData || trendData.length === 0) && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <TrendingUp sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Trend Data Available
          </Typography>
          <Typography color="text.secondary">
            Select subtopics and click "Analyze Trends" to get started
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default TrendAnalysisDataForSEO;