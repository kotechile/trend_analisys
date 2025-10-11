/**
 * Keyword Clusters Component
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  Grid,
} from '@mui/material';
import { Search as SearchIcon, TrendingUp, Visibility } from '@mui/icons-material';
import { useKeywords } from '../../hooks/useKeywords';

interface KeywordClustersProps {
  keywordDataId: string;
}

export const KeywordClusters: React.FC<KeywordClustersProps> = ({ keywordDataId }) => {
  const { useClusters, clusterKeywords, isClusteringKeywords, clusterKeywordsError } = useKeywords();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: clustersData, isLoading, error } = useClusters(keywordDataId);

  const clusters = clustersData?.data || [];
  const filteredClusters = clusters.filter(cluster =>
    cluster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cluster.keywords.some(keyword => 
      keyword.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleClusterKeywords = async () => {
    try {
      await clusterKeywords(keywordDataId);
    } catch (error) {
      console.error('Failed to cluster keywords:', error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCompetitionColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error.message || 'Failed to load keyword clusters'}
      </Alert>
    );
  }

  const paginatedClusters = filteredClusters.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Keyword Clusters ({filteredClusters.length})
          </Typography>
          <Box display="flex" gap={1}>
            <TextField
              size="small"
              placeholder="Search clusters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              onClick={handleClusterKeywords}
              disabled={isClusteringKeywords}
              startIcon={isClusteringKeywords ? <CircularProgress size={20} /> : null}
            >
              {isClusteringKeywords ? 'Clustering...' : 'Cluster Keywords'}
            </Button>
          </Box>
        </Box>

        {clusterKeywordsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {clusterKeywordsError.message || 'Failed to cluster keywords'}
          </Alert>
        )}

        {clusters.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No keyword clusters found. Click "Cluster Keywords" to generate clusters.
            </Typography>
            <Button
              variant="contained"
              onClick={handleClusterKeywords}
              disabled={isClusteringKeywords}
              startIcon={isClusteringKeywords ? <CircularProgress size={20} /> : null}
            >
              {isClusteringKeywords ? 'Clustering...' : 'Generate Clusters'}
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cluster Name</TableCell>
                    <TableCell>Keywords</TableCell>
                    <TableCell align="right">Priority Score</TableCell>
                    <TableCell align="right">Search Volume</TableCell>
                    <TableCell align="center">Competition</TableCell>
                    <TableCell align="right">Opportunity Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedClusters.map((cluster) => (
                    <TableRow key={cluster.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" noWrap>
                          {cluster.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexWrap="wrap" gap={0.5} maxWidth={300}>
                          {cluster.keywords.slice(0, 3).map((keyword, index) => (
                            <Chip
                              key={index}
                              label={keyword}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {cluster.keywords.length > 3 && (
                            <Chip
                              label={`+${cluster.keywords.length - 3} more`}
                              size="small"
                              variant="outlined"
                              color="default"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {cluster.priority_score.toFixed(1)}
                          </Typography>
                          <TrendingUp 
                            fontSize="small" 
                            color={cluster.priority_score > 7 ? 'success' : cluster.priority_score > 4 ? 'warning' : 'error'}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {cluster.search_volume.toLocaleString()}
                          </Typography>
                          <Visibility fontSize="small" color="action" />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={cluster.competition_level}
                          color={getCompetitionColor(cluster.competition_level) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <Typography 
                            variant="body2" 
                            color={cluster.opportunity_score > 7 ? 'success.main' : cluster.opportunity_score > 4 ? 'warning.main' : 'error.main'}
                            sx={{ mr: 1 }}
                          >
                            {cluster.opportunity_score.toFixed(1)}
                          </Typography>
                          <TrendingUp 
                            fontSize="small" 
                            color={cluster.opportunity_score > 7 ? 'success' : cluster.opportunity_score > 4 ? 'warning' : 'error'}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredClusters.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}

        {clusters.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">
                    {clusters.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Clusters
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {clusters.filter(c => c.priority_score > 7).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High Priority
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {clusters.filter(c => c.competition_level === 'low').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Competition
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
