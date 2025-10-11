/**
 * Content Generation Form Component
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
} from '@mui/material';
import { useContent } from '../../hooks/useContent';

interface ContentGenerationFormProps {
  opportunityId: string;
  onContentGenerated?: (contentId: string) => void;
}

export const ContentGenerationForm: React.FC<ContentGenerationFormProps> = ({
  opportunityId,
  onContentGenerated,
}) => {
  const { generateContent, isGeneratingContent, generateContentError } = useContent();
  const [formData, setFormData] = useState({
    contentTypes: ['article'] as string[],
    targetAudience: '',
    tone: 'professional',
    length: 'medium',
    focusKeywords: [] as string[],
    competitorAnalysis: false,
    seoOptimization: true,
  });

  const contentTypes = [
    { value: 'article', label: 'Article' },
    { value: 'guide', label: 'Guide' },
    { value: 'review', label: 'Review' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'listicle', label: 'Listicle' },
  ];

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'authoritative', label: 'Authoritative' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'technical', label: 'Technical' },
  ];

  const lengths = [
    { value: 'short', label: 'Short (500-1000 words)' },
    { value: 'medium', label: 'Medium (1000-2500 words)' },
    { value: 'long', label: 'Long (2500-5000 words)' },
    { value: 'comprehensive', label: 'Comprehensive (5000+ words)' },
  ];

  const handleInputChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleContentTypeToggle = (contentType: string) => {
    setFormData(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(contentType)
        ? prev.contentTypes.filter(type => type !== contentType)
        : [...prev.contentTypes, contentType],
    }));
  };

  const handleKeywordAdd = (keyword: string) => {
    if (keyword.trim() && !formData.focusKeywords.includes(keyword.trim())) {
      setFormData(prev => ({
        ...prev,
        focusKeywords: [...prev.focusKeywords, keyword.trim()],
      }));
    }
  };

  const handleKeywordRemove = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      focusKeywords: prev.focusKeywords.filter(k => k !== keyword),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (formData.contentTypes.length === 0) {
      return;
    }

    try {
      const result = await generateContent({
        opportunity_id: opportunityId,
        content_types: formData.contentTypes,
        target_audience: formData.targetAudience || undefined,
        tone: formData.tone,
        length: formData.length,
      });

      if (result.success && onContentGenerated) {
        onContentGenerated(result.data.content_id);
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Generate Content Ideas
        </Typography>
        
        {generateContentError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {generateContentError.message || 'Failed to generate content'}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Content Types *
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {contentTypes.map(type => (
                  <Chip
                    key={type.value}
                    label={type.label}
                    onClick={() => handleContentTypeToggle(type.value)}
                    color={formData.contentTypes.includes(type.value) ? 'primary' : 'default'}
                    variant={formData.contentTypes.includes(type.value) ? 'filled' : 'outlined'}
                    disabled={isGeneratingContent}
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
                disabled={isGeneratingContent}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={isGeneratingContent}>
                <InputLabel>Tone</InputLabel>
                <Select
                  value={formData.tone}
                  onChange={handleInputChange('tone')}
                  label="Tone"
                >
                  {tones.map(tone => (
                    <MenuItem key={tone.value} value={tone.value}>
                      {tone.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={isGeneratingContent}>
                <InputLabel>Length</InputLabel>
                <Select
                  value={formData.length}
                  onChange={handleInputChange('length')}
                  label="Length"
                >
                  {lengths.map(length => (
                    <MenuItem key={length.value} value={length.value}>
                      {length.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Focus Keywords"
                placeholder="Enter keywords separated by commas"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    handleKeywordAdd(input.value);
                    input.value = '';
                  }
                }}
                disabled={isGeneratingContent}
              />
              {formData.focusKeywords.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                  {formData.focusKeywords.map(keyword => (
                    <Chip
                      key={keyword}
                      label={keyword}
                      onDelete={() => handleKeywordRemove(keyword)}
                      size="small"
                      disabled={isGeneratingContent}
                    />
                  ))}
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" flexDirection="column" gap={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.competitorAnalysis}
                      onChange={(e) => setFormData(prev => ({ ...prev, competitorAnalysis: e.target.checked }))}
                      disabled={isGeneratingContent}
                    />
                  }
                  label="Include competitor analysis"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.seoOptimization}
                      onChange={(e) => setFormData(prev => ({ ...prev, seoOptimization: e.target.checked }))}
                      disabled={isGeneratingContent}
                    />
                  }
                  label="Include SEO optimization"
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={formData.contentTypes.length === 0 || isGeneratingContent}
                startIcon={isGeneratingContent ? <CircularProgress size={20} /> : null}
                fullWidth
              >
                {isGeneratingContent ? 'Generating Content...' : 'Generate Content Ideas'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};
