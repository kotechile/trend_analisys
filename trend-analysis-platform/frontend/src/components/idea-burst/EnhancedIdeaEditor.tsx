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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Visibility,
  TrendingUp,
  Search,
  MonetizationOn,
  Assessment,
  ExpandMore,
  CheckCircle,
  Warning,
  Lightbulb,
  ContentCopy,
  Psychology,
  AttachMoney,
  QuestionAnswer,
} from '@mui/icons-material';

interface KeywordData {
  id: string;
  keyword: string;
  keyword_type: string;
  search_volume: number;
  keyword_difficulty: number;
  cpc: number;
  opportunity_score: number;
  priority_score: number;
  affiliate_potential_score: number;
  is_optimized: boolean;
  llm_optimized_title?: string;
  llm_optimized_description?: string;
  content_suggestions: string[];
  heading_suggestions: string[];
  related_questions: string[];
  suggested_affiliate_networks: string[];
  monetization_opportunities: string[];
}

interface ContentIdea {
  id: string;
  title: string;
  description: string;
  content_type: string;
  status: string;
  priority: string;
  is_enhanced: boolean;
  seo_optimized_title?: string;
  seo_optimized_description?: string;
  primary_keywords_optimized: string[];
  keyword_metrics_summary: any;
  affiliate_networks_suggested: string[];
  enhancement_timestamp?: string;
}

interface EnhancedIdeaEditorProps {
  contentIdea: ContentIdea;
  keywords: KeywordData[];
  onSave: (updatedIdea: ContentIdea, updatedKeywords: KeywordData[]) => void;
  onGenerateContent: (ideaId: string) => void;
  onExportKeywords: (ideaId: string) => void;
}

export const EnhancedIdeaEditor: React.FC<EnhancedIdeaEditorProps> = ({
  contentIdea,
  keywords,
  onSave,
  onGenerateContent,
  onExportKeywords,
}) => {
  const [editedIdea, setEditedIdea] = useState<ContentIdea>(contentIdea);
  const [editedKeywords, setEditedKeywords] = useState<KeywordData[]>(keywords);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordData | null>(null);
  const [keywordDialogOpen, setKeywordDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    setEditedIdea(contentIdea);
    setEditedKeywords(keywords);
  }, [contentIdea, keywords]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      await onSave(editedIdea, editedKeywords);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeywordEdit = (keyword: KeywordData) => {
    setSelectedKeyword(keyword);
    setKeywordDialogOpen(true);
  };

  // const handleKeywordUpdate = (updatedKeyword: KeywordData) => {
  //   setEditedKeywords(prev => 
  //     prev.map(k => k.id === updatedKeyword.id ? updatedKeyword : k)
  //   );
  //   setKeywordDialogOpen(false);
  //   setSelectedKeyword(null);
  // };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 70) return 'error';
    if (difficulty >= 40) return 'warning';
    return 'success';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getKeywordTypeIcon = (type: string) => {
    switch (type) {
      case 'primary': return <Search />;
      case 'long_tail': return <TrendingUp />;
      case 'question_based': return <QuestionAnswer />;
      case 'comparison': return <Assessment />;
      case 'technical': return <Psychology />;
      default: return <Search />;
    }
  };

  const calculateMetrics = () => {
    const totalKeywords = editedKeywords.length;
    const optimizedKeywords = editedKeywords.filter(k => k.is_optimized).length;
    const highPriorityKeywords = editedKeywords.filter(k => k.priority_score >= 80).length;
    const affiliateKeywords = editedKeywords.filter(k => k.affiliate_potential_score >= 60).length;
    
    const avgSearchVolume = editedKeywords.reduce((sum, k) => sum + k.search_volume, 0) / totalKeywords;
    const avgDifficulty = editedKeywords.reduce((sum, k) => sum + k.keyword_difficulty, 0) / totalKeywords;
    const avgOpportunity = editedKeywords.reduce((sum, k) => sum + k.opportunity_score, 0) / totalKeywords;
    
    return {
      totalKeywords,
      optimizedKeywords,
      highPriorityKeywords,
      affiliateKeywords,
      avgSearchVolume: Math.round(avgSearchVolume),
      avgDifficulty: Math.round(avgDifficulty),
      avgOpportunity: Math.round(avgOpportunity),
      optimizationRate: totalKeywords > 0 ? Math.round((optimizedKeywords / totalKeywords) * 100) : 0
    };
  };

  const metrics = calculateMetrics();

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h5" gutterBottom>
                {editedIdea.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {editedIdea.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={editedIdea.content_type} color="primary" size="small" />
                <Chip label={editedIdea.status} color="secondary" size="small" />
                <Chip label={editedIdea.priority} color="default" size="small" />
                {editedIdea.is_enhanced && (
                  <Chip 
                    label="Enhanced" 
                    color="success" 
                    size="small" 
                    icon={<CheckCircle />}
                  />
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={() => onExportKeywords(editedIdea.id)}
              >
                Export Keywords
              </Button>
              <Button
                variant="contained"
                startIcon={<Lightbulb />}
                onClick={() => onGenerateContent(editedIdea.id)}
              >
                Generate Content
              </Button>
            </Box>
          </Box>

          {/* Save Status */}
          {saveStatus === 'saving' && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Saving changes...
              </Typography>
            </Box>
          )}

          {saveStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Changes saved successfully!
            </Alert>
          )}

          {saveStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to save changes. Please try again.
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={isSaving}
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs value={activeTab} onChange={(_e, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" icon={<Assessment />} />
          <Tab label="Keywords" icon={<Search />} />
          <Tab label="SEO Optimization" icon={<TrendingUp />} />
          <Tab label="Affiliate Opportunities" icon={<MonetizationOn />} />
          <Tab label="Content Generation" icon={<Lightbulb />} />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Content Idea Overview
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Basic Information
                      </Typography>
                      <TextField
                        fullWidth
                        label="Title"
                        value={editedIdea.title}
                        onChange={(e) => setEditedIdea(prev => ({ ...prev, title: e.target.value }))}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Description"
                        value={editedIdea.description}
                        onChange={(e) => setEditedIdea(prev => ({ ...prev, description: e.target.value }))}
                        sx={{ mb: 2 }}
                      />
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Content Type</InputLabel>
                        <Select
                          value={editedIdea.content_type}
                          onChange={(e) => setEditedIdea(prev => ({ ...prev, content_type: e.target.value }))}
                        >
                          <MenuItem value="blog_post">Blog Post</MenuItem>
                          <MenuItem value="article">Article</MenuItem>
                          <MenuItem value="guide">Guide</MenuItem>
                          <MenuItem value="review">Review</MenuItem>
                          <MenuItem value="tutorial">Tutorial</MenuItem>
                        </Select>
                      </FormControl>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Keyword Metrics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                              {metrics.totalKeywords}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Keywords
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main">
                              {metrics.optimizationRate}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Optimization Rate
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="warning.main">
                              {metrics.highPriorityKeywords}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              High Priority
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="info.main">
                              {metrics.affiliateKeywords}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Affiliate Potential
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Keywords Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Keywords ({editedKeywords.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" size="small">
                    Filter
                  </Button>
                  <Button variant="outlined" size="small">
                    Sort
                  </Button>
                </Box>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Keyword</TableCell>
                      <TableCell align="right">Type</TableCell>
                      <TableCell align="right">Search Volume</TableCell>
                      <TableCell align="right">Difficulty</TableCell>
                      <TableCell align="right">Opportunity</TableCell>
                      <TableCell align="right">Priority</TableCell>
                      <TableCell align="right">Affiliate</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {editedKeywords.map((keyword) => (
                      <TableRow key={keyword.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {keyword.keyword}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            icon={getKeywordTypeIcon(keyword.keyword_type)}
                            label={keyword.keyword_type}
                            size="small"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {keyword.search_volume.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={keyword.keyword_difficulty}
                            color={getDifficultyColor(keyword.keyword_difficulty)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${keyword.opportunity_score.toFixed(1)}%`}
                            color={getScoreColor(keyword.opportunity_score)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${keyword.priority_score.toFixed(1)}%`}
                            color={getScoreColor(keyword.priority_score)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${keyword.affiliate_potential_score.toFixed(1)}%`}
                            color={getScoreColor(keyword.affiliate_potential_score)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {keyword.is_optimized ? (
                            <Chip
                              icon={<CheckCircle />}
                              label="Optimized"
                              color="success"
                              size="small"
                            />
                          ) : (
                            <Chip
                              icon={<Warning />}
                              label="Pending"
                              color="warning"
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleKeywordEdit(keyword)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleKeywordEdit(keyword)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* SEO Optimization Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                SEO Optimization
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        SEO-Optimized Title
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        value={editedIdea.seo_optimized_title || ''}
                        onChange={(e) => setEditedIdea(prev => ({ 
                          ...prev, 
                          seo_optimized_title: e.target.value 
                        }))}
                        placeholder="Enter SEO-optimized title..."
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Meta Description
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={editedIdea.seo_optimized_description || ''}
                        onChange={(e) => setEditedIdea(prev => ({ 
                          ...prev, 
                          seo_optimized_description: e.target.value 
                        }))}
                        placeholder="Enter meta description..."
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Primary Keywords
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {editedIdea.primary_keywords_optimized.map((keyword, index) => (
                          <Chip
                            key={index}
                            label={keyword}
                            color="primary"
                            onDelete={() => {
                              const updated = [...editedIdea.primary_keywords_optimized];
                              updated.splice(index, 1);
                              setEditedIdea(prev => ({ 
                                ...prev, 
                                primary_keywords_optimized: updated 
                              }));
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Affiliate Opportunities Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Affiliate Opportunities
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Suggested Networks
                      </Typography>
                      <List dense>
                        {editedIdea.affiliate_networks_suggested.map((network, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <AttachMoney />
                            </ListItemIcon>
                            <ListItemText primary={network} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        High-Potential Keywords
                      </Typography>
                      <List dense>
                        {editedKeywords
                          .filter(k => k.affiliate_potential_score >= 60)
                          .slice(0, 5)
                          .map((keyword) => (
                            <ListItem key={keyword.id}>
                              <ListItemIcon>
                                <MonetizationOn />
                              </ListItemIcon>
                              <ListItemText 
                                primary={keyword.keyword}
                                secondary={`${keyword.affiliate_potential_score.toFixed(1)}% potential`}
                              />
                            </ListItem>
                          ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Content Generation Tab */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Content Generation
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Content Suggestions
                      </Typography>
                      <List>
                        {editedKeywords
                          .filter(k => k.content_suggestions.length > 0)
                          .slice(0, 10)
                          .map((keyword) => (
                            <Accordion key={keyword.id}>
                              <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="subtitle1">
                                  {keyword.keyword}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <List dense>
                                  {keyword.content_suggestions.map((suggestion, index) => (
                                    <ListItem key={index}>
                                      <ListItemIcon>
                                        <Lightbulb />
                                      </ListItemIcon>
                                      <ListItemText primary={suggestion} />
                                    </ListItem>
                                  ))}
                                </List>
                              </AccordionDetails>
                            </Accordion>
                          ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Card>

      {/* Keyword Detail Dialog */}
      <Dialog
        open={keywordDialogOpen}
        onClose={() => setKeywordDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Keyword Details</DialogTitle>
        <DialogContent>
          {selectedKeyword && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedKeyword.keyword}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Search Volume
                  </Typography>
                  <Typography variant="h6">
                    {selectedKeyword.search_volume.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Keyword Difficulty
                  </Typography>
                  <Typography variant="h6">
                    {selectedKeyword.keyword_difficulty}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    CPC
                  </Typography>
                  <Typography variant="h6">
                    ${selectedKeyword.cpc.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Opportunity Score
                  </Typography>
                  <Typography variant="h6">
                    {selectedKeyword.opportunity_score.toFixed(1)}%
                  </Typography>
                </Grid>
              </Grid>

              {selectedKeyword.llm_optimized_title && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    LLM Optimizations
                  </Typography>
                  <TextField
                    fullWidth
                    label="Optimized Title"
                    value={selectedKeyword.llm_optimized_title}
                    multiline
                    rows={2}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Optimized Description"
                    value={selectedKeyword.llm_optimized_description || ''}
                    multiline
                    rows={3}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKeywordDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedIdeaEditor;

