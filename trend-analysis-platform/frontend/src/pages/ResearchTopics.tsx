/**
 * Research Topics page component
 * Main page for managing research topics and their complete dataflow
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useResearchTopics, useCreateResearchTopic, useDeleteResearchTopic, useArchiveResearchTopic, useRestoreResearchTopic } from '../hooks/useResearchTopics';
import { ResearchTopic, ResearchTopicStatus, ResearchTopicFormData } from '../types/researchTopics';
import ResearchTopicForm from '../components/researchTopics/ResearchTopicForm';
import ResearchTopicCard from '../components/researchTopics/ResearchTopicCard';
import ResearchTopicStats from '../components/researchTopics/ResearchTopicStats';
import DataflowViewer from '../components/researchTopics/DataflowViewer';

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
      id={`research-topics-tabpanel-${index}`}
      aria-labelledby={`research-topics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ResearchTopicsProps {
  onNavigateToAffiliateResearch?: (topicId: string) => void;
}

const ResearchTopics: React.FC<ResearchTopicsProps> = ({ onNavigateToAffiliateResearch }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ResearchTopicStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'title'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState<ResearchTopic | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDataflowDialog, setShowDataflowDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [actionTopic, setActionTopic] = useState<ResearchTopic | null>(null);

  // API hooks
  const { data: topicsData, isLoading, error, refetch } = useResearchTopics({
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    size: 12,
    order_by: sortBy,
    order_direction: sortDirection
  });


  const createMutation = useCreateResearchTopic();
  const deleteMutation = useDeleteResearchTopic();
  const archiveMutation = useArchiveResearchTopic();
  const restoreMutation = useRestoreResearchTopic();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real implementation, you would trigger search here
  };

  const handleFilterChange = (status: ResearchTopicStatus | 'all') => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSortChange = (field: 'created_at' | 'updated_at' | 'title') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const handleCreateTopic = async (data: ResearchTopicFormData) => {
    try {
      // Add user_id to the data
      const topicData = {
        ...data,
        user_id: '123e4567-e89b-12d3-a456-426614174000' // Default user ID for now
      };
      await createMutation.mutateAsync(topicData);
      setShowCreateDialog(false);
      refetch();
    } catch (error) {
      console.error('Error creating research topic:', error);
    }
  };

  const handleDeleteTopic = async (topic: ResearchTopic) => {
    if (window.confirm(`Are you sure you want to delete? Type DELETE "${topic.title}"?`)) {
      try {
        await deleteMutation.mutateAsync(topic.id);
        refetch();
      } catch (error) {
        console.error('Error deleting research topic:', error);
      }
    }
  };

  const handleArchiveTopic = async (topic: ResearchTopic) => {
    try {
      await archiveMutation.mutateAsync(topic.id);
      refetch();
    } catch (error) {
      console.error('Error archiving research topic:', error);
    }
  };

  const handleRestoreTopic = async (topic: ResearchTopic) => {
    try {
      await restoreMutation.mutateAsync(topic.id);
      refetch();
    } catch (error) {
      console.error('Error restoring research topic:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, topic: ResearchTopic) => {
    setAnchorEl(event.currentTarget);
    setActionTopic(topic);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActionTopic(null);
  };

  const handleViewDataflow = (topic: ResearchTopic) => {
    setSelectedTopic(topic);
    setShowDataflowDialog(true);
    handleMenuClose();
  };

  const handleEditTopic = (topic: ResearchTopic) => {
    // In a real implementation, you would open an edit dialog
    console.log('Edit topic:', topic);
    handleMenuClose();
  };

  const handleNavigateToAffiliateResearch = (topic: ResearchTopic) => {
    if (onNavigateToAffiliateResearch) {
      onNavigateToAffiliateResearch(topic.id);
    }
  };

  const getStatusColor = (status: ResearchTopicStatus) => {
    switch (status) {
      case ResearchTopicStatus.ACTIVE:
        return 'success';
      case ResearchTopicStatus.COMPLETED:
        return 'primary';
      case ResearchTopicStatus.ARCHIVED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: ResearchTopicStatus) => {
    switch (status) {
      case ResearchTopicStatus.ACTIVE:
        return <TimelineIcon />;
      case ResearchTopicStatus.COMPLETED:
        return <TrendingUpIcon />;
      case ResearchTopicStatus.ARCHIVED:
        return <ArchiveIcon />;
      default:
        return null;
    }
  };

  // Use real data from Supabase
  const displayData = topicsData;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Research Topics
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
          sx={{ ml: 2 }}
        >
          New Research Topic
        </Button>
      </Box>

      {/* Error handling */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Error:</strong> {error.message}
          </Typography>
          {error.message.includes('404') || error.message.includes('Not Found') ? (
            <Typography variant="body2" sx={{ mt: 1 }}>
              The affiliate_research table doesn't exist in your Supabase database. 
              Please check your database setup or create the table.
            </Typography>
          ) : null}
        </Alert>
      )}

      {/* Empty state when no data */}
      {!isLoading && !error && displayData?.items?.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>No research topics found.</strong> Create your first research topic to get started!
          </Typography>
        </Alert>
      )}

      {/* Stats Overview */}
      <ResearchTopicStats />

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          placeholder="Search research topics..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 300 }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => handleFilterChange(e.target.value as ResearchTopicStatus | 'all')}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value={ResearchTopicStatus.ACTIVE}>Active</MenuItem>
            <MenuItem value={ResearchTopicStatus.COMPLETED}>Completed</MenuItem>
            <MenuItem value={ResearchTopicStatus.ARCHIVED}>Archived</MenuItem>
          </Select>
        </FormControl>
        <Button
          startIcon={<FilterIcon />}
          onClick={() => handleSortChange('created_at')}
          color={sortBy === 'created_at' ? 'primary' : 'inherit'}
        >
          Sort by Date
        </Button>
        <Button
          startIcon={<FilterIcon />}
          onClick={() => handleSortChange('title')}
          color={sortBy === 'title' ? 'primary' : 'inherit'}
        >
          Sort by Title
        </Button>
        <IconButton onClick={() => refetch()}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="All Topics" />
          <Tab label="Active" />
          <Tab label="Completed" />
          <Tab label="Archived" />
        </Tabs>
      </Box>

      {/* Content */}
      <TabPanel value={activeTab} index={0}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {displayData?.items.map((topic) => (
              <Grid item xs={12} sm={6} md={4} key={topic.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2" sx={{ flexGrow: 1, mr: 1 }}>
                        {topic.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, topic)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {topic.description || 'No description provided'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        icon={getStatusIcon(topic.status)}
                        label={topic.status}
                        color={getStatusColor(topic.status) as any}
                        size="small"
                      />
                      <Chip
                        label={`v${topic.version}`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(topic.created_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewDataflow(topic)}
                    >
                      View Dataflow
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditTopic(topic)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => handleNavigateToAffiliateResearch(topic)}
                      sx={{ ml: 'auto' }}
                    >
                      Next →
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => actionTopic && handleViewDataflow(actionTopic)}>
          <ViewIcon sx={{ mr: 1 }} />
          View Dataflow
        </MenuItem>
        <MenuItem onClick={() => actionTopic && handleEditTopic(actionTopic)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        {actionTopic?.status === ResearchTopicStatus.ARCHIVED ? (
          <MenuItem onClick={() => actionTopic && handleRestoreTopic(actionTopic)}>
            <RestoreIcon sx={{ mr: 1 }} />
            Restore
          </MenuItem>
        ) : (
          <MenuItem onClick={() => actionTopic && handleArchiveTopic(actionTopic)}>
            <ArchiveIcon sx={{ mr: 1 }} />
            Archive
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => actionTopic && handleDeleteTopic(actionTopic)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Research Topic</DialogTitle>
        <DialogContent>
          <ResearchTopicForm
            onSubmit={handleCreateTopic}
            onCancel={() => setShowCreateDialog(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Dataflow Dialog */}
      <Dialog
        open={showDataflowDialog}
        onClose={() => setShowDataflowDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Dataflow: {selectedTopic?.title}
        </DialogTitle>
        <DialogContent>
          {selectedTopic && (
            <DataflowViewer topicId={selectedTopic.id} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDataflowDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResearchTopics;
