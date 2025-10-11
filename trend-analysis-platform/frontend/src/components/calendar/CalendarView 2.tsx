/**
 * Calendar View Component
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CalendarToday,
  Add,
  Edit,
  Delete,
  ContentCopy,
  Code,
  Schedule,
  CheckCircle,
  Pending,
  PlayArrow,
} from '@mui/icons-material';
import { useCalendar } from '../../hooks/useCalendar';

interface CalendarViewProps {
  startDate: string;
  endDate: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ startDate, endDate }) => {
  const { 
    useCalendarEntries, 
    useUpcomingReminders,
    scheduleContent: _scheduleContent,
    scheduleSoftwareDevelopment: _scheduleSoftwareDevelopment,
    updateCalendarEntry: _updateCalendarEntry,
    deleteCalendarEntry,
    isSchedulingContent: _isSchedulingContent,
    isSchedulingSoftwareDevelopment: _isSchedulingSoftwareDevelopment,
    isUpdatingCalendarEntry: _isUpdatingCalendarEntry,
    isDeletingCalendarEntry,
  } = useCalendar();

  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const { data: entriesData, isLoading, error } = useCalendarEntries({
    start_date: startDate,
    end_date: endDate,
  });

  const { data: remindersData } = useUpcomingReminders(24);

  const entries = entriesData?.data?.entries || [];
  const reminders = remindersData?.data || [];

  // const handleScheduleContent = async (contentId: string, scheduledDate: string) => {
  //   try {
  //     await scheduleContent({
  //       content_id: contentId,
  //       scheduled_date: scheduledDate,
  //       content_type: 'content',
  //     });
  //   } catch (error) {
  //     console.error('Failed to schedule content:', error);
  //   }
  // };

  // const handleScheduleSoftware = async (softwareSolutionId: string, plannedStartDate: string, estimatedCompletionDate: string) => {
  //   try {
  //     await scheduleSoftwareDevelopment(softwareSolutionId, plannedStartDate, estimatedCompletionDate);
  //   } catch (error) {
  //     console.error('Failed to schedule software development:', error);
  //   }
  // };

  const handleEditEntry = (entry: any) => {
    setSelectedEntry(entry);
    setEditDialogOpen(true);
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteCalendarEntry(entryId);
    } catch (error) {
      console.error('Failed to delete calendar entry:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'missed': return 'error';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return <Schedule />;
      case 'in_progress': return <PlayArrow />;
      case 'completed': return <CheckCircle />;
      case 'missed': return <Delete />;
      case 'archived': return <Pending />;
      default: return <Schedule />;
    }
  };

  const getItemTypeIcon = (itemType: string) => {
    switch (itemType.toLowerCase()) {
      case 'content': return <ContentCopy />;
      case 'software': return <Code />;
      default: return <CalendarToday />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
        {error.message || 'Failed to load calendar entries'}
      </Alert>
    );
  }

  // Group entries by date
  const groupedEntries = entries.reduce((acc: any, entry: any) => {
    const date = new Date(entry.scheduled_date).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <Box>
      {/* Upcoming Reminders */}
      {reminders.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Upcoming Reminders ({reminders.length})
            </Typography>
            <Grid container spacing={2}>
              {reminders.slice(0, 3).map((reminder: any) => (
                <Grid item xs={12} sm={6} md={4} key={reminder.id}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 1 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        {getItemTypeIcon(reminder.item_type)}
                        <Typography variant="subtitle2" noWrap>
                          {reminder.title}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(reminder.scheduled_date)} at {formatTime(reminder.scheduled_date)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {reminder.hours_until}h remaining
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Calendar Entries */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Calendar Entries ({entries.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setScheduleDialogOpen(true)}
            >
              Schedule Item
            </Button>
          </Box>

          {entries.length === 0 ? (
            <Box textAlign="center" py={4}>
              <CalendarToday sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No calendar entries found for this period.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Schedule content or software development to get started.
              </Typography>
            </Box>
          ) : (
            <Box>
              {sortedDates.map(date => (
                <Box key={date} sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    {formatDate(date)}
                  </Typography>
                  <Grid container spacing={2}>
                    {groupedEntries[date].map((entry: any) => (
                      <Grid item xs={12} sm={6} md={4} key={entry.id}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                              <Box display="flex" alignItems="center" gap={1}>
                                {getItemTypeIcon(entry.item_type)}
                                <Typography variant="subtitle2" noWrap>
                                  {entry.title}
                                </Typography>
                              </Box>
                              <Box display="flex" gap={0.5}>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditEntry(entry)}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    disabled={isDeletingCalendarEntry}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>

                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Chip
                                icon={getStatusIcon(entry.status)}
                                label={entry.status}
                                color={getStatusColor(entry.status) as any}
                                size="small"
                              />
                              <Typography variant="caption" color="text.secondary">
                                {formatTime(entry.scheduled_date)}
                              </Typography>
                            </Box>

                            {entry.content && (
                              <Box mb={1}>
                                <Typography variant="caption" color="text.secondary">
                                  Content: {entry.content.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Score: {entry.content.opportunity_score}
                                </Typography>
                              </Box>
                            )}

                            {entry.software && (
                              <Box mb={1}>
                                <Typography variant="caption" color="text.secondary">
                                  Software: {entry.software.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Complexity: {entry.software.complexity_score}/10
                                </Typography>
                              </Box>
                            )}

                            {entry.notes && (
                              <Typography variant="caption" color="text.secondary">
                                {entry.notes}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Calendar Entry</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Scheduled Date"
                type="datetime-local"
                value={selectedEntry?.scheduled_date ? new Date(selectedEntry.scheduled_date).toISOString().slice(0, 16) : ''}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedEntry?.status || ''}
                  label="Status"
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="missed">Missed</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={selectedEntry?.notes || ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule New Item</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose what you'd like to schedule:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={() => {
                  setScheduleDialogOpen(false);
                  // Handle content scheduling
                }}
              >
                Schedule Content
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Code />}
                onClick={() => {
                  setScheduleDialogOpen(false);
                  // Handle software scheduling
                }}
              >
                Schedule Software Development
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
