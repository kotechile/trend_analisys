/**
 * Affiliate Research Page Component
 * Complete affiliate research workflow and management
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
  MonetizationOn,
} from '@mui/icons-material';
import { useAffiliate } from '../hooks/useAffiliate';
import { AffiliateResearchForm, AffiliateProgramsList } from '../components/affiliate';
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
      id={`affiliate-tabpanel-${index}`}
      aria-labelledby={`affiliate-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const AffiliateResearch: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [newResearchDialogOpen, setNewResearchDialogOpen] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState<any>(null);

  const {
    useAffiliateResearchesList,
    useAffiliateResearch,
    startAffiliateResearch,
    isStartingResearch,
    startResearchError,
  } = useAffiliate();

  // Fetch data
  const { data: researchesData, isLoading, error, refetch } = useAffiliateResearchesList({
    skip: 0,
    limit: 50,
  });

  const researches = researchesData?.data?.researches || [];
  const filteredResearches = researches.filter(research => {
    const matchesSearch = research.niche.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || research.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStartResearch = async (niche: string) => {
    try {
      const result = await startAffiliateResearch({ niche });
      if (result.success) {
        setNewResearchDialogOpen(false);
        refetch();
      }
    } catch (error) {
      console.error('Failed to start research:', error);
    }
  };

  const handleViewResearch = (researchId: string) => {
    setSelectedResearch(researchId);
    setTabValue(1); // Switch to programs tab
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading affiliate researches..." fullHeight />;
  }

  if (error) {
    return (
      <Alert severity="error">
        {error.message || 'Failed to load affiliate researches'}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Affiliate Research
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setNewResearchDialogOpen(true)}
        >
          Start New Research
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search niches"
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
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="affiliate research tabs">
          <Tab label="Research List" />
          <Tab label="Programs" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Research List Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Research Projects ({filteredResearches.length})
          </Typography>
          
          {filteredResearches.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No research projects found.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setNewResearchDialogOpen(true)}
              >
                Start Your First Research
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Niche</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Programs Found</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredResearches.map((research: any) => (
                    <TableRow key={research.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {research.niche}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={research.status} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${research.programs_data?.length || 0} programs`}
                          color="info"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(research.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleViewResearch(research.id)}
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

        {/* Programs Tab */}
        <TabPanel value={tabValue} index={1}>
          {selectedResearch ? (
            <AffiliateProgramsList researchId={selectedResearch} />
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                Select a research project to view affiliate programs
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Research Analytics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Total Researches
                      </Typography>
                      <Typography variant="h4">
                        {researches.length}
                      </Typography>
                    </Box>
                    <Search color="primary" sx={{ fontSize: 40 }} />
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
                        {researches.filter(r => r.status === 'completed').length}
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
                        In Progress
                      </Typography>
                      <Typography variant="h4">
                        {researches.filter(r => r.status === 'in_progress').length}
                      </Typography>
                    </Box>
                    <MonetizationOn color="warning" sx={{ fontSize: 40 }} />
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
                        Total Programs
                      </Typography>
                      <Typography variant="h4">
                        {researches.reduce((sum, r) => sum + (r.programs_data?.length || 0), 0)}
                      </Typography>
                    </Box>
                    <MonetizationOn color="info" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* New Research Dialog */}
      <Dialog open={newResearchDialogOpen} onClose={() => setNewResearchDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Start New Affiliate Research</DialogTitle>
        <DialogContent>
          <AffiliateResearchForm
            onResearchStarted={handleStartResearch}
            isSubmitting={isStartingResearch}
            error={startResearchError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewResearchDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
