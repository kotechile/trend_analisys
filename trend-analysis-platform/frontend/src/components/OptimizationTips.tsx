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
  ListItemIcon,
  Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon
} from '@mui/icons-material';

interface OptimizationTip {
  id: string;
  title: string;
  description: string;
  category: 'title' | 'content' | 'keywords' | 'technical' | 'link' | 'meta';
  priority: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'high' | 'medium' | 'low';
  examples?: string[];
  resources?: string[];
}

interface OptimizationTipsProps {
  tips: OptimizationTip[];
  onTipSelect?: (tip: OptimizationTip) => void;
  onTipBookmark?: (tip: OptimizationTip) => void;
  onTipShare?: (tip: OptimizationTip) => void;
  showCategories?: boolean;
  showPriority?: boolean;
  compact?: boolean;
}

const OptimizationTips: React.FC<OptimizationTipsProps> = ({
  tips,
  onTipSelect,
  onTipBookmark,
  onTipShare,
  showCategories = true,
  showPriority = true,
  compact = false
}) => {
  const [bookmarkedTips, setBookmarkedTips] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'title': return 'primary';
      case 'content': return 'success';
      case 'keywords': return 'warning';
      case 'technical': return 'error';
      case 'link': return 'info';
      case 'meta': return 'secondary';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'title': return <SearchIcon />;
      case 'content': return <LightbulbIcon />;
      case 'keywords': return <TrendingUpIcon />;
      case 'technical': return <WarningIcon />;
      case 'link': return <TrendingUpIcon />;
      case 'meta': return <InfoIcon />;
      default: return <LightbulbIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };



  const handleBookmark = (tip: OptimizationTip) => {
    const newBookmarked = new Set(bookmarkedTips);
    if (newBookmarked.has(tip.id)) {
      newBookmarked.delete(tip.id);
    } else {
      newBookmarked.add(tip.id);
    }
    setBookmarkedTips(newBookmarked);
    onTipBookmark?.(tip);
  };


  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredTips = tips.filter(tip => {
    if (selectedCategory !== 'all' && tip.category !== selectedCategory) {
      return false;
    }
    if (selectedPriority !== 'all' && tip.priority !== selectedPriority) {
      return false;
    }
    return true;
  });

  const categories = [...new Set(tips.map(tip => tip.category))];
  const priorities = [...new Set(tips.map(tip => tip.priority))];

  if (compact) {
    return (
      <Box>
        {filteredTips.slice(0, 3).map((tip) => (
          <Card key={tip.id} sx={{ mb: 1 }}>
            <CardContent sx={{ py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getCategoryIcon(tip.category)}
                <Typography variant="body2" fontWeight="medium">
                  {tip.title}
                </Typography>
                <Chip
                  label={tip.priority}
                  color={getPriorityColor(tip.priority)}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        ))}
        {filteredTips.length > 3 && (
          <Typography variant="caption" color="text.secondary">
            +{filteredTips.length - 3} more tips
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Optimization Tips
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`${tips.length} tips`}
            color="primary"
            icon={<LightbulbIcon />}
          />
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2}>
          {showCategories && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Category
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label="All"
                  color={selectedCategory === 'all' ? 'primary' : 'default'}
                  onClick={() => setSelectedCategory('all')}
                  clickable
                />
                {categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    color={selectedCategory === category ? 'primary' : 'default'}
                    onClick={() => setSelectedCategory(category)}
                    clickable
                  />
                ))}
              </Box>
            </Grid>
          )}
          {showPriority && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Priority
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label="All"
                  color={selectedPriority === 'all' ? 'primary' : 'default'}
                  onClick={() => setSelectedPriority('all')}
                  clickable
                />
                {priorities.map((priority) => (
                  <Chip
                    key={priority}
                    label={priority}
                    color={selectedPriority === priority ? 'primary' : 'default'}
                    onClick={() => setSelectedPriority(priority)}
                    clickable
                  />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Tips Grid */}
      <Grid container spacing={3}>
        {filteredTips.map((tip) => {
          const isBookmarked = bookmarkedTips.has(tip.id);

          return (
            <Grid item xs={12} md={6} lg={4} key={tip.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {tip.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip
                          label={tip.category}
                          color={getCategoryColor(tip.category)}
                          size="small"
                          icon={getCategoryIcon(tip.category)}
                        />
                        <Chip
                          label={tip.priority}
                          color={getPriorityColor(tip.priority)}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}>
                        <IconButton
                          size="small"
                          onClick={() => handleBookmark(tip)}
                        >
                          {isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {tip.description}
                  </Typography>

                  {/* Metrics */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {tip.difficulty}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Difficulty
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="success.main">
                          {tip.impact}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Impact
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="warning.main">
                          {tip.priority}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Priority
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Examples */}
                  {tip.examples && tip.examples.length > 0 && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2">
                          Examples ({tip.examples.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {tip.examples.map((example, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon>
                                <CheckIcon color="success" />
                              </ListItemIcon>
                              <ListItemText
                                primary={example}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {/* Resources */}
                  {tip.resources && tip.resources.length > 0 && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2">
                          Resources ({tip.resources.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {tip.resources.map((resource, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemText
                                primary={resource}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleCopy(tip.title)}
                    startIcon={<CopyIcon />}
                  >
                    Copy
                  </Button>
                  <Box>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => onTipSelect?.(tip)}
                      sx={{ mr: 1 }}
                    >
                      Apply
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => onTipShare?.(tip)}
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

      {filteredTips.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LightbulbIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No optimization tips found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or check back later for new tips.
          </Typography>
        </Paper>
      )}

      {/* Summary */}
      {filteredTips.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {filteredTips.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tips
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {filteredTips.filter(tip => tip.priority === 'high').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  High Priority
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {filteredTips.filter(tip => tip.difficulty === 'easy').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Easy to Implement
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {filteredTips.filter(tip => tip.impact === 'high').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  High Impact
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default OptimizationTips;
