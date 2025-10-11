import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Link,
} from '@mui/material';
import {
  Psychology,
  Category,
  TrendingUp,
  MonetizationOn,
  Assessment,
  OpenInNew,
} from '@mui/icons-material';

interface LLMAnalysisDisplayProps {
  analysis: {
    topic: string;
    category: string;
    target_audience: string;
    content_opportunities: string[];
    affiliate_types: string[];
    competition_level: string;
    earnings_potential: string;
    related_areas: Array<{
      area: string;
      description: string;
      relevance_score: number;
    }>;
    affiliate_programs: Array<{
      name: string;
      commission: string;
      category: string;
      difficulty: string;
      description: string;
      link: string;
      estimated_traffic: number;
      competition_level: string;
    }>;
  };
}

export const LLMAnalysisDisplay: React.FC<LLMAnalysisDisplayProps> = ({ analysis }) => {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      outdoor_recreation: '#4caf50',
      food_cooking: '#ff9800',
      technology: '#2196f3',
      health_fitness: '#e91e63',
      education_learning: '#9c27b0',
      home_garden: '#795548',
      travel_hospitality: '#00bcd4',
      fashion_beauty: '#f44336',
      automotive: '#607d8b',
      business_services: '#3f51b5',
      entertainment_gaming: '#ff5722',
      finance_investing: '#4caf50',
      pets_animals: '#8bc34a',
      sports_fitness: '#ffc107',
      general: '#9e9e9e',
    };
    return colors[category] || '#9e9e9e';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      Easy: '#4caf50',
      Medium: '#ff9800',
      Hard: '#f44336',
    };
    return colors[difficulty] || '#9e9e9e';
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Psychology color="primary" />
        AI-Powered Analysis
      </Typography>

      <Grid container spacing={3}>
        {/* Category & Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Category color="primary" />
                Category Analysis
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={analysis.category.replace('_', ' ').toUpperCase()}
                  sx={{
                    backgroundColor: getCategoryColor(analysis.category),
                    color: 'white',
                    fontWeight: 'bold',
                    mb: 1,
                  }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Target Audience:</strong> {analysis.target_audience}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Competition Level:</strong> {analysis.competition_level}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Earnings Potential:</strong> {analysis.earnings_potential}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Content Opportunities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="primary" />
                Content Opportunities
              </Typography>
              
              <List dense>
                {analysis.content_opportunities.map((opportunity, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary={opportunity}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Related Areas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment color="primary" />
                AI-Generated Subtopics
              </Typography>
              
              <Grid container spacing={2}>
                {analysis.related_areas.map((area, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        {area.area}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {area.description}
                      </Typography>
                      <Chip
                        label={`${Math.round(area.relevance_score * 100)}% relevant`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* AI-Generated Affiliate Programs */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MonetizationOn color="primary" />
                AI-Recommended Affiliate Programs
              </Typography>
              
              <Grid container spacing={2}>
                {analysis.affiliate_programs.map((program, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        height: '100%',
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Link
                          href={program.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          {program.name}
                        </Link>
                        <OpenInNew fontSize="small" color="action" />
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {program.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        <Chip
                          label={program.commission}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                        <Chip
                          label={program.difficulty}
                          size="small"
                          sx={{
                            backgroundColor: getDifficultyColor(program.difficulty),
                            color: 'white',
                          }}
                        />
                        <Chip
                          label={program.competition_level}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary">
                        Est. Traffic: {program.estimated_traffic.toLocaleString()}
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
