/**
 * Dashboard Page Component
 * Main dashboard showing overview of user's research, trends, and content
 */

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  ContentCopy,
  Code,
  CalendarToday,
  Assessment,
  Refresh,
  Add,
  Visibility,
} from '@mui/icons-material';
import { useAffiliate } from '../hooks/useAffiliate';
import { useTrends } from '../hooks/useTrends';
import { useContent } from '../hooks/useContent';
import { useSoftware } from '../hooks/useSoftware';
import { useCalendar } from '../hooks/useCalendar';
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
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const Dashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  const { useAffiliateResearchesList } = useAffiliate();
  const { useTrendAnalysesList } = useTrends();
  const { useContentIdeasList } = useContent();
  const { useSoftwareSolutionsList } = useSoftware();
  const { useCalendarEntries, useUpcomingReminders } = useCalendar();

  // Fetch data
  const { data: researchesData, isLoading: researchesLoading } = useAffiliateResearchesList({ skip: 0, limit: 5 });
  const { data: trendsData, isLoading: trendsLoading } = useTrendAnalysesList({ skip: 0, limit: 5 });
  const { data: contentData, isLoading: contentLoading } = useContentIdeasList({ skip: 0, limit: 5 });
  const { data: softwareData, isLoading: softwareLoading } = useSoftwareSolutionsList({ skip: 0, limit: 5 });
  const { data: calendarData, isLoading: calendarLoading } = useCalendarEntries({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const { data: remindersData, isLoading: remindersLoading } = useUpcomingReminders(24);

  const researches = researchesData?.data?.researches || [];
  const trends = trendsData?.data?.analyses || [];
  const contentIdeas = contentData?.data?.content_ideas || [];
  const softwareSolutions = softwareData?.data?.software_solutions || [];
  const calendarEntries = calendarData?.data?.entries || [];
  const reminders = remindersData?.data || [];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const isLoading = researchesLoading || trendsLoading || contentLoading || softwareLoading || calendarLoading;

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." fullHeight />;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {/* Navigate to new research */}}
        >
          Start New Research
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
                    Affiliate Researches
                  </Typography>
                  <Typography variant="h4">
                    {researches.length}
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
                    Trend Analyses
                  </Typography>
                  <Typography variant="h4">
                    {trends.length}
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
                    Content Ideas
                  </Typography>
                  <Typography variant="h4">
                    {contentIdeas.length}
                  </Typography>
                </Box>
                <ContentCopy color="info" sx={{ fontSize: 40 }} />
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
                    Software Solutions
                  </Typography>
                  <Typography variant="h4">
                    {softwareSolutions.length}
                  </Typography>
                </Box>
                <Code color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upcoming Reminders */}
      {reminders.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Upcoming Reminders ({reminders.length})
          </Typography>
          {reminders.slice(0, 3).map((reminder: any) => (
            <Typography key={reminder.id} variant="body2">
              • {reminder.title} - {new Date(reminder.scheduled_date).toLocaleDateString()}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="Recent Activity" />
          <Tab label="Trend Analysis" />
          <Tab label="Content Ideas" />
          <Tab label="Software Solutions" />
          <Tab label="Calendar" />
        </Tabs>

        {/* Recent Activity Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Recent Affiliate Researches
              </Typography>
              {researches.length === 0 ? (
                <Typography color="text.secondary">No recent researches</Typography>
              ) : (
                researches.map((research: any) => (
                  <Card key={research.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            {research.niche}
                          </Typography>
                          <StatusChip status={research.status} />
                        </Box>
                        <Button size="small" startIcon={<Visibility />}>
                          View
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Recent Trend Analyses
              </Typography>
              {trends.length === 0 ? (
                <Typography color="text.secondary">No recent analyses</Typography>
              ) : (
                trends.map((trend: any) => (
                  <Card key={trend.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            {trend.keyword}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={2}>
                            <StatusChip status={trend.status} />
                            <ScoreIndicator
                              score={trend.opportunity_score}
                              maxScore={100}
                              size="small"
                            />
                          </Box>
                        </Box>
                        <Button size="small" startIcon={<Visibility />}>
                          View
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Trend Analysis Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Trend Analysis Overview
          </Typography>
          {trends.length === 0 ? (
            <Typography color="text.secondary">No trend analyses available</Typography>
          ) : (
            <Grid container spacing={2}>
              {trends.map((trend: any) => (
                <Grid item xs={12} sm={6} md={4} key={trend.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {trend.keyword}
                      </Typography>
                      <Box mb={2}>
                        <ScoreIndicator
                          score={trend.opportunity_score}
                          maxScore={100}
                          label="Opportunity Score"
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <StatusChip status={trend.status} />
                        <Button size="small" startIcon={<Visibility />}>
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Content Ideas Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Content Ideas Overview
          </Typography>
          {contentIdeas.length === 0 ? (
            <Typography color="text.secondary">No content ideas available</Typography>
          ) : (
            <Grid container spacing={2}>
              {contentIdeas.map((idea: any) => (
                <Grid item xs={12} sm={6} md={4} key={idea.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {idea.title}
                      </Typography>
                      <Box mb={2}>
                        <ScoreIndicator
                          score={idea.opportunity_score}
                          maxScore={100}
                          label="Opportunity Score"
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <StatusChip status={idea.status} />
                        <Button size="small" startIcon={<Visibility />}>
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Software Solutions Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Software Solutions Overview
          </Typography>
          {softwareSolutions.length === 0 ? (
            <Typography color="text.secondary">No software solutions available</Typography>
          ) : (
            <Grid container spacing={2}>
              {softwareSolutions.map((solution: any) => (
                <Grid item xs={12} sm={6} md={4} key={solution.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {solution.name}
                      </Typography>
                      <Box mb={2}>
                        <ScoreIndicator
                          score={solution.complexity_score}
                          maxScore={10}
                          label="Complexity"
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <StatusChip status={solution.development_status} />
                        <Button size="small" startIcon={<Visibility />}>
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Calendar Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Upcoming Calendar Events
          </Typography>
          {calendarEntries.length === 0 ? (
            <Typography color="text.secondary">No upcoming events</Typography>
          ) : (
            <Grid container spacing={2}>
              {calendarEntries.map((entry: any) => (
                <Grid item xs={12} sm={6} md={4} key={entry.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {entry.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {new Date(entry.scheduled_date).toLocaleDateString()}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <StatusChip status={entry.status} />
                        <Button size="small" startIcon={<Visibility />}>
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};
