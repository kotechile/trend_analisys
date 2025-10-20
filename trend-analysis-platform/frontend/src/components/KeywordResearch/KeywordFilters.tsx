/**
 * KeywordFilters - Advanced filtering component for keyword research
 * 
 * Provides comprehensive filtering options for keyword data with real-time updates.
 */

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  FilterList,
  Clear
} from '@mui/icons-material';

interface KeywordFiltersProps {
  onFiltersChange: (filters: KeywordFilters) => void;
  initialFilters?: KeywordFilters;
}

interface KeywordFilters {
  maxDifficulty?: number;
  minVolume?: number;
  maxVolume?: number;
  minCpc?: number;
  maxCpc?: number;
  intentTypes?: string[];
  minTrend?: number;
  maxTrend?: number;
  hasPriorityScore?: boolean;
  minPriorityScore?: number;
  keywordLength?: {
    min: number;
    max: number;
  };
  excludeKeywords?: string[];
  includeKeywords?: string[];
}

const KeywordFilters: React.FC<KeywordFiltersProps> = ({
  onFiltersChange,
  initialFilters = {}
}) => {
  const [filters, setFilters] = React.useState<KeywordFilters>({
    maxDifficulty: 50,
    minVolume: 100,
    maxVolume: 1000000,
    minCpc: 0,
    maxCpc: 10,
    intentTypes: ['COMMERCIAL', 'TRANSACTIONAL'],
    minTrend: -50,
    maxTrend: 100,
    hasPriorityScore: false,
    minPriorityScore: 0,
    keywordLength: { min: 1, max: 50 },
    excludeKeywords: [],
    includeKeywords: [],
    ...initialFilters
  });

  const [excludeKeywordInput, setExcludeKeywordInput] = React.useState('');
  const [includeKeywordInput, setIncludeKeywordInput] = React.useState('');

  const intentTypeOptions = [
    { value: 'INFORMATIONAL', label: 'Informational' },
    { value: 'COMMERCIAL', label: 'Commercial' },
    { value: 'TRANSACTIONAL', label: 'Transactional' }
  ];

  const handleFilterChange = (key: keyof KeywordFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleAddExcludeKeyword = () => {
    if (excludeKeywordInput.trim() && !filters.excludeKeywords?.includes(excludeKeywordInput.trim())) {
      const newKeywords = [...(filters.excludeKeywords || []), excludeKeywordInput.trim()];
      handleFilterChange('excludeKeywords', newKeywords);
      setExcludeKeywordInput('');
    }
  };

  const handleRemoveExcludeKeyword = (keyword: string) => {
    const newKeywords = filters.excludeKeywords?.filter(k => k !== keyword) || [];
    handleFilterChange('excludeKeywords', newKeywords);
  };

  const handleAddIncludeKeyword = () => {
    if (includeKeywordInput.trim() && !filters.includeKeywords?.includes(includeKeywordInput.trim())) {
      const newKeywords = [...(filters.includeKeywords || []), includeKeywordInput.trim()];
      handleFilterChange('includeKeywords', newKeywords);
      setIncludeKeywordInput('');
    }
  };

  const handleRemoveIncludeKeyword = (keyword: string) => {
    const newKeywords = filters.includeKeywords?.filter(k => k !== keyword) || [];
    handleFilterChange('includeKeywords', newKeywords);
  };

  const handleClearFilters = () => {
    const defaultFilters: KeywordFilters = {
      maxDifficulty: 50,
      minVolume: 100,
      maxVolume: 1000000,
      minCpc: 0,
      maxCpc: 10,
      intentTypes: ['COMMERCIAL', 'TRANSACTIONAL'],
      minTrend: -50,
      maxTrend: 100,
      hasPriorityScore: false,
      minPriorityScore: 0,
      keywordLength: { min: 1, max: 50 },
      excludeKeywords: [],
      includeKeywords: []
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterList sx={{ mr: 1 }} />
        <Typography variant="h6">Advanced Filters</Typography>
        <Button
          size="small"
          startIcon={<Clear />}
          onClick={handleClearFilters}
          sx={{ ml: 'auto' }}
        >
          Clear All
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Difficulty Range */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Keyword Difficulty
          </Typography>
          <Slider
            value={[0, filters.maxDifficulty || 50]}
            onChange={(_, value) => handleFilterChange('maxDifficulty', value[1])}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            step={5}
            marks={[
              { value: 0, label: '0' },
              { value: 25, label: '25' },
              { value: 50, label: '50' },
              { value: 75, label: '75' },
              { value: 100, label: '100' }
            ]}
          />
          <Typography variant="caption" color="text.secondary">
            Max: {filters.maxDifficulty}%
          </Typography>
        </Grid>

        {/* Volume Range */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Search Volume
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              label="Min Volume"
              type="number"
              value={filters.minVolume}
              onChange={(e) => handleFilterChange('minVolume', Number(e.target.value))}
              inputProps={{ min: 0 }}
            />
            <TextField
              size="small"
              label="Max Volume"
              type="number"
              value={filters.maxVolume}
              onChange={(e) => handleFilterChange('maxVolume', Number(e.target.value))}
              inputProps={{ min: 0 }}
            />
          </Box>
        </Grid>

        {/* CPC Range */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Cost Per Click (CPC)
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              label="Min CPC"
              type="number"
              value={filters.minCpc}
              onChange={(e) => handleFilterChange('minCpc', Number(e.target.value))}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              size="small"
              label="Max CPC"
              type="number"
              value={filters.maxCpc}
              onChange={(e) => handleFilterChange('maxCpc', Number(e.target.value))}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Box>
        </Grid>

        {/* Intent Types */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Intent Types
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {intentTypeOptions.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                onClick={() => {
                  const currentTypes = filters.intentTypes || [];
                  const newTypes = currentTypes.includes(option.value)
                    ? currentTypes.filter(t => t !== option.value)
                    : [...currentTypes, option.value];
                  handleFilterChange('intentTypes', newTypes);
                }}
                color={filters.intentTypes?.includes(option.value) ? 'primary' : 'default'}
                variant={filters.intentTypes?.includes(option.value) ? 'filled' : 'outlined'}
                size="small"
              />
            ))}
          </Box>
        </Grid>

        {/* Trend Range */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Trend Percentage
          </Typography>
          <Slider
            value={[filters.minTrend || -50, filters.maxTrend || 100]}
            onChange={(_, value) => {
              handleFilterChange('minTrend', value[0]);
              handleFilterChange('maxTrend', value[1]);
            }}
            valueLabelDisplay="auto"
            min={-100}
            max={200}
            step={5}
            marks={[
              { value: -100, label: '-100%' },
              { value: 0, label: '0%' },
              { value: 100, label: '100%' },
              { value: 200, label: '200%' }
            ]}
          />
        </Grid>

        {/* Priority Score */}
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={filters.hasPriorityScore || false}
                onChange={(e) => handleFilterChange('hasPriorityScore', e.target.checked)}
              />
            }
            label="Has Priority Score"
          />
          {filters.hasPriorityScore && (
            <TextField
              size="small"
              label="Min Priority Score"
              type="number"
              value={filters.minPriorityScore}
              onChange={(e) => handleFilterChange('minPriorityScore', Number(e.target.value))}
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              sx={{ mt: 1 }}
            />
          )}
        </Grid>

        {/* Keyword Length */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Keyword Length (words)
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              label="Min Words"
              type="number"
              value={filters.keywordLength?.min || 1}
              onChange={(e) => handleFilterChange('keywordLength', {
                ...filters.keywordLength,
                min: Number(e.target.value)
              })}
              inputProps={{ min: 1 }}
            />
            <TextField
              size="small"
              label="Max Words"
              type="number"
              value={filters.keywordLength?.max || 50}
              onChange={(e) => handleFilterChange('keywordLength', {
                ...filters.keywordLength,
                max: Number(e.target.value)
              })}
              inputProps={{ min: 1 }}
            />
          </Box>
        </Grid>

        {/* Advanced Filters */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">Advanced Filters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {/* Exclude Keywords */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Exclude Keywords
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Enter keyword to exclude"
                      value={excludeKeywordInput}
                      onChange={(e) => setExcludeKeywordInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddExcludeKeyword();
                        }
                      }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleAddExcludeKeyword}
                      disabled={!excludeKeywordInput.trim()}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {filters.excludeKeywords?.map((keyword) => (
                      <Chip
                        key={keyword}
                        label={keyword}
                        onDelete={() => handleRemoveExcludeKeyword(keyword)}
                        color="error"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Include Keywords */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Include Keywords
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Enter keyword to include"
                      value={includeKeywordInput}
                      onChange={(e) => setIncludeKeywordInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddIncludeKeyword();
                        }
                      }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleAddIncludeKeyword}
                      disabled={!includeKeywordInput.trim()}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {filters.includeKeywords?.map((keyword) => (
                      <Chip
                        key={keyword}
                        label={keyword}
                        onDelete={() => handleRemoveIncludeKeyword(keyword)}
                        color="success"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KeywordFilters;
