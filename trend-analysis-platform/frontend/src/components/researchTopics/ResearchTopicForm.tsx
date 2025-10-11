/**
 * Research Topic Form component
 * Form for creating and editing research topics
 */

import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { useResearchTopicForm } from '../../hooks/useResearchTopics';
import { ResearchTopicFormData, ResearchTopicStatus } from '../../types/researchTopics';

interface ResearchTopicFormProps {
  initialData?: Partial<ResearchTopicFormData>;
  onSubmit: (data: ResearchTopicFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

const ResearchTopicForm: React.FC<ResearchTopicFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create'
}) => {
  const {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
    isValid
  } = useResearchTopicForm(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Research Topic Title"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title || 'Enter a descriptive title for your research topic'}
            required
            disabled={isLoading}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description || 'Provide a detailed description of what you want to research'}
            multiline
            rows={4}
            disabled={isLoading}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) => updateField('status', e.target.value as ResearchTopicStatus)}
              disabled={isLoading}
            >
              <MenuItem value={ResearchTopicStatus.ACTIVE}>Active</MenuItem>
              <MenuItem value={ResearchTopicStatus.COMPLETED}>Completed</MenuItem>
              <MenuItem value={ResearchTopicStatus.ARCHIVED}>Archived</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Please fix the errors below before submitting.
            </Alert>
          )}
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!isValid || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Topic' : 'Update Topic'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResearchTopicForm;
