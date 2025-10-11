import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Slider,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  Star as StarIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Upload as UploadIcon,
  Analytics as AnalyticsIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';

import IdeaCard from '../components/IdeaCard';

interface IdeaBurstPageProps {
  onNavigate?: (_page: string) => void;
}

interface IdeaBurstSession {
  id: string;
  user_id: string;
  ideas: any[];
  selected_ideas: string[];
  filters: {
    content_type: string;
    min_score: number;
    max_difficulty: number;
  };
  sort_by: string;
  created_at: string;
  updated_at: string;
}

const IdeaBurstPage: React.FC<IdeaBurstPageProps> = ({
  onNavigate
}) => {
  const [activeTab] = useState(0);
  const [session, setSession] = useState<IdeaBurstSession | null>(null);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const [selectedIdeas, setSelectedIdeas] = useState<Set<string>>(new Set());
  const [bookmarkedIdeas, setBookmarkedIdeas] = useState<Set<string>>(new Set());
  const [favoritedIdeas, setFavoritedIdeas] = useState<Set<string>>(new Set());
  
  // Generation options
  const [generationType, setGenerationType] = useState<'seed' | 'ahrefs'>('seed');
  const [seedKeywords, setSeedKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  // const [ahrefsFileId, setAhrefsFileId] = useState<string | null>(null);
  
  // Filters
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
  const [volumeRange, setVolumeRange] = useState<[number, number]>([0, 100000]);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [showFavoritedOnly, setShowFavoritedOnly] = useState(false);
  
  // Sort options
  const [sortBy] = useState<string>('score');
  const [sortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Dialog states
  const [showGenerationDialog, setShowGenerationDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  // const [showIdeaDetails, setShowIdeaDetails] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Mock data for demonstration
  useEffect(() => {
    const mockSession: IdeaBurstSession = {
      id: 'session_1',
      user_id: 'user_1',
      ideas: [
        {
          id: '1',
          title: 'The Ultimate Guide to SEO Optimization',
          content_type: 'article',
          primary_keywords: ['SEO optimization', 'search engine optimization'],
          secondary_keywords: ['SEO tips', 'SEO best practices', 'SEO strategy'],
          seo_optimization_score: 85.5,
          traffic_potential_score: 78.2,
          total_search_volume: 12500,
          average_difficulty: 65.5,
          average_cpc: 2.45,
          optimization_tips: [
            'Include primary keyword in title and first paragraph',
            'Use secondary keywords in H2 headings',
            'Add internal links to related content'
          ],
          content_outline: [
            'Introduction',
            'What is SEO?',
            'Key SEO Factors',
            'Best Practices',
            'Common Mistakes',
            'Conclusion'
          ],
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Best SEO Tools Comparison 2024',
          content_type: 'comparison',
          primary_keywords: ['SEO tools', 'best SEO tools'],
          secondary_keywords: ['SEO software', 'SEO platforms', 'SEO analytics'],
          seo_optimization_score: 82.1,
          traffic_potential_score: 85.3,
          total_search_volume: 8900,
          average_difficulty: 58.2,
          average_cpc: 3.15,
          optimization_tips: [
            'Create comparison tables',
            'Include pros and cons sections',
            'Add user reviews and ratings'
          ],
          content_outline: [
            'Introduction',
            'Tool A Overview',
            'Tool B Overview',
            'Head-to-Head Comparison',
            'Final Verdict'
          ],
          created_at: new Date().toISOString()
        }
      ],
      selected_ideas: [],
      filters: {
        content_type: 'all',
        min_score: 0,
        max_difficulty: 100
      },
      sort_by: 'score',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setSession(mockSession);
  }, []);

  // const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
  //   setActiveTab(newValue);
  // };

  const handleGenerateIdeas = async (_type: 'seed' | 'ahrefs') => {
    // setLoading(true);
    // setError(null);
    
    try {
      // Mock idea generation
      setTimeout(() => {
        const newIdeas = [
          {
            id: `idea_${Date.now()}`,
            title: `Generated Idea ${Date.now()}`,
            content_type: 'article',
            primary_keywords: ['generated keyword'],
            secondary_keywords: ['secondary keyword'],
            seo_optimization_score: Math.random() * 100,
            traffic_potential_score: Math.random() * 100,
            total_search_volume: Math.floor(Math.random() * 10000),
            average_difficulty: Math.random() * 100,
            average_cpc: Math.random() * 5,
            optimization_tips: ['Generated tip'],
            content_outline: ['Generated outline'],
            created_at: new Date().toISOString()
          }
        ];
        
        if (session) {
          setSession({
            ...session,
            ideas: [...session.ideas, ...newIdeas],
            updated_at: new Date().toISOString()
          });
        }
        
        // setLoading(false);
      }, 2000);
      
    } catch (err) {
      // setError(err instanceof Error ? err.message : 'Generation failed');
      // setLoading(false);
    }
  };

  const handleIdeaSelect = (idea: any) => {
    const newSelected = new Set(selectedIdeas);
    if (newSelected.has(idea.id)) {
      newSelected.delete(idea.id);
    } else {
      newSelected.add(idea.id);
    }
    setSelectedIdeas(newSelected);
  };

  const handleBookmark = (idea: any) => {
    const newBookmarked = new Set(bookmarkedIdeas);
    if (newBookmarked.has(idea.id)) {
      newBookmarked.delete(idea.id);
    } else {
      newBookmarked.add(idea.id);
    }
    setBookmarkedIdeas(newBookmarked);
  };

  // const handleFavorite = (idea: any) => {
  //   const newFavorited = new Set(favoritedIdeas);
  //   if (newFavorited.has(idea.id)) {
  //     newFavorited.delete(idea.id);
  //   } else {
  //     newFavorited.add(idea.id);
  //   }
  //   setFavoritedIdeas(newFavorited);
  // };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      setSeedKeywords([...seedKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setSeedKeywords(seedKeywords.filter((_, i) => i !== index));
  };

  const handleExport = (format: string) => {
    console.log(`Exporting ideas in ${format} format`);
    setShowExportDialog(false);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const contentTypes = [...new Set(session?.ideas.map(idea => idea.content_type) || [])];

  const filteredIdeas = session?.ideas.filter(idea => {
    // Content type filter
    if (contentTypeFilter !== 'all' && idea.content_type !== contentTypeFilter) {
      return false;
    }

    // Score range filter
    const combinedScore = (idea.seo_optimization_score + idea.traffic_potential_score) / 2;
    if (combinedScore < scoreRange[0] || combinedScore > scoreRange[1]) {
      return false;
    }

    // Volume range filter
    if (idea.total_search_volume < volumeRange[0] || idea.total_search_volume > volumeRange[1]) {
      return false;
    }

    // Bookmarked filter
    if (showBookmarkedOnly && !bookmarkedIdeas.has(idea.id)) {
      return false;
    }

    // Favorited filter
    if (showFavoritedOnly && !favoritedIdeas.has(idea.id)) {
      return false;
    }

    return true;
  }) || [];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Idea Burst
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate and explore content ideas
        </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => setShowExportDialog(true)}
            disabled={selectedIdeas.size === 0}
          >
            Export Selected
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowGenerationDialog(true)}
          >
            Generate Ideas
          </Button>
        </Box>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LightbulbIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Ideas</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {session?.ideas.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BookmarkIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Bookmarked</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {bookmarkedIdeas.size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StarIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Favorites</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {favoritedIdeas.size}
        </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Selected</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {selectedIdeas.size}
        </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search ideas..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={<SortIcon />}
          >
            Sort
          </Button>
        </Box>

        {/* Advanced Filters */}
        {showFilters && (
          <Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Content Type</InputLabel>
                  <Select
                    value={contentTypeFilter}
                    onChange={(e) => setContentTypeFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    {contentTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Score Range: {scoreRange[0]} - {scoreRange[1]}
                </Typography>
                <Slider
                  value={scoreRange}
                  onChange={(e, newValue) => setScoreRange(newValue as [number, number])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Volume Range: {formatNumber(volumeRange[0])} - {formatNumber(volumeRange[1])}
                </Typography>
                <Slider
                  value={volumeRange}
                  onChange={(e, newValue) => setVolumeRange(newValue as [number, number])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100000}
                  step={1000}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showBookmarkedOnly}
                        onChange={(e) => setShowBookmarkedOnly(e.target.checked)}
                      />
                    }
                    label="Bookmarked Only"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showFavoritedOnly}
                        onChange={(e) => setShowFavoritedOnly(e.target.checked)}
                      />
                    }
                    label="Favorites Only"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Ideas Grid */}
      {filteredIdeas.length > 0 ? (
        <Grid container spacing={3}>
          {filteredIdeas.map((idea) => (
            <Grid item xs={12} md={6} lg={4} key={idea.id}>
              <IdeaCard
                idea={idea}
                onSelect={handleIdeaSelect}
                onBookmark={handleBookmark}
                onCopy={handleCopy}
                selected={selectedIdeas.has(idea.id)}
                showDetails={true}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LightbulbIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No ideas found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or generate new ideas.
          </Typography>
        </Paper>
      )}

      {/* Selected Ideas Summary */}
      {selectedIdeas.size > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedIdeas.size} idea(s) selected
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={() => console.log('Copy selected ideas')}
              >
                Copy Titles
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => setShowExportDialog(true)}
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<ShareIcon />}
                onClick={() => console.log('Share selected ideas')}
              >
                Share
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Generation Dialog */}
      <Dialog
        open={showGenerationDialog}
        onClose={() => setShowGenerationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Generate Content Ideas
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              <Step>
                <StepLabel>Choose Generation Method</StepLabel>
                <StepContent>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Button
                      variant={generationType === 'seed' ? 'contained' : 'outlined'}
                      startIcon={<PsychologyIcon />}
                      onClick={() => setGenerationType('seed')}
                    >
                      Seed Keywords
                    </Button>
                    <Button
                      variant={generationType === 'ahrefs' ? 'contained' : 'outlined'}
                      startIcon={<AnalyticsIcon />}
                      onClick={() => setGenerationType('ahrefs')}
                    >
                      Ahrefs Data
                    </Button>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(1)}
                    sx={{ mt: 1 }}
                  >
                    Continue
                  </Button>
                </StepContent>
              </Step>
              
              <Step>
                <StepLabel>
                  {generationType === 'seed' ? 'Enter Seed Keywords' : 'Select Ahrefs File'}
                </StepLabel>
                <StepContent>
                  {generationType === 'seed' ? (
                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                          fullWidth
                          placeholder="Enter a keyword..."
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                        />
                        <Button
                          variant="outlined"
                          onClick={handleAddKeyword}
                          disabled={!newKeyword.trim()}
                        >
                          Add
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {seedKeywords.map((keyword, index) => (
                          <Chip
                            key={index}
                            label={keyword}
                            onDelete={() => handleRemoveKeyword(index)}
                            color="primary"
                          />
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Button
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        onClick={() => onNavigate?.('/keyword-analysis')}
                      >
                        Upload Ahrefs File
                      </Button>
                    </Box>
                  )}
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(2)}
                    sx={{ mt: 1 }}
                    disabled={generationType === 'seed' && seedKeywords.length === 0}
                  >
                    Continue
                  </Button>
                </StepContent>
              </Step>
              
              <Step>
                <StepLabel>Configure Options</StepLabel>
                <StepContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Content Types</InputLabel>
                      <Select multiple value={['article', 'comparison']}>
                        <MenuItem value="article">Articles</MenuItem>
                        <MenuItem value="comparison">Comparisons</MenuItem>
                        <MenuItem value="guide">Guides</MenuItem>
                        <MenuItem value="tutorial">Tutorials</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Number of Ideas"
                      type="number"
                      defaultValue={10}
                      inputProps={{ min: 1, max: 50 }}
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Include optimization tips"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Include content outlines"
                    />
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => {
                      handleGenerateIdeas(generationType);
                      setShowGenerationDialog(false);
                      setActiveStep(0);
                    }}
                    sx={{ mt: 1 }}
                  >
                    Generate Ideas
                  </Button>
                </StepContent>
              </Step>
            </Stepper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGenerationDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Export Content Ideas
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select
                value="json"
                onChange={(e) => console.log('Format changed:', e.target.value)}
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="xlsx">Excel</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Include optimization tips"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Include content outlines"
            />
            <FormControlLabel
              control={<Switch />}
              label="Include keyword data"
            />
    </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => handleExport('json')}>
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default IdeaBurstPage;