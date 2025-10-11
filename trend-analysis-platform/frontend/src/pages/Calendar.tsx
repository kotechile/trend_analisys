/**
 * Calendar Page Component
 * Content calendar and scheduling management
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Refresh,
  Download,
  Visibility,
  Edit,
  Delete,
  CalendarToday,
  Schedule,
  ContentCopy,
  Code,
} from '@mui/icons-material';
import { useCalendar } from '../hooks/useCalendar';
import { CalendarView } from '../components/calendar';
import { LoadingSpinner, StatusChip } from '../components/common';

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
      id={`calendar-tabpanel-${index}`}
      aria-labelledby={`calendar-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const Calendar: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [newEventDialogOpen, setNewEventDialogOpen] = useState(false);

  const { useCalendarEntries, useUpcomingReminders } = useCalendar();

  // Fetch data
  const { data: entriesData, isLoading, error, refetch } = useCalendarEntries({
    start_date: dateRange.start,
    end_date: dateRange.end,
  });
  const { data: remindersData } = useUpcomingReminders(24);

  const entries = entriesData?.data?.entries || [];
  const reminders = remindersData?.data || [];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading calendar..." fullHeight />;
  }

  if (error) {
    return (
      <Alert severity="error">
        {error.message || 'Failed to load calendar'}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Content Calendar
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setNewEventDialogOpen(true)}
        >
          Schedule Event
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
                    Total Events
                  </Typography>
                  <Typography variant="h4">
                    {entries.length}
                  </Typography>
                </Box>
                <CalendarToday color="primary" sx={{ fontSize: 40 }} />
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
                    Upcoming
                  </Typography>
                  <Typography variant="h4">
                    {entries.filter(e => new Date(e.scheduled_date) > new Date()).length}
                  </Typography>
                </Box>
                <Schedule color="success" sx={{ fontSize: 40 }} />
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
                    Content
                  </Typography>
                  <Typography variant="h4">
                    {entries.filter(e => e.item_type === 'content').length}
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
                    Software
                  </Typography>
                  <Typography variant="h4">
                    {entries.filter(e => e.item_type === 'software').length}
                  </Typography>
                </Box>
                <Code color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Date Range Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
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
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="calendar tabs">
          <Tab label="Calendar View" />
          <Tab label="List View" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Calendar View Tab */}
        <TabPanel value={tabValue} index={0}>
          <CalendarView
            startDate={dateRange.start}
            endDate={dateRange.end}
          />
        </TabPanel>

        {/* List View Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Calendar Events ({entries.length})
          </Typography>
          
          {entries.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No events found for this date range.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setNewEventDialogOpen(true)}
              >
                Schedule First Event
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {entries.map((entry: any) => (
                <Grid item xs={12} sm={6} md={4} key={entry.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        {entry.item_type === 'content' ? <ContentCopy /> : <Code />}
                        <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                          {entry.item_type}
                        </Typography>
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {entry.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {new Date(entry.scheduled_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <StatusChip status={entry.status} />
                        <Box display="flex" gap={0.5}>
                          <Button size="small" startIcon={<Visibility />}>
                            View
                          </Button>
                          <Button size="small" startIcon={<Edit />}>
                            Edit
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Calendar Analytics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Events by Type
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Content</Typography>
                    <Typography variant="body2">
                      {entries.filter(e => e.item_type === 'content').length}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Software</Typography>
                    <Typography variant="body2">
                      {entries.filter(e => e.item_type === 'software').length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Events by Status
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Scheduled</Typography>
                    <Typography variant="body2">
                      {entries.filter(e => e.status === 'scheduled').length}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">In Progress</Typography>
                    <Typography variant="body2">
                      {entries.filter(e => e.status === 'in_progress').length}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Completed</Typography>
                    <Typography variant="body2">
                      {entries.filter(e => e.status === 'completed').length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upcoming Reminders
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {reminders.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Next 24 hours
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* New Event Dialog */}
      <Dialog open={newEventDialogOpen} onClose={() => setNewEventDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule New Event</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select label="Event Type">
                  <MenuItem value="content">Content</MenuItem>
                  <MenuItem value="software">Software Development</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                placeholder="Enter event title"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Scheduled Date"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                placeholder="Add any notes..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewEventDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Schedule Event</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
