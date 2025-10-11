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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Switch,
  FormControlLabel,
  Divider
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
  ContentCopy as CopyIcon
} from '@mui/icons-material';

import IdeaCard from '../components/IdeaCard';

interface ContentIdeasPageProps {
  onNavigate?: (_page: string) => void;
}

interface ContentIdea {
  id: string;
  title: string;
  content_type: string;
  primary_keywords: string[];
  secondary_keywords: string[];
  seo_optimization_score: number;
  traffic_potential_score: number;
  total_search_volume: number;
  average_difficulty: number;
  average_cpc: number;
  optimization_tips: string[];
  content_outline: string[];
  created_at: string;
  bookmarked?: boolean;
  favorited?: boolean;
}

const ContentIdeasPage: React.FC<ContentIdeasPageProps> = ({
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<ContentIdea[]>([]);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const [selectedIdeas, setSelectedIdeas] = useState<Set<string>>(new Set());
  const [bookmarkedIdeas, setBookmarkedIdeas] = useState<Set<string>>(new Set());
  const [favoritedIdeas, setFavoritedIdeas] = useState<Set<string>>(new Set());
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
  const [volumeRange, setVolumeRange] = useState<[number, number]>([0, 100000]);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [showFavoritedOnly, setShowFavoritedOnly] = useState(false);
  
  // Sort options
  const [sortBy] = useState<string>('score');
  const [sortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Dialog states
  const [showFilters, setShowFilters] = useState(false);
  // const [showIdeaDetails, setShowIdeaDetails] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockIdeas: ContentIdea[] = [
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
      },
      {
        id: '3',
        title: 'How to Build High-Quality Backlinks',
        content_type: 'guide',
        primary_keywords: ['backlink building', 'link building'],
        secondary_keywords: ['backlink strategy', 'link building tips', 'SEO backlinks'],
        seo_optimization_score: 88.7,
        traffic_potential_score: 82.1,
        total_search_volume: 15600,
        average_difficulty: 72.3,
        average_cpc: 4.20,
        optimization_tips: [
          'Focus on high-authority domains',
          'Create linkable content',
          'Build relationships with influencers'
        ],
        content_outline: [
          'Introduction',
          'What are Backlinks?',
          'Link Building Strategies',
          'Tools and Resources',
          'Common Mistakes',
          'Conclusion'
        ],
        created_at: new Date().toISOString()
      }
    ];
    
    setIdeas(mockIdeas);
    setFilteredIdeas(mockIdeas);
  }, []);

  // Filter and sort ideas
  useEffect(() => {
    let filtered = ideas.filter(idea => {
      // Search filter
      if (searchTerm && !idea.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !idea.primary_keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }

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
    });

    // Sort ideas
    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortBy) {
        case 'score':
          aValue = (a.seo_optimization_score + a.traffic_potential_score) / 2;
          bValue = (b.seo_optimization_score + b.traffic_potential_score) / 2;
          break;
        case 'volume':
          aValue = a.total_search_volume;
          bValue = b.total_search_volume;
          break;
        case 'difficulty':
          aValue = a.average_difficulty;
          bValue = b.average_difficulty;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredIdeas(filtered);
  }, [ideas, searchTerm, contentTypeFilter, scoreRange, volumeRange, showBookmarkedOnly, showFavoritedOnly, sortBy, sortDirection, bookmarkedIdeas, favoritedIdeas]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleIdeaSelect = (idea: ContentIdea) => {
    const newSelected = new Set(selectedIdeas);
    if (newSelected.has(idea.id)) {
      newSelected.delete(idea.id);
    } else {
      newSelected.add(idea.id);
    }
    setSelectedIdeas(newSelected);
  };

  const handleBookmark = (idea: ContentIdea) => {
    const newBookmarked = new Set(bookmarkedIdeas);
    if (newBookmarked.has(idea.id)) {
      newBookmarked.delete(idea.id);
    } else {
      newBookmarked.add(idea.id);
    }
    setBookmarkedIdeas(newBookmarked);
  };

  // const handleFavorite = (idea: ContentIdea) => {
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

  const handleExport = (format: string) => {
    console.log(`Exporting ideas in ${format} format`);
    setShowExportDialog(false);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const contentTypes = [...new Set(ideas.map(idea => idea.content_type))];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Content Ideas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover and manage SEO-optimized content ideas
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
            onClick={() => onNavigate?.('/idea-burst')}
          >
            Generate New Ideas
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
                {ideas.length}
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="All Ideas" icon={<LightbulbIcon />} />
          <Tab label="Bookmarked" icon={<BookmarkIcon />} />
          <Tab label="Favorites" icon={<StarIcon />} />
          <Tab label="Selected" icon={<TrendingUpIcon />} />
        </Tabs>
      </Paper>

      {/* Ideas Grid */}
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

      {filteredIdeas.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LightbulbIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No content ideas found
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

export default ContentIdeasPage;
