import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Alert,
  LinearProgress,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Lightbulb,
  CloudUpload,
  Speed,
  Edit,
  MonetizationOn,
  ContentCopy,
  Save,
  Share,
  Analytics,
  TrendingUp,
  Search,
  Psychology,
  AttachMoney,
  CheckCircle,
  Warning,
  Error,
  Add,
} from '@mui/icons-material';

import IndividualKeywordUpload from '../components/idea-burst/IndividualKeywordUpload';
// import EnhancedIdeaEditor from '../components/idea-burst/EnhancedIdeaEditor';
import AffiliateNetworkSuggestions from '../components/idea-burst/AffiliateNetworkSuggestions';
import SubtopicSeedKeywords from '../components/idea-burst/SubtopicSeedKeywords';

interface ContentIdea {
  id: string;
  title: string;
  description: string;
  content_type: string;
  status: string;
  priority: string;
  is_enhanced: boolean;
  seo_optimized_title?: string;
  seo_optimized_description?: string;
  primary_keywords_optimized: string[];
  keyword_metrics_summary: any;
  affiliate_networks_suggested: string[];
  enhancement_timestamp?: string;
}

interface KeywordData {
  id: string;
  keyword: string;
  keyword_type: string;
  search_volume: number;
  keyword_difficulty: number;
  cpc: number;
  opportunity_score: number;
  priority_score: number;
  affiliate_potential_score: number;
  is_optimized: boolean;
  llm_optimized_title?: string;
  llm_optimized_description?: string;
  content_suggestions: string[];
  heading_suggestions: string[];
  related_questions: string[];
  suggested_affiliate_networks: string[];
  monetization_opportunities: string[];
}

const EnhancedIdeaBurst: React.FC = () => {
  // Enhanced Idea Burst - Updated with new features
  const [activeStep, setActiveStep] = useState(0);
  // const [activeTab, setActiveTab] = useState(0);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
  const [generatedKeywords, setGeneratedKeywords] = useState<Record<string, any[]>>({});
  const [ahrefsKeywords, setAhrefsKeywords] = useState<any[]>([]);
  const [researchId, setResearchId] = useState<string>('demo-research');
  const [availableResearches, setAvailableResearches] = useState<any[]>([]);
  const [selectedResearchId, setSelectedResearchId] = useState<string>('');
  const [isLoadingResearches, setIsLoadingResearches] = useState(false);

  // Load available researches on component mount
  useEffect(() => {
    loadAvailableResearches();
  }, []);

  // Load available researches from API
  const loadAvailableResearches = async () => {
    setIsLoadingResearches(true);
    setError('');
    try {
      // Get user ID from localStorage or use demo-user as fallback
      const userData = localStorage.getItem('trendtap_user');
      const userId = userData ? JSON.parse(userData).id : 'demo-user';
      const response = await fetch(`/api/affiliate/research-by-user?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.researches) {
          setAvailableResearches(data.researches);
        } else {
          setError('No research data found. Please create a research topic first.');
          setAvailableResearches([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        setError(`Failed to load researches: ${errorData.detail || 'Server error'}`);
        setAvailableResearches([]);
      }
    } catch (error) {
      console.error('Error loading researches:', error);
      setError(`Network error: ${error instanceof Error ? error.message : 'Failed to connect to server'}`);
      setAvailableResearches([]);
    } finally {
      setIsLoadingResearches(false);
    }
  };

  // Handle research selection
  const handleResearchSelect = (researchId: string) => {
    setSelectedResearchId(researchId);
    if (researchId === 'new') {
      setSelectedSubtopics([]);
      setResearchId('new-research');
    } else {
      const research = availableResearches.find(r => r.id === researchId);
      if (research) {
        setSelectedSubtopics(research.subtopics || []);
        setResearchId(researchId);
      }
    }
  };

  const steps = [
    {
      label: 'Select Research',
      description: 'Choose research topic and generate seed keywords',
      icon: <Lightbulb />,
    },
    {
      label: 'Upload Ahrefs Data',
      description: 'Upload Ahrefs CSV for keyword enhancement (optional)',
      icon: <CloudUpload />,
    },
    {
      label: 'Generate Ideas',
      description: 'Generate SEO-optimized content ideas',
      icon: <Add />,
    },
    {
      label: 'Review & Edit',
      description: 'Review and edit generated ideas',
      icon: <Edit />,
    },
    {
      label: 'Affiliate Integration',
      description: 'Add affiliate network suggestions and monetization',
      icon: <MonetizationOn />,
    },
    {
      label: 'Generate Content',
      description: 'Generate SEO-optimized content with affiliate integration',
      icon: <ContentCopy />,
    },
  ];

  const handleKeywordsGenerated = (keywordsBySubtopic: Record<string, any[]>) => {
    setGeneratedKeywords(keywordsBySubtopic);
    setSuccess('Seed keywords generated successfully! You can now copy the keywords and proceed when ready.');
    // Don't auto-advance - let user copy keywords and proceed manually
  };

  const handleAhrefsUploaded = async (uploadedKeywords: KeywordData[], sessionId: string) => {
    setAhrefsKeywords(uploadedKeywords);
    setSuccess(`Successfully uploaded ${uploadedKeywords.length} Ahrefs keywords!`);
    setActiveStep(2); // Move to Generate Ideas step
    
    // Auto-generate enhanced ideas after Ahrefs upload
    setTimeout(() => {
      handleGenerateIdeasWithKeywords();
    }, 1000); // Small delay to show the success message
  };

  const handleGenerateIdeasWithKeywords = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Get user ID from localStorage
      const userData = localStorage.getItem('trendtap_user');
      const userId = userData ? JSON.parse(userData).id : 'demo-user';
      
      // Generate ideas using both seed keywords and Ahrefs data
      const allKeywords = [...Object.values(generatedKeywords).flat(), ...ahrefsKeywords];
      const keywordsBySubtopic = { ...generatedKeywords };
      
      // Add Ahrefs keywords to appropriate subtopics
      ahrefsKeywords.forEach(kw => {
        // Simple matching - in real implementation, you'd have better logic
        const bestMatch = selectedSubtopics.find(sub => 
          kw.keyword.toLowerCase().includes(sub.toLowerCase().split(' ')[0])
        );
        if (bestMatch) {
          if (!keywordsBySubtopic[bestMatch]) keywordsBySubtopic[bestMatch] = [];
          keywordsBySubtopic[bestMatch].push(kw);
        }
      });

      const response = await fetch('/api/content-ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: researchId,
          topic_title: selectedSubtopics.join(', '),
          subtopics: selectedSubtopics,
          keywords: Object.values(keywordsBySubtopic).flat(),
          user_id: userId,
          content_types: ['blog', 'software']
        })
      });

      if (!response.ok) throw new Error('Failed to generate ideas');
      const result = await response.json();
      
      console.log('Generated ideas result:', result);
      setContentIdeas(result.ideas || []);
      setSuccess(`Generated ${result.total_ideas || result.ideas?.length || 0} SEO-optimized ideas!`);
      setActiveStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to generate ideas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateIdeasWithoutKeywords = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Get user ID from localStorage
      const userData = localStorage.getItem('trendtap_user');
      const userId = userData ? JSON.parse(userData).id : 'demo-user';
      
      const response = await fetch('/api/content-ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: researchId,
          topic_title: selectedSubtopics.join(', '),
          subtopics: selectedSubtopics,
          keywords: [],
          user_id: userId,
          content_types: ['blog', 'software']
        })
      });

      if (!response.ok) throw new Error('Failed to generate ideas');
      const result = await response.json();
      
      console.log('Generated basic ideas result:', result);
      setContentIdeas(result.ideas || []);
      setSuccess(`Generated ${result.total_ideas || result.ideas?.length || 0} basic ideas!`);
      setActiveStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to generate ideas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdeaSave = async (updatedIdea: ContentIdea, updatedKeywords: KeywordData[]) => {
    setIsLoading(true);
    try {
      // Update content idea and keywords
      setSelectedIdea(updatedIdea);
      setKeywords(updatedKeywords);
      
      // Update content ideas list
      setContentIdeas(prev => 
        prev.map(idea => idea.id === updatedIdea.id ? updatedIdea : idea)
      );
      
      setSuccess('Content idea updated successfully!');
    } catch (error) {
      setError('Failed to save content idea');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateContent = async (ideaId: string) => {
    setIsLoading(true);
    try {
      // Simulate content generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      setSuccess('Content generated successfully!');
      setActiveStep(5);
    } catch (error) {
      setError('Failed to generate content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportKeywords = async (ideaId: string) => {
    try {
      // Simulate keyword export
      const csvContent = keywords.map(k => 
        `${k.keyword},${k.search_volume},${k.keyword_difficulty},${k.opportunity_score}`
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `keywords-${ideaId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSuccess('Keywords exported successfully!');
    } catch (error) {
      setError('Failed to export keywords');
    }
  };

  const handleNetworkSelect = async (network: any, keyword: string) => {
    console.log('Network selected:', network, 'for keyword:', keyword);
  };

  const handleGenerateAffiliateContent = async (keyword: string, network: any) => {
    console.log('Generating affiliate content for:', keyword, 'with network:', network);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Research Topic
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose an existing research topic or create a new one to generate content ideas.
            </Typography>

            {/* Research Selection Dropdown */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Choose Research Topic</InputLabel>
                  <Select
                    value={selectedResearchId}
                    onChange={(e) => handleResearchSelect(e.target.value)}
                    label="Choose Research Topic"
                    disabled={isLoadingResearches}
                  >
                    <MenuItem value="new">Create New Research</MenuItem>
                    {availableResearches.map((research) => (
                      <MenuItem key={research.id} value={research.id}>
                        {research.main_topic} ({research.subtopics?.length || 0} subtopics)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {isLoadingResearches && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress sx={{ flexGrow: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Loading researches...
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Selected Subtopics Display */}
            {selectedSubtopics.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Selected Subtopics ({selectedSubtopics.length})
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Generate seed keywords for each subtopic to enhance your content ideas.
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {selectedSubtopics.map((subtopic, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            {subtopic}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Generate 10+ related seed keywords for this subtopic
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <SubtopicSeedKeywords 
                  subtopics={selectedSubtopics}
                  onKeywordsGenerated={handleKeywordsGenerated}
                  hideKeywordDisplay={true}
                />

                {/* Show generated keywords persistently */}
                {Object.keys(generatedKeywords).length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Generated Keywords
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(generatedKeywords).map(([subtopic, keywords]) => (
                        <Grid item xs={12} md={6} key={subtopic}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{subtopic}</Typography>
                                <Button 
                                  size="small" 
                                  variant="contained" 
                                  startIcon={<ContentCopy />} 
                                  onClick={() => {
                                    const keywordList = keywords.map(k => k.keyword).join(', ');
                                    navigator.clipboard.writeText(keywordList).then(() => {
                                      setSuccess(`Copied ${keywords.length} keywords to clipboard!`);
                                    });
                                  }}
                                >
                                  Copy CSV
                                </Button>
                              </Box>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxHeight: 150, overflowY: 'auto' }}>
                                {keywords.map((k, idx) => (
                                  <Chip key={`${subtopic}-${idx}-${k.keyword}`} label={k.keyword} size="small" />
                                ))}
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                {keywords.length} keywords
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            )}

            {/* No subtopics selected message */}
            {selectedSubtopics.length === 0 && selectedResearchId && selectedResearchId !== 'new' && (
              <Alert severity="info">
                No subtopics found for the selected research. Please select a different research or create a new one.
              </Alert>
            )}

            {/* Create new research message */}
            {selectedResearchId === 'new' && (
              <Alert severity="info">
                Create a new research topic to get started with content idea generation.
              </Alert>
            )}

            {/* Error display */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {/* Next button for manual progression */}
            {selectedSubtopics.length > 0 && Object.keys(generatedKeywords).length > 0 && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="body2" color="success.dark" sx={{ mb: 2 }}>
                  ✅ Keywords generated! Copy them to Ahrefs if needed, then proceed to the next step.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(1)}
                  size="large"
                >
                  Next: Upload Ahrefs Data (Optional)
                </Button>
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload Ahrefs Data (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload your Ahrefs CSV file to enhance keywords with real search data and metrics. This step is optional - you can skip to generate ideas with the seed keywords.
            </Typography>

            {/* Show generated keywords persistently */}
            {Object.keys(generatedKeywords).length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Generated Keywords (Available for Copy)
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(generatedKeywords).map(([subtopic, keywords]) => (
                    <Grid item xs={12} md={6} key={subtopic}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{subtopic}</Typography>
                            <Button 
                              size="small" 
                              variant="contained" 
                              startIcon={<ContentCopy />} 
                              onClick={() => {
                                const keywordList = keywords.map(k => k.keyword).join(', ');
                                navigator.clipboard.writeText(keywordList).then(() => {
                                  setSuccess(`Copied ${keywords.length} keywords to clipboard!`);
                                });
                              }}
                            >
                              Copy CSV
                            </Button>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxHeight: 150, overflowY: 'auto' }}>
                            {keywords.map((k, idx) => (
                              <Chip key={`${subtopic}-${idx}-${k.keyword}`} label={k.keyword} size="small" />
                            ))}
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            {keywords.length} keywords
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            
            <IndividualKeywordUpload
              contentIdeaId={researchId}
              onKeywordsUploaded={handleAhrefsUploaded}
              onOptimizationComplete={() => {}}
            />

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Skip this step?</strong> You can proceed to generate ideas using only the seed keywords by clicking "Next" below.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setActiveStep(2)}
                fullWidth
              >
                Skip Ahrefs Upload - Go to Generate Ideas
              </Button>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Generate Ideas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose how you want to generate your content ideas. You can either upload Ahrefs data for enhanced SEO or use the generated seed keywords.
            </Typography>

            {/* Show current status */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Status:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${Object.keys(generatedKeywords).length} subtopics with keywords`} 
                  color="success" 
                  size="small" 
                />
                {ahrefsKeywords.length > 0 && (
                  <Chip 
                    label={`${ahrefsKeywords.length} Ahrefs keywords uploaded`} 
                    color="primary" 
                    size="small" 
                  />
                )}
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Enhanced Ideas (with Ahrefs)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Generate SEO-optimized ideas using uploaded Ahrefs keyword data for maximum search performance.
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={`${Object.keys(generatedKeywords).length} subtopics with seed keywords`} 
                        color="success" 
                        size="small" 
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={`${ahrefsKeywords.length} Ahrefs keywords`} 
                        color="info" 
                        size="small" 
                      />
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleGenerateIdeasWithKeywords}
                      disabled={isLoading || (Object.keys(generatedKeywords).length === 0 && ahrefsKeywords.length === 0)}
                      startIcon={<Add />}
                    >
                      {isLoading ? 'Generating...' : 'Generate Enhanced Ideas'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="secondary">
                      Basic Ideas (Seed Keywords)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Generate ideas using the LLM-generated seed keywords for quick content planning.
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={`${selectedSubtopics.length} subtopics`} 
                        color="default" 
                        size="small" 
                      />
                    </Box>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleGenerateIdeasWithoutKeywords}
                      disabled={isLoading}
                      startIcon={<Add />}
                    >
                      {isLoading ? 'Generating...' : 'Generate Basic Ideas'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Instructions */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Instructions:</strong>
                <br />• <strong>Enhanced Ideas:</strong> Upload Ahrefs CSV in Step 1, then click here for SEO-optimized ideas
                <br />• <strong>Basic Ideas:</strong> Click here to generate ideas using the seed keywords from Step 0
              </Typography>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Generated Ideas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review and edit your generated content ideas. Each idea includes the keywords used for SEO optimization.
            </Typography>
            
            <Grid container spacing={2}>
              {contentIdeas.map((idea) => (
                <Grid item xs={12} md={6} key={idea.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 3 },
                      border: selectedIdea?.id === idea.id ? 2 : 1,
                      borderColor: selectedIdea?.id === idea.id ? 'primary.main' : 'divider'
                    }}
                    onClick={() => setSelectedIdea(idea)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {idea.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip label={idea.content_type} color="primary" size="small" />
                          <Chip label={idea.priority} color="secondary" size="small" />
                          {idea.is_enhanced && (
                            <Chip 
                              label="Enhanced" 
                              color="success" 
                              size="small" 
                              icon={<CheckCircle />}
                            />
                          )}
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {idea.description}
                      </Typography>
                      {idea.keywords_used && idea.keywords_used.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Keywords used:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {idea.keywords_used.slice(0, 5).map((kw: string, idx: number) => (
                              <Chip key={idx} label={kw} size="small" variant="outlined" />
                            ))}
                            {idea.keywords_used.length > 5 && (
                              <Chip 
                                label={`+${idea.keywords_used.length - 5} more`} 
                                size="small" 
                                variant="outlined" 
                                color="default"
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<TrendingUp />}
                        >
                          Enhance
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 4:
        return (
          <AffiliateNetworkSuggestions
            keywords={keywords}
            contentIdea={selectedIdea}
            onNetworkSelect={handleNetworkSelect}
            onGenerateAffiliateContent={handleGenerateAffiliateContent}
          />
        );

      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Content Generation Complete!
            </Typography>
            <Alert severity="success" sx={{ mb: 2 }}>
              Your SEO-optimized content has been generated with affiliate integration.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Generated Content
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Your content is ready with:
                    </Typography>
                    <ul>
                      <li>SEO-optimized title and meta description</li>
                      <li>Keyword-optimized content sections</li>
                      <li>Affiliate integration points</li>
                      <li>Internal linking suggestions</li>
                      <li>FAQ section</li>
                    </ul>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button variant="contained" startIcon={<ContentCopy />}>
                        View Content
                      </Button>
                      <Button variant="outlined" startIcon={<Save />}>
                        Save Draft
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Next Steps
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Recommended actions:
                    </Typography>
                    <ul>
                      <li>Review and edit the generated content</li>
                      <li>Add your affiliate links</li>
                      <li>Optimize images and media</li>
                      <li>Set up tracking and analytics</li>
                      <li>Schedule publication</li>
                    </ul>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button variant="contained" startIcon={<Share />}>
                        Publish
                      </Button>
                      <Button variant="outlined" startIcon={<Analytics />}>
                        Track Performance
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Lightbulb sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1">
            💡 Enhanced Idea Burst - NEW VERSION
          </Typography>
          <Typography variant="body1" color="text.secondary">
            AI-powered content idea optimization with keyword analysis and affiliate integration
          </Typography>
        </Box>
      </Box>

      {/* Status Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Progress Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="horizontal">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  icon={step.icon}
                  optional={
                    index === activeStep ? (
                      <Typography variant="caption">{step.description}</Typography>
                    ) : null
                  }
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardContent>
          {isLoading && <LinearProgress sx={{ mb: 2 }} />}
          {renderStepContent(activeStep)}
        </CardContent>
      </Card>

      {/* Navigation */}
      {activeStep > 0 && activeStep < 6 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={() => setActiveStep(prev => Math.min(6, prev + 1))}
            disabled={activeStep === 6}
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default EnhancedIdeaBurst;

