/**
 * Content Ideas List Component
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
  Divider,
} from '@mui/material';
import { 
  Search as SearchIcon, 
  ExpandMore as ExpandMoreIcon,
  Visibility,
  Edit,
  Delete,
  ContentCopy,
} from '@mui/icons-material';
import { useContent } from '../../hooks/useContent';

interface ContentIdeasListProps {
  contentId?: string;
}

export const ContentIdeasList: React.FC<ContentIdeasListProps> = ({ contentId }) => {
  const { 
    useContentIdeasList, 
    useContentIdeas, 
    deleteContentIdeas, 
    isDeletingContentIdeas,
    deleteContentIdeasError 
  } = useContent();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedAngle, setExpandedAngle] = useState<string | false>(false);

  const { data: contentIdeasData, isLoading, error } = contentId 
    ? useContentIdeas(contentId)
    : useContentIdeasList({ skip: page * rowsPerPage, limit: rowsPerPage });

  const contentIdeas = contentId 
    ? (contentIdeasData?.data ? [contentIdeasData.data] : [])
    : (contentIdeasData?.data?.content_ideas || []);

  const filteredIdeas = contentIdeas.filter(idea =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteContent = async (contentId: string) => {
    try {
      await deleteContentIdeas(contentId);
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAngleToggle = (angleId: string) => {
    setExpandedAngle(expandedAngle === angleId ? false : angleId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'generated': return 'default';
      case 'reviewed': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'archived': return 'warning';
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
        {error.message || 'Failed to load content ideas'}
      </Alert>
    );
  }

  const paginatedIdeas = filteredIdeas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Content Ideas ({filteredIdeas.length})
          </Typography>
          <TextField
            size="small"
            placeholder="Search content ideas..."
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

        {deleteContentIdeasError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {deleteContentIdeasError.message || 'Failed to delete content'}
          </Alert>
        )}

        {contentIdeas.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              No content ideas found. Generate some content ideas to get started.
            </Typography>
          </Box>
        ) : (
          <>
            {paginatedIdeas.map((idea) => (
              <Card key={idea.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        {idea.title}
                      </Typography>
                      <Box display="flex" gap={1} mb={2}>
                        <Chip
                          label={idea.status}
                          color={getStatusColor(idea.status) as any}
                          size="small"
                        />
                        <Chip
                          label={`Score: ${idea.opportunity_score.toFixed(1)}`}
                          color={idea.opportunity_score > 7 ? 'success' : idea.opportunity_score > 4 ? 'warning' : 'error'}
                          size="small"
                          variant="outlined"
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
                        onClick={() => handleDeleteContent(idea.id)}
                        disabled={isDeletingContentIdeas}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>

                  {idea.article_angles && idea.article_angles.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Article Angles ({idea.article_angles.length})
                      </Typography>
                      {idea.article_angles.map((angle: any, index: number) => (
                        <Accordion 
                          key={angle.id || index}
                          expanded={expandedAngle === angle.id}
                          onChange={() => handleAngleToggle(angle.id)}
                        >
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box display="flex" alignItems="center" width="100%">
                              <Typography variant="subtitle2" sx={{ flex: 1 }}>
                                {angle.title}
                              </Typography>
                              <Box display="flex" gap={1} mr={2}>
                                <Chip label={angle.angle_type} size="small" variant="outlined" />
                                <Chip 
                                  label={`${angle.estimated_word_count} words`} 
                                  size="small" 
                                  variant="outlined" 
                                />
                                <Chip 
                                  label={`SEO: ${angle.seo_score}`} 
                                  size="small" 
                                  color={angle.seo_score > 7 ? 'success' : angle.seo_score > 4 ? 'warning' : 'error'}
                                />
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box>
                              <Typography variant="body2" gutterBottom>
                                <strong>Headline:</strong> {angle.headline}
                              </Typography>
                              <Typography variant="body2" gutterBottom>
                                <strong>Hook:</strong> {angle.hook}
                              </Typography>
                              <Typography variant="body2" gutterBottom>
                                <strong>Target Audience:</strong> {angle.target_audience}
                              </Typography>
                              
                              {angle.key_points && angle.key_points.length > 0 && (
                                <Box mt={2}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Key Points:
                                  </Typography>
                                  <List dense>
                                    {angle.key_points.map((point: string, pointIndex: number) => (
                                      <ListItem key={pointIndex} sx={{ py: 0 }}>
                                        <ListItemText 
                                          primary={point} 
                                          primaryTypographyProps={{ variant: 'body2' }}
                                        />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              )}

                              <Box mt={2} display="flex" gap={1}>
                                <Button size="small" startIcon={<ContentCopy />}>
                                  Copy Headline
                                </Button>
                                <Button size="small" startIcon={<Edit />}>
                                  Edit Angle
                                </Button>
                              </Box>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  )}

                  {idea.seo_recommendations && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        SEO Recommendations
                      </Typography>
                      <Grid container spacing={1}>
                        {idea.seo_recommendations.target_keywords && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Target Keywords:
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                              {idea.seo_recommendations.target_keywords.slice(0, 5).map((keyword: string, index: number) => (
                                <Chip key={index} label={keyword} size="small" />
                              ))}
                              {idea.seo_recommendations.target_keywords.length > 5 && (
                                <Chip 
                                  label={`+${idea.seo_recommendations.target_keywords.length - 5} more`} 
                                  size="small" 
                                  variant="outlined" 
                                />
                              )}
                            </Box>
                          </Grid>
                        )}
                        {idea.seo_recommendations.meta_title && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Meta Title:
                            </Typography>
                            <Typography variant="body2">
                              {idea.seo_recommendations.meta_title}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}

            {!contentId && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredIdeas.length}
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
