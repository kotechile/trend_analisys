import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, AppBar, Toolbar, Tabs, Tab, Paper, Button, TextField, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import IdeaBurstPage from './components/IdeaBurstPage';
import TrendAnalysis from './components/TrendAnalysis';
import { supabaseResearchTopicsService } from './services/supabaseResearchTopicsService';
import { ResearchTopic, ResearchTopicCreate, ResearchTopicStatus } from './types/researchTopics';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import { AuthCallback } from './components/auth/AuthCallback';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'user:', user);
    if (!isLoading && !isAuthenticated) {
      console.log('ProtectedRoute - redirecting to login');
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    console.log('ProtectedRoute - showing loading screen');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - not authenticated, returning null');
    return null; // Will redirect to login
  }

  console.log('ProtectedRoute - authenticated, rendering children');
  return <>{children}</>;
};

// Simple Dashboard component
const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>🚀 TrendTap Dashboard</Typography>
      <Typography variant="body1" gutterBottom>
        Welcome back, {user?.firstName || user?.email || 'User'}! 
      </Typography>
      <Typography variant="body1">
        This system features advanced LLM-powered semantic analysis for affiliate research.
      </Typography>
    </Box>
  );
};

// Simple Idea Burst component
const IdeaBurst = () => (
  <Box sx={{ flexGrow: 1 }}>
    <IdeaBurstPage />
  </Box>
);

// Research Topics component for managing research topics
const ResearchTopics = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [topics, setTopics] = useState<ResearchTopic[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Subtopic management states
  const [isGeneratingSubtopics, setIsGeneratingSubtopics] = useState(false);
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [editingSubtopics, setEditingSubtopics] = useState(false);
  const [newSubtopic, setNewSubtopic] = useState('');

  // Load topics on component mount
  useEffect(() => {
    console.log('ResearchTopics component mounted, user:', user);
    // Load topics regardless of user state for development
    loadTopics();
  }, [user]);

  const loadTopics = async () => {
    try {
      console.log('Loading research topics...');
      console.log('Current user:', user);
      console.log('User ID:', user?.id);
      console.log('Is authenticated:', isAuthenticated);
      setLoading(true);
      
      // For development, always try to load topics even if user is null
      const response = await supabaseResearchTopicsService.listResearchTopics();
      console.log('Research topics response:', response);
      setTopics(response.items);
      console.log('Set topics to:', response.items);
      console.log('Topics count:', response.items.length);
      
      if (response.items.length === 0) {
        console.log('No topics found - this might be due to user ID mismatch');
      }
    } catch (err) {
      console.error('Failed to load topics:', err);
      setError('Failed to load research topics. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async () => {
    if (!newTopic.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      // Create the research topic
      const topicData: ResearchTopicCreate = {
        title: newTopic,
        description: '', // Will be filled by LLM explosion
        status: ResearchTopicStatus.ACTIVE
      };
      
      // Create the research topic (user ID will be obtained from Supabase auth)
      const createdTopic = await supabaseResearchTopicsService.createResearchTopic(topicData);
      
      // Generate subtopics using the enhanced API
      await generateSubtopics(newTopic);
      
      setTopics(prev => [createdTopic, ...prev]);
      setNewTopic('');
      
      // Show success message
      console.log('Topic created successfully:', createdTopic);
    } catch (error) {
      console.error('Failed to create topic:', error);
      setError('Failed to create research topic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateSubtopics = async (topic: string) => {
    if (!user?.id) return;
    
    setIsGeneratingSubtopics(true);
    try {
      const { affiliateResearchService } = await import('./services/affiliateResearchService');
      const generatedSubtopics = await affiliateResearchService.decomposeTopic(topic, user.id);
      
      // Always include the main topic as the first subtopic
      const allSubtopics = [topic, ...generatedSubtopics];
      setSubtopics(allSubtopics);
      setEditingSubtopics(true);
      
      console.log('Generated subtopics:', allSubtopics);
    } catch (error) {
      console.error('Failed to generate subtopics:', error);
      // Fallback to just the main topic
      setSubtopics([topic]);
      setEditingSubtopics(true);
    } finally {
      setIsGeneratingSubtopics(false);
    }
  };

  const addSubtopic = () => {
    if (newSubtopic.trim() && !subtopics.includes(newSubtopic.trim())) {
      setSubtopics(prev => [...prev, newSubtopic.trim()]);
      setNewSubtopic('');
    }
  };

  const removeSubtopic = (index: number) => {
    setSubtopics(prev => prev.filter((_, i) => i !== index));
  };

  const saveSubtopics = async () => {
    if (!user?.id || subtopics.length === 0) return;
    
    try {
      const { affiliateResearchService } = await import('./services/affiliateResearchService');
      
      // Save subtopics to database
      await affiliateResearchService.storeSubtopics(
        subtopics.slice(1), // Exclude the main topic (first item)
        user.id,
        subtopics[0], // Main topic
        selectedTopicId // Research topic ID
      );
      
      console.log('Subtopics saved to database:', subtopics);
      setEditingSubtopics(false);
    } catch (error) {
      console.error('Failed to save subtopics:', error);
      // Still close editing mode even if save fails
      setEditingSubtopics(false);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic and all related data?')) return;
    
    setError(null);
    try {
      await supabaseResearchTopicsService.deleteResearchTopic(topicId);
      setTopics(prev => prev.filter(topic => topic.id !== topicId));
      console.log('Topic deleted successfully');
    } catch (error) {
      console.error('Failed to delete topic:', error);
      setError('Failed to delete research topic. Please try again.');
    }
  };

      const handleNavigateToAffiliateResearch = (topicId: string) => {
        setSelectedTopicId(topicId);
        // Find the topic to get its subtopics
        const topic = topics.find(t => t.id === topicId);
        
        console.log('handleNavigateToAffiliateResearch - navigating to /affiliate-research');
        console.log('Current location before navigation:', window.location.pathname);
        
        // Navigate to affiliate research tab with selected topic ID and subtopics
        navigate('/affiliate-research', { 
          state: { 
            selectedTopicId: topicId,
            subtopics: subtopics.length > 0 ? subtopics : undefined,
            topicTitle: topic?.title
          } 
        });
        console.log('Navigate to affiliate research with topic ID:', topicId, 'and subtopics:', subtopics);
      };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>🔬 Research Topics</Typography>
      
      {/* Error Display */}
      {error && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#ffebee', border: '1px solid #f44336' }}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Paper>
      )}
      
      {/* Create New Topic */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Create New Research Topic</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Type any seed topic (e.g., artificial intelligence, sustainable living)"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleCreateTopic}
            disabled={loading || !newTopic.trim()}
            sx={{ minWidth: 150 }}
          >
            {loading ? 'Creating...' : 'Create Topic'}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          The LLM will automatically explode your topic into relevant sub-topics for research.
        </Typography>
      </Paper>

      {/* Subtopic Management */}
      {editingSubtopics && (
        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom>Manage Subtopics</Typography>
          
          {isGeneratingSubtopics && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                🤖 Generating intelligent subtopics using Google Autocomplete + LLM...
              </Typography>
            </Box>
          )}
          
          {subtopics.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Generated Subtopics ({subtopics.length}):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {subtopics.map((subtopic, index) => (
                  <Chip
                    key={index}
                    label={subtopic}
                    color={index === 0 ? "primary" : "default"}
                    variant={index === 0 ? "filled" : "outlined"}
                    onDelete={index > 0 ? () => removeSubtopic(index) : undefined}
                    deleteIcon={<span>×</span>}
                  />
                ))}
              </Box>
              {subtopics.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  💡 The first subtopic (highlighted) is your main topic. You can remove others but not the main topic.
                </Typography>
              )}
            </Box>
          )}
          
          {/* Add New Subtopic */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Add a custom subtopic..."
              value={newSubtopic}
              onChange={(e) => setNewSubtopic(e.target.value)}
              size="small"
            />
            <Button
              variant="outlined"
              onClick={addSubtopic}
              disabled={!newSubtopic.trim() || subtopics.includes(newSubtopic.trim())}
              size="small"
            >
              Add
            </Button>
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={saveSubtopics}
              disabled={subtopics.length === 0}
            >
              Save Subtopics
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setEditingSubtopics(false);
                setSubtopics([]);
              }}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      )}

      {/* Existing Topics */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Your Research Topics</Typography>
        {loading && topics.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Loading research topics...
          </Typography>
        ) : topics.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No research topics yet. Create your first topic above.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {topics.map((topic) => (
              <Box key={topic.id} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {topic.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip 
                        label={topic.status} 
                        color={topic.status === 'completed' ? 'success' : topic.status === 'active' ? 'primary' : 'default'}
                        size="small" 
                      />
                      {topic.description && (
                        <Chip label={topic.description} variant="outlined" size="small" />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Created: {new Date(topic.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleNavigateToAffiliateResearch(topic.id)}
                      disabled={topic.status === 'archived'}
                    >
                      Research
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteTopic(topic.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

// Affiliate Research component
const AffiliateResearch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get selected topic from navigation state
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(
    location.state?.selectedTopicId || null
  );
  
  // Get passed subtopics from navigation state
  const [passedSubtopics, setPassedSubtopics] = useState<string[] | null>(
    location.state?.subtopics || null
  );
  
  const [researchTopics, setResearchTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [affiliateOffers, setAffiliateOffers] = useState<any[]>([]);
  const [offersBySubtopic, setOffersBySubtopic] = useState<{ [subtopic: string]: any[] }>({});
  const [offersLoadedFromCache, setOffersLoadedFromCache] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSubtopics, setLoadingSubtopics] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Subtopic management states
  const [editingSubtopics, setEditingSubtopics] = useState(false);
  const [newSubtopic, setNewSubtopic] = useState('');

  // Load research topics on component mount
  useEffect(() => {
    loadResearchTopics();
  }, [user]);

  // Handle passed subtopics when component first loads
  useEffect(() => {
    if (passedSubtopics && passedSubtopics.length > 0) {
      console.log('Setting passed subtopics on component mount:', passedSubtopics);
      setSubtopics(passedSubtopics);
    }
  }, [passedSubtopics]);

  // Load selected topic details when topic ID changes
  useEffect(() => {
    if (selectedTopicId && researchTopics.length > 0) {
      const topic = researchTopics.find(t => t.id === selectedTopicId);
      if (topic) {
        setSelectedTopic(topic);
        
        // If we have passed subtopics, use them first
        if (passedSubtopics && passedSubtopics.length > 0) {
          console.log('Using passed subtopics:', passedSubtopics);
          setSubtopics(passedSubtopics);
        } else if (user?.id) {
          // Otherwise load subtopics for the pre-selected topic
          handleTopicChange(selectedTopicId);
        }
      }
    }
  }, [selectedTopicId, researchTopics, user, passedSubtopics]);

  const loadResearchTopics = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await supabaseResearchTopicsService.listResearchTopics();
      setResearchTopics(response.items);
    } catch (err) {
      console.error('Failed to load research topics:', err);
      setError('Failed to load research topics');
    } finally {
      setLoading(false);
    }
  };

  const loadSubtopicsFromDatabase = async (topicId: string) => {
    if (!user?.id || !topicId) return [];
    
    try {
      // Use the affiliate research service to load subtopics
      const { affiliateResearchService } = await import('./services/affiliateResearchService');
      console.log('Loading subtopics for topic ID:', topicId, 'user:', user.id);
      
      const subtopics = await affiliateResearchService.getSubtopicsForTopic(topicId, user.id);
      console.log('Loaded existing subtopics from database:', subtopics);
      
      return subtopics;
    } catch (error) {
      console.error('Failed to load subtopics from database:', error);
      return [];
    }
  };

  const handleTopicChange = async (topicId: string) => {
    console.log('handleTopicChange called with topicId:', topicId);
    setSelectedTopicId(topicId);
    const topic = researchTopics.find(t => t.id === topicId);
    console.log('Found topic:', topic);
    setSelectedTopic(topic);
    
    // Only clear results if we're actually changing to a different topic
    if (selectedTopicId !== topicId) {
      console.log('Different topic selected, clearing previous results');
      setSubtopics([]);
      setAffiliateOffers([]);
      setOffersBySubtopic({});
    }
    
    // Load existing subtopics for the selected topic
    if (topic && user?.id) {
      try {
        console.log('Loading subtopics for topic:', topic.title);
        const existingSubtopics = await loadSubtopicsFromDatabase(topic.id);
        console.log('Existing subtopics from database:', existingSubtopics);
        
        if (existingSubtopics.length > 0) {
          // Use existing subtopics from database
          const allSubtopics = [topic.title, ...existingSubtopics];
          setSubtopics(allSubtopics);
          console.log('Loaded existing subtopics for topic:', topic.title, allSubtopics);
        } else {
          // Fallback: generate new subtopics if none exist in database
          console.log('No existing subtopics found, generating new ones...');
          const { affiliateResearchService } = await import('./services/affiliateResearchService');
          const generatedSubtopics = await affiliateResearchService.decomposeTopic(topic.title, user.id);
          
          // Always include the main topic as the first subtopic
          const allSubtopics = [topic.title, ...generatedSubtopics];
          setSubtopics(allSubtopics);
          console.log('Generated new subtopics for topic:', topic.title, allSubtopics);
        }
        
        // Load existing affiliate offers for this topic
        console.log('Loading existing affiliate offers for topic:', topic.id);
        const { affiliateResearchService } = await import('./services/affiliateResearchService');
        
        // Debug: Check what's in the database
        await affiliateResearchService.debugStoredOffers(user.id);
        
        // Try to migrate existing temp-session offers to this topic
        await affiliateResearchService.migrateOffersToTopicId(topic.id, user.id);
        
        const existingOffers = await affiliateResearchService.loadExistingOffers(topic.id, user.id);
        
        if (existingOffers && existingOffers.length > 0) {
          console.log('Found existing offers:', existingOffers.length);
          
          // Load offers grouped by subtopic
          const offersBySubtopic = await affiliateResearchService.loadExistingOffersBySubtopics(topic.id, user.id);
          
          // Sort offers by relevance score
          const sortedOffers = existingOffers.sort((a, b) => 
            (b.relevance_score || 0) - (a.relevance_score || 0)
          );
          
          setAffiliateOffers(sortedOffers);
          setOffersBySubtopic(offersBySubtopic);
          setOffersLoadedFromCache(true);
          
          console.log('Loaded existing offers and grouped by subtopic');
        } else {
          console.log('No existing offers found for this topic');
          setOffersLoadedFromCache(false);
        }
      } catch (error) {
        console.error('Failed to load subtopics:', error);
        // Fallback to just the main topic
        setSubtopics([topic.title]);
      }
    }
  };

  const handleSearchAffiliateOffers = async () => {
    if (!selectedTopic || !user?.id) {
      console.log('Missing selectedTopic or user:', { selectedTopic, user });
      return;
    }
    
    try {
      console.log('Starting affiliate research for topic:', selectedTopic.title);
      setError(null);
      setLoadingSubtopics(true);
      setLoadingOffers(true);
      setIsProcessing(true);
      
      // Use existing subtopics if available, otherwise generate new ones
      let searchSubtopics = subtopics;
      
      if (searchSubtopics.length === 0) {
        console.log('No existing subtopics, generating new ones...');
        const { affiliateResearchService } = await import('./services/affiliateResearchService');
        const generatedSubtopics = await affiliateResearchService.decomposeTopic(
          selectedTopic.title,
          user.id
        );
        searchSubtopics = [selectedTopic.title, ...generatedSubtopics];
        setSubtopics(searchSubtopics);
      } else {
        console.log('Using existing subtopics:', searchSubtopics);
      }
      
      // Step 2: Search for affiliate offers for ALL subtopics
      console.log('Searching for offers for all subtopics:', searchSubtopics);
      
      const { affiliateResearchService } = await import('./services/affiliateResearchService');
      const offersBySubtopic = await affiliateResearchService.searchAffiliateProgramsForSubtopics(
        searchSubtopics,
        selectedTopic.title,
        user.id
      );
      
      console.log('Found offers by subtopic:', offersBySubtopic);
      
      // Step 3: Deduplicate and combine offers
      const { combinedOffers, offersBySubtopic: deduplicatedOffers, duplicateMap } = 
        affiliateResearchService.deduplicateOffersBySubtopics(offersBySubtopic);
      
      console.log('Combined offers:', combinedOffers);
      console.log('Deduplicated offers by subtopic:', deduplicatedOffers);
      console.log('Duplicate map:', duplicateMap);
      
      // Sort combined offers by relevance score (highest first)
      const sortedOffers = combinedOffers.sort((a, b) => 
        (b.relevance_score || 0) - (a.relevance_score || 0)
      );
      
      setAffiliateOffers(sortedOffers);
      
      // Store the offers by subtopic for display
      setOffersBySubtopic(deduplicatedOffers);
      setOffersLoadedFromCache(false); // New search, not from cache
      
      // Step 4: Store affiliate offers in Supabase (optional)
      try {
        await affiliateResearchService.storeAffiliateOffers(sortedOffers, user.id, selectedTopic.id);
        console.log('Offers stored successfully');
      } catch (err) {
        console.log('Affiliate offers storage failed, continuing...', err);
      }
      
      console.log('Affiliate research completed successfully');
      
    } catch (err) {
      console.error('Affiliate research failed:', err);
      setError(`Failed to search affiliate offers: ${err.message || 'Unknown error'}`);
    } finally {
      console.log('Setting loading states to false');
      setLoadingSubtopics(false);
      setLoadingOffers(false);
      setIsProcessing(false);
    }
  };

  const handleNavigateToTrendAnalysis = () => {
    // Navigate to trend analysis tab with pre-selected topic
    if (selectedTopic) {
      navigate('/trend-validation', { 
        state: { 
          selectedTopicId: selectedTopic.id,
          selectedTopicTitle: selectedTopic.title 
        } 
      });
    } else {
      navigate('/trend-validation');
    }
    console.log('Navigate to trend analysis with topic:', selectedTopic?.title);
  };

  // Subtopic management functions
  const addSubtopic = () => {
    if (newSubtopic.trim() && !subtopics.includes(newSubtopic.trim())) {
      setSubtopics(prev => [...prev, newSubtopic.trim()]);
      setNewSubtopic('');
    }
  };

  const removeSubtopic = (index: number) => {
    setSubtopics(prev => prev.filter((_, i) => i !== index));
  };

  const saveSubtopics = async () => {
    if (!user?.id || subtopics.length === 0 || !selectedTopic) return;
    
    try {
      const { affiliateResearchService } = await import('./services/affiliateResearchService');
      
      // Save subtopics to database
      await affiliateResearchService.storeSubtopics(
        subtopics.slice(1), // Exclude the main topic (first item)
        user.id,
        selectedTopic.title, // Main topic
        selectedTopic.id // Research topic ID
      );
      
      console.log('Subtopics saved to database:', subtopics);
      setEditingSubtopics(false);
    } catch (error) {
      console.error('Failed to save subtopics:', error);
      // Still close editing mode even if save fails
      setEditingSubtopics(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>🔍 Affiliate Research</Typography>
      
      {/* Error Display */}
      {error && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#ffebee', border: '1px solid #f44336' }}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Paper>
      )}
      
      {/* Research Topic Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Select Research Topic</Typography>
        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Loading research topics...
          </Typography>
        ) : (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Choose a research topic</InputLabel>
            <Select
              value={researchTopics.find(t => t.id === selectedTopicId) ? selectedTopicId : ''}
              onChange={(e) => handleTopicChange(e.target.value)}
              label="Choose a research topic"
            >
              {researchTopics.map((topic) => (
                <MenuItem key={topic.id} value={topic.id}>
                  {topic.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        
        {selectedTopic && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selected: {selectedTopic.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {selectedTopic.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label={selectedTopic.status} 
                color={selectedTopic.status === 'completed' ? 'success' : selectedTopic.status === 'active' ? 'primary' : 'default'}
                size="small" 
              />
              <Typography variant="caption" color="text.secondary">
                Created: {new Date(selectedTopic.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Subtopic Management */}
      {selectedTopic && (
        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Manage Subtopics</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setEditingSubtopics(!editingSubtopics)}
            >
              {editingSubtopics ? 'Done Editing' : 'Edit Subtopics'}
            </Button>
          </Box>
          
          {subtopics.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Current Subtopics ({subtopics.length}):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {subtopics.map((subtopic, index) => (
                  <Chip
                    key={index}
                    label={subtopic}
                    color={index === 0 ? "primary" : "default"}
                    variant={index === 0 ? "filled" : "outlined"}
                    onDelete={editingSubtopics && index > 0 ? () => removeSubtopic(index) : undefined}
                    deleteIcon={<span>×</span>}
                  />
                ))}
              </Box>
              {subtopics.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  💡 The first subtopic (highlighted) is your main topic. You can remove others but not the main topic.
                </Typography>
              )}
            </Box>
          )}
          
          {editingSubtopics && (
            <>
              {/* Add New Subtopic */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Add a custom subtopic..."
                  value={newSubtopic}
                  onChange={(e) => setNewSubtopic(e.target.value)}
                  size="small"
                />
                <Button
                  variant="outlined"
                  onClick={addSubtopic}
                  disabled={!newSubtopic.trim() || subtopics.includes(newSubtopic.trim())}
                  size="small"
                >
                  Add
                </Button>
              </Box>
              
              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={saveSubtopics}
                  disabled={subtopics.length === 0}
                  size="small"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditingSubtopics(false);
                    setNewSubtopic('');
                  }}
                  size="small"
                >
                  Cancel
                </Button>
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* Search Affiliate Offers */}
      {selectedTopic && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Search Affiliate Offers</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will search for affiliate offers related to ALL subtopics from your research topic. 
            The system will find offers for each subtopic, deduplicate them, and show you both a combined view 
            (sorted by relevance) and a grouped view by subtopic.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleSearchAffiliateOffers}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Search Affiliate Offers'}
            </Button>
            
            {isProcessing && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setIsProcessing(false);
                  setLoadingSubtopics(false);
                  setLoadingOffers(false);
                  console.log('Process cancelled by user');
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Paper>
      )}


      {/* Debug: Show loading states */}
      {isProcessing && (
        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5' }}>
          <Typography variant="body2" color="text.secondary">
            {loadingSubtopics && '🔄 Generating subtopics using Google Autocomplete + LLM...'}
            {loadingOffers && '🔍 Searching for affiliate offers...'}
            {!loadingSubtopics && !loadingOffers && '⚙️ Processing...'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            This may take up to 30 seconds. You can cancel if needed.
          </Typography>
        </Paper>
      )}

      {/* Affiliate Offers Results */}
      {affiliateOffers.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                Found {affiliateOffers.length} Affiliate Offers
              </Typography>
              {offersLoadedFromCache && (
                <Chip 
                  label="Loaded from previous search" 
                  color="info" 
                  size="small" 
                  icon={<span>💾</span>}
                />
              )}
            </Box>
            <Button
              variant="contained"
              onClick={handleNavigateToTrendAnalysis}
              sx={{ minWidth: 200 }}
            >
              Trend Analysis →
            </Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {offersLoadedFromCache && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleSearchAffiliateOffers}
                disabled={isProcessing}
                sx={{ ml: 1 }}
              >
                {isProcessing ? 'Refreshing...' : 'Refresh Offers'}
              </Button>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Offers are sorted by relevance score (how many subtopics they match). Higher scores indicate more relevant offers.
            {offersLoadedFromCache && " These offers were loaded from your previous search for this topic."}
          </Typography>
          
          {/* Combined View - All Offers */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="primary">
              All Offers (Combined View)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {affiliateOffers.map((offer, index) => (
                <Box key={index} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1">
                          {offer.offer_name}
                        </Typography>
                        {offer.relevance_score && (
                          <Chip 
                            label={`${Math.round(offer.relevance_score * 100)}% Match`} 
                            color="primary" 
                            size="small" 
                          />
                        )}
                      </Box>
                      
                      {offer.subtopics && offer.subtopics.length > 0 && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            <strong>Relevant to:</strong>
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {offer.subtopics.map((subtopic, idx) => (
                              <Chip 
                                key={idx}
                                label={subtopic} 
                                size="small" 
                                variant="outlined"
                                color="secondary"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      {offer.offer_description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {offer.offer_description}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        {offer.commission_rate && (
                          <Chip 
                            label={`${offer.commission_rate} Commission`} 
                            color="success" 
                            size="small" 
                          />
                        )}
                        <Chip 
                          label={offer.status} 
                          color={offer.status === 'active' ? 'success' : 'default'}
                          size="small" 
                        />
                        {offer.linkup_data?.link && (
                          <Chip 
                            label="Visit Program" 
                            color="primary" 
                            size="small"
                            clickable
                            onClick={() => window.open(offer.linkup_data.link, '_blank')}
                            sx={{ cursor: 'pointer' }}
                          />
                        )}
                      </Box>
                      
                      {offer.access_instructions && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Access:</strong> {offer.access_instructions}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Grouped by Subtopic View */}
          {Object.keys(offersBySubtopic).length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom color="secondary">
                Offers by Subtopic
              </Typography>
              {Object.entries(offersBySubtopic).map(([subtopic, offers]) => (
                <Box key={subtopic} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    color: 'primary.main', 
                    fontWeight: 'bold',
                    borderBottom: '2px solid #e0e0e0',
                    pb: 1
                  }}>
                    {subtopic} ({offers.length} offers)
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                    {offers.map((offer, index) => (
                      <Box key={index} sx={{ p: 2, border: '1px solid #f0f0f0', borderRadius: 1, bgcolor: '#fafafa' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              {offer.offer_name}
                            </Typography>
                            {offer.offer_description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {offer.offer_description}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {offer.commission_rate && (
                                <Chip 
                                  label={`${offer.commission_rate} Commission`} 
                                  color="success" 
                                  size="small" 
                                />
                              )}
                              <Chip 
                                label={offer.status} 
                                color={offer.status === 'active' ? 'success' : 'default'}
                                size="small" 
                              />
                              {offer.linkup_data?.link && (
                                <Chip 
                                  label="Visit Program" 
                                  color="primary" 
                                  size="small"
                                  clickable
                                  onClick={() => window.open(offer.linkup_data.link, '_blank')}
                                  sx={{ cursor: 'pointer' }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      )}

      {/* Navigate to Trend Analysis */}
      {affiliateOffers.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Next Step</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ready to analyze trends for your selected affiliate offers?
          </Typography>
          <Button
            variant="contained"
            onClick={handleNavigateToTrendAnalysis}
            sx={{ minWidth: 200 }}
          >
            Trend Analysis →
          </Button>
        </Paper>
      )}
    </Box>
  );
};


// Placeholder components for other tabs
const PlaceholderPage = ({ title }: { title: string }) => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>{title}</Typography>
    <Typography variant="body1">This feature is coming soon!</Typography>
  </Box>
);

// Main App Content (protected)
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Ensure user is on a valid route
  useEffect(() => {
    const validRoutes = ['/', '/affiliate-research', '/trend-validation', '/idea-burst', '/keyword-armoury', '/calendar', '/settings'];
    const currentPath = location.pathname;
    
    if (!validRoutes.includes(currentPath)) {
      console.log('Invalid route detected, redirecting to home:', currentPath);
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const routes = ['/', '/affiliate-research', '/trend-validation', '/idea-burst', '/keyword-armoury', '/calendar', '/settings'];
    const targetRoute = routes[newValue];
    console.log('handleTabChange - newValue:', newValue, 'targetRoute:', targetRoute, 'routes:', routes);
    navigate(targetRoute);
  };

  const getCurrentTab = () => {
    const routes = ['/', '/affiliate-research', '/trend-validation', '/idea-burst', '/keyword-armoury', '/calendar', '/settings'];
    const currentPath = location.pathname;
    const tabIndex = routes.indexOf(currentPath);
    console.log('getCurrentTab - currentPath:', currentPath, 'tabIndex:', tabIndex, 'routes:', routes);
    
    // If path not found, default to first tab (Research Topics)
    if (tabIndex === -1) {
      console.log('Path not found in routes, defaulting to tab 0');
      return 0;
    }
    
    return tabIndex;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🚀 TrendTap - AI Research Workspace
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user?.firstName || user?.email || 'User'}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'white' }}>
        <Tabs
          value={getCurrentTab()}
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab label="Research Topics" />
          <Tab label="Affiliate Research" />
          <Tab label="Trend Analysis" />
          <Tab label="Idea Burst" />
          <Tab label="Keyword Armoury" />
          <Tab label="Calendar" />
          <Tab label="Settings" />
        </Tabs>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5' }}>
        <Paper sx={{ p: 3, minHeight: '70vh' }}>
        <Routes>
          <Route path="/" element={<ResearchTopics />} />
          <Route path="/affiliate-research" element={<AffiliateResearch />} />
          <Route path="/trend-validation" element={<TrendAnalysis />} />
          <Route path="/idea-burst" element={<IdeaBurst />} />
          <Route path="/keyword-armoury" element={<PlaceholderPage title="Keyword Armoury" />} />
          <Route path="/calendar" element={<PlaceholderPage title="Calendar" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        </Routes>
        </Paper>
      </Box>
    </Box>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;