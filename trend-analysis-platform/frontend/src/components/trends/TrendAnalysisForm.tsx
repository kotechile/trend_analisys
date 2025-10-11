/**
 * Trend Analysis Form Component
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { useTrends } from '../../hooks/useTrends';

interface TrendAnalysisFormProps {
  onAnalysisStarted?: (analysisId: string) => void;
  affiliateResearchId?: string;
}

export const TrendAnalysisForm: React.FC<TrendAnalysisFormProps> = ({
  onAnalysisStarted,
  affiliateResearchId,
}) => {
  const { startAnalysis, isStartingAnalysis, startAnalysisError, useKeywordSuggestions, useRegions } = useTrends();
  const [formData, setFormData] = useState({
    keyword: '',
    geo: 'US',
    timeRange: '12m',
  });

  const { data: keywordSuggestions } = useKeywordSuggestions(formData.keyword, formData.geo);
  const { data: regionsData } = useRegions();

  const regions = regionsData?.data || [];
  const suggestions = keywordSuggestions?.data || [];

  const timeRanges = [
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '12m', label: '12 Months' },
    { value: '5y', label: '5 Years' },
  ];

  const handleInputChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleKeywordChange = (event: any, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyword: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.keyword.trim()) {
      return;
    }

    try {
      const result = await startAnalysis({
        keyword: formData.keyword,
        geo: formData.geo,
        time_range: formData.timeRange,
        affiliate_research_id: affiliateResearchId,
      });

      if (result.success && onAnalysisStarted) {
        onAnalysisStarted(result.data.id);
      }
    } catch (error) {
      console.error('Failed to start trend analysis:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Start Trend Analysis
        </Typography>
        
        {startAnalysisError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {startAnalysisError.message || 'Failed to start analysis'}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                options={suggestions}
                value={formData.keyword}
                onChange={handleKeywordChange}
                onInputChange={handleKeywordChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Keyword *"
                    placeholder="e.g., espresso machine, coffee grinder"
                    required
                    disabled={isStartingAnalysis}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Typography variant="body2">{option}</Typography>
                  </li>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={isStartingAnalysis}>
                <InputLabel>Region</InputLabel>
                <Select
                  value={formData.geo}
                  onChange={handleInputChange('geo')}
                  label="Region"
                >
                  {regions.map(region => (
                    <MenuItem key={region.code} value={region.code}>
                      {region.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={isStartingAnalysis}>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={formData.timeRange}
                  onChange={handleInputChange('timeRange')}
                  label="Time Range"
                >
                  {timeRanges.map(range => (
                    <MenuItem key={range.value} value={range.value}>
                      {range.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {affiliateResearchId && (
              <Grid item xs={12}>
                <Alert severity="info">
                  This analysis will be linked to your affiliate research.
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!formData.keyword.trim() || isStartingAnalysis}
                startIcon={isStartingAnalysis ? <CircularProgress size={20} /> : null}
                fullWidth
              >
                {isStartingAnalysis ? 'Starting Analysis...' : 'Start Analysis'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};
