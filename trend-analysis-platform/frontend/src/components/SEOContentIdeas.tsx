import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Badge
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon
} from '@mui/icons-material';

interface SEOContentIdea {
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
}

interface SEOContentIdeasProps {
  ideas: SEOContentIdea[];
  onIdeaSelect?: (idea: SEOContentIdea) => void;
  onIdeaBookmark?: (idea: SEOContentIdea) => void;
  onIdeaShare?: (idea: SEOContentIdea) => void;
  showFilters?: boolean;
}

const SEOContentIdeas: React.FC<SEOContentIdeasProps> = ({
  ideas,
  onIdeaSelect,
  onIdeaBookmark,
  onIdeaShare,
  showFilters = true
}) => {
  const [bookmarkedIdeas, setBookmarkedIdeas] = useState<Set<string>>(new Set());
  const [favoriteIdeas, setFavoriteIdeas] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'score' | 'volume' | 'difficulty'>('score');
  const [filterType, setFilterType] = useState<string>('all');

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getContentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'article': return 'primary';
      case 'comparison': return 'secondary';
      case 'guide': return 'success';
      case 'tutorial': return 'info';
      case 'review': return 'warning';
      default: return 'default';
    }
  };

  const handleBookmark = (idea: SEOContentIdea) => {
    const ideaId = idea.title;
    const newBookmarked = new Set(bookmarkedIdeas);
    if (newBookmarked.has(ideaId)) {
      newBookmarked.delete(ideaId);
    } else {
      newBookmarked.add(ideaId);
    }
    setBookmarkedIdeas(newBookmarked);
    onIdeaBookmark?.(idea);
  };

  const handleFavorite = (idea: SEOContentIdea) => {
    const ideaId = idea.title;
    const newFavorites = new Set(favoriteIdeas);
    if (newFavorites.has(ideaId)) {
      newFavorites.delete(ideaId);
    } else {
      newFavorites.add(ideaId);
    }
    setFavoriteIdeas(newFavorites);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const sortedAndFilteredIdeas = ideas
    .filter(idea => filterType === 'all' || idea.content_type === filterType)
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.seo_optimization_score + b.traffic_potential_score) - 
                 (a.seo_optimization_score + a.traffic_potential_score);
        case 'volume':
          return b.total_search_volume - a.total_search_volume;
        case 'difficulty':
          return a.average_difficulty - b.average_difficulty;
        default:
          return 0;
      }
    });

  const contentTypes = [...new Set(ideas.map(idea => idea.content_type))];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          SEO Content Ideas
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`${ideas.length} ideas`}
            color="primary"
            icon={<LightbulbIcon />}
          />
        </Box>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filters & Sorting
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Sort by:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[
                  { value: 'score', label: 'Score' },
                  { value: 'volume', label: 'Volume' },
                  { value: 'difficulty', label: 'Difficulty' }
                ].map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    color={sortBy === option.value ? 'primary' : 'default'}
                    onClick={() => setSortBy(option.value as any)}
                    clickable
                  />
                ))}
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Content type:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label="All"
                  color={filterType === 'all' ? 'primary' : 'default'}
                  onClick={() => setFilterType('all')}
                  clickable
                />
                {contentTypes.map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    color={filterType === type ? 'primary' : 'default'}
                    onClick={() => setFilterType(type)}
                    clickable
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Ideas Grid */}
      <Grid container spacing={3}>
        {sortedAndFilteredIdeas.map((idea, index) => {
          const ideaId = idea.title;
          const isBookmarked = bookmarkedIdeas.has(ideaId);
          const isFavorite = favoriteIdeas.has(ideaId);
          const combinedScore = idea.seo_optimization_score + idea.traffic_potential_score;

          return (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {idea.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip
                          label={idea.content_type}
                          color={getContentTypeColor(idea.content_type)}
                          size="small"
                        />
                        <Chip
                          label={`Score: ${combinedScore.toFixed(1)}`}
                          color={getScoreColor(combinedScore / 2)}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                        <IconButton
                          size="small"
                          onClick={() => handleFavorite(idea)}
                        >
                          {isFavorite ? <StarIcon color="warning" /> : <StarBorderIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}>
                        <IconButton
                          size="small"
                          onClick={() => handleBookmark(idea)}
                        >
                          {isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Metrics */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="success.main">
                          {formatNumber(idea.total_search_volume)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Search Volume
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="warning.main">
                          {idea.average_difficulty.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Difficulty
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Scores */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">SEO Score</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {idea.seo_optimization_score.toFixed(1)} ({getScoreLabel(idea.seo_optimization_score)})
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Traffic Score</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {idea.traffic_potential_score.toFixed(1)} ({getScoreLabel(idea.traffic_potential_score)})
                      </Typography>
                    </Box>
                  </Box>

                  {/* Keywords */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">
                        Keywords ({idea.primary_keywords.length + idea.secondary_keywords.length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Primary Keywords:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                          {idea.primary_keywords.map((keyword) => (
                            <Chip
                              key={keyword}
                              label={keyword}
                              size="small"
                              color="primary"
                              icon={<SearchIcon />}
                            />
                          ))}
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Secondary Keywords:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {idea.secondary_keywords.map((keyword) => (
                            <Chip
                              key={keyword}
                              label={keyword}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* Optimization Tips */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">
                        Optimization Tips ({idea.optimization_tips.length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {idea.optimization_tips.slice(0, 3).map((tip, tipIndex) => (
                          <ListItem key={tipIndex} sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={tip}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleCopy(idea.title)}
                    startIcon={<CopyIcon />}
                  >
                    Copy Title
                  </Button>
                  <Box>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => onIdeaSelect?.(idea)}
                      sx={{ mr: 1 }}
                    >
                      Select
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => onIdeaShare?.(idea)}
                    >
                      <ShareIcon />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {sortedAndFilteredIdeas.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LightbulbIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No content ideas found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or check back later for new ideas.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default SEOContentIdeas;

