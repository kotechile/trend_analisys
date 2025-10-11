import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Tooltip,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  CheckCircle as CheckIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon
} from '@mui/icons-material';

interface IdeaCardProps {
  idea: {
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
  };
  onSelect?: (idea: any) => void;
  onBookmark?: (idea: any) => void;
  onShare?: (idea: any) => void;
  onCopy?: (text: string) => void;
  selected?: boolean;
  compact?: boolean;
  showDetails?: boolean;
}

const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  onSelect,
  onBookmark,
  onShare,
  onCopy,
  selected = false,
  compact = false,
  showDetails = true
}) => {
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [favorited, setFavorited] = useState(false);

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

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return 'success';
    if (difficulty <= 60) return 'warning';
    return 'error';
  };


  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    onBookmark?.(idea);
  };

  const handleFavorite = () => {
    setFavorited(!favorited);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    onCopy?.(text);
  };

  const handleExpand = () => {
    setExpanded(!expanded);
  };

  const combinedScore = (idea.seo_optimization_score + idea.traffic_potential_score) / 2;

  if (compact) {
    return (
      <Card 
        sx={{ 
          border: selected ? '2px solid' : '1px solid',
          borderColor: selected ? 'primary.main' : 'divider',
          cursor: 'pointer'
        }}
        onClick={() => onSelect?.(idea)}
      >
        <CardContent sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="body2" fontWeight="medium" sx={{ flexGrow: 1 }}>
              {idea.title}
            </Typography>
            <Chip
              label={`${combinedScore.toFixed(1)}`}
              color={getScoreColor(combinedScore)}
              size="small"
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label={idea.content_type}
              color={getContentTypeColor(idea.content_type)}
              size="small"
            />
            <Chip
              label={`${formatNumber(idea.total_search_volume)} vol`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${idea.average_difficulty.toFixed(1)} diff`}
              color={getDifficultyColor(idea.average_difficulty)}
              size="small"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        border: selected ? '2px solid' : '1px solid',
        borderColor: selected ? 'primary.main' : 'divider'
      }}
    >
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
                color={getScoreColor(combinedScore)}
                size="small"
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={favorited ? 'Remove from favorites' : 'Add to favorites'}>
              <IconButton
                size="small"
                onClick={handleFavorite}
              >
                {favorited ? <StarIcon color="warning" /> : <StarBorderIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}>
              <IconButton
                size="small"
                onClick={handleBookmark}
              >
                {bookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Metrics */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">
                {formatNumber(idea.total_search_volume)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Volume
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main">
                {idea.average_difficulty.toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Difficulty
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="info.main">
                ${idea.average_cpc.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                CPC
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
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Primary Keywords:
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {idea.primary_keywords.slice(0, 3).map((keyword) => (
              <Chip
                key={keyword}
                label={keyword}
                size="small"
                color="primary"
                icon={<SearchIcon />}
              />
            ))}
            {idea.primary_keywords.length > 3 && (
              <Chip
                label={`+${idea.primary_keywords.length - 3}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Optimization Tips */}
        {showDetails && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Key Tips:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {idea.optimization_tips.slice(0, 2).join(' • ')}
            </Typography>
          </Box>
        )}

        {/* Expandable Details */}
        {showDetails && (
          <Collapse in={expanded}>
            <Divider sx={{ my: 2 }} />
            
            {/* Secondary Keywords */}
            <Box sx={{ mb: 2 }}>
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

            {/* All Optimization Tips */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                All Optimization Tips:
              </Typography>
              <List dense>
                {idea.optimization_tips.map((tip, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={tip}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Content Outline */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Content Outline:
              </Typography>
              <List dense>
                {idea.content_outline.map((section, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon>
                      <Typography variant="body2" color="primary">
                        {index + 1}.
                      </Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={section}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Collapse>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleCopy(idea.title)}
            startIcon={<CopyIcon />}
          >
            Copy Title
          </Button>
          {showDetails && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleExpand}
              endIcon={expanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
            >
              {expanded ? 'Less' : 'More'}
            </Button>
          )}
        </Box>
        <Box>
          <Button
            variant={selected ? 'contained' : 'outlined'}
            size="small"
            onClick={() => onSelect?.(idea)}
            sx={{ mr: 1 }}
          >
            {selected ? 'Selected' : 'Select'}
          </Button>
          <IconButton
            size="small"
            onClick={() => onShare?.(idea)}
          >
            <ShareIcon />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
};

export default IdeaCard;
