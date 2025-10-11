/**
 * Keyword Upload Component
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { CloudUpload, CheckCircle, Error as ErrorIcon, Description } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useKeywords } from '../../hooks/useKeywords';

interface KeywordUploadProps {
  onUploadComplete?: (keywordDataId: string) => void;
}

export const KeywordUpload: React.FC<KeywordUploadProps> = ({ onUploadComplete }) => {
  const { uploadKeywords, isUploadingKeywords, uploadKeywordsError } = useKeywords();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<any>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadKeywords(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setUploadStatus('success');
        setUploadResult(result.data);
        if (onUploadComplete) {
          onUploadComplete(result.data.keyword_data_id);
        }
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      setUploadStatus('error');
      console.error('Upload failed:', error);
    }
  }, [uploadKeywords, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
    disabled: isUploadingKeywords || uploadStatus === 'uploading',
  });

  const resetUpload = () => {
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadResult(null);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Upload Keywords
        </Typography>

        {uploadKeywordsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {uploadKeywordsError.message || 'Upload failed'}
          </Alert>
        )}

        {uploadStatus === 'idle' && (
          <Paper
            {...getRootProps()}
            sx={{
              p: 4,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop the file here' : 'Drag & drop a CSV file here'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or click to select a file
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supports CSV, XLS, and XLSX files
            </Typography>
          </Paper>
        )}

        {uploadStatus === 'uploading' && (
          <Box>
            <Box display="flex" alignItems="center" mb={2}>
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography variant="body1">
                Uploading and processing keywords...
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {uploadProgress}% complete
            </Typography>
          </Box>
        )}

        {uploadStatus === 'success' && uploadResult && (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center">
                <CheckCircle sx={{ mr: 1 }} />
                Keywords uploaded successfully!
              </Box>
            </Alert>

            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Upload Summary
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText
                    primary="Keywords Processed"
                    secondary={uploadResult.keywords_processed}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ErrorIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Keywords Skipped"
                    secondary={uploadResult.keywords_skipped}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle />
                  </ListItemIcon>
                  <ListItemText
                    primary="Processing Time"
                    secondary={`${uploadResult.processing_time}s`}
                  />
                </ListItem>
              </List>
            </Paper>

            <Box display="flex" gap={1}>
              <Button variant="contained" onClick={resetUpload}>
                Upload Another File
              </Button>
              <Button variant="outlined" onClick={() => onUploadComplete?.(uploadResult.keyword_data_id)}>
                View Keywords
              </Button>
            </Box>
          </Box>
        )}

        {uploadStatus === 'error' && (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center">
                <ErrorIcon sx={{ mr: 1 }} />
                Upload failed. Please try again.
              </Box>
            </Alert>
            <Button variant="contained" onClick={resetUpload}>
              Try Again
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Expected CSV Format
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            Your CSV file should contain the following columns:
            <List dense>
              <ListItem>
                <ListItemText
                  primary="keyword"
                  secondary="The keyword phrase"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="search_volume"
                  secondary="Monthly search volume (optional)"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="competition"
                  secondary="Competition level: low, medium, high (optional)"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="cpc"
                  secondary="Cost per click (optional)"
                />
              </ListItem>
            </List>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
