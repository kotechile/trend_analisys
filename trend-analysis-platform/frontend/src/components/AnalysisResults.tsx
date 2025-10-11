import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface AnalysisResultsProps {
  fileId: string;
  onExport?: (format: string) => void;
  onRefresh?: () => void;
}

interface AnalysisSummary {
  total_keywords: number;
  total_volume: number;
  average_difficulty: number;
  average_cpc: number;
  intent_distribution: Record<string, number>;
}

interface Keyword {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  intents: string[];
  opportunity_score: number;
}

interface ContentOpportunity {
  keyword: string;
  opportunity_score: number;
  content_suggestions: string[];
  priority: string;
}

interface SEOContentIdea {
  title: string;
  content_type: string;
  primary_keywords: string[];
  secondary_keywords: string[];
  seo_optimization_score: number;
  traffic_potential_score: number;
  total_search_volume: number;
  average_difficulty: number;
  average_cpc: number;
  optimization_tips: string[];
  content_outline: string[];
}

interface AnalysisResultsData {
  analysis_id: string;
  file_id: string;
  status: string;
  summary: AnalysisSummary;
  keywords: Keyword[];
  content_opportunities: ContentOpportunity[];
  seo_content_ideas: SEOContentIdea[];
  created_at: string;
  completed_at?: string;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  fileId,
  onExport,
  onRefresh
}) => {
  const [data, setData] = useState<AnalysisResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchAnalysisResults();
  }, [fileId]);

  const fetchAnalysisResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This would be replaced with actual API call
      // const response = await api.getAnalysisResults(fileId);
      // setData(response.data);
      
      // Mock data for now
      setData({
        analysis_id: 'mock-analysis-id',
        file_id: fileId,
        status: 'completed',
        created_at: new Date().toISOString(),
        summary: {
          total_keywords: 1250,
          total_volume: 45000,
          average_difficulty: 65.5,
          average_cpc: 2.3,
          intent_distribution: {
            'Informational': 450,
            'Commercial': 380,
            'Navigational': 250,
            'Transactional': 170
          }
        },
        keywords: [],
        content_opportunities: [],
        seo_content_ideas: []
      });
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analysis results');
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Loading analysis results...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchAnalysisResults}>
            <RefreshIcon sx={{ mr: 1 }} />
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No analysis results available
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Analysis Results
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => onExport?.('json')}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SearchIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Keywords</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatNumber(data.summary.total_keywords)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Volume</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {formatNumber(data.summary.total_volume)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssessmentIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Avg Difficulty</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {data.summary.average_difficulty.toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Avg CPC</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                ${data.summary.average_cpc.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Intent Distribution */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Intent Distribution
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.entries(data.summary.intent_distribution).map(([intent, count]) => (
            <Chip
              key={intent}
              label={`${intent}: ${count}`}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Keywords" />
          <Tab label="Content Opportunities" />
          <Tab label="SEO Content Ideas" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Keyword</TableCell>
                <TableCell align="right">Volume</TableCell>
                <TableCell align="right">Difficulty</TableCell>
                <TableCell align="right">CPC</TableCell>
                <TableCell>Intents</TableCell>
                <TableCell align="right">Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.keywords.slice(0, 10).map((keyword, index) => (
                <TableRow key={index}>
                  <TableCell>{keyword.keyword}</TableCell>
                  <TableCell align="right">{formatNumber(keyword.volume)}</TableCell>
                  <TableCell align="right">{keyword.difficulty.toFixed(1)}</TableCell>
                  <TableCell align="right">${keyword.cpc.toFixed(2)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {keyword.intents.map((intent) => (
                        <Chip key={intent} label={intent} size="small" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={keyword.opportunity_score.toFixed(1)}
                      color={getScoreColor(keyword.opportunity_score)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Keyword</TableCell>
                <TableCell align="right">Score</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Suggestions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.content_opportunities.slice(0, 10).map((opportunity, index) => (
                <TableRow key={index}>
                  <TableCell>{opportunity.keyword}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={opportunity.opportunity_score.toFixed(1)}
                      color={getScoreColor(opportunity.opportunity_score)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={opportunity.priority}
                      color={getPriorityColor(opportunity.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {opportunity.content_suggestions.slice(0, 2).map((suggestion, idx) => (
                        <Chip key={idx} label={suggestion} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 2 && (
        <Grid container spacing={2}>
          {data.seo_content_ideas.slice(0, 6).map((idea, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {idea.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={idea.content_type} color="primary" size="small" />
                    <Chip
                      label={`SEO: ${idea.seo_optimization_score.toFixed(1)}`}
                      color={getScoreColor(idea.seo_optimization_score)}
                      size="small"
                    />
                    <Chip
                      label={`Traffic: ${idea.traffic_potential_score.toFixed(1)}`}
                      color={getScoreColor(idea.traffic_potential_score)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Volume: {formatNumber(idea.total_search_volume)} | 
                    Difficulty: {idea.average_difficulty.toFixed(1)} | 
                    CPC: ${idea.average_cpc.toFixed(2)}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Primary Keywords:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {idea.primary_keywords.slice(0, 3).map((keyword) => (
                        <Chip key={keyword} label={keyword} size="small" />
                      ))}
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {idea.optimization_tips.slice(0, 2).join(' • ')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AnalysisResults;