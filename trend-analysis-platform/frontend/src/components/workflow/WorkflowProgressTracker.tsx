/**
 * Workflow Progress Tracker Component
 * Visual progress indicator for the enhanced workflow
 */

import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Paper,
} from '@mui/material';
import { WorkflowProgressTrackerProps } from '../../types/workflow';

const WorkflowProgressTracker: React.FC<WorkflowProgressTrackerProps> = ({
  currentStep,
  completedSteps,
  totalSteps,
}) => {
  const progressPercentage = (completedSteps.length / totalSteps) * 100;

  return (
    <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Workflow Progress
        </Typography>
        <Chip
          label={`${completedSteps.length}/${totalSteps} steps completed`}
          color="primary"
          variant="outlined"
        />
      </Box>
      
      <LinearProgress
        variant="determinate"
        value={progressPercentage}
        sx={{
          height: 8,
          borderRadius: 4,
          mb: 2,
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
          },
        }}
      />
      
      <Typography variant="body2" color="text.secondary">
        Current Step: <strong>{currentStep.replace('_', ' ').toUpperCase()}</strong>
      </Typography>
    </Paper>
  );
};

export default WorkflowProgressTracker;
