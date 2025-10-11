/**
 * Trend Validation Page Component
 * Trend analysis and validation workflow
 */

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search,
  Add,
  Refresh,
  FilterList,
  Download,
  Visibility,
  Edit,
  Delete,
  TrendingUp,
  Assessment,
  Timeline,
} from '@mui/icons-material';
import { useTrends } from '../hooks/useTrends';
import { TrendAnalysisForm, TrendChart } from '../components/trends';
import { LoadingSpinner, StatusChip, ScoreIndicator } from '../components/common';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trend-tabpanel-${index}`}
      aria-labelledby={`trend-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const TrendValidation: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [newAnalysisDialogOpen, setNewAnalysisDialogOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);

  const {
    useTrendAnalysesList,
    useTrendAnalysis,
    startTrendAnalysis,
    isStartingAnalysis,
    startAnalysisError,
  } = useTrends();

  // Fetch data
  const { data: analysesData, isLoading, error, refetch } = useTrendAnalysesList({
    skip: 0,
    limit: 50,
  });

  const analyses = analysesData?.data?.analyses || [];
  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.keyword.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || analysis.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStartAnalysis = async (keyword: string, geo: string) => {
    try {
      const result = await startTrendAnalysis({ keyword, geo });
      if (result.success) {
        setNewAnalysisDialogOpen(false);
        refetch();
      }
    } catch (error) {
      console.error('Failed to start analysis:', error);
    }
  };

  const handleViewAnalysis = (analysisId: string) => {
    setSelectedAnalysis(analysisId);
    setTabValue(1); // Switch to charts tab
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading trend analyses..." fullHeight />;
  }

  if (error) {
    return (
      <Alert severity="error">
        {error.message || 'Failed to load trend analyses'}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Trend Validation
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setNewAnalysisDialogOpen(true)}
        >
          Start New Analysis
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search keywords"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={5}>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => refetch()}
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => {/* Export functionality */}}
                >
                  Export
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="trend validation tabs">
          <Tab label="Analysis List" />
          <Tab label="Charts" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Analysis List Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Trend Analyses ({filteredAnalyses.length})
          </Typography>
          
          {filteredAnalyses.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No trend analyses found.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setNewAnalysisDialogOpen(true)}
              >
                Start Your First Analysis
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Keyword</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Opportunity Score</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAnalyses.map((analysis: any) => (
                    <TableRow key={analysis.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {analysis.keyword}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={analysis.geo} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <StatusChip status={analysis.status} />
                      </TableCell>
                      <TableCell>
                        <ScoreIndicator
                          score={analysis.opportunity_score}
                          maxScore={100}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleViewAnalysis(analysis.id)}
                          >
                            View
                          </Button>
                          <Button size="small" startIcon={<Edit />}>
                            Edit
                          </Button>
                          <Button size="small" startIcon={<Delete />} color="error">
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Charts Tab */}
        <TabPanel value={tabValue} index={1}>
          {selectedAnalysis ? (
            <TrendChart analysisId={selectedAnalysis} />
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                Select a trend analysis to view charts
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Trend Analysis Analytics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Total Analyses
                      </Typography>
                      <Typography variant="h4">
                        {analyses.length}
                      </Typography>
                    </Box>
                    <Assessment color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Completed
                      </Typography>
                      <Typography variant="h4">
                        {analyses.filter(a => a.status === 'completed').length}
                      </Typography>
                    </Box>
                    <TrendingUp color="success" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        High Opportunity
                      </Typography>
                      <Typography variant="h4">
                        {analyses.filter(a => a.opportunity_score > 70).length}
                      </Typography>
                    </Box>
                    <Timeline color="warning" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Avg Score
                      </Typography>
                      <Typography variant="h4">
                        {analyses.length > 0 
                          ? Math.round(analyses.reduce((sum, a) => sum + a.opportunity_score, 0) / analyses.length)
                          : 0
                        }
                      </Typography>
                    </Box>
                    <Assessment color="info" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* New Analysis Dialog */}
      <Dialog open={newAnalysisDialogOpen} onClose={() => setNewAnalysisDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Start New Trend Analysis</DialogTitle>
        <DialogContent>
          <TrendAnalysisForm
            onAnalysisStarted={handleStartAnalysis}
            isSubmitting={isStartingAnalysis}
            error={startAnalysisError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewAnalysisDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
