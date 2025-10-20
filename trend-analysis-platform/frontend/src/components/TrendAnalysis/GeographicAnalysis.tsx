/**
 * GeographicAnalysis - Geographic data visualization component
 * 
 * Displays top states, cities, and regional breakdown with scores and percentages.
 */

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  LocationOn,
  TrendingUp,
  Public,
  LocationCity
} from '@mui/icons-material';
import { TrendData } from '../../types/dataforseo';

interface GeographicAnalysisProps {
  data: TrendData[];
}

const GeographicAnalysis: React.FC<GeographicAnalysisProps> = ({ data }) => {
  console.log('GeographicAnalysis received data:', data);
  
  if (!data || data.length === 0) {
    console.log('No data provided to GeographicAnalysis');
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No geographic data available
        </Typography>
      </Box>
    );
  }

  // Get geographic data from the first trend (assuming all trends have similar geographic patterns)
  const geographicData = data[0]?.geographic_data;
  console.log('Geographic data from first trend:', geographicData);

  if (!geographicData || !Array.isArray(geographicData) || geographicData.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Geographic data not available for this trend
        </Typography>
      </Box>
    );
  }

  // Transform the data to match the expected structure
  const transformedData = {
    top_states: geographicData
      .filter(item => item.region_type === 'state')
      .map(item => ({
        state: item.location_name,
        score: item.interest_value,
        percentage: Math.round(item.interest_value)
      }))
      .sort((a, b) => b.score - a.score),
    
    top_cities: geographicData
      .filter(item => item.region_type === 'city')
      .map(item => ({
        city: item.location_name,
        state: 'Unknown', // We don't have state info in our data
        score: item.interest_value,
        percentage: Math.round(item.interest_value)
      }))
      .sort((a, b) => b.score - a.score),
    
    regional_breakdown: geographicData
      .filter(item => item.region_type === 'country' || item.region_type === 'region')
      .reduce((acc, item) => {
        const region = item.region_type === 'country' ? 'Country' : 'Region';
        if (!acc[region]) {
          acc[region] = {
            score: item.interest_value,
            percentage: Math.round(item.interest_value),
            states: [item.location_name]
          };
        } else {
          acc[region].states.push(item.location_name);
        }
        return acc;
      }, {} as any)
  };
  
  console.log('Transformed data:', transformedData);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'error';
  };

  const getScoreIntensity = (score: number) => {
    if (score >= 80) return 0.9;
    if (score >= 60) return 0.7;
    if (score >= 40) return 0.5;
    return 0.3;
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Public />
        Geographic Analysis
      </Typography>
      
      <Grid container spacing={3}>
        {/* Top States */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn />
                Top States by Interest
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>State</strong></TableCell>
                      <TableCell align="center"><strong>Score</strong></TableCell>
                      <TableCell align="center"><strong>Percentage</strong></TableCell>
                      <TableCell align="center"><strong>Trend</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transformedData.top_states?.map((state, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {state.state}
                            </Typography>
                            {index < 3 && (
                              <Chip 
                                label={`#${index + 1}`} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Typography 
                              variant="body2" 
                              fontWeight="bold"
                              color={`${getScoreColor(state.score)}.main`}
                            >
                              {state.score}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={state.score}
                              color={getScoreColor(state.score)}
                              sx={{ 
                                width: 40, 
                                height: 6, 
                                borderRadius: 3,
                                opacity: getScoreIntensity(state.score)
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="bold">
                            {state.percentage}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={state.score >= 70 ? 'High' : state.score >= 50 ? 'Medium' : 'Low'}
                            size="small"
                            color={getScoreColor(state.score)}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Cities */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationCity />
                Top Cities by Interest
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>City</strong></TableCell>
                      <TableCell align="center"><strong>State</strong></TableCell>
                      <TableCell align="center"><strong>Score</strong></TableCell>
                      <TableCell align="center"><strong>Percentage</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transformedData.top_cities?.map((city, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {city.city}
                            </Typography>
                            {index < 3 && (
                              <Chip 
                                label={`#${index + 1}`} 
                                size="small" 
                                color="secondary" 
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={city.state} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Typography 
                              variant="body2" 
                              fontWeight="bold"
                              color={`${getScoreColor(city.score)}.main`}
                            >
                              {city.score}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={city.score}
                              color={getScoreColor(city.score)}
                              sx={{ 
                                width: 40, 
                                height: 6, 
                                borderRadius: 3,
                                opacity: getScoreIntensity(city.score)
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="bold">
                            {city.percentage}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Regional Breakdown */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp />
                Regional Breakdown
              </Typography>
              <Grid container spacing={2}>
                {transformedData.regional_breakdown && Object.entries(transformedData.regional_breakdown).map(([region, data]) => (
                  <Grid item xs={12} sm={6} md={3} key={region}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                        {region}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h4" color={`${getScoreColor(data.score)}.main`} fontWeight="bold">
                          {data.score}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Interest Score
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={data.score}
                        color={getScoreColor(data.score)}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          mb: 1,
                          opacity: getScoreIntensity(data.score)
                        }}
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {data.percentage}% of total interest
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        States: {data.states.slice(0, 3).join(', ')}
                        {data.states.length > 3 && ` +${data.states.length - 3} more`}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeographicAnalysis;
