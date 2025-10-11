import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  AttachMoney as MoneyIcon,
  Search as SearchIcon,
  Compare as CompareIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
// import { createClient } from '@supabase/supabase-js';
// import * as api from '../services/api';

interface EnhancedIdeaBurstPageProps {
  // Existing props
  contentIdeas: any[];
  selectionIndicators: any[];
  onSelectIdea: (idea: any) => void;
  onFilterIdeas: (filter: string, value: string) => void;
  onSortIdeas: (field: string, order: string) => void;
  isLoading?: boolean;
  error?: string;
  
  // New Ahrefs enhancements
  ahrefsData?: AhrefsAnalysisData;
  enhancedFeedback?: boolean;
  modernUI?: boolean;
}

interface AhrefsAnalysisData {
  report_id: string;
  summary: {
    total_keywords: number;
    high_opportunity_count: number;
    medium_opportunity_count: number;
    low_opportunity_count: number;
    total_search_volume: number;
    average_difficulty: number;
    average_cpc: number;
  };
  top_opportunities: {
    high_opportunity_keywords: any[];
    quick_wins: any[];
    high_volume_targets: any[];
  };
  enhanced_ideas: {
    blog_ideas: BlogIdea[];
    software_ideas: SoftwareIdea[];
  };
}

interface BlogIdea {
  id: string;
  title: string;
  content_type: string;
  primary_keywords: string[];
  secondary_keywords: string[];
  seo_optimization_score: number;
  traffic_potential_score: number;
  combined_score: number;
  total_search_volume: number;
  average_difficulty: number;
  average_cpc: number;
  optimization_tips: string[];
  content_outline: string;
  target_audience: string;
  content_length: string;
  enhanced_with_ahrefs: boolean;
}

interface SoftwareIdea {
  id: string;
  title: string;
  description: string;
  features: string[];
  target_market: string;
  monetization_strategy: string;
  technical_requirements: string[];
  market_opportunity_score: number;
  development_difficulty: number;
  estimated_development_time: string;
  enhanced_with_ahrefs: boolean;
}

const EnhancedIdeaBurstPage: React.FC<EnhancedIdeaBurstPageProps> = ({
  contentIdeas,
  selectionIndicators,
  onSelectIdea,
  onFilterIdeas: _onFilterIdeas,
  onSortIdeas: _onSortIdeas,
  isLoading = false,
  error,
  ahrefsData,
  enhancedFeedback: _enhancedFeedback = true,
  modernUI: _modernUI = true
}) => {
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [expandedIdeas, setExpandedIdeas] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, _setSortBy] = useState<string>('combined_score');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [ideaType, setIdeaType] = useState<'blog' | 'software' | 'all'>('all');
  // const [ahrefsProcessing, setAhrefsProcessing] = useState<boolean>(false);
  // const [ahrefsFile, setAhrefsFile] = useState<File | null>(null);

  // Initialize Supabase client
  // const supabase = createClient(
  //   process.env.REACT_APP_SUPABASE_URL!,
  //   process.env.REACT_APP_SUPABASE_ANON_KEY!
  // );

  const handleAhrefsFileUpload = async (file: File) => {
    console.log('Ahrefs file upload:', file.name);
    // Placeholder for future implementation
  };

  const handleIdeaSelect = (ideaId: string) => {
    setSelectedIdeas(prev =>
      prev.includes(ideaId)
        ? prev.filter(id => id !== ideaId)
        : [...prev, ideaId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIdeas.length === getFilteredIdeas().length) {
      setSelectedIdeas([]);
    } else {
      setSelectedIdeas(getFilteredIdeas().map(idea => idea.id));
    }
  };

  const handleIdeaExpand = (ideaId: string) => {
    setExpandedIdeas(prev =>
      prev.includes(ideaId)
        ? prev.filter(id => id !== ideaId)
        : [...prev, ideaId]
    );
  };

  const handleSelectIdea = (idea: any) => {
    onSelectIdea(idea);
  };

  const handleExportIdeas = async () => {
    try {
      const ideasToExport = selectedIdeas.length > 0 
        ? getFilteredIdeas().filter(idea => selectedIdeas.includes(idea.id))
        : getFilteredIdeas();
      
      // await api.exportIdeas(ideasToExport);
      console.log('Export ideas:', ideasToExport);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getFilteredIdeas = () => {
    let filtered = contentIdeas;

    // Filter by idea type
    if (ideaType !== 'all') {
      filtered = filtered.filter(idea => {
        if (ideaType === 'blog') return idea.type === 'blog' || !idea.type;
        if (ideaType === 'software') return idea.type === 'software';
        return true;
      });
    }

    // Filter by content type
    if (filterType !== 'all') {
      filtered = filtered.filter(idea => idea.content_type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.primary_keywords.some((keyword: string) =>
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return filtered;
  };

  const getSortedIdeas = () => {
    const filtered = getFilteredIdeas();
    
    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'seo_score':
          aValue = a.seo_optimization_score || 0;
          bValue = b.seo_optimization_score || 0;
          break;
        case 'traffic_score':
          aValue = a.traffic_potential_score || 0;
          bValue = b.traffic_potential_score || 0;
          break;
        case 'search_volume':
          aValue = a.total_search_volume || 0;
          bValue = b.total_search_volume || 0;
          break;
        case 'combined_score':
        default:
          aValue = a.combined_score || 0;
          bValue = b.combined_score || 0;
          break;
      }
      
      return bValue - aValue;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return 'success';
    if (difficulty <= 60) return 'warning';
    return 'error';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const getIndicatorValue = (idea: any, indicatorType: string) => {
    switch (indicatorType) {
      case 'seo_score':
        return idea.seo_optimization_score || 0;
      case 'traffic_potential':
        return idea.traffic_potential_score || 0;
      case 'difficulty':
        return idea.average_difficulty || 0;
      case 'search_volume':
        return idea.total_search_volume || 0;
      case 'cpc':
        return idea.average_cpc || 0;
      default:
        return 0;
    }
  };

  const getIndicatorColor = (indicatorType: string, value: number) => {
    switch (indicatorType) {
      case 'seo_score':
      case 'traffic_potential':
        return value >= 80 ? 'success' : value >= 60 ? 'warning' : 'error';
      case 'difficulty':
        return value <= 30 ? 'success' : value <= 60 ? 'warning' : 'error';
      case 'search_volume':
        return value >= 10000 ? 'primary' : value >= 1000 ? 'info' : 'default';
      case 'cpc':
        return value >= 3.0 ? 'error' : value >= 1.0 ? 'warning' : 'success';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading content ideas...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error: {error}
      </Alert>
    );
  }

  if (!contentIdeas || contentIdeas.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No content ideas available. Generate some content ideas first.
      </Alert>
    );
  }

  const sortedIdeas = getSortedIdeas();

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Enhanced Idea Burst
      </Typography>

      {/* Ahrefs File Upload Section */}
      {!ahrefsData && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Upload Ahrefs File for Enhanced Ideas
          </Typography>
          
          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'primary.dark',
                bgcolor: 'action.hover'
              }
            }}
            onClick={() => document.getElementById('ahrefs-file-input')?.click()}
          >
            <input
              id="ahrefs-file-input"
              type="file"
              accept=".tsv,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAhrefsFileUpload(file);
              }}
              style={{ display: 'none' }}
            />
            
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Upload Ahrefs TSV File
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Get enhanced ideas with keyword metrics and rankings
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Ahrefs Analysis Results */}
      {ahrefsData && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Ahrefs Analysis Results
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Total Keywords
                  </Typography>
                  <Typography variant="h4">
                    {formatNumber(ahrefsData.summary.total_keywords)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success">
                    High Opportunity
                  </Typography>
                  <Typography variant="h4">
                    {ahrefsData.summary.high_opportunity_count}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="info">
                    Search Volume
                  </Typography>
                  <Typography variant="h4">
                    {formatNumber(ahrefsData.summary.total_search_volume)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="warning">
                    Avg Difficulty
                  </Typography>
                  <Typography variant="h4">
                    {ahrefsData.summary.average_difficulty.toFixed(1)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Selection Indicators */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Selection Indicators
        </Typography>
        
        <Grid container spacing={2}>
          {selectionIndicators.map((indicator, index) => (
            <Grid item xs={12} sm={6} md={2} key={index}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color={getIndicatorColor(indicator.type, indicator.value)}>
                    {indicator.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {indicator.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Filters and Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search content ideas"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by content type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Filter by content type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="list-article">List Article</MenuItem>
                <MenuItem value="how-to-guide">How-to Guide</MenuItem>
                <MenuItem value="comparison">Comparison</MenuItem>
                <MenuItem value="review">Review</MenuItem>
                <MenuItem value="tutorial">Tutorial</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Idea Type</InputLabel>
              <Select
                value={ideaType}
                onChange={(e) => setIdeaType(e.target.value as 'blog' | 'software' | 'all')}
                label="Idea Type"
              >
                <MenuItem value="all">All Ideas</MenuItem>
                <MenuItem value="blog">Blog Ideas</MenuItem>
                <MenuItem value="software">Software Ideas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportIdeas}
                size="small"
              >
                Export Ideas
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<CompareIcon />}
                onClick={() => setShowComparison(!showComparison)}
                size="small"
              >
                Compare Ideas
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedIdeas.length === getFilteredIdeas().length}
                onChange={handleSelectAll}
                indeterminate={selectedIdeas.length > 0 && selectedIdeas.length < getFilteredIdeas().length}
              />
            }
            label="Select all ideas"
          />
          
          <Typography variant="body2" color="text.secondary">
            {selectedIdeas.length} of {getFilteredIdeas().length} ideas selected
          </Typography>
        </Box>
      </Paper>

      {/* Content Ideas Grid */}
      <Grid container spacing={3}>
        {sortedIdeas.map((idea) => (
          <Grid item xs={12} md={6} key={idea.id}>
            <Card 
              variant="outlined"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: selectedIdeas.includes(idea.id) ? '2px solid' : '1px solid',
                borderColor: selectedIdeas.includes(idea.id) ? 'primary.main' : 'divider'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Checkbox
                    checked={selectedIdeas.includes(idea.id)}
                    onChange={() => handleIdeaSelect(idea.id)}
                    sx={{ mr: 1 }}
                  />
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {idea.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={idea.content_type}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        label={`SEO: ${idea.seo_optimization_score}`}
                        color={getScoreColor(idea.seo_optimization_score)}
                        size="small"
                      />
                      <Chip
                        label={`Traffic: ${idea.traffic_potential_score}`}
                        color={getScoreColor(idea.traffic_potential_score)}
                        size="small"
                      />
                      {idea.enhanced_with_ahrefs && (
                        <Chip
                          label="Ahrefs Enhanced"
                          color="success"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Selection Indicators */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selection Indicators:
                  </Typography>
                  <Grid container spacing={1}>
                    {selectionIndicators.map((indicator, index) => {
                      const value = getIndicatorValue(idea, indicator.type);
                      const color = getIndicatorColor(indicator.type, value);
                      
                      return (
                        <Grid item xs={6} key={index}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {indicator.label}:
                            </Typography>
                            <Chip
                              label={value}
                              color={color}
                              size="small"
                            />
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>

                {/* Metrics */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SearchIcon color="primary" fontSize="small" />
                      <Typography variant="body2">
                        {formatNumber(idea.total_search_volume)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SpeedIcon color="warning" fontSize="small" />
                      <Typography variant="body2">
                        {idea.average_difficulty}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MoneyIcon color="success" fontSize="small" />
                      <Typography variant="body2">
                        {formatCurrency(idea.average_cpc)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon color="info" fontSize="small" />
                      <Typography variant="body2">
                        {idea.combined_score}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Primary Keywords */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Primary Keywords:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {idea.primary_keywords?.slice(0, 3).map((keyword: string, index: number) => (
                      <Chip
                        key={index}
                        label={keyword}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                    {idea.primary_keywords?.length > 3 && (
                      <Chip
                        label={`+${idea.primary_keywords.length - 3} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>

                {/* Expandable Details */}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="text"
                    onClick={() => handleIdeaExpand(idea.id)}
                    startIcon={<ExpandMoreIcon />}
                    size="small"
                  >
                    {expandedIdeas.includes(idea.id) ? 'Hide Details' : 'View Details'}
                  </Button>
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  onClick={() => handleSelectIdea(idea)}
                  startIcon={<CheckCircleIcon />}
                  size="small"
                >
                  Select Idea
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Comparison View */}
      {showComparison && selectedIdeas.length >= 2 && (
        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Idea Comparison
          </Typography>
          
          <Grid container spacing={3}>
            {selectedIdeas.map(ideaId => {
              const idea = contentIdeas.find(i => i.id === ideaId);
              if (!idea) return null;
              
              return (
                <Grid item xs={12} md={6} key={ideaId}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {idea.title}
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            SEO Score
                          </Typography>
                          <Typography variant="h6" color={getScoreColor(idea.seo_optimization_score)}>
                            {idea.seo_optimization_score}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Traffic Score
                          </Typography>
                          <Typography variant="h6" color={getScoreColor(idea.traffic_potential_score)}>
                            {idea.traffic_potential_score}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Search Volume
                          </Typography>
                          <Typography variant="h6">
                            {formatNumber(idea.total_search_volume)}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Difficulty
                          </Typography>
                          <Typography variant="h6" color={getDifficultyColor(idea.average_difficulty)}>
                            {idea.average_difficulty}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default EnhancedIdeaBurstPage;


