/**
 * SubtopicComparison - Side-by-side comparison component for subtopics
 * 
 * Provides detailed comparison of multiple subtopics with metrics and visualizations.
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  LocationOn,
  CalendarToday
} from '@mui/icons-material';
import { TrendData } from '../../types/dataforseo';

interface SubtopicComparisonProps {
  data: TrendData[];
}

const SubtopicComparison: React.FC<SubtopicComparisonProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No comparison data available
        </Typography>
      </Box>
    );
  }

  // Calculate comparison metrics
  const comparisonMetrics = data.map(trend => {
    const timeline = trend.timeline_data || [];
    const values = timeline.map(point => point.value);
    const firstValue = values[0] || 0;
    const lastValue = values[values.length - 1] || 0;
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate trend direction
    const trendDirection = lastValue > firstValue ? 'up' : 
                          lastValue < firstValue ? 'down' : 'flat';
    const trendPercentage = firstValue > 0 ? 
      ((lastValue - firstValue) / firstValue) * 100 : 0;

    return {
      ...trend,
      firstValue,
      lastValue,
      maxValue,
      minValue,
      averageValue,
      trendDirection,
      trendPercentage
    };
  });

  // Sort by trend percentage (descending)
  const sortedMetrics = [...comparisonMetrics].sort((a, b) => b.trendPercentage - a.trendPercentage);

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp color="success" />;
      case 'down':
        return <TrendingDown color="error" />;
      default:
        return <TrendingFlat color="default" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'success';
      case 'down':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Subtopic Comparison
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {sortedMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={4} key={metric.subtopic}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {metric.subtopic}
                  </Typography>
                  {getTrendIcon(metric.trendDirection)}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h4" sx={{ mr: 1 }}>
                    {metric.averageValue.toFixed(1)}
                  </Typography>
                  <Chip
                    label={`${metric.trendPercentage > 0 ? '+' : ''}${metric.trendPercentage.toFixed(1)}%`}
                    color={getTrendColor(metric.trendDirection) as any}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Avg Interest: {metric.averageValue.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Range: {metric.minValue.toFixed(1)} - {metric.maxValue.toFixed(1)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Comparison Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subtopic</TableCell>
                <TableCell align="right">Current</TableCell>
                <TableCell align="right">Average</TableCell>
                <TableCell align="right">Peak</TableCell>
                <TableCell align="right">Trend</TableCell>
                <TableCell align="right">Location</TableCell>
                <TableCell align="right">Time Range</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedMetrics.map((metric) => (
                <TableRow key={metric.subtopic}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {metric.subtopic}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {metric.lastValue.toFixed(1)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {metric.averageValue.toFixed(1)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {metric.maxValue.toFixed(1)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      {getTrendIcon(metric.trendDirection)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        {metric.location}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        {metric.time_range}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Insights */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Key Insights
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Top Performer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>{sortedMetrics[0]?.subtopic}</strong> shows the strongest growth with a{' '}
            {sortedMetrics[0]?.trendPercentage > 0 ? '+' : ''}{sortedMetrics[0]?.trendPercentage.toFixed(1)}% change
            and an average interest of {sortedMetrics[0]?.averageValue.toFixed(1)}.
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Trend Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sortedMetrics.filter(m => m.trendDirection === 'up').length} subtopics are trending up,{' '}
            {sortedMetrics.filter(m => m.trendDirection === 'down').length} are trending down, and{' '}
            {sortedMetrics.filter(m => m.trendDirection === 'flat').length} are stable.
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Recommendation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Focus on <strong>{sortedMetrics[0]?.subtopic}</strong> for maximum growth potential, 
            while monitoring <strong>{sortedMetrics[sortedMetrics.length - 1]?.subtopic}</strong> 
            for potential recovery opportunities.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default SubtopicComparison;
