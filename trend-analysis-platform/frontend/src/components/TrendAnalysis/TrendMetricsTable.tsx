/**
 * TrendMetricsTable - Detailed metrics table for trend analysis
 * 
 * Displays comprehensive trend metrics including volume, geography, and performance data.
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
  Typography,
  Box,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  LocationOn,
  Timeline,
  Speed
} from '@mui/icons-material';
import { TrendData } from '../../types/dataforseo';

interface TrendMetricsTableProps {
  data: TrendData[];
}

const TrendMetricsTable: React.FC<TrendMetricsTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No trend metrics available
        </Typography>
      </Box>
    );
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp color="success" />;
    if (trend < 0) return <TrendingDown color="error" />;
    return <TrendingFlat color="action" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'success';
    if (trend < 0) return 'error';
    return 'default';
  };

  const calculateGrowthRate = (timelineData: any[]) => {
    if (!timelineData || timelineData.length < 2) return 0;
    const first = timelineData[0].value;
    const last = timelineData[timelineData.length - 1].value;
    return ((last - first) / first) * 100;
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Speed />
        Detailed Trend Metrics
      </Typography>
      
      <Grid container spacing={3}>
        {/* Main Metrics Table */}
        <Grid item xs={12} lg={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Subtopic</strong></TableCell>
                  <TableCell align="center"><strong>Location</strong></TableCell>
                  <TableCell align="center"><strong>Avg Interest</strong></TableCell>
                  <TableCell align="center"><strong>Peak Interest</strong></TableCell>
                  <TableCell align="center"><strong>Growth Rate</strong></TableCell>
                  <TableCell align="center"><strong>Trend Status</strong></TableCell>
                  <TableCell align="center"><strong>Data Points</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((trend, index) => {
                  const growthRate = calculateGrowthRate(trend.timeline_data);
                  return (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {trend.subtopic}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <LocationOn fontSize="small" color="action" />
                          {trend.location}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold">
                          {trend.average_interest?.toFixed(1) || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {trend.peak_interest?.toFixed(1) || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          {getTrendIcon(growthRate)}
                          <Typography 
                            variant="body2" 
                            color={getTrendColor(growthRate)}
                            fontWeight="bold"
                          >
                            {growthRate.toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={growthRate > 5 ? 'Rising' : growthRate < -5 ? 'Declining' : 'Stable'}
                          color={getTrendColor(growthRate)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {trend.timeline_data?.length || 0}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Summary Cards */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Top Performer */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  🏆 Top Performer
                </Typography>
                {(() => {
                  const topTrend = data.reduce((max, trend) => 
                    trend.average_interest > max.average_interest ? trend : max
                  );
                  return (
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        {topTrend.subtopic}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg: {topTrend.average_interest?.toFixed(1)} | Peak: {topTrend.peak_interest?.toFixed(1)}
                      </Typography>
                    </Box>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Fastest Growing */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="success">
                  📈 Fastest Growing
                </Typography>
                {(() => {
                  const fastestGrowing = data.reduce((max, trend) => {
                    const growth = calculateGrowthRate(trend.timeline_data);
                    const maxGrowth = calculateGrowthRate(max.timeline_data);
                    return growth > maxGrowth ? trend : max;
                  });
                  const growth = calculateGrowthRate(fastestGrowing.timeline_data);
                  return (
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        {fastestGrowing.subtopic}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Growth: {growth.toFixed(1)}%
                      </Typography>
                    </Box>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🌍 Geographic Analysis
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {data.map((trend, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">{trend.subtopic}</Typography>
                      <Chip 
                        label={trend.location} 
                        size="small" 
                        variant="outlined"
                        icon={<LocationOn />}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Related Queries Section */}
      {data.some(trend => trend.related_queries && trend.related_queries.length > 0) && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Timeline />
            Related Queries
          </Typography>
          <Grid container spacing={2}>
            {data.map((trend, index) => (
              trend.related_queries && trend.related_queries.length > 0 && (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        {trend.subtopic}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {trend.related_queries.slice(0, 5).map((query, queryIndex) => (
                          <Chip
                            key={queryIndex}
                            label={query}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default TrendMetricsTable;
