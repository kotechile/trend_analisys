/**
 * Affiliate Research Step Component
 * Handles affiliate offer research for selected subtopics
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
} from '@mui/material';
import { MonetizationOn, ArrowForward, ArrowBack } from '@mui/icons-material';
import { useAffiliateResearch } from '../../hooks/useWorkflow';
import { WorkflowStepProps } from '../../types/workflow';

const AffiliateResearchStep: React.FC<WorkflowStepProps> = React.memo(({
  onNext,
  onBack,
  data,
  loading = false,
  error,
}) => {
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);

  const affiliateResearchMutation = useAffiliateResearch();

  const handleSearch = () => {
    if (!data?.selectedSubtopics || data.selectedSubtopics.length === 0) return;

    affiliateResearchMutation.mutate({
      subtopicIds: data.selectedSubtopics,
      sessionId: data?.sessionId || 'temp-session',
    });
  };

  const handleOfferToggle = (offerId: string) => {
    setSelectedOffers(prev =>
      prev.includes(offerId)
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // Auto-trigger search when component mounts if we have subtopics
  React.useEffect(() => {
    if (data?.selectedSubtopics && data.selectedSubtopics.length > 0) {
      handleSearch();
    }
  }, [data?.selectedSubtopics]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <MonetizationOn sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          💰 Affiliate Research
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Finding relevant affiliate offers for your selected subtopics...
      </Typography>

      {/* Loading State */}
      {affiliateResearchMutation.isPending && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
              <CircularProgress sx={{ mr: 2 }} />
              <Typography>Searching for affiliate offers...</Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {(error || affiliateResearchMutation.isError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || affiliateResearchMutation.error?.message || 'Failed to find affiliate offers. Please try again.'}
        </Alert>
      )}

      {/* Results */}
      {affiliateResearchMutation.isSuccess && affiliateResearchMutation.data && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Found {affiliateResearchMutation.data.offers.length} Affiliate Offers
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select the offers you want to include in your content strategy:
            </Typography>

            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <FormGroup>
                <Grid container spacing={2}>
                  {affiliateResearchMutation.data.offers.map((offer) => (
                    <Grid item xs={12} md={6} key={offer.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedOffers.includes(offer.id)}
                            onChange={() => handleOfferToggle(offer.id)}
                          />
                        }
                        label={
                          <Paper sx={{ p: 2, width: '100%' }}>
                            <Typography variant="subtitle1" gutterBottom>
                              {offer.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {offer.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip
                                label={offer.category}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Chip
                                label={offer.difficulty}
                                size="small"
                                color={
                                  offer.difficulty === 'easy' ? 'success' :
                                  offer.difficulty === 'medium' ? 'warning' : 'error'
                                }
                                variant="outlined"
                              />
                              <Chip
                                label={offer.commission}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            </Box>
                          </Paper>
                        }
                        sx={{ width: '100%', alignItems: 'flex-start' }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>
            </FormControl>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForward />}
          onClick={handleNext}
          disabled={loading || selectedOffers.length === 0}
        >
          Continue to Trend Analysis
        </Button>
      </Box>
    </Box>
  );
});

AffiliateResearchStep.displayName = 'AffiliateResearchStep';

export default AffiliateResearchStep;