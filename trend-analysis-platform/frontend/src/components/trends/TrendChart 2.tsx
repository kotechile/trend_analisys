/**
 * Trend Chart Component
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTrends } from '../../hooks/useTrends';

interface TrendChartProps {
  analysisId: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ analysisId }) => {
  const { useAnalysis, useForecast } = useTrends();
  
  const { data: analysisData, isLoading: analysisLoading, error: analysisError } = useAnalysis(analysisId);
  const { data: forecastData, isLoading: forecastLoading, error: forecastError } = useForecast(analysisId);

  if (analysisLoading || forecastLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (analysisError || forecastError) {
    return (
      <Alert severity="error">
        {analysisError?.message || forecastError?.message || 'Failed to load trend data'}
      </Alert>
    );
  }

  const analysis = analysisData?.data;
  const forecast = forecastData?.data;

  if (!analysis || !forecast) {
    return (
      <Alert severity="warning">
        No trend data available
      </Alert>
    );
  }

  // Combine historical and forecast data for the chart
  const chartData = [
    ...(analysis.historical_data?.time_series || []).map((point: any) => ({
      date: new Date(point.date).toLocaleDateString(),
      value: point.value,
      type: 'Historical',
    })),
    ...(forecast.forecast_data?.forecast_periods || []).map((period: any) => ({
      date: new Date(period.period).toLocaleDateString(),
      value: period.predicted_value,
      type: 'Forecast',
    })),
  ];

  const opportunityScore = analysis.opportunity_score || 0;
  const confidenceScore = forecast.confidence_score || 0;
  const trendDirection = forecast.trend_direction || 'stable';

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'success';
      case 'down': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Trend Analysis: {analysis.keyword}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color={`${getScoreColor(opportunityScore)}.main`}>
                {opportunityScore.toFixed(0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Opportunity Score
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color={`${getScoreColor(confidenceScore)}.main`}>
                {(confidenceScore * 100).toFixed(0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Confidence
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Chip
                label={trendDirection.toUpperCase()}
                color={getTrendColor(trendDirection) as any}
                variant="filled"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Trend Direction
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary.main">
                {analysis.geo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Region
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box height={400}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => `Date: ${value}`}
                formatter={(value: any, name: string) => [
                  value,
                  name === 'Historical' ? 'Historical Data' : 'Forecast'
                ]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#1976d2"
                strokeWidth={2}
                dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {forecast.key_drivers && forecast.key_drivers.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Key Drivers
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {forecast.key_drivers.map((driver: string, index: number) => (
                <Chip key={index} label={driver} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        {forecast.risks && forecast.risks.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom color="error">
              Potential Risks
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {forecast.risks.map((risk: string, index: number) => (
                <Chip 
                  key={index} 
                  label={risk} 
                  size="small" 
                  color="error" 
                  variant="outlined" 
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
