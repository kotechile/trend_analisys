/**
 * Dataflow Viewer component
 * Displays the complete dataflow for a research topic including subtopics, trend analyses, and content ideas
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useResearchTopicComplete, useDataflowIntegrity } from '../../hooks/useResearchTopics';
import { SubtopicItem } from '../../types/researchTopics';

interface DataflowViewerProps {
  topicId: string;
}

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
      id={`dataflow-tabpanel-${index}`}
      aria-labelledby={`dataflow-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DataflowViewer: React.FC<DataflowViewerProps> = ({ topicId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSubtopic, setSelectedSubtopic] = useState<SubtopicItem | null>(null);
  const [showSubtopicDialog, setShowSubtopicDialog] = useState(false);

  const { data: dataflow, isLoading, error } = useResearchTopicComplete(topicId);
  const { isValid, issues, refresh: refreshIntegrity } = useDataflowIntegrity(topicId);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSubtopicClick = (subtopic: SubtopicItem) => {
    setSelectedSubtopic(subtopic);
    setShowSubtopicDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'failed':
        return 'error';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon />;
      case 'in_progress':
        return <ScheduleIcon />;
      case 'failed':
        return <ErrorIcon />;
      case 'pending':
        return <TimelineIcon />;
      default:
        return <TimelineIcon />;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !dataflow) {
    return (
      <Alert severity="error">
        Failed to load dataflow: {error?.message || 'Unknown error'}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
          {dataflow.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {dataflow.description || 'No description provided'}
        </Typography>
        
        {/* Status and Version */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            label={dataflow.status}
            color={dataflow.status === 'active' ? 'success' : dataflow.status === 'completed' ? 'primary' : 'default'}
            size="small"
          />
          <Chip
            label={`v${dataflow.version}`}
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Integrity Check */}
        {!isValid && (
          <Alert 
            severity="warning" 
            sx={{ mb: 2 }}
            action={
              <Button size="small" onClick={refreshIntegrity}>
                Refresh
              </Button>
            }
          >
            <Typography variant="body2">
              Dataflow integrity issues detected:
            </Typography>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              {issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </Alert>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label={
              <Badge badgeContent={dataflow.subtopics.length} color="primary">
                Subtopics
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={dataflow.trend_analyses.length} color="primary">
                Trend Analyses
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={dataflow.content_ideas.length} color="primary">
                Content Ideas
              </Badge>
            } 
          />
        </Tabs>
      </Box>

      {/* Subtopics Tab */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Subtopics ({dataflow.subtopics.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
          >
            Add Subtopic
          </Button>
        </Box>

        {dataflow.subtopics.length === 0 ? (
          <Alert severity="info">
            No subtopics created yet. Click "Add Subtopic" to get started.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {dataflow.subtopics.map((subtopic: any, index: number) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                      {subtopic.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {subtopic.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => handleSubtopicClick(subtopic)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Trend Analyses Tab */}
      <TabPanel value={activeTab} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Trend Analyses ({dataflow.trend_analyses.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
          >
            Add Analysis
          </Button>
        </Box>

        {dataflow.trend_analyses.length === 0 ? (
          <Alert severity="info">
            No trend analyses created yet. Click "Add Analysis" to get started.
          </Alert>
        ) : (
          <List>
            {dataflow.trend_analyses.map((analysis: any, index: number) => (
              <React.Fragment key={analysis.id}>
                <ListItem>
                  <ListItemIcon>
                    {getStatusIcon(analysis.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={analysis.analysis_name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Subtopic: {analysis.subtopic_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Keywords: {analysis.keywords.join(', ')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Timeframe: {analysis.timeframe} | Geo: {analysis.geo || 'Global'}
                        </Typography>
                        {analysis.error_message && (
                          <Typography variant="body2" color="error">
                            Error: {analysis.error_message}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={analysis.status}
                      color={getStatusColor(analysis.status) as any}
                      size="small"
                    />
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < dataflow.trend_analyses.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </TabPanel>

      {/* Content Ideas Tab */}
      <TabPanel value={activeTab} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Content Ideas ({dataflow.content_ideas.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
          >
            Add Idea
          </Button>
        </Box>

        {dataflow.content_ideas.length === 0 ? (
          <Alert severity="info">
            No content ideas generated yet. Click "Add Idea" to get started.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {dataflow.content_ideas.map((idea: any) => (
              <Grid item xs={12} sm={6} md={4} key={idea.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                      {idea.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {idea.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={idea.content_type}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={idea.idea_type}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={idea.status}
                        color={getStatusColor(idea.status) as any}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      Primary Keyword: {idea.primary_keyword}
                    </Typography>
                    {idea.estimated_read_time && (
                      <Typography variant="body2" color="text.secondary">
                        Read Time: {idea.estimated_read_time} min
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View
                    </Button>
                    <Button size="small" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Subtopic Details Dialog */}
      <Dialog
        open={showSubtopicDialog}
        onClose={() => setShowSubtopicDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedSubtopic?.name}
        </DialogTitle>
        <DialogContent>
          {selectedSubtopic && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedSubtopic.description}
              </Typography>
              
              {/* Show related trend analyses */}
              <Typography variant="h6" sx={{ mb: 1 }}>
                Related Trend Analyses
              </Typography>
              {dataflow.trend_analyses
                .filter((analysis: any) => analysis.subtopic_name === selectedSubtopic.name)
                .map((analysis: any) => (
                  <Card key={analysis.id} sx={{ mb: 1 }}>
                    <CardContent>
                      <Typography variant="subtitle1">
                        {analysis.analysis_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: {analysis.status} | Keywords: {analysis.keywords.join(', ')}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubtopicDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataflowViewer;
