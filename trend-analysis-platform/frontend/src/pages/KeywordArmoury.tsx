/**
 * Keyword Armoury Page Component
 * Keyword management and analysis workflow
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
} from '@mui/material';
import {
  Search,
  Add,
  Refresh,
  Download,
  Visibility,
  Edit,
  Delete,
  Upload,
  GetApp,
} from '@mui/icons-material';
import { useKeywords } from '../hooks/useKeywords';
import { KeywordUpload, KeywordClusters } from '../components/keywords';
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
      id={`keyword-tabpanel-${index}`}
      aria-labelledby={`keyword-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const KeywordArmoury: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const { useKeywordDataList } = useKeywords();

  // Fetch data
  const { data: keywordsData, isLoading, error, refetch } = useKeywordDataList({
    skip: 0,
    limit: 50,
  });

  const keywords = keywordsData?.data?.keyword_data || [];
  const filteredKeywords = keywords.filter(keyword => {
    const matchesSearch = keyword.keywords_processed?.some((k: any) => 
      k.keyword?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesSource = !sourceFilter || keyword.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading keywords..." fullHeight />;
  }

  if (error) {
    return (
      <Alert severity="error">
        {error.message || 'Failed to load keywords'}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Keyword Armoury
        </Typography>
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => {/* Handle upload */}}
        >
          Upload Keywords
        </Button>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Keywords
                  </Typography>
                  <Typography variant="h4">
                    {keywords.reduce((sum, k) => sum + (k.keywords_processed?.length || 0), 0)}
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
                    Uploaded
                  </Typography>
                  <Typography variant="h4">
                    {keywords.filter(k => k.source === 'upload').length}
                  </Typography>
                </Box>
                <Upload color="success" sx={{ fontSize: 40 }} />
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
                    Crawled
                  </Typography>
                  <Typography variant="h4">
                    {keywords.filter(k => k.source === 'crawl').length}
                  </Typography>
                </Box>
                <GetApp color="warning" sx={{ fontSize: 40 }} />
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
                    High Priority
                  </Typography>
                  <Typography variant="h4">
                    {keywords.filter(k => k.priority_score > 0.7).length}
                  </Typography>
                </Box>
                <Search color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
                <InputLabel>Source</InputLabel>
                <Select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  label="Source"
                >
                  <MenuItem value="">All Sources</MenuItem>
                  <MenuItem value="upload">Uploaded</MenuItem>
                  <MenuItem value="crawl">Crawled</MenuItem>
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
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="keyword armoury tabs">
          <Tab label="Upload Keywords" />
          <Tab label="Keyword Clusters" />
          <Tab label="All Keywords" />
        </Tabs>

        {/* Upload Keywords Tab */}
        <TabPanel value={tabValue} index={0}>
          <KeywordUpload />
        </TabPanel>

        {/* Keyword Clusters Tab */}
        <TabPanel value={tabValue} index={1}>
          <KeywordClusters />
        </TabPanel>

        {/* All Keywords Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            All Keywords ({filteredKeywords.length})
          </Typography>
          
          {filteredKeywords.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No keywords found.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Upload />}
                onClick={() => setTabValue(0)}
              >
                Upload Keywords
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Source</TableCell>
                    <TableCell>Keywords Count</TableCell>
                    <TableCell>Priority Score</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredKeywords.map((keyword: any) => (
                    <TableRow key={keyword.id} hover>
                      <TableCell>
                        <Chip 
                          label={keyword.source} 
                          color={keyword.source === 'upload' ? 'primary' : 'secondary'}
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {keyword.keywords_processed?.length || 0} keywords
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <ScoreIndicator
                          score={keyword.priority_score}
                          maxScore={1}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(keyword.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Button size="small" startIcon={<Visibility />}>
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
      </Paper>
    </Box>
  );
};
