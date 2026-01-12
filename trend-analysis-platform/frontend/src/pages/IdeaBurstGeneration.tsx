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
  LinearProgress,
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
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
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
  const [sortBy, setSortBy] = useState<'priority' | 'default'>('priority');

  // Calculate priority score for each idea
  const calculateIdeaPriorityScore = (idea: ContentIdea): number => {
    const seo = idea.seo_optimization_score || 0;
    const traffic = idea.traffic_potential_score || 0;
    const volume = idea.total_search_volume || 0;
    const difficulty = idea.average_difficulty || 50;
    const cpc = idea.average_cpc || 0;
    const quality = idea.overall_quality_score || 0;

    // Priority score combines multiple factors
    // Formula: Weighted combination of metrics
    // - High traffic potential (40%)
    // - Good SEO score (25%)
    // - High search volume (15%)
    // - Low difficulty (10%)
    // - High CPC value (10%)

    const trafficWeight = traffic * 0.40;
    const seoWeight = seo * 0.25;
    const volumeWeight = Math.min(Math.log10(volume + 1) * 20, 15); // Logarithmic scale, capped at 15
    const difficultyWeight = (100 - difficulty) * 0.10;
    const cpcWeight = Math.min(cpc * 10, 10); // Capped at 10

    const priorityScore = trafficWeight + seoWeight + volumeWeight + difficultyWeight + cpcWeight;

    // Round to 1 decimal place
    return Math.round(priorityScore * 10) / 10;
  };

  // Get ideas with priority scores
  const getPrioritizedIdeas = (ideas: ContentIdea[]) => {
    return ideas.map(idea => ({
      ...idea,
      priority_score: calculateIdeaPriorityScore(idea)
    })).sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
  };

  // Load research topics on component mount
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadResearchTopics();
    }
  }, [isAuthenticated, user]);

  // Load existing ideas and subtopics when topic changes
  useEffect(() => {
    if (selectedTopicId && user?.id) {
      loadExistingIdeas();
      loadSubtopics();
    }
  }, [selectedTopicId, user]);

  // Load subtopics for selected topic
  const loadSubtopics = async () => {
    console.log('🔍 loadSubtopics called with:', { selectedTopicId, 'user?.id': user?.id });

    if (!selectedTopicId) {
      console.log('❌ No topic ID selected');
      return;
    }

    if (!user?.id) {
      console.log('❌ No user ID available');
      return;
    }

    try {
      console.log('✅ loadSubtopics calling Supabase:', {
        research_topic_id: selectedTopicId,
        user_id: user.id
      });
      const { data, error } = await supabase
        .from('topic_decompositions')
        .select('subtopics')
        .eq('research_topic_id', selectedTopicId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('📊 Subtopics query result:', { dataLength: data?.length || 0, error });

      if (!error && data && data.length > 0 && data[0].subtopics) {
        console.log('✅ Setting subtopics:', data[0].subtopics);
        setSubtopics(data[0].subtopics);
      } else if (!error && (!data || data.length === 0 || !data[0].subtopics)) {
        console.log('⚠️ No subtopics found for this topic');
        setSubtopics([]);
      } else if (error) {
        console.error('❌ Error loading subtopics:', error);
      }
    } catch (err) {
      console.error('❌ Exception loading subtopics:', err);
    }
  };

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
      console.log('🔍 loadExistingIdeas calling Supabase:', {
        topic_id: selectedTopicId,
        user_id: user.id
      });
      const { data, error } = await supabase
        .from('content_ideas')
        .select('*')
        .eq('topic_id', selectedTopicId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich ideas with metrics if missing
      const enrichedIdeas = await enrichIdeasWithMetrics(data || [], selectedTopicId, user.id);
      setContentIdeas(enrichedIdeas);

      console.log('📊 Loaded and enriched ideas:', enrichedIdeas.length);
    } catch (err) {
      console.error('Error loading existing ideas:', err);
    }
  };

  const enrichIdeasWithMetrics = async (ideas: ContentIdea[], topicId: string, userId: string) => {
    try {
      console.log(`📊 Enrichment: Starting for ${ideas.length} ideas. Topic: ${topicId}`);

      // 1. Fetch ALL keywords for this topic/user from the database ONCE
      let topicKeywords: any[] = [];

      if (topicId) {
        const { data, error } = await supabase
          .from('keyword_research_data')
          .select('keyword, search_volume, keyword_difficulty, cpc')
          .eq('topic_id', topicId)
          .eq('user_id', userId);

        if (error) {
          console.error('❌ Error fetching topic keywords for enrichment:', error);
        } else {
          topicKeywords = data || [];
          console.log(`✅ Enrichment: Loaded ${topicKeywords.length} keywords from database for topic ${topicId}`);
        }
      } else {
        console.warn('⚠️ Enrichment: No topic ID provided, cannot fetch bulk keywords.');
      }

      // 2. Create a lookup map for O(1) access and case-insensitive matching
      // Map key: normalized keyword (lowercase, trimmed) -> value: metric object
      const keywordMap = new Map<string, any>();
      topicKeywords.forEach(k => {
        if (k.keyword) {
          // CRITICAL FIX: Filter out known "fake" defaults that might be in the database.
          // Volume: 1000, Difficulty: 50, CPC: 2.5 seems to be a hardcoded fallback pattern.
          const isSuspiciousDefault = k.search_volume === 1000 && (k.keyword_difficulty === 50 || k.difficulty === 50);

          if (isSuspiciousDefault) {
            // Skip this keyword so it doesn't pollute our data.
            // This will cause the enrichment to find "no match", which correctly triggers the "Metrics unavailable" state.
            return;
          }

          keywordMap.set(k.keyword.toLowerCase().trim(), k);
        }
      });

      // 3. Enrich each idea using the map
      const enrichedIdeas = ideas.map(idea => {
        // Calculate overall_quality_score if missing: (seo + traffic + (100 - difficulty)) / 3
        const seo = idea.seo_optimization_score || 0;
        const traffic = idea.traffic_potential_score || 0;
        const difficulty = idea.average_difficulty || 50;
        const calculatedQuality = seo > 0 && traffic > 0
          ? Math.round(((seo + traffic + (100 - difficulty)) / 3) * 100) / 100
          : 0;

        // If metrics are already present and look valid, keep them (but ensure quality score).
        // CRITICAL UPDATE: Treat 1000 volume as a "suspicious default" that needs verification/enrichment.
        // If it's exactly 1000, we proceed to lookup to see if we have better data.
        if (idea.seo_optimization_score && idea.seo_optimization_score > 0 &&
          idea.traffic_potential_score && idea.traffic_potential_score > 0 &&
          idea.total_search_volume && idea.total_search_volume > 0 &&
          idea.total_search_volume !== 1000) {

          if (!idea.overall_quality_score || idea.overall_quality_score === 0) {
            return { ...idea, overall_quality_score: calculatedQuality };
          }
          return idea;
        }

        // Otherwise, try to find metrics from our loaded map
        const rawKeywords = [...(idea.primary_keywords || []), ...(idea.keywords || [])];
        const normalizedKeywords = rawKeywords
          .map(k => k.toLowerCase().trim())
          .filter(k => k.length > 0);

        if (normalizedKeywords.length === 0) {
          return { ...idea, overall_quality_score: calculatedQuality };
        }

        // Find matches in the map
        const matchedMetrics = normalizedKeywords
          .map(k => keywordMap.get(k))
          .filter(m => m !== undefined);

        if (matchedMetrics.length > 0) {
          const totalVolume = matchedMetrics.reduce((sum, k) => sum + (k.search_volume || 0), 0);
          const avgDifficulty = matchedMetrics.reduce((sum, k) => sum + (k.keyword_difficulty || 0), 0) / matchedMetrics.length;
          const avgCpc = matchedMetrics.reduce((sum, k) => sum + (k.cpc || 0), 0) / matchedMetrics.length;

          // Recalculate scores based on REAL data
          // Simple heuristic for SEO/Traffic based on volume/difficulty if we don't have sophisticated logic here
          // For now, we keep the existing ones or default if 0, but usually content generation provides initial scores.
          // Let's improve them slightly if they are defaults.

          const enrichedSeo = idea.seo_optimization_score || 75;
          const enrichedTraffic = idea.traffic_potential_score || 70;
          const enrichedQuality = Math.round(((enrichedSeo + enrichedTraffic + (100 - avgDifficulty)) / 3) * 100) / 100;

          console.log(`✅ Enriched "${idea.title}": Found ${matchedMetrics.length}/${normalizedKeywords.length} keywords. Vol: ${totalVolume}`);

          return {
            ...idea,
            total_search_volume: totalVolume,
            average_difficulty: avgDifficulty,
            average_cpc: avgCpc,
            seo_optimization_score: enrichedSeo,
            traffic_potential_score: enrichedTraffic,
            overall_quality_score: enrichedQuality
          };
        } else {
          // No matches found in DB
          console.log(`⚠️ No metrics found for "${idea.title}". Keywords: ${normalizedKeywords.join(', ')}`);

          // CRITICAL: Explicitly clear potentially misleading default values (e.g. 1000 vol, 4.50 cpc)
          // if we have verified we have NO data for these keywords.
          return {
            ...idea,
            overall_quality_score: calculatedQuality,
            total_search_volume: 0,
            average_difficulty: 0,
            average_cpc: 0,
            seo_optimization_score: 0,
            traffic_potential_score: 0
          };
        }
      });

      return enrichedIdeas;

    } catch (error) {
      console.error(`Failed to enrich ideas:`, error);
      return ideas;
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
      setContentIdeas([]); // Clear existing ideas to avoid "stale data" confusion
      setGenerationProgress(0);
      setGenerationStatus('Initializing idea generation...');

      // Helper function to get subtopic name based on progress
      const getCurrentSubtopic = (progress: number): string => {
        if (subtopics.length === 0) return '';
        // Divide progress into segments for each subtopic
        // Reserve first 10% for initialization
        const startPercent = 10;
        const endPercent = 95;
        const segmentSize = (endPercent - startPercent) / Math.max(subtopics.length, 1);
        const adjustedProgress = progress - startPercent;
        const subtopicIndex = Math.min(
          Math.floor(adjustedProgress / segmentSize),
          subtopics.length - 1
        );
        return subtopics[subtopicIndex] || '';
      };

      // Simulate progress updates while waiting
      let currentProgressValue = 0;
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          // Update the current progress value
          if (prev >= 99) {
            currentProgressValue = 99;
            return 99; // Stop at 99, final jump to 100 on completion
          }
          if (prev >= 90) {
            // From 90% to 99%, increment by smaller amounts for smoother progress
            currentProgressValue = prev + 0.5;
            return prev + 0.5;
          }
          // From 0% to 90%, increment by 5%
          currentProgressValue = prev + 5;
          return prev + 5;
        });

        // Update status based on current progress value
        const percentage = currentProgressValue;
        const currentSubtopic = getCurrentSubtopic(percentage);

        let statusMessage = '';
        if (percentage < 10) {
          statusMessage = 'Initializing keyword database...';
        } else if (percentage >= 10 && percentage < 30) {
          statusMessage = 'Analyzing keywords and selecting best candidates...';
        } else if (percentage >= 30 && percentage < 50) {
          statusMessage = 'Categorizing keywords by intent and search volume...';
        } else if (percentage >= 50 && percentage < 70) {
          statusMessage = 'Calculating priority scores and opportunities...';
        } else if (percentage >= 70 && percentage < 85) {
          statusMessage = 'Preparing keywords for content generation...';
        } else if (percentage >= 85 && percentage < 90) {
          statusMessage = 'Starting AI content idea generation...';
        } else if (percentage >= 90 && percentage < 93) {
          statusMessage = 'Generating blog post ideas...';
        } else if (percentage >= 93 && percentage < 96) {
          statusMessage = 'Generating software project ideas...';
        } else if (percentage >= 96 && percentage < 99) {
          statusMessage = 'Optimizing SEO scores and calculating traffic potential...';
        } else if (percentage >= 99) {
          statusMessage = 'Finalizing and saving ideas to database...';
        } else if (currentSubtopic) {
          // Show current subtopic being processed
          statusMessage = `Processing "${currentSubtopic}"... ${Math.floor(percentage)}%`;
        } else {
          statusMessage = `Generating content ideas... ${Math.floor(percentage)}% complete`;
        }

        setGenerationStatus(statusMessage);
      }, 1500); // Update every 1.5 seconds for smoother progress

      const progressTimeout = setTimeout(() => {
        clearInterval(progressInterval);
      }, 300000); // 5 minutes max

      try {
        // Use optimized endpoint that queries keywords from database
        const response = await contentIdeasService.generateContentIdeasOptimized({
          topic_id: selectedTopicId,
          topic_title: researchTopics.find(t => t.id === selectedTopicId)?.title || 'Unknown Topic',
          subtopics: subtopics, // Include subtopics for better context
          user_id: user.id,
          content_types: ['blog', 'software'],
          max_keywords: 50 // Limit keywords for performance
        });

        clearInterval(progressInterval);
        clearTimeout(progressTimeout);
        setGenerationProgress(100);
        setGenerationStatus('Complete!');

        if (response.success) {
          setSuccess(response.message || `Generated ${response.total_ideas} content ideas using intelligent keyword prioritization!`);
          setTabValue(0); // Switch to ideas tab

          // Reload ideas from Supabase to ensure we have the latest data
          await loadExistingIdeas();
        } else {
          setError('Failed to generate content ideas');
        }
      } catch (fetchErr) {
        clearInterval(progressInterval);
        clearTimeout(progressTimeout);
        throw fetchErr;
      }
    } catch (err) {
      console.error('Error generating ideas:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate content ideas');
      setGenerationProgress(0);
      setGenerationStatus('');
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

  const handleDeleteIdeas = async (ideaIds: string[]) => {
    if (!user?.id || ideaIds.length === 0) {
      return;
    }

    try {
      // Delete each idea
      for (const ideaId of ideaIds) {
        await contentIdeasService.deleteContentIdea(ideaId, user.id);
      }

      // Remove from selected items
      const newSelected = new Set(selectedIdeas);
      ideaIds.forEach(id => newSelected.delete(id));
      setSelectedIdeas(newSelected);

      // Reload ideas
      await loadExistingIdeas();

      setSuccess(`Successfully deleted ${ideaIds.length} idea${ideaIds.length > 1 ? 's' : ''}`);
    } catch (err) {
      console.error('Error deleting ideas:', err);
      setError('Failed to delete ideas');
    }
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
      const ideasToPublish = contentIdeas.filter(idea => selectedIdeas.has(idea.id) && idea.content_type === 'blog');

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

  // Get prioritized ideas for display
  const allPrioritizedIdeas = sortBy === 'priority' ? getPrioritizedIdeas(contentIdeas) : contentIdeas;
  const blogIdeas = allPrioritizedIdeas.filter(idea => idea.content_type === 'blog');
  const softwareIdeas = allPrioritizedIdeas.filter(idea => idea.content_type === 'software');

  // Handler to select top N ideas by priority
  const handleSelectTopIdeas = (count: number) => {
    const prioritized = getPrioritizedIdeas(contentIdeas);
    const topIdeas = prioritized.slice(0, count).map(idea => idea.id);
    setSelectedIdeas(new Set(topIdeas));
    setSnackbarMessage(`Selected top ${count} ideas by priority score`);
    setShowSnackbar(true);
  };

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
          <InputLabel id="topic-select-label" sx={{ bgcolor: 'background.paper', px: 0.5 }}>Research Topic</InputLabel>
          <Select
            labelId="topic-select-label"
            value={selectedTopicId || ''}
            onChange={(e) => {
              console.log('Topic changed to:', e.target.value);
              setSelectedTopicId(e.target.value);
            }}
            disabled={loading}
            label="Research Topic"
          >
            {researchTopics.length === 0 ? (
              <MenuItem disabled>Loading topics...</MenuItem>
            ) : (
              researchTopics.map((topic) => (
                <MenuItem key={topic.id} value={topic.id}>
                  {topic.title}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {researchTopics.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Loaded {researchTopics.length} topics
          </Typography>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Selected Topic ID: {selectedTopicId}
          </Typography>
          {selectedTopic && (
            <Typography variant="body2" color="text.secondary">
              {selectedTopic.description || 'No description available'}
            </Typography>
          )}
        </Box>

        {subtopics.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Subtopics ({subtopics.length}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {subtopics.slice(0, 10).map((subtopic, index) => (
                <Chip key={index} label={subtopic} size="small" variant="outlined" />
              ))}
              {subtopics.length > 10 && (
                <Chip label={`+${subtopics.length - 10} more`} size="small" variant="outlined" />
              )}
            </Box>
          </Box>
        )}

        {subtopics.length === 0 && selectedTopicId && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            No subtopics loaded for this topic
          </Typography>
        )}
      </Paper>

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

          {generating && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {generationStatus}
              </Typography>
              <LinearProgress variant="determinate" value={generationProgress} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                This may take 3-5 minutes. Please don't close this page.
              </Typography>
            </Box>
          )}

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
                variant="contained"
                color="success"
                startIcon={<Star />}
                onClick={() => handleSelectTopIdeas(5)}
              >
                Top 5 Ideas
              </Button>

              <Button
                variant="outlined"
                color="success"
                startIcon={<Star />}
                onClick={() => handleSelectTopIdeas(10)}
              >
                Top 10 Ideas
              </Button>

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
              >
                {publishing ? 'Publishing...' : `Publish to Titles (${selectedIdeas.size})`}
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={<CheckBox />}
                onClick={() => handleDeleteIdeas(Array.from(selectedIdeas))}
                disabled={selectedIdeas.size === 0}
              >
                Delete Selected ({selectedIdeas.size})
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
              ideas={allPrioritizedIdeas}
              selectedIdeas={selectedIdeas}
              onIdeaSelect={handleIdeaSelect}
              onDeleteIdea={(ideaId) => handleDeleteIdeas([ideaId])}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <IdeaGrid
              ideas={blogIdeas}
              selectedIdeas={selectedIdeas}
              onIdeaSelect={handleIdeaSelect}
              onDeleteIdea={(ideaId) => handleDeleteIdeas([ideaId])}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <IdeaGrid
              ideas={softwareIdeas}
              selectedIdeas={selectedIdeas}
              onIdeaSelect={handleIdeaSelect}
              onDeleteIdea={(ideaId) => handleDeleteIdeas([ideaId])}
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
  onDeleteIdea?: (ideaId: string) => void;
}

const IdeaGrid: React.FC<IdeaGridProps> = ({ ideas, selectedIdeas, onIdeaSelect, onDeleteIdea }) => {
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
                    size="small"
                  />
                }
                label=""
                sx={{ position: 'absolute', top: 4, left: 4, m: 0 }}
              />

              {onDeleteIdea && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => onDeleteIdea(idea.id)}
                  sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', padding: 0.5 }}
                >
                  ✕
                </Button>
              )}

              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pr: 6, pt: 4, mb: 1 }}>
                <Typography variant="h6" sx={{ flex: 1 }}>
                  {idea.title}
                </Typography>
                {(idea as any).priority_score !== undefined && (
                  <Chip
                    label={`Priority: ${((idea as any).priority_score).toFixed(1)}`}
                    size="small"
                    color={(idea as any).priority_score > 70 ? "success" : (idea as any).priority_score > 50 ? "warning" : "default"}
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {idea.description}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip
                  label={idea.content_type}
                  size="small"
                  color="primary"
                  title="Content type"
                />
                <Chip
                  label={`Difficulty: ${idea.difficulty_level}`}
                  size="small"
                  title="Content creation difficulty level"
                />
                {idea.monetization_potential && (
                  <Chip
                    label={`Revenue: ${idea.monetization_potential}`}
                    size="small"
                    color="secondary"
                    title="Monetization potential"
                  />
                )}
              </Box>

              {/* Metrics for decision making */}
              {(() => {
                // Improved check: Ensure we don't show chips for 0 values (which now indicate missing data)
                const hasSEO = idea.seo_optimization_score !== undefined && idea.seo_optimization_score > 0;
                const hasTraffic = idea.traffic_potential_score !== undefined && idea.traffic_potential_score > 0;
                const hasQuality = idea.overall_quality_score !== undefined && idea.overall_quality_score > 0;
                const hasVolume = idea.total_search_volume !== undefined && idea.total_search_volume > 0;
                const hasDifficulty = idea.average_difficulty !== undefined && idea.average_difficulty > 0;
                const hasCpc = idea.average_cpc !== undefined && idea.average_cpc > 0;

                const hasAnyMetrics = hasSEO || hasTraffic || hasQuality || hasVolume || hasDifficulty || hasCpc;

                if (!hasAnyMetrics) return (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Metrics unavailable (Research required)
                    </Typography>
                  </Box>
                );

                return (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Decision Metrics:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                      {hasSEO && (
                        <Chip
                          label={`SEO: ${idea.seo_optimization_score}`}
                          size="small"
                          variant="outlined"
                          color={idea.seo_optimization_score! > 80 ? "success" : idea.seo_optimization_score! > 60 ? "warning" : "default"}
                        />
                      )}
                      {hasTraffic && (
                        <Chip
                          label={`Traffic: ${idea.traffic_potential_score}`}
                          size="small"
                          variant="outlined"
                          color={idea.traffic_potential_score! > 80 ? "success" : idea.traffic_potential_score! > 60 ? "warning" : "default"}
                        />
                      )}
                      {hasQuality && (
                        <Chip
                          label={`Quality: ${idea.overall_quality_score!.toFixed(1)}`}
                          size="small"
                          variant="outlined"
                          color={idea.overall_quality_score! > 80 ? "success" : idea.overall_quality_score! > 60 ? "warning" : "default"}
                        />
                      )}
                      {hasVolume && (
                        <Chip
                          label={`Volume: ${idea.total_search_volume!.toLocaleString()}`}
                          size="small"
                          variant="outlined"
                          color={idea.total_search_volume! > 10000 ? "success" : idea.total_search_volume! > 5000 ? "warning" : "default"}
                        />
                      )}
                      {hasDifficulty && (
                        <Chip
                          label={`Difficulty: ${idea.average_difficulty!.toFixed(0)}`}
                          size="small"
                          variant="outlined"
                          color={idea.average_difficulty! < 30 ? "success" : idea.average_difficulty! < 60 ? "warning" : "error"}
                        />
                      )}
                      {hasCpc && (
                        <Chip
                          label={`CPC: $${idea.average_cpc!.toFixed(2)}`}
                          size="small"
                          variant="outlined"
                          color={idea.average_cpc! > 3 ? "success" : idea.average_cpc! > 1.5 ? "warning" : "default"}
                        />
                      )}
                    </Box>
                  </Box>
                );
              })()}

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
