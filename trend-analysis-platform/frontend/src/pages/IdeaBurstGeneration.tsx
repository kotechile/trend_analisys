/**
 * Idea Burst Generation Page
 * 
 * Dedicated page for generating content ideas from stored keywords
 * Features topic selection, keyword display, idea generation, and publishing
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  Lightbulb,
  Refresh,
  Publish,
  CheckBox,
  CheckBoxOutlineBlank,
  Search,
  FilterList,
  Star,
  TrendingUp,
  Visibility,
  AttachMoney
} from '@mui/icons-material';
// Keywords are now loaded by backend - no need for keywordResearchService import
import { contentIdeasService, ContentIdea, OptimizedContentIdeaGenerationRequest } from '../services/contentIdeasService';
import { titlesPublishService, PublishIdeasRequest } from '../services/titlesPublishService';
import { supabase } from '../lib/supabase';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`idea-tabpanel-${index}`}
      aria-labelledby={`idea-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface ResearchTopic {
  id: string;
  title: string;
  description?: string;
  created_at: string;
}

const IdeaBurstGeneration: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Navigation state from keyword research page
  const navigationState = location.state as { 
    selectedTopicId?: string; 
    selectedTopicTitle?: string; 
    selectedSubtopics?: string[] 
  } | null;

  // State management
  const [researchTopics, setResearchTopics] = useState<ResearchTopic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(navigationState?.selectedTopicId || '');
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // UI state
  const [tabValue, setTabValue] = useState(0);
  const [selectedIdeas, setSelectedIdeas] = useState<Set<string>>(new Set());
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishResult, setPublishResult] = useState<any>(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Load research topics on component mount
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadResearchTopics();
    }
  }, [isAuthenticated, user]);

  // Load existing ideas when topic changes (keywords are loaded by backend)
  useEffect(() => {
    if (selectedTopicId && user?.id) {
      loadExistingIdeas();
    }
  }, [selectedTopicId, user]);

  const loadResearchTopics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('research_topics')
        .select('id, title, description, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResearchTopics(data || []);
    } catch (err) {
      console.error('Error loading research topics:', err);
      setError('Failed to load research topics');
    } finally {
      setLoading(false);
    }
  };

  // Keywords are now loaded by backend - no need for this function

  const loadExistingIdeas = async () => {
    if (!selectedTopicId || !user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('content_ideas')
        .select('*')
        .eq('topic_id', selectedTopicId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContentIdeas(data || []);
    } catch (err) {
      console.error('Error loading existing ideas:', err);
    }
  };

  const handleGenerateIdeas = async () => {
    if (!selectedTopicId || !user?.id) {
      setError('Please select a topic');
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      // Use optimized endpoint that queries keywords from database
      const response = await contentIdeasService.generateContentIdeasOptimized({
        topic_id: selectedTopicId,
        topic_title: researchTopics.find(t => t.id === selectedTopicId)?.title || 'Unknown Topic',
        subtopics: [], // Could be enhanced to include subtopics
        user_id: user.id,
        content_types: ['blog', 'software'],
        max_keywords: 50 // Limit keywords for performance
      });

      if (response.success) {
        setContentIdeas(response.ideas);
        setSuccess(response.message || `Generated ${response.total_ideas} content ideas using intelligent keyword prioritization!`);
        setTabValue(0); // Switch to ideas tab
      } else {
        setError('Failed to generate content ideas');
      }
    } catch (err) {
      console.error('Error generating ideas:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate content ideas');
    } finally {
      setGenerating(false);
    }
  };

  const handleIdeaSelect = (ideaId: string) => {
    const newSelected = new Set(selectedIdeas);
    if (newSelected.has(ideaId)) {
      newSelected.delete(ideaId);
    } else {
      newSelected.add(ideaId);
    }
    setSelectedIdeas(newSelected);
  };

  const handleSelectAll = () => {
    const allIdeaIds = new Set(contentIdeas.map(idea => idea.id));
    setSelectedIdeas(allIdeaIds);
  };

  const handleDeselectAll = () => {
    setSelectedIdeas(new Set());
  };

  const handlePublishToTitles = async () => {
    if (!user?.id || selectedIdeas.size === 0) {
      setSnackbarMessage('Please select at least one idea to publish');
      setShowSnackbar(true);
      return;
    }

    setPublishing(true);
    setPublishDialogOpen(true);

    try {
      const ideasToPublish = contentIdeas.filter(idea => selectedIdeas.has(idea.id));
      
      const publishRequest: PublishIdeasRequest = {
        ideas: ideasToPublish,
        trend_analysis_id: selectedTopicId,
        source_topic_id: selectedTopicId,
        user_id: user.id
      };

      const result = await titlesPublishService.publishIdeas(publishRequest);
      setPublishResult(result);

      if (result.success) {
        setSnackbarMessage(`Successfully published ${result.published_count} ideas to Titles`);
        setSelectedIdeas(new Set()); // Clear selection
        await loadExistingIdeas(); // Refresh ideas
      } else {
        setSnackbarMessage(`Failed to publish ideas: ${result.errors.join(', ')}`);
      }
    } catch (err) {
      console.error('Error publishing ideas:', err);
      setSnackbarMessage('Failed to publish ideas');
    } finally {
      setPublishing(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Authentication guard
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography color="error">Please log in to access idea generation functionality.</Typography>
      </Box>
    );
  }

  const selectedTopic = researchTopics.find(t => t.id === selectedTopicId);
  const blogIdeas = contentIdeas.filter(idea => idea.content_type === 'blog');
  const softwareIdeas = contentIdeas.filter(idea => idea.content_type === 'software');

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        💡 Idea Burst Generation
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Generate content ideas from your keyword research data
      </Typography>

      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Topic Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Research Topic
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Research Topic</InputLabel>
          <Select
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            disabled={loading}
          >
            {researchTopics.map((topic) => (
              <MenuItem key={topic.id} value={topic.id}>
                {topic.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {selectedTopic && (
          <Typography variant="body2" color="text.secondary">
            {selectedTopic.description || 'No description available'}
          </Typography>
        )}
      </Paper>

      {/* Keywords are now loaded by backend - no need to display them */}

      {/* Action Buttons */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={20} /> : <Lightbulb />}
            onClick={handleGenerateIdeas}
            disabled={!selectedTopicId || generating}
          >
            {generating ? 'Generating Ideas...' : 'Generate Ideas'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadExistingIdeas}
            disabled={!selectedTopicId}
          >
            Refresh Ideas
          </Button>
          
          {contentIdeas.length > 0 && (
            <>
              <Button
                variant="outlined"
                startIcon={<CheckBox />}
                onClick={handleSelectAll}
              >
                Select All
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<CheckBoxOutlineBlank />}
                onClick={handleDeselectAll}
              >
                Deselect All
              </Button>
              
              <Button
                variant="contained"
                color="secondary"
                startIcon={publishing ? <CircularProgress size={20} /> : <Publish />}
                onClick={handlePublishToTitles}
                disabled={selectedIdeas.size === 0 || publishing}
                sx={{ ml: 'auto' }}
              >
                {publishing ? 'Publishing...' : `Publish to Titles (${selectedIdeas.size})`}
              </Button>
            </>
          )}
        </Box>
      </Paper>

      {/* Content Ideas Tabs */}
      {contentIdeas.length > 0 && (
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`All Ideas (${contentIdeas.length})`} />
            <Tab label={`Blog Posts (${blogIdeas.length})`} />
            <Tab label={`Software Ideas (${softwareIdeas.length})`} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <IdeaGrid 
              ideas={contentIdeas} 
              selectedIdeas={selectedIdeas}
              onIdeaSelect={handleIdeaSelect}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <IdeaGrid 
              ideas={blogIdeas} 
              selectedIdeas={selectedIdeas}
              onIdeaSelect={handleIdeaSelect}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <IdeaGrid 
              ideas={softwareIdeas} 
              selectedIdeas={selectedIdeas}
              onIdeaSelect={handleIdeaSelect}
            />
          </TabPanel>
        </Paper>
      )}

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onClose={() => setPublishDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Publishing Ideas to Titles</DialogTitle>
        <DialogContent>
          {publishing ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
              <CircularProgress size={24} />
              <Typography>Publishing ideas to Titles table...</Typography>
            </Box>
          ) : publishResult ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Publishing Results
              </Typography>
              <Typography color="success.main">
                Successfully published: {publishResult.published_count} ideas
              </Typography>
              {publishResult.errors.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography color="error.main" gutterBottom>
                    Errors:
                  </Typography>
                  {publishResult.errors.map((error: string, index: number) => (
                    <Typography key={index} variant="body2" color="error">
                      • {error}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

// Idea Grid Component
interface IdeaGridProps {
  ideas: ContentIdea[];
  selectedIdeas: Set<string>;
  onIdeaSelect: (ideaId: string) => void;
}

const IdeaGrid: React.FC<IdeaGridProps> = ({ ideas, selectedIdeas, onIdeaSelect }) => {
  if (ideas.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No ideas found for this category.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {ideas.map((idea, index) => (
        <Grid item xs={12} md={6} lg={4} key={`idea-${idea.id}-${index}`}>
          <Card sx={{ height: '100%', position: 'relative' }}>
            <CardContent>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedIdeas.has(idea.id)}
                    onChange={() => onIdeaSelect(idea.id)}
                    icon={<CheckBoxOutlineBlank />}
                    checkedIcon={<CheckBox />}
                  />
                }
                label=""
                sx={{ position: 'absolute', top: 8, right: 8 }}
              />
              
              <Typography variant="h6" gutterBottom>
                {idea.title}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {idea.description}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip label={idea.content_type} size="small" color="primary" />
                <Chip label={idea.difficulty_level} size="small" />
                {idea.monetization_potential && (
                  <Chip label={idea.monetization_potential} size="small" color="secondary" />
                )}
                {idea.overall_quality_score && (
                  <Chip 
                    label={`Quality: ${idea.overall_quality_score}`} 
                    size="small" 
                    color={idea.overall_quality_score > 80 ? "success" : idea.overall_quality_score > 60 ? "warning" : "default"}
                  />
                )}
              </Box>
              
              {/* Metrics for decision making */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Decision Metrics:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                  {idea.seo_optimization_score && (
                    <Chip 
                      label={`SEO: ${idea.seo_optimization_score}`} 
                      size="small" 
                      variant="outlined"
                      color={idea.seo_optimization_score > 80 ? "success" : idea.seo_optimization_score > 60 ? "warning" : "default"}
                    />
                  )}
                  {idea.traffic_potential_score && (
                    <Chip 
                      label={`Traffic: ${idea.traffic_potential_score}`} 
                      size="small" 
                      variant="outlined"
                      color={idea.traffic_potential_score > 80 ? "success" : idea.traffic_potential_score > 60 ? "warning" : "default"}
                    />
                  )}
                  {idea.average_cpc && (
                    <Chip 
                      label={`CPC: $${idea.average_cpc}`} 
                      size="small" 
                      variant="outlined"
                      color={idea.average_cpc > 3 ? "success" : idea.average_cpc > 1.5 ? "warning" : "default"}
                    />
                  )}
                  {idea.estimated_read_time && idea.content_type === 'blog' && (
                    <Chip 
                      label={`${idea.estimated_read_time} min read`} 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                  {idea.development_effort && idea.content_type === 'software' && (
                    <Chip 
                      label={`Effort: ${idea.development_effort}`} 
                      size="small" 
                      variant="outlined"
                      color={idea.development_effort === 'high' ? "error" : idea.development_effort === 'medium' ? "warning" : "success"}
                    />
                  )}
                </Box>
              </Box>
              
              {/* Main Keywords Display */}
              {idea.primary_keywords && idea.primary_keywords.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Main Keywords:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {idea.primary_keywords.slice(0, 3).map((keyword, index) => (
                      <Chip
                        key={index}
                        label={keyword}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: '20px' }}
                      />
                    ))}
                    {idea.primary_keywords.length > 3 && (
                      <Chip
                        label={`+${idea.primary_keywords.length - 3} more`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: '20px' }}
                      />
                    )}
                  </Box>
                </Box>
              )}
              
              {/* All Keywords Display */}
              {idea.keywords && idea.keywords.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    All Keywords: {idea.keywords.slice(0, 3).join(', ')}
                    {idea.keywords.length > 3 && ` +${idea.keywords.length - 3} more`}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {idea.created_at ? new Date(idea.created_at).toLocaleDateString() : 'Just generated'}
                </Typography>
                
                {idea.published_to_titles && (
                  <Chip label="Published" size="small" color="success" />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default IdeaBurstGeneration;
