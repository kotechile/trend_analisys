/**
 * Research Topic Stats component
 * Displays statistics and overview of research topics
 */

import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Archive as ArchiveIcon,
  Analytics as AnalyticsIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useResearchTopicsStats } from '../../hooks/useResearchTopics';
import { ResearchTopicStats as StatsType } from '../../types/researchTopics';

const ResearchTopicStats: React.FC = () => {
  const { data: stats, isLoading, error } = useResearchTopicsStats();

  if (isLoading) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Statistics
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <AnalyticsIcon />
                    </Avatar>
                    <Typography variant="h6">-</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Loading...
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Statistics
        </Typography>
        <Typography color="error">
          Failed to load statistics
        </Typography>
      </Box>
    );
  }

  const completionRate = stats.total_topics > 0 
    ? Math.round((stats.completed_topics / stats.total_topics) * 100)
    : 0;

  const activityRate = stats.total_topics > 0
    ? Math.round((stats.active_topics / stats.total_topics) * 100)
    : 0;

  const statsCards = [
    {
      title: 'Total Topics',
      value: stats.total_topics,
      icon: <AnalyticsIcon />,
      color: 'primary.main',
      description: 'All research topics'
    },
    {
      title: 'Active Topics',
      value: stats.active_topics,
      icon: <TimelineIcon />,
      color: 'success.main',
      description: 'Currently in progress'
    },
    {
      title: 'Completed',
      value: stats.completed_topics,
      icon: <CheckCircleIcon />,
      color: 'info.main',
      description: 'Successfully finished'
    },
    {
      title: 'Archived',
      value: stats.archived_topics,
      icon: <ArchiveIcon />,
      color: 'grey.500',
      description: 'Archived topics'
    }
  ];

  const dataflowStats = [
    {
      title: 'Subtopics',
      value: stats.total_subtopics,
      icon: <TrendingUpIcon />,
      color: 'secondary.main',
      description: 'Total subtopics created'
    },
    {
      title: 'Trend Analyses',
      value: stats.total_analyses,
      icon: <AnalyticsIcon />,
      color: 'warning.main',
      description: 'Analyses completed'
    },
    {
      title: 'Content Ideas',
      value: stats.total_content_ideas,
      icon: <LightbulbIcon />,
      color: 'success.main',
      description: 'Ideas generated'
    }
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Research Topics Overview
      </Typography>
      
      {/* Main Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ mr: 2, bgcolor: stat.color }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h4" component="div">
                    {stat.value}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {stat.description}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Progress Indicators */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Completion Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" sx={{ mr: 2 }}>
                  {completionRate}%
                </Typography>
                <Chip
                  label={completionRate >= 50 ? 'Good' : completionRate >= 25 ? 'Fair' : 'Needs Improvement'}
                  color={completionRate >= 50 ? 'success' : completionRate >= 25 ? 'warning' : 'error'}
                  size="small"
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                color={completionRate >= 50 ? 'success' : completionRate >= 25 ? 'warning' : 'error'}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {stats.completed_topics} of {stats.total_topics} topics completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Activity Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" sx={{ mr: 2 }}>
                  {activityRate}%
                </Typography>
                <Chip
                  label={activityRate >= 50 ? 'High' : activityRate >= 25 ? 'Medium' : 'Low'}
                  color={activityRate >= 50 ? 'success' : activityRate >= 25 ? 'warning' : 'error'}
                  size="small"
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={activityRate}
                color={activityRate >= 50 ? 'success' : activityRate >= 25 ? 'warning' : 'error'}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {stats.active_topics} of {stats.total_topics} topics are active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dataflow Stats */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Dataflow Statistics
          </Typography>
          <Grid container spacing={2}>
            {dataflowStats.map((stat, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: stat.color }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Last Activity */}
      {stats.last_activity && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Last activity: {new Date(stats.last_activity).toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ResearchTopicStats;
