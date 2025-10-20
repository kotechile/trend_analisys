/**
 * KeywordTable - Interactive keyword data table component
 * 
 * Displays keyword research results with sorting, filtering, and priority indicators.
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Typography,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Star,
  StarBorder,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Visibility,
  FilterList
} from '@mui/icons-material';
import { KeywordData } from '../../types/dataforseo';

interface KeywordTableProps {
  keywords: KeywordData[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (property: string) => void;
  showPriority?: boolean;
  maxRows?: number;
}

const KeywordTable: React.FC<KeywordTableProps> = ({
  keywords,
  sortBy = 'priority_score',
  sortOrder = 'desc',
  onSort,
  showPriority = false,
  maxRows = 50
}) => {
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());

  // Sort keywords
  const sortedKeywords = React.useMemo(() => {
    if (!keywords || keywords.length === 0) return [];

    const sorted = [...keywords].sort((a, b) => {
      const aValue = a[sortBy as keyof KeywordData] as number || 0;
      const bValue = b[sortBy as keyof KeywordData] as number || 0;
      
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return maxRows ? sorted.slice(0, maxRows) : sorted;
  }, [keywords, sortBy, sortOrder, maxRows]);

  const handleSort = (property: string) => {
    if (onSort) {
      onSort(property);
    }
  };

  const toggleFavorite = (keyword: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(keyword)) {
        newFavorites.delete(keyword);
      } else {
        newFavorites.add(keyword);
      }
      return newFavorites;
    });
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return 'success';
    if (difficulty <= 60) return 'warning';
    return 'error';
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'COMMERCIAL':
        return 'primary';
      case 'TRANSACTIONAL':
        return 'success';
      case 'INFORMATIONAL':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (num: number | undefined) => {
    if (num === undefined || num === null) return 'N/A';
    return `$${num.toFixed(2)}`;
  };

  const formatPercentage = (num: number | undefined) => {
    if (num === undefined || num === null) return 'N/A';
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  if (!keywords || keywords.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No keywords found
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle2">Keyword</Typography>
                {showPriority && (
                  <Chip
                    label="Priority"
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            </TableCell>
            
            <TableCell align="right">
              <TableSortLabel
                active={sortBy === 'search_volume'}
                direction={sortBy === 'search_volume' ? sortOrder : 'asc'}
                onClick={() => handleSort('search_volume')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Visibility fontSize="small" sx={{ mr: 0.5 }} />
                  Volume
                </Box>
              </TableSortLabel>
            </TableCell>
            
            <TableCell align="right">
              <TableSortLabel
                active={sortBy === 'keyword_difficulty'}
                direction={sortBy === 'keyword_difficulty' ? sortOrder : 'asc'}
                onClick={() => handleSort('keyword_difficulty')}
              >
                Difficulty
              </TableSortLabel>
            </TableCell>
            
            <TableCell align="right">
              <TableSortLabel
                active={sortBy === 'cpc'}
                direction={sortBy === 'cpc' ? sortOrder : 'asc'}
                onClick={() => handleSort('cpc')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoney fontSize="small" sx={{ mr: 0.5 }} />
                  CPC
                </Box>
              </TableSortLabel>
            </TableCell>
            
            <TableCell align="right">
              <TableSortLabel
                active={sortBy === 'trend_percentage'}
                direction={sortBy === 'trend_percentage' ? sortOrder : 'asc'}
                onClick={() => handleSort('trend_percentage')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                  Trend
                </Box>
              </TableSortLabel>
            </TableCell>
            
            <TableCell align="center">Intent</TableCell>
            
            {showPriority && (
              <TableCell align="right">
                <TableSortLabel
                  active={sortBy === 'priority_score'}
                  direction={sortBy === 'priority_score' ? sortOrder : 'asc'}
                  onClick={() => handleSort('priority_score')}
                >
                  Priority
                </TableSortLabel>
              </TableCell>
            )}
            
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        
        <TableBody>
          {sortedKeywords.map((keyword, index) => (
            <TableRow key={keyword.keyword} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {keyword.keyword}
                  </Typography>
                  {showPriority && keyword.priority_score && (
                    <Chip
                      label={`#${index + 1}`}
                      size="small"
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              </TableCell>
              
              <TableCell align="right">
                <Typography variant="body2">
                  {formatNumber(keyword.search_volume)}
                </Typography>
              </TableCell>
              
              <TableCell align="right">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {keyword.keyword_difficulty || 'N/A'}
                  </Typography>
                  {keyword.keyword_difficulty && (
                    <LinearProgress
                      variant="determinate"
                      value={keyword.keyword_difficulty}
                      color={getDifficultyColor(keyword.keyword_difficulty) as any}
                      sx={{ width: 60, height: 4 }}
                    />
                  )}
                </Box>
              </TableCell>
              
              <TableCell align="right">
                <Typography variant="body2">
                  {formatCurrency(keyword.cpc)}
                </Typography>
              </TableCell>
              
              <TableCell align="right">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {keyword.trend_percentage && keyword.trend_percentage > 0 ? (
                    <TrendingUp fontSize="small" color="success" />
                  ) : keyword.trend_percentage && keyword.trend_percentage < 0 ? (
                    <TrendingDown fontSize="small" color="error" />
                  ) : null}
                  <Typography 
                    variant="body2" 
                    color={
                      keyword.trend_percentage && keyword.trend_percentage > 0 ? 'success.main' :
                      keyword.trend_percentage && keyword.trend_percentage < 0 ? 'error.main' : 'text.secondary'
                    }
                    sx={{ ml: 0.5 }}
                  >
                    {formatPercentage(keyword.trend_percentage)}
                  </Typography>
                </Box>
              </TableCell>
              
              <TableCell align="center">
                <Chip
                  label={keyword.intent_type || 'N/A'}
                  size="small"
                  color={getIntentColor(keyword.intent_type || '') as any}
                />
              </TableCell>
              
              {showPriority && (
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {keyword.priority_score ? keyword.priority_score.toFixed(1) : 'N/A'}
                  </Typography>
                </TableCell>
              )}
              
              <TableCell align="center">
                <Tooltip title={favorites.has(keyword.keyword) ? 'Remove from favorites' : 'Add to favorites'}>
                  <IconButton
                    size="small"
                    onClick={() => toggleFavorite(keyword.keyword)}
                  >
                    {favorites.has(keyword.keyword) ? (
                      <Star color="primary" />
                    ) : (
                      <StarBorder />
                    )}
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default KeywordTable;
