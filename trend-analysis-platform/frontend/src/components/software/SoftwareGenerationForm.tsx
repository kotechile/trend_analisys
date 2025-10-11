/**
 * Software Generation Form Component
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
  Chip,
  FormControlLabel,
  Checkbox,
  Slider,
  Typography as MuiTypography,
} from '@mui/material';
import { useSoftware } from '../../hooks/useSoftware';

interface SoftwareGenerationFormProps {
  opportunityId: string;
  trendAnalysisId: string;
  keywordDataId: string;
  onSolutionsGenerated?: (softwareSolutionsId: string) => void;
}

export const SoftwareGenerationForm: React.FC<SoftwareGenerationFormProps> = ({
  opportunityId,
  trendAnalysisId,
  keywordDataId,
  onSolutionsGenerated,
}) => {
  const { generateSolutions, isGeneratingSolutions, generateSolutionsError, useSoftwareTypes } = useSoftware();
  const [formData, setFormData] = useState({
    softwareTypes: ['calculator'] as string[],
    maxSolutions: 5,
    targetAudience: '',
    complexityRange: [3, 7] as [number, number],
    includeMonetization: true,
    includeSEO: true,
    includeDevelopmentPlan: true,
  });

  const { data: softwareTypesData } = useSoftwareTypes();
  const softwareTypes = softwareTypesData?.data || [
    { value: 'calculator', label: 'Calculator' },
    { value: 'analyzer', label: 'Analyzer' },
    { value: 'generator', label: 'Generator' },
    { value: 'converter', label: 'Converter' },
    { value: 'estimator', label: 'Estimator' },
  ];

  const handleInputChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSoftwareTypeToggle = (softwareType: string) => {
    setFormData(prev => ({
      ...prev,
      softwareTypes: prev.softwareTypes.includes(softwareType)
        ? prev.softwareTypes.filter(type => type !== softwareType)
        : [...prev.softwareTypes, softwareType],
    }));
  };

  const handleComplexityChange = (event: Event, newValue: number | number[]) => {
    setFormData(prev => ({
      ...prev,
      complexityRange: newValue as [number, number],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (formData.softwareTypes.length === 0) {
      return;
    }

    try {
      const result = await generateSolutions({
        opportunity_id: opportunityId,
        trend_analysis_id: trendAnalysisId,
        keyword_data_id: keywordDataId,
        software_types: formData.softwareTypes,
        max_solutions: formData.maxSolutions,
      });

      if (result.success && onSolutionsGenerated) {
        onSolutionsGenerated(result.data.software_solutions_id);
      }
    } catch (error) {
      console.error('Failed to generate software solutions:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Generate Software Solutions
        </Typography>
        
        {generateSolutionsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {generateSolutionsError.message || 'Failed to generate software solutions'}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Software Types *
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {softwareTypes.map(type => (
                  <Chip
                    key={type.value}
                    label={type.label}
                    onClick={() => handleSoftwareTypeToggle(type.value)}
                    color={formData.softwareTypes.includes(type.value) ? 'primary' : 'default'}
                    variant={formData.softwareTypes.includes(type.value) ? 'filled' : 'outlined'}
                    disabled={isGeneratingSolutions}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Target Audience"
                value={formData.targetAudience}
                onChange={handleInputChange('targetAudience')}
                placeholder="e.g., coffee enthusiasts, fitness beginners"
                disabled={isGeneratingSolutions}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={isGeneratingSolutions}>
                <InputLabel>Max Solutions</InputLabel>
                <Select
                  value={formData.maxSolutions}
                  onChange={handleInputChange('maxSolutions')}
                  label="Max Solutions"
                >
                  {[3, 4, 5, 6, 7, 8].map(num => (
                    <MenuItem key={num} value={num}>
                      {num} solutions
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Complexity Range: {formData.complexityRange[0]} - {formData.complexityRange[1]}
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={formData.complexityRange}
                  onChange={handleComplexityChange}
                  valueLabelDisplay="auto"
                  min={1}
                  max={10}
                  step={1}
                  marks={[
                    { value: 1, label: 'Simple' },
                    { value: 5, label: 'Medium' },
                    { value: 10, label: 'Complex' },
                  ]}
                  disabled={isGeneratingSolutions}
                />
              </Box>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <MuiTypography variant="caption" color="text.secondary">
                  Simple (1-3): Basic tools, minimal features
                </MuiTypography>
                <MuiTypography variant="caption" color="text.secondary">
                  Complex (8-10): Advanced tools, multiple integrations
                </MuiTypography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" flexDirection="column" gap={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.includeMonetization}
                      onChange={(e) => setFormData(prev => ({ ...prev, includeMonetization: e.target.checked }))}
                      disabled={isGeneratingSolutions}
                    />
                  }
                  label="Include monetization strategy"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.includeSEO}
                      onChange={(e) => setFormData(prev => ({ ...prev, includeSEO: e.target.checked }))}
                      disabled={isGeneratingSolutions}
                    />
                  }
                  label="Include SEO optimization"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.includeDevelopmentPlan}
                      onChange={(e) => setFormData(prev => ({ ...prev, includeDevelopmentPlan: e.target.checked }))}
                      disabled={isGeneratingSolutions}
                    />
                  }
                  label="Include development plan"
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>What you'll get:</strong> Detailed software solution ideas with technical requirements, 
                  development complexity scores, monetization strategies, and SEO optimization recommendations.
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={formData.softwareTypes.length === 0 || isGeneratingSolutions}
                startIcon={isGeneratingSolutions ? <CircularProgress size={20} /> : null}
                fullWidth
              >
                {isGeneratingSolutions ? 'Generating Solutions...' : 'Generate Software Solutions'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};
