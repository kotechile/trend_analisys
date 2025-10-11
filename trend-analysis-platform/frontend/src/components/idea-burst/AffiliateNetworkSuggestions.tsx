import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Rating,
} from '@mui/material';
import {
  MonetizationOn,
  TrendingUp,
  Assessment,
  CheckCircle,
  Warning,
  Error,
  ExpandMore,
  Link,
  Share,
  Store,
  Campaign,
  Search,
  Lightbulb,
  LocationOn,
} from '@mui/icons-material';

interface AffiliateNetwork {
  id: string;
  name: string;
  category: string;
  commission_rate: string;
  cookie_duration: string;
  payment_terms: string;
  approval_requirements: string;
  content_guidelines: string[];
  best_for: string[];
  pros: string[];
  cons: string[];
  rating: number;
  popularity_score: number;
  content_fit_score: number;
  keyword_relevance: number;
}

interface KeywordAffiliateMatch {
  keyword: string;
  keyword_type: string;
  search_volume: number;
  affiliate_potential_score: number;
  suggested_networks: AffiliateNetwork[];
  monetization_opportunities: string[];
  content_integration_suggestions: string[];
  placement_recommendations: string[];
}

interface AffiliateNetworkSuggestionsProps {
  keywords: any[];
  contentIdea: any;
  onGenerateAffiliateContent: (keyword: string, network: AffiliateNetwork) => void;
}

export const AffiliateNetworkSuggestions: React.FC<AffiliateNetworkSuggestionsProps> = ({
  keywords,
  contentIdea,
  onGenerateAffiliateContent,
}) => {
  const [affiliateMatches, setAffiliateMatches] = useState<KeywordAffiliateMatch[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<AffiliateNetwork | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [networkDialogOpen, setNetworkDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');

  // Mock affiliate networks data
  const affiliateNetworks: AffiliateNetwork[] = [
    {
      id: 'amazon',
      name: 'Amazon Associates',
      category: 'E-commerce',
      commission_rate: '1-10%',
      cookie_duration: '24 hours',
      payment_terms: 'Monthly',
      approval_requirements: 'Easy approval',
      content_guidelines: ['No price comparisons', 'Clear disclosure required', 'No misleading claims'],
      best_for: ['Product reviews', 'Buying guides', 'Product comparisons'],
      pros: ['Huge product selection', 'High brand recognition', 'Easy to use'],
      cons: ['Low commission rates', 'Short cookie duration', 'Strict guidelines'],
      rating: 4.2,
      popularity_score: 95,
      content_fit_score: 0,
      keyword_relevance: 0,
    },
    {
      id: 'shareasale',
      name: 'ShareASale',
      category: 'Multi-merchant',
      commission_rate: '5-50%',
      cookie_duration: '30 days',
      payment_terms: 'Monthly',
      approval_requirements: 'Moderate approval',
      content_guidelines: ['Honest reviews required', 'Disclosure mandatory', 'No false claims'],
      best_for: ['Software reviews', 'Digital products', 'Niche products'],
      pros: ['High commission rates', 'Long cookie duration', 'Diverse merchants'],
      cons: ['Approval required', 'Complex reporting', 'Payment delays'],
      rating: 4.5,
      popularity_score: 85,
      content_fit_score: 0,
      keyword_relevance: 0,
    },
    {
      id: 'cj_affiliate',
      name: 'CJ Affiliate',
      category: 'Multi-merchant',
      commission_rate: '3-30%',
      cookie_duration: '30 days',
      payment_terms: 'Monthly',
      approval_requirements: 'Strict approval',
      content_guidelines: ['Quality content required', 'Traffic requirements', 'Disclosure needed'],
      best_for: ['High-traffic sites', 'Established blogs', 'Premium content'],
      pros: ['Premium brands', 'High payouts', 'Advanced tracking'],
      cons: ['Hard to get approved', 'High requirements', 'Complex setup'],
      rating: 4.7,
      popularity_score: 90,
      content_fit_score: 0,
      keyword_relevance: 0,
    },
    {
      id: 'impact',
      name: 'Impact',
      category: 'Multi-merchant',
      commission_rate: '2-25%',
      cookie_duration: '30 days',
      payment_terms: 'Monthly',
      approval_requirements: 'Moderate approval',
      content_guidelines: ['Transparent content', 'Disclosure required', 'Quality standards'],
      best_for: ['Content marketing', 'Influencer marketing', 'Brand partnerships'],
      pros: ['Modern platform', 'Good tracking', 'Brand variety'],
      cons: ['Newer platform', 'Limited merchants', 'Learning curve'],
      rating: 4.3,
      popularity_score: 75,
      content_fit_score: 0,
      keyword_relevance: 0,
    },
  ];

  useEffect(() => {
    generateAffiliateMatches();
  }, [keywords]);

  const generateAffiliateMatches = () => {
    const matches: KeywordAffiliateMatch[] = keywords
      .filter(k => k.affiliate_potential_score >= 50)
      .map(keyword => {
        const suggestedNetworks = getSuggestedNetworks(keyword);
        return {
          keyword: keyword.keyword,
          keyword_type: keyword.keyword_type,
          search_volume: keyword.search_volume,
          affiliate_potential_score: keyword.affiliate_potential_score,
          suggested_networks: suggestedNetworks,
          monetization_opportunities: keyword.monetization_opportunities || [],
          content_integration_suggestions: generateContentIntegrationSuggestions(keyword),
          placement_recommendations: generatePlacementRecommendations(keyword),
        };
      })
      .sort((a, b) => b.affiliate_potential_score - a.affiliate_potential_score);

    setAffiliateMatches(matches);
  };

  const getSuggestedNetworks = (keyword: any): AffiliateNetwork[] => {
    // const keywordType = keyword.keyword_type;
    // const potentialScore = keyword.affiliate_potential_score;
    // const searchVolume = keyword.search_volume;

    // Calculate content fit score for each network
    const networksWithScores = affiliateNetworks.map(network => ({
      ...network,
      content_fit_score: calculateContentFitScore(network, keyword, contentIdea),
      keyword_relevance: calculateKeywordRelevance(network, keyword),
    }));

    // Filter and sort networks based on relevance
    return networksWithScores
      .filter(network => network.content_fit_score >= 60)
      .sort((a, b) => (b.content_fit_score + b.keyword_relevance) - (a.content_fit_score + a.keyword_relevance))
      .slice(0, 3);
  };

  const calculateContentFitScore = (network: AffiliateNetwork, keyword: any, contentIdea: any): number => {
    let score = 0;

    // Base score from network rating
    score += network.rating * 20;

    // Content type matching
    const contentType = contentIdea.content_type;
    if (contentType === 'review' && network.best_for.includes('Product reviews')) score += 20;
    if (contentType === 'guide' && network.best_for.includes('Buying guides')) score += 20;
    if (contentType === 'comparison' && network.best_for.includes('Product comparisons')) score += 20;

    // Keyword type matching
    if (keyword.keyword_type === 'comparison' && network.best_for.includes('Product comparisons')) score += 15;
    if (keyword.keyword_type === 'primary' && network.best_for.includes('Product reviews')) score += 15;

    // Search volume consideration
    if (keyword.search_volume > 1000) score += 10;
    if (keyword.search_volume > 5000) score += 10;

    // Commission rate consideration
    const commissionRange = network.commission_rate.split('-');
    const minCommission = parseFloat(commissionRange[0]);
    if (minCommission >= 5) score += 10;
    if (minCommission >= 10) score += 10;

    return Math.min(100, score);
  };

  const calculateKeywordRelevance = (network: AffiliateNetwork, keyword: any): number => {
    let relevance = 0;

    // Check if keyword matches network's best categories
    const keywordText = keyword.keyword.toLowerCase();
    
    if (network.name.toLowerCase().includes('amazon') && 
        (keywordText.includes('buy') || keywordText.includes('product') || keywordText.includes('review'))) {
      relevance += 30;
    }

    if (network.name.toLowerCase().includes('shareasale') && 
        (keywordText.includes('software') || keywordText.includes('digital') || keywordText.includes('tool'))) {
      relevance += 30;
    }

    if (network.name.toLowerCase().includes('cj') && 
        (keywordText.includes('premium') || keywordText.includes('brand') || keywordText.includes('luxury'))) {
      relevance += 30;
    }

    // General relevance based on keyword type
    if (keyword.keyword_type === 'comparison') relevance += 20;
    if (keyword.keyword_type === 'primary') relevance += 15;
    if (keyword.keyword_type === 'long_tail') relevance += 10;

    return Math.min(100, relevance);
  };

  const generateContentIntegrationSuggestions = (keyword: any): string[] => {
    const suggestions = [];
    const keywordText = keyword.keyword;

    if (keyword.keyword_type === 'comparison') {
      suggestions.push(`Create a detailed comparison section featuring ${keywordText}`);
      suggestions.push(`Include pros and cons for each option in ${keywordText}`);
    }

    if (keyword.keyword_type === 'primary') {
      suggestions.push(`Write a comprehensive review of ${keywordText}`);
      suggestions.push(`Create a buying guide for ${keywordText}`);
    }

    if (keyword.keyword_type === 'long_tail') {
      suggestions.push(`Add a detailed section about ${keywordText}`);
      suggestions.push(`Include specific examples and use cases for ${keywordText}`);
    }

    suggestions.push(`Add a call-to-action for ${keywordText} products`);
    suggestions.push(`Include related product recommendations`);

    return suggestions;
  };

  const generatePlacementRecommendations = (keyword: any): string[] => {
    const recommendations = [];

    if (keyword.keyword_type === 'primary') {
      recommendations.push('Place in introduction or main content section');
      recommendations.push('Include in H2 or H3 headings');
    }

    if (keyword.keyword_type === 'comparison') {
      recommendations.push('Place in comparison or review section');
      recommendations.push('Include in product comparison tables');
    }

    if (keyword.keyword_type === 'question_based') {
      recommendations.push('Place in FAQ section');
      recommendations.push('Include in Q&A format content');
    }

    recommendations.push('Add to conclusion with call-to-action');
    recommendations.push('Include in sidebar or related products section');

    return recommendations;
  };

  const handleNetworkSelect = (network: AffiliateNetwork, keyword: string) => {
    setSelectedNetwork(network);
    setSelectedKeyword(keyword);
    setNetworkDialogOpen(true);
  };

  const handleGenerateAffiliateContent = async (keyword: string, network: AffiliateNetwork) => {
    setIsGenerating(true);
    setGenerationStatus('generating');

    try {
      // Simulate content generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await onGenerateAffiliateContent(keyword, network);
      setGenerationStatus('success');
      setTimeout(() => setGenerationStatus('idle'), 2000);
    } catch (error) {
      setGenerationStatus('error');
      setTimeout(() => setGenerationStatus('idle'), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getNetworkIcon = (networkId: string) => {
    switch (networkId) {
      case 'amazon': return <Store />;
      case 'shareasale': return <Share />;
      case 'cj_affiliate': return <Campaign />;
      case 'impact': return <TrendingUp />;
      default: return <MonetizationOn />;
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            💰 Affiliate Network Suggestions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            AI-powered affiliate network recommendations based on your keyword metrics and content potential.
          </Typography>

          {/* Generation Status */}
          {generationStatus === 'generating' && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Generating affiliate content...
              </Typography>
            </Box>
          )}

          {generationStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Affiliate content generated successfully!
            </Alert>
          )}

          {generationStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to generate affiliate content. Please try again.
            </Alert>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onChange={(_e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Keyword Matches" icon={<Search />} />
            <Tab label="Network Comparison" icon={<Assessment />} />
            <Tab label="Integration Guide" icon={<Link />} />
          </Tabs>

          {/* Tab Content */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                High-Potential Keywords ({affiliateMatches.length})
              </Typography>
              
              {affiliateMatches.map((match, index) => (
                <Accordion key={index} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {match.keyword}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                        <Chip
                          label={`${match.affiliate_potential_score.toFixed(1)}% potential`}
                          color={getScoreColor(match.affiliate_potential_score)}
                          size="small"
                        />
                        <Chip
                          label={`${match.search_volume.toLocaleString()} searches`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                          Suggested Networks
                        </Typography>
                        {match.suggested_networks.map((network) => (
                          <Card key={network.id} sx={{ mb: 2, p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getNetworkIcon(network.id)}
                                <Typography variant="h6" sx={{ ml: 1 }}>
                                  {network.name}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip
                                  label={`${network.content_fit_score.toFixed(0)}% fit`}
                                  color={getScoreColor(network.content_fit_score)}
                                  size="small"
                                />
                                <Rating value={network.rating} size="small" readOnly />
                              </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {network.commission_rate} commission • {network.cookie_duration} cookie
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleNetworkSelect(network, match.keyword)}
                              >
                                View Details
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleGenerateAffiliateContent(match.keyword, network)}
                                disabled={isGenerating}
                              >
                                Generate Content
                              </Button>
                            </Box>
                          </Card>
                        ))}
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                          Integration Suggestions
                        </Typography>
                        <List dense>
                          {match.content_integration_suggestions.map((suggestion, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon>
                                <Lightbulb />
                              </ListItemIcon>
                              <ListItemText primary={suggestion} />
                            </ListItem>
                          ))}
                        </List>
                        
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                          Placement Recommendations
                        </Typography>
                        <List dense>
                          {match.placement_recommendations.map((recommendation, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon>
                                <LocationOn />
                              </ListItemIcon>
                              <ListItemText primary={recommendation} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Network Comparison
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Network</TableCell>
                      <TableCell align="right">Commission</TableCell>
                      <TableCell align="right">Cookie Duration</TableCell>
                      <TableCell align="right">Rating</TableCell>
                      <TableCell align="right">Content Fit</TableCell>
                      <TableCell align="right">Best For</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {affiliateNetworks.map((network) => (
                      <TableRow key={network.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getNetworkIcon(network.id)}
                            <Typography variant="body2" sx={{ ml: 1, fontWeight: 'medium' }}>
                              {network.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {network.commission_rate}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {network.cookie_duration}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Rating value={network.rating} size="small" readOnly />
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${network.popularity_score}%`}
                            color={getScoreColor(network.popularity_score)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {network.best_for.slice(0, 2).join(', ')}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleNetworkSelect(network, '')}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Integration Guide
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Content Integration Best Practices
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircle color="success" />
                          </ListItemIcon>
                          <ListItemText primary="Always disclose affiliate relationships" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircle color="success" />
                          </ListItemIcon>
                          <ListItemText primary="Use natural, contextual placement" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircle color="success" />
                          </ListItemIcon>
                          <ListItemText primary="Provide genuine value and honest reviews" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircle color="success" />
                          </ListItemIcon>
                          <ListItemText primary="Test products before recommending" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Optimization Tips
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <TrendingUp color="primary" />
                          </ListItemIcon>
                          <ListItemText primary="Focus on high-converting keywords" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <TrendingUp color="primary" />
                          </ListItemIcon>
                          <ListItemText primary="A/B test different placements" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <TrendingUp color="primary" />
                          </ListItemIcon>
                          <ListItemText primary="Track performance metrics" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <TrendingUp color="primary" />
                          </ListItemIcon>
                          <ListItemText primary="Optimize for mobile users" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Network Details Dialog */}
      <Dialog
        open={networkDialogOpen}
        onClose={() => setNetworkDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedNetwork?.name} - {selectedKeyword}
        </DialogTitle>
        <DialogContent>
          {selectedNetwork && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Network Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Commission Rate" 
                        secondary={selectedNetwork.commission_rate}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Cookie Duration" 
                        secondary={selectedNetwork.cookie_duration}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Payment Terms" 
                        secondary={selectedNetwork.payment_terms}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Approval Requirements" 
                        secondary={selectedNetwork.approval_requirements}
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Content Guidelines
                  </Typography>
                  <List dense>
                    {selectedNetwork.content_guidelines.map((guideline, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Warning color="warning" />
                        </ListItemIcon>
                        <ListItemText primary={guideline} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Best For
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedNetwork.best_for.map((category, index) => (
                      <Chip key={index} label={category} color="primary" size="small" />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Pros
                  </Typography>
                  <List dense>
                    {selectedNetwork.pros.map((pro, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText primary={pro} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Cons
                  </Typography>
                  <List dense>
                    {selectedNetwork.cons.map((con, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Error color="error" />
                        </ListItemIcon>
                        <ListItemText primary={con} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNetworkDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedNetwork && selectedKeyword) {
                handleGenerateAffiliateContent(selectedKeyword, selectedNetwork);
                setNetworkDialogOpen(false);
              }
            }}
            disabled={isGenerating}
          >
            Generate Content
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AffiliateNetworkSuggestions;

