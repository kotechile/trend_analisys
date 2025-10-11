import React from 'react';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Tooltip,
  Badge,
  Paper,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Lightbulb as LightbulbIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface SelectionIndicator {
  type: 'score' | 'volume' | 'difficulty' | 'cpc' | 'intent' | 'competition';
  value: number;
  label: string;
  description: string;
  color: 'success' | 'warning' | 'error' | 'info';
  icon: React.ReactNode;
}

interface SelectionIndicatorsProps {
  idea: {
    id: string;
    title: string;
    seo_optimization_score: number;
    traffic_potential_score: number;
    total_search_volume: number;
    average_difficulty: number;
    average_cpc: number;
    primary_keywords: string[];
    secondary_keywords: string[];
    content_type: string;
  };
  showDetails?: boolean;
  compact?: boolean;
}

const SelectionIndicators: React.FC<SelectionIndicatorsProps> = ({
  idea,
  showDetails = true,
  compact = false
}) => {
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

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return 'success';
    if (difficulty <= 60) return 'warning';
    return 'error';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 30) return 'Easy';
    if (difficulty <= 60) return 'Medium';
    return 'Hard';
  };

  const getVolumeColor = (volume: number) => {
    if (volume >= 10000) return 'success';
    if (volume >= 1000) return 'warning';
    return 'error';
  };

  const getVolumeLabel = (volume: number) => {
    if (volume >= 10000) return 'High';
    if (volume >= 1000) return 'Medium';
    return 'Low';
  };

  const getCPCColor = (cpc: number) => {
    if (cpc >= 5) return 'success';
    if (cpc >= 2) return 'warning';
    return 'error';
  };

  const getCPCLabel = (cpc: number) => {
    if (cpc >= 5) return 'High Value';
    if (cpc >= 2) return 'Medium Value';
    return 'Low Value';
  };

  const indicators: SelectionIndicator[] = [
    {
      type: 'score',
      value: (idea.seo_optimization_score + idea.traffic_potential_score) / 2,
      label: 'Overall Score',
      description: 'Combined SEO and traffic potential score',
      color: getScoreColor((idea.seo_optimization_score + idea.traffic_potential_score) / 2),
      icon: <AssessmentIcon />
    },
    {
      type: 'volume',
      value: idea.total_search_volume,
      label: 'Search Volume',
      description: 'Monthly search volume for primary keywords',
      color: getVolumeColor(idea.total_search_volume),
      icon: <TrendingUpIcon />
    },
    {
      type: 'difficulty',
      value: idea.average_difficulty,
      label: 'Difficulty',
      description: 'Average keyword difficulty score',
      color: getDifficultyColor(idea.average_difficulty),
      icon: <WarningIcon />
    },
    {
      type: 'cpc',
      value: idea.average_cpc,
      label: 'CPC Value',
      description: 'Average cost per click for keywords',
      color: getCPCColor(idea.average_cpc),
      icon: <TrendingUpIcon />
    }
  ];

  const getIndicatorContent = (indicator: SelectionIndicator) => {
    const getValueDisplay = () => {
      switch (indicator.type) {
        case 'score':
          return `${indicator.value.toFixed(1)} (${getScoreLabel(indicator.value)})`;
        case 'volume':
          return formatNumber(indicator.value);
        case 'difficulty':
          return `${indicator.value.toFixed(1)} (${getDifficultyLabel(indicator.value)})`;
        case 'cpc':
          return `$${indicator.value.toFixed(2)} (${getCPCLabel(indicator.value)})`;
        default:
          return indicator.value.toString();
      }
    };

    if (compact) {
      return (
        <Tooltip title={`${indicator.label}: ${getValueDisplay()}`}>
          <Chip
            icon={indicator.icon}
            label={getValueDisplay()}
            color={indicator.color}
            size="small"
            variant="outlined"
          />
        </Tooltip>
      );
    }

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {indicator.icon}
            <Typography variant="subtitle2" sx={{ ml: 1 }}>
              {indicator.label}
            </Typography>
          </Box>
          <Typography variant="h6" color={`${indicator.color}.main`} gutterBottom>
            {getValueDisplay()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {indicator.description}
          </Typography>
          {indicator.type === 'score' && (
            <LinearProgress
              variant="determinate"
              value={indicator.value}
              color={indicator.color}
              sx={{ mt: 1 }}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  const getOverallRecommendation = () => {
    const overallScore = (idea.seo_optimization_score + idea.traffic_potential_score) / 2;
    const volumeScore = idea.total_search_volume >= 1000 ? 1 : 0;
    const difficultyScore = idea.average_difficulty <= 60 ? 1 : 0;
    const cpcScore = idea.average_cpc >= 2 ? 1 : 0;
    
    const totalScore = overallScore + (volumeScore + difficultyScore + cpcScore) * 10;
    
    if (totalScore >= 100) {
      return {
        label: 'Highly Recommended',
        color: 'success' as const,
        icon: <CheckIcon />,
        description: 'This idea has excellent potential for high traffic and SEO success.'
      };
    } else if (totalScore >= 80) {
      return {
        label: 'Recommended',
        color: 'warning' as const,
        icon: <StarIcon />,
        description: 'This idea shows good potential with some optimization needed.'
      };
    } else {
      return {
        label: 'Consider Carefully',
        color: 'error' as const,
        icon: <WarningIcon />,
        description: 'This idea may require significant effort or has limited potential.'
      };
    }
  };

  const recommendation = getOverallRecommendation();

  if (compact) {
    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        {indicators.map((indicator) => (
          <Box key={indicator.type}>
            {getIndicatorContent(indicator)}
          </Box>
        ))}
        <Chip
          icon={recommendation.icon}
          label={recommendation.label}
          color={recommendation.color}
          size="small"
          variant="filled"
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Overall Recommendation */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: `${recommendation.color}.light` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {recommendation.icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {recommendation.label}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {recommendation.description}
        </Typography>
      </Paper>

      {/* Detailed Indicators */}
      {showDetails && (
        <Grid container spacing={2}>
          {indicators.map((indicator) => (
            <Grid item xs={12} sm={6} md={3} key={indicator.type}>
              {getIndicatorContent(indicator)}
            </Grid>
          ))}
        </Grid>
      )}

      {/* Keyword Analysis */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Keyword Analysis
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              Primary Keywords ({idea.primary_keywords.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {idea.primary_keywords.map((keyword) => (
                <Chip
                  key={keyword}
                  label={keyword}
                  color="primary"
                  size="small"
                  icon={<SearchIcon />}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              Secondary Keywords ({idea.secondary_keywords.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {idea.secondary_keywords.slice(0, 3).map((keyword) => (
                <Chip
                  key={keyword}
                  label={keyword}
                  variant="outlined"
                  size="small"
                />
              ))}
              {idea.secondary_keywords.length > 3 && (
                <Chip
                  label={`+${idea.secondary_keywords.length - 3} more`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Content Type Indicator */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LightbulbIcon color="primary" />
          <Typography variant="subtitle2">
            Content Type: {idea.content_type}
          </Typography>
          <Chip
            label={idea.content_type}
            color="primary"
            size="small"
            variant="outlined"
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default SelectionIndicators;