/**
 * Score Indicator Component
 */

import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

interface ScoreIndicatorProps {
  score: number;
  maxScore?: number;
  label?: string;
  showIcon?: boolean;
  showPercentage?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({
  score,
  maxScore = 10,
  label,
  showIcon = true,
  showPercentage = false,
  size = 'medium',
  color = 'primary',
}) => {
  const percentage = (score / maxScore) * 100;
  const normalizedScore = Math.min(Math.max(score, 0), maxScore);

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const getTrendIcon = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 70) return <TrendingUp />;
    if (percentage >= 40) return <TrendingFlat />;
    return <TrendingDown />;
  };

  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'small':
        return { height: 8, fontSize: '0.75rem' };
      case 'large':
        return { height: 12, fontSize: '1.1rem' };
      default:
        return { height: 10, fontSize: '0.875rem' };
    }
  };

  const sizeStyles = getSizeStyles(size);
  const scoreColor = getScoreColor(normalizedScore, maxScore);

  return (
    <Box>
      {label && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
      )}
      
      <Box display="flex" alignItems="center" gap={1}>
        <Box flex={1}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={scoreColor as any}
            sx={{
              height: sizeStyles.height,
              borderRadius: 1,
              backgroundColor: 'grey.200',
            }}
          />
        </Box>
        
        <Box display="flex" alignItems="center" gap={0.5} minWidth="fit-content">
          {showIcon && (
            <Tooltip title={`Score: ${normalizedScore}/${maxScore}`}>
              <Box display="flex" alignItems="center">
                {getTrendIcon(normalizedScore, maxScore)}
              </Box>
            </Tooltip>
          )}
          
          <Typography
            variant="body2"
            color={`${scoreColor}.main`}
            fontWeight="medium"
            sx={{ fontSize: sizeStyles.fontSize }}
          >
            {showPercentage ? `${percentage.toFixed(0)}%` : `${normalizedScore}/${maxScore}`}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
