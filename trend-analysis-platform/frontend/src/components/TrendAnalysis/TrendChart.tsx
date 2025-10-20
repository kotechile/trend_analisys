/**
 * TrendChart - Interactive trend visualization component
 * 
 * Displays trend data using Recharts with interactive features and responsive design.
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid
} from '@mui/material';
import { TrendData } from '../../types/dataforseo';

interface TrendChartProps {
  data: TrendData[];
  chartType?: 'line' | 'area';
  showLegend?: boolean;
  height?: number;
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  chartType = 'line',
  showLegend = true,
  height = 400
}) => {
  // Transform data for Recharts
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group data by date
    const dateMap = new Map<string, any>();
    
    data.forEach(trend => {
      trend.time_series?.forEach(point => {
        const date = point.date;
        if (!dateMap.has(date)) {
          dateMap.set(date, { date });
        }
        dateMap.get(date)[trend.keyword || trend.subtopic] = point.value;
      });
    });

    return Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data]);

  // Generate colors for different subtopics
  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1',
    '#d084d0', '#87d068', '#ffc0cb', '#dda0dd', '#98fb98'
  ];

  const subtopics = data.map(trend => trend.keyword || trend.subtopic);
  const colorMap = subtopics.reduce((acc, subtopic, index) => {
    acc[subtopic] = colors[index % colors.length];
    return acc;
  }, {} as Record<string, string>);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No trend data available
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          📈 Trend Analysis - Volume & Geography
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Interactive charts showing search volume trends over time for all selected subtopics
        </Typography>
        
        {/* Subtopic Legend with Stats */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {subtopics.map((subtopic, index) => {
            const trendData = data.find(t => (t.keyword || t.subtopic) === subtopic);
            return (
              <Chip
                key={subtopic}
                label={`${subtopic} (Avg: ${trendData?.time_series ? (trendData.time_series.reduce((sum, point) => sum + point.value, 0) / trendData.time_series.length).toFixed(1) : 'N/A'})`}
                sx={{
                  backgroundColor: colorMap[subtopic],
                  color: 'white',
                  '&:hover': {
                    backgroundColor: colorMap[subtopic],
                    opacity: 0.8
                  }
                }}
              />
            );
          })}
        </Box>
      </Box>

      <ResponsiveContainer width="100%" height={height}>
        {chartType === 'area' ? (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value, name) => [value, name]}
            />
            {showLegend && <Legend />}
            {subtopics.map((subtopic, index) => (
              <Area
                key={subtopic}
                type="monotone"
                dataKey={subtopic}
                stackId="1"
                stroke={colorMap[subtopic]}
                fill={colorMap[subtopic]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value, name) => [value, name]}
            />
            {showLegend && <Legend />}
            {subtopics.map((subtopic, index) => (
              <Line
                key={subtopic}
                type="monotone"
                dataKey={subtopic}
                stroke={colorMap[subtopic]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {data.map((trend) => (
          <Grid item xs={12} sm={6} md={3} key={trend.keyword || trend.subtopic}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {trend.keyword || trend.subtopic}
              </Typography>
              <Typography variant="h6" sx={{ color: colorMap[trend.keyword || trend.subtopic] }}>
                {trend.time_series ? (trend.time_series.reduce((sum, point) => sum + point.value, 0) / trend.time_series.length).toFixed(1) : '0'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg Interest
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default TrendChart;
