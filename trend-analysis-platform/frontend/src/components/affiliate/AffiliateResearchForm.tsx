/**
 * Affiliate Research Form Component
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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAffiliate } from '../../hooks/useAffiliate';

interface AffiliateResearchFormProps {
  onResearchStarted?: (researchId: string) => void;
}

export const AffiliateResearchForm: React.FC<AffiliateResearchFormProps> = ({
  onResearchStarted,
}) => {
  const { startResearch, isStartingResearch, startResearchError } = useAffiliate();
  const [formData, setFormData] = useState({
    niche: '',
    targetAudience: '',
    budgetRange: '',
    preferredNetworks: [] as string[],
  });

  const networkOptions = [
    'ShareASale',
    'Impact',
    'Amazon Associates',
    'CJ Affiliate',
    'Partnerize',
    'Awin',
    'ClickBank',
    'Rakuten Advertising',
    'FlexOffers',
    'Webgains',
    'Tradedoubler',
    'Affiliate Window',
    'Skimlinks',
    'VigLink',
  ];

  const budgetRanges = [
    'Under $1,000',
    '$1,000 - $5,000',
    '$5,000 - $10,000',
    '$10,000 - $25,000',
    '$25,000+',
  ];

  const handleInputChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleNetworkToggle = (network: string) => {
    setFormData(prev => ({
      ...prev,
      preferredNetworks: prev.preferredNetworks.includes(network)
        ? prev.preferredNetworks.filter(n => n !== network)
        : [...prev.preferredNetworks, network],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.niche.trim()) {
      return;
    }

    try {
      const result = await startResearch({
        niche: formData.niche,
        target_audience: formData.targetAudience || undefined,
        budget_range: formData.budgetRange || undefined,
        preferred_networks: formData.preferredNetworks.length > 0 ? formData.preferredNetworks : undefined,
      });

      if (result.success && onResearchStarted) {
        onResearchStarted(result.data.id);
      }
    } catch (error) {
      console.error('Failed to start affiliate research:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Start Affiliate Research
        </Typography>
        
        {startResearchError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {startResearchError.message || 'Failed to start research'}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Niche *"
                value={formData.niche}
                onChange={handleInputChange('niche')}
                placeholder="e.g., home coffee roasting, fitness equipment, pet supplies"
                required
                disabled={isStartingResearch}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Target Audience"
                value={formData.targetAudience}
                onChange={handleInputChange('targetAudience')}
                placeholder="e.g., coffee enthusiasts, fitness beginners"
                disabled={isStartingResearch}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={isStartingResearch}>
                <InputLabel>Budget Range</InputLabel>
                <Select
                  value={formData.budgetRange}
                  onChange={handleInputChange('budgetRange')}
                  label="Budget Range"
                >
                  {budgetRanges.map(range => (
                    <MenuItem key={range} value={range}>
                      {range}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Preferred Networks (Optional)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {networkOptions.map(network => (
                  <Chip
                    key={network}
                    label={network}
                    onClick={() => handleNetworkToggle(network)}
                    color={formData.preferredNetworks.includes(network) ? 'primary' : 'default'}
                    variant={formData.preferredNetworks.includes(network) ? 'filled' : 'outlined'}
                    disabled={isStartingResearch}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!formData.niche.trim() || isStartingResearch}
                startIcon={isStartingResearch ? <CircularProgress size={20} /> : null}
                fullWidth
              >
                {isStartingResearch ? 'Starting Research...' : 'Start Research'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};
