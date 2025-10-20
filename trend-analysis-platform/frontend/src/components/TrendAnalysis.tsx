import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  Analytics,
  Timeline,
  ArrowBack,
  Add,
  ExpandMore,
  ExpandLess,
  Save,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface TrendAnalysisProps {
  selectedTopicId?: string;
  selectedTopicTitle?: string;
  onNavigateBack?: () => void;
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({
  selectedTopicId: propSelectedTopicId,
  selectedTopicTitle: propSelectedTopicTitle,
  onNavigateBack,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const navigationState = location.state as { selectedTopicId?: string; selectedTopicTitle?: string; subtopics?: string[] } | null;
  
  // State management
  const [researchTopics, setResearchTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [selectedSubtopics, setSelectedSubtopics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSubtopic, setNewSubtopic] = useState('');
  const [showManageSubtopics, setShowManageSubtopics] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
  // Get selected topic ID from props or navigation state
  const selectedTopicId = propSelectedTopicId || navigationState?.selectedTopicId;
  const selectedTopicTitle = propSelectedTopicTitle || navigationState?.selectedTopicTitle;

  // Load research topics on component mount
  useEffect(() => {
    console.log('TrendAnalysis component mounted, loading research topics...');
    loadResearchTopics();
  }, []);

  // Handle pre-selected topic from navigation state immediately
  useEffect(() => {
    if (selectedTopicId && selectedTopicTitle && !selectedTopic) {
      console.log('TrendAnalysis - Setting pre-selected topic immediately:', selectedTopicTitle, 'ID:', selectedTopicId);
      // Create a temporary topic object for the pre-selected topic
      const tempTopic = {
        id: selectedTopicId,
        title: selectedTopicTitle,
        description: `Research topic: ${selectedTopicTitle}`,
        status: 'active',
        version: 1
      };
      setSelectedTopic(tempTopic);
      
      // If we have subtopics from navigation state, use them
      if (navigationState?.subtopics && navigationState.subtopics.length > 0) {
        console.log('TrendAnalysis - Using subtopics from navigation state immediately:', navigationState.subtopics);
        setSubtopics(navigationState.subtopics);
      }
    }
  }, [selectedTopicId, selectedTopicTitle, selectedTopic, navigationState?.subtopics]);

  // Handle pre-selected topic - update with full topic data when researchTopics are loaded
  useEffect(() => {
    if (selectedTopicId && researchTopics.length > 0) {
      const topic = researchTopics.find(t => t.id === selectedTopicId);
      console.log('TrendAnalysis - Looking for topic with ID:', selectedTopicId, 'in topics:', researchTopics.map(t => ({ id: t.id, title: t.title })));
      if (topic) {
        console.log('TrendAnalysis - Found topic in database:', topic);
        // Update the selectedTopic with the full data from database
        setSelectedTopic(topic);
        
        // If we don't have subtopics yet, load them
        if (subtopics.length === 0) {
          if (navigationState?.subtopics && navigationState.subtopics.length > 0 && 
              selectedTopicId === navigationState.selectedTopicId) {
            console.log('TrendAnalysis - Using subtopics from navigation state:', navigationState.subtopics);
            setSubtopics(navigationState.subtopics);
          } else {
            handleTopicChange(selectedTopicId);
          }
        }
      } else {
        console.log('TrendAnalysis - Topic not found for ID:', selectedTopicId);
      }
    }
  }, [selectedTopicId, researchTopics, navigationState?.subtopics, navigationState?.selectedTopicId, subtopics.length]);

  const loadResearchTopics = async () => {
    try {
      setLoading(true);
      const { supabaseResearchTopicsService } = await import('../services/supabaseResearchTopicsService');
      const response = await supabaseResearchTopicsService.listResearchTopics();
      
      // Handle the response format - it might be wrapped in an object
      const topics = Array.isArray(response) ? response : (response?.items || []);
      console.log('TrendAnalysis - Loaded research topics:', topics);
      console.log('TrendAnalysis - Topics count:', topics.length);
      console.log('TrendAnalysis - Topic IDs:', topics.map(t => t.id));
      setResearchTopics(topics);
    } catch (error) {
      console.error('TrendAnalysis - Failed to load research topics:', error);
      setError('Failed to load research topics');
      setResearchTopics([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  const handleTopicChange = async (topicId: string) => {
    console.log('TrendAnalysis - handleTopicChange called with topicId:', topicId);
    const topic = researchTopics.find(t => t.id === topicId);
    console.log('TrendAnalysis - Found topic:', topic);
    setSelectedTopic(topic);
    
    if (topic) {
      // Check if this is the same topic from navigation state and we have subtopics
      if (navigationState?.subtopics && navigationState.subtopics.length > 0 && 
          topicId === navigationState.selectedTopicId) {
        console.log('TrendAnalysis - Using subtopics from navigation state for pre-selected topic:', navigationState.subtopics);
        setSubtopics(navigationState.subtopics);
      } else {
        // Load existing subtopics for this topic from database
        console.log('TrendAnalysis - Loading subtopics for topic:', topic.title, 'with ID:', topic.id);
        await loadSubtopicsForTopic(topic);
      }
    } else {
      console.log('TrendAnalysis - No topic found for ID:', topicId);
    }
  };

  const loadSubtopicsForTopic = async (topic: any) => {
    try {
      console.log('TrendAnalysis - loadSubtopicsForTopic called for topic:', topic.title, 'ID:', topic.id);
      setLoading(true);
      
      if (!user?.id) {
        console.log('TrendAnalysis - No user ID available, using topic title only');
        setSubtopics([topic.title]);
        return;
      }
      
      console.log('TrendAnalysis - User ID available:', user.id);
      
      // Use direct Supabase query (same as Page 2) to get subtopics from the database
      console.log('TrendAnalysis - Querying Supabase directly for subtopics...');
      const { data, error } = await supabase
        .from('topic_decompositions')
        .select('subtopics, research_topic_id, user_id, created_at')
        .eq('research_topic_id', topic.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('TrendAnalysis - Supabase query result:', { data, error });

      if (error) {
        console.error('TrendAnalysis - Error fetching subtopics from Supabase:', error);
        setSubtopics([topic.title]);
        return;
      }

      if (data && data.length > 0) {
        const existingSubtopics = data[0].subtopics || [];
        console.log('TrendAnalysis - Found existing subtopics in database:', existingSubtopics);
        
        if (existingSubtopics.length > 0) {
          // If we have subtopics from the database, use them
          const allSubtopics = [topic.title, ...existingSubtopics];
          setSubtopics(allSubtopics);
          console.log('TrendAnalysis - Loaded subtopics from database:', allSubtopics);
        } else {
          // No subtopics in the data, generate new ones
          console.log('TrendAnalysis - No subtopics in database data, generating new ones...');
          await generateAndStoreSubtopics(topic);
        }
      } else {
        // No data found, generate new subtopics
        console.log('TrendAnalysis - No data found in database, generating new subtopics...');
        await generateAndStoreSubtopics(topic);
      }
    } catch (error) {
      console.error('TrendAnalysis - Failed to load subtopics:', error);
      setSubtopics([topic.title]);
    } finally {
      setLoading(false);
    }
  };

  const generateAndStoreSubtopics = async (topic: any) => {
    try {
      const { affiliateResearchService } = await import('../services/affiliateResearchService');
      
      console.log('TrendAnalysis - Generating subtopics for topic:', topic.title);
      const generatedSubtopics = await affiliateResearchService.decomposeTopic(topic.title, user.id);
      const allSubtopics = [topic.title, ...generatedSubtopics];
      setSubtopics(allSubtopics);
      console.log('TrendAnalysis - Generated subtopics:', allSubtopics);
      
      // Store the generated subtopics in the database for future use
      try {
        await affiliateResearchService.storeSubtopics(
          generatedSubtopics,
          user.id,
          topic.title,
          topic.id
        );
        console.log('TrendAnalysis - Stored generated subtopics in database');
      } catch (storeError) {
        console.error('TrendAnalysis - Failed to store generated subtopics:', storeError);
      }
    } catch (error) {
      console.error('TrendAnalysis - Failed to generate subtopics:', error);
      setSubtopics([topic.title]);
    }
  };

  const openGoogleTrends = (subtopic: string) => {
    // Encode the subtopic for URL
    const encodedSubtopic = encodeURIComponent(subtopic);
    
    // Create Google Trends URL with the subtopic pre-populated
    const googleTrendsUrl = `https://trends.google.com/trends/explore?q=${encodedSubtopic}`;
    
    // Open in new tab
    window.open(googleTrendsUrl, '_blank', 'noopener,noreferrer');
  };

  const openAllGoogleTrends = () => {
    if (!selectedTopic || subtopics.length === 0) return;

    // Open Google Trends for each subtopic
    subtopics.forEach((subtopic, index) => {
      // Add a small delay between opening tabs to avoid browser blocking
      setTimeout(() => {
        openGoogleTrends(subtopic);
      }, index * 500); // 500ms delay between each tab
    });
  };

  const addSubtopic = () => {
    if (newSubtopic.trim() && !subtopics.includes(newSubtopic.trim())) {
      setSubtopics(prev => [...prev, newSubtopic.trim()]);
      setNewSubtopic('');
    }
  };

  const removeSubtopic = (index: number) => {
    const removedSubtopic = subtopics[index];
    setSubtopics(prev => prev.filter((_, i) => i !== index));
    
    // Remove from selected subtopics if it was selected
    if (selectedSubtopics.has(removedSubtopic)) {
      const newSelected = new Set(selectedSubtopics);
      newSelected.delete(removedSubtopic);
      setSelectedSubtopics(newSelected);
    }
  };

  const toggleSubtopicSelection = (subtopic: string) => {
    const newSelected = new Set(selectedSubtopics);
    if (newSelected.has(subtopic)) {
      newSelected.delete(subtopic);
    } else {
      newSelected.add(subtopic);
    }
    setSelectedSubtopics(newSelected);
  };

  const selectAllSubtopics = () => {
    setSelectedSubtopics(new Set(subtopics));
  };

  const clearSelection = () => {
    setSelectedSubtopics(new Set());
  };

  const saveSelectedSubtopics = async () => {
    if (!user?.id || !selectedTopic || selectedSubtopics.size === 0) {
      console.log('Trend Analysis - Cannot save subtopics: missing user, topic, or selected subtopics');
      return;
    }
    
    try {
      const { affiliateResearchService } = await import('../services/affiliateResearchService');
      const subtopicsArray = Array.from(selectedSubtopics);
      
      console.log('Trend Analysis - Saving selected subtopics to database:', {
        subtopics: subtopicsArray,
        userId: user.id,
        mainTopic: selectedTopic.title,
        researchTopicId: selectedTopic.id
      });
      
      // Save subtopics to database
      await affiliateResearchService.storeSubtopics(
        subtopicsArray,
        user.id,
        selectedTopic.title,
        selectedTopic.id
      );
      
      console.log('Trend Analysis - Successfully saved selected subtopics to database');
      setSaveMessage(`Successfully saved ${subtopicsArray.length} selected subtopics!`);
      setTimeout(() => setSaveMessage(null), 3000); // Clear message after 3 seconds
    } catch (error) {
      console.error('Trend Analysis - Failed to save selected subtopics:', error);
      setSaveMessage('Failed to save subtopics. Please try again.');
      setTimeout(() => setSaveMessage(null), 3000); // Clear message after 3 seconds
    }
  };

  const navigateToIdeaBurst = async () => {
    if (selectedSubtopics.size > 1) {
      const subtopicsArray = Array.from(selectedSubtopics);
      const navigationState = {
        selectedTopicId: selectedTopic?.id,
        selectedTopicTitle: selectedTopic?.title,
        selectedSubtopics: subtopicsArray
      };
      
      console.log('Trend Analysis - Navigating to Idea Burst with state:', navigationState);
      console.log('Trend Analysis - Selected subtopics array:', subtopicsArray);
      console.log('Trend Analysis - Selected subtopics size:', selectedSubtopics.size);
      console.log('Trend Analysis - Selected topic:', selectedTopic);
      
      // Save selected subtopics to database before navigation
      await saveSelectedSubtopics();
      
      // Use replace: false to ensure state is passed
      navigate('/idea-burst', {
        state: navigationState
      });
      
      // Also try storing in sessionStorage as backup
      try {
        sessionStorage.setItem('ideaBurstState', JSON.stringify(navigationState));
        console.log('Trend Analysis - Stored state in sessionStorage:', navigationState);
      } catch (e) {
        console.log('Trend Analysis - Failed to store in sessionStorage:', e);
      }
    } else {
      console.log('Trend Analysis - Not enough subtopics selected:', selectedSubtopics.size);
    }
  };


  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading research topics...
        </Typography>
      </Box>
    );
  }

  // Safety check to prevent rendering errors
  if (!Array.isArray(researchTopics)) {
    console.error('researchTopics is not an array:', researchTopics);
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" color="error" sx={{ mt: 2 }}>
          Error loading research topics. Please refresh the page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Trend Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Analyze Google Trends data for your research topics and subtopics to identify trending opportunities.
      </Typography>
      
      {/* Save Message */}
      {saveMessage && (
        <Alert 
          severity={saveMessage.includes('Successfully') ? 'success' : 'error'} 
          sx={{ mb: 2 }}
          onClose={() => setSaveMessage(null)}
        >
          {saveMessage}
        </Alert>
      )}
      
      {/* Google Trends Notice */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Google Trends Integration:</strong> Click the "View Google Trends" buttons to open Google Trends with your subtopics pre-populated. 
          This provides real-time trend data directly from Google.
        </Typography>
      </Alert>

      {/* Navigation back button */}
      {(onNavigateBack || navigationState) && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={onNavigateBack || (() => navigate('/affiliate-research'))}
          >
            Back to Affiliate Research
          </Button>
        </Box>
      )}

      {/* Topic Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Research Topic
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Choose a research topic</InputLabel>
          <Select
            value={selectedTopic?.id || ''}
            onChange={(e) => handleTopicChange(e.target.value)}
            label="Choose a research topic"
            disabled={loading || !Array.isArray(researchTopics)}
          >
            {loading ? (
              <MenuItem disabled>Loading topics...</MenuItem>
            ) : Array.isArray(researchTopics) && researchTopics.length > 0 ? (
              researchTopics.map((topic) => (
                <MenuItem key={topic.id} value={topic.id}>
                  {topic.title}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No topics available</MenuItem>
            )}
            {/* Add the selected topic if it's not in the list yet (for pre-selected topics) */}
            {selectedTopic && !researchTopics.find(t => t.id === selectedTopic.id) && (
              <MenuItem key={selectedTopic.id} value={selectedTopic.id}>
                {selectedTopic.title} (Pre-selected)
              </MenuItem>
            )}
          </Select>
        </FormControl>
        
        {selectedTopic && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Selected: <strong>{selectedTopic.title}</strong>
              {navigationState && (
                <Chip
                  label="Pre-selected from Affiliate Research"
                  color="info"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Chip
              label={`${subtopics.length} subtopics`}
              color="primary"
              size="small"
            />
          </Box>
        )}
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Subtopics Management */}
      {selectedTopic && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Manage Subtopics ({subtopics.length})
            </Typography>
            <IconButton
              onClick={() => setShowManageSubtopics(!showManageSubtopics)}
              aria-label="toggle manage subtopics"
            >
              {showManageSubtopics ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          
          <Collapse in={showManageSubtopics}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add or remove subtopics for trend analysis. These will be used to generate Google Trends links.
            </Typography>
            
            {/* Add new subtopic */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Add new subtopic</InputLabel>
              <Select
                value={newSubtopic}
                onChange={(e) => setNewSubtopic(e.target.value)}
                label="Add new subtopic"
              >
                <MenuItem value="">Select or type a subtopic</MenuItem>
                {/* Add common subtopics based on the main topic */}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={addSubtopic}
              disabled={!newSubtopic.trim()}
            >
              Add Subtopic
            </Button>
          </Box>

            {/* Subtopics List for Management */}
            {subtopics.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {subtopics.map((subtopic, index) => (
                  <Chip
                    key={index}
                    label={subtopic}
                    onDelete={() => removeSubtopic(index)}
                    color="default"
                  />
                ))}
              </Box>
            )}
          </Collapse>


          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Analytics />}
              onClick={openAllGoogleTrends}
              disabled={subtopics.length === 0}
            >
              Open All in Google Trends
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Timeline />}
              onClick={() => {
                // Open Google Trends with the main topic
                if (selectedTopic) {
                  openGoogleTrends(selectedTopic.title);
                }
              }}
              disabled={!selectedTopic}
            >
              View Main Topic Trends
            </Button>
          </Box>
        </Paper>
      )}

      {/* Google Trends Analysis */}
      {selectedTopic && subtopics.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Google Trends Analysis
            </Typography>
            {subtopics.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={selectAllSubtopics}
                  disabled={selectedSubtopics.size === subtopics.length}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={clearSelection}
                  disabled={selectedSubtopics.size === 0}
                >
                  Clear Selection
                </Button>
              </Box>
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select subtopics using checkboxes, then click "View Google Trends" to open Google Trends with that search term pre-populated.
          </Typography>
          
          {selectedSubtopics.size > 0 && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Selected: {selectedSubtopics.size} subtopic{selectedSubtopics.size !== 1 ? 's' : ''}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={saveSelectedSubtopics}
                  startIcon={<Save />}
                  size="small"
                  disabled={selectedSubtopics.size === 0}
                >
                  Save Selection ({selectedSubtopics.size})
                </Button>
                {selectedSubtopics.size > 1 && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={navigateToIdeaBurst}
                    startIcon={<Analytics />}
                    size="small"
                  >
                    Go to Idea Burst ({selectedSubtopics.size} subtopics)
                  </Button>
                )}
              </Box>
            </Box>
          )}
          
          <Grid container spacing={2}>
            {subtopics.map((subtopic) => (
              <Grid item xs={12} md={6} lg={4} key={subtopic}>
                <Card sx={{ height: '100%', border: selectedSubtopics.has(subtopic) ? 2 : 1, borderColor: selectedSubtopics.has(subtopic) ? 'primary.main' : 'divider' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedSubtopics.has(subtopic)}
                            onChange={() => toggleSubtopicSelection(subtopic)}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="h6" noWrap sx={{ ml: 1 }}>
                            {subtopic}
                          </Typography>
                        }
                        sx={{ flexGrow: 1 }}
                      />
                      <Chip
                        label="Google Trends"
                        color={selectedSubtopics.has(subtopic) ? 'primary' : 'default'}
                        size="small"
                        icon={<TrendingUp />}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {selectedSubtopics.has(subtopic) 
                        ? 'Selected for Idea Burst. Click the button below to view Google Trends.'
                        : 'Click the checkbox to select, then click the button below to view Google Trends.'
                      }
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      size="small"
                      variant={selectedSubtopics.has(subtopic) ? 'contained' : 'outlined'}
                      startIcon={<Timeline />}
                      onClick={() => openGoogleTrends(subtopic)}
                      sx={{ width: '100%' }}
                    >
                      View Google Trends
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

    </Box>
  );
};


export default TrendAnalysis;
