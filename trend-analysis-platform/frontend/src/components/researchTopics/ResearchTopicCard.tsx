/**
 * Research Topic Card component
 * Individual card display for research topics
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Avatar,
  Button,
  Tooltip
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Archive as ArchiveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import { ResearchTopic, ResearchTopicStatus } from '../../types/researchTopics';
import { useDataflowProgress } from '../../hooks/useResearchTopics';

interface ResearchTopicCardProps {
  topic: ResearchTopic;
  onView: (topic: ResearchTopic) => void;
  onEdit: (topic: ResearchTopic) => void;
  onDelete: (topic: ResearchTopic) => void;
  onArchive: (topic: ResearchTopic) => void;
  onRestore: (topic: ResearchTopic) => void;
  showActions?: boolean;
}

const ResearchTopicCard: React.FC<ResearchTopicCardProps> = ({
  topic,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  showActions = true
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { progressPercentage, hasSubtopics, hasTrendAnalyses, hasContentIdeas } = useDataflowProgress(topic.id);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
        return <TimelineIcon />;
    }
  };

  const getProgressColor = () => {
    if (progressPercentage === 100) return 'success';
    if (progressPercentage >= 66) return 'primary';
    if (progressPercentage >= 33) return 'warning';
    return 'error';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ flexGrow: 1, mr: 1, lineHeight: 1.2 }}>
            {topic.title}
          </Typography>
          {showActions && (
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          )}
        </Box>

        {/* Description */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 2, minHeight: '2.5em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {topic.description || 'No description provided'}
        </Typography>

        {/* Status and Version */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
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

        {/* Progress Indicator */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Dataflow Progress
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {progressPercentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            color={getProgressColor() as any}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        {/* Progress Steps */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Tooltip title={hasSubtopics ? 'Subtopics created' : 'No subtopics yet'}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: hasSubtopics ? 'success.main' : 'grey.300',
                fontSize: '0.75rem'
              }}
            >
              S
            </Avatar>
          </Tooltip>
          <Tooltip title={hasTrendAnalyses ? 'Trend analyses completed' : 'No trend analyses yet'}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: hasTrendAnalyses ? 'success.main' : 'grey.300',
                fontSize: '0.75rem'
              }}
            >
              T
            </Avatar>
          </Tooltip>
          <Tooltip title={hasContentIdeas ? 'Content ideas generated' : 'No content ideas yet'}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: hasContentIdeas ? 'success.main' : 'grey.300',
                fontSize: '0.75rem'
              }}
            >
              C
            </Avatar>
          </Tooltip>
        </Box>

        {/* Metadata */}
        <Typography variant="caption" color="text.secondary">
          Created: {new Date(topic.created_at).toLocaleDateString()}
        </Typography>
        {topic.updated_at !== topic.created_at && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Updated: {new Date(topic.updated_at).toLocaleDateString()}
          </Typography>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ pt: 0 }}>
        <Button
          size="small"
          startIcon={<ViewIcon />}
          onClick={() => onView(topic)}
          sx={{ flexGrow: 1 }}
        >
          View Dataflow
        </Button>
        {showActions && (
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit(topic)}
          >
            Edit
          </Button>
        )}
      </CardActions>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onView(topic); handleMenuClose(); }}>
          <ViewIcon sx={{ mr: 1 }} />
          View Dataflow
        </MenuItem>
        <MenuItem onClick={() => { onEdit(topic); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        {topic.status === ResearchTopicStatus.ARCHIVED ? (
          <MenuItem onClick={() => { onRestore(topic); handleMenuClose(); }}>
            <RestoreIcon sx={{ mr: 1 }} />
            Restore
          </MenuItem>
        ) : (
          <MenuItem onClick={() => { onArchive(topic); handleMenuClose(); }}>
            <ArchiveIcon sx={{ mr: 1 }} />
            Archive
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => { onDelete(topic); handleMenuClose(); }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ResearchTopicCard;
