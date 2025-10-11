/**
 * Software Solutions List Component
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from '@mui/material';
import { 
  Search as SearchIcon, 
  ExpandMore as ExpandMoreIcon,
  Visibility,
  Edit,
  Delete,
  Code,
  MonetizationOn,
  Search,
  Schedule,
  CheckCircle,
  Pending,
  PlayArrow,
} from '@mui/icons-material';
import { useSoftware } from '../../hooks/useSoftware';

interface SoftwareSolutionsListProps {
  softwareSolutionsId?: string;
}

export const SoftwareSolutionsList: React.FC<SoftwareSolutionsListProps> = ({ softwareSolutionsId }) => {
  const { 
    useSoftwareSolutionsList, 
    useSoftwareSolutions, 
    deleteSoftwareSolution, 
    isDeletingSoftwareSolution,
    deleteSoftwareSolutionError 
  } = useSoftware();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedSolution, setExpandedSolution] = useState<string | false>(false);

  const { data: solutionsData, isLoading, error } = softwareSolutionsId 
    ? useSoftwareSolutions(softwareSolutionsId)
    : useSoftwareSolutionsList({ skip: page * rowsPerPage, limit: rowsPerPage });

  const solutions = softwareSolutionsId 
    ? (solutionsData?.data?.software_solutions || [])
    : (solutionsData?.data?.software_solutions || []);

  const filteredSolutions = solutions.filter(solution =>
    solution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    solution.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    solution.software_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteSolution = async (solutionId: string) => {
    try {
      await deleteSoftwareSolution(solutionId);
    } catch (error) {
      console.error('Failed to delete software solution:', error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSolutionToggle = (solutionId: string) => {
    setExpandedSolution(expandedSolution === solutionId ? false : solutionId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'idea': return 'default';
      case 'planned': return 'info';
      case 'in_development': return 'warning';
      case 'completed': return 'success';
      case 'archived': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'idea': return <Pending />;
      case 'planned': return <Schedule />;
      case 'in_development': return <PlayArrow />;
      case 'completed': return <CheckCircle />;
      case 'archived': return <Delete />;
      default: return <Pending />;
    }
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 3) return 'success';
    if (complexity <= 6) return 'warning';
    return 'error';
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
        {error.message || 'Failed to load software solutions'}
      </Alert>
    );
  }

  const paginatedSolutions = filteredSolutions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Software Solutions ({filteredSolutions.length})
          </Typography>
          <TextField
            size="small"
            placeholder="Search solutions..."
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
        </Box>

        {deleteSoftwareSolutionError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {deleteSoftwareSolutionError.message || 'Failed to delete solution'}
          </Alert>
        )}

        {solutions.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              No software solutions found. Generate some solutions to get started.
            </Typography>
          </Box>
        ) : (
          <>
            {paginatedSolutions.map((solution) => (
              <Card key={solution.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        {solution.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {solution.description}
                      </Typography>
                      <Box display="flex" gap={1} mb={2}>
                        <Chip
                          label={solution.software_type}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`Complexity: ${solution.complexity_score}/10`}
                          color={getComplexityColor(solution.complexity_score) as any}
                          size="small"
                        />
                        <Chip
                          label={`Priority: ${(solution.priority_score * 100).toFixed(0)}%`}
                          color={solution.priority_score > 0.7 ? 'success' : solution.priority_score > 0.4 ? 'warning' : 'error'}
                          size="small"
                        />
                        <Chip
                          icon={getStatusIcon(solution.development_status)}
                          label={solution.development_status}
                          color={getStatusColor(solution.development_status) as any}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Button size="small" startIcon={<Visibility />}>
                        View
                      </Button>
                      <Button size="small" startIcon={<Edit />}>
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<Delete />}
                        color="error"
                        onClick={() => handleDeleteSolution(solution.id)}
                        disabled={isDeletingSoftwareSolution}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>

                  <Accordion 
                    expanded={expandedSolution === solution.id}
                    onChange={() => handleSolutionToggle(solution.id)}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">
                        View Details
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Target Keywords
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {solution.target_keywords.slice(0, 8).map((keyword: string, index: number) => (
                              <Chip key={index} label={keyword} size="small" />
                            ))}
                            {solution.target_keywords.length > 8 && (
                              <Chip 
                                label={`+${solution.target_keywords.length - 8} more`} 
                                size="small" 
                                variant="outlined" 
                              />
                            )}
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Development Time
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {solution.estimated_development_time || 'Not estimated'}
                          </Typography>
                        </Grid>

                        {solution.technical_requirements && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Technical Requirements
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                  Frontend: {solution.technical_requirements.frontend}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Backend: {solution.technical_requirements.backend}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                  Database: {solution.technical_requirements.database}
                                </Typography>
                                {solution.technical_requirements.apis && (
                                  <Typography variant="body2" color="text.secondary">
                                    APIs: {solution.technical_requirements.apis.join(', ')}
                                  </Typography>
                                )}
                              </Grid>
                            </Grid>
                          </Grid>
                        )}

                        {solution.development_phases && solution.development_phases.length > 0 && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Development Phases
                            </Typography>
                            <List dense>
                              {solution.development_phases.map((phase: any, index: number) => (
                                <ListItem key={index} sx={{ py: 0 }}>
                                  <ListItemIcon>
                                    <Code fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={phase.phase}
                                    secondary={`${phase.duration} - ${phase.tasks.length} tasks`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Grid>
                        )}

                        {solution.monetization_strategy && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Monetization Strategy
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <MonetizationOn fontSize="small" />
                              <Typography variant="body2">
                                Primary: {solution.monetization_strategy.primary}
                              </Typography>
                            </Box>
                            {solution.monetization_strategy.free_features && (
                              <Typography variant="body2" color="text.secondary">
                                Free Features: {solution.monetization_strategy.free_features.join(', ')}
                              </Typography>
                            )}
                            {solution.monetization_strategy.premium_features && (
                              <Typography variant="body2" color="text.secondary">
                                Premium Features: {solution.monetization_strategy.premium_features.join(', ')}
                              </Typography>
                            )}
                          </Grid>
                        )}

                        {solution.seo_optimization && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              SEO Optimization
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Search fontSize="small" />
                              <Typography variant="body2">
                                Meta Description: {solution.seo_optimization.meta_description}
                              </Typography>
                            </Box>
                            {solution.seo_optimization.content_strategy && (
                              <Typography variant="body2" color="text.secondary">
                                Content Strategy: {solution.seo_optimization.content_strategy.join(', ')}
                              </Typography>
                            )}
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            ))}

            {!softwareSolutionsId && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredSolutions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
