import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  IconButton,
  Chip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileUpload: (_file: File) => Promise<void>;
  onFileDelete?: () => void;
  maxSize?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
}

interface UploadStatus {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress?: number;
  message?: string;
  fileId?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  onFileDelete,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['.tsv', '.csv'],
  disabled = false
}) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: 'idle' });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadedFile(file);

    // Validate file size
    if (file.size > maxSize) {
      setUploadStatus({
        status: 'error',
        message: `File size exceeds maximum allowed size (${Math.round(maxSize / 1024 / 1024)}MB)`
      });
      return;
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      setUploadStatus({
        status: 'error',
        message: `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`
      });
      return;
    }

    setUploadStatus({ status: 'uploading', progress: 0 });

    try {
      await onFileUpload(file);
      setUploadStatus({
        status: 'success',
        message: 'File uploaded successfully'
      });
    } catch (error) {
      setUploadStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Upload failed'
      });
    }
  }, [onFileUpload, maxSize, acceptedTypes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/tab-separated-values': ['.tsv'],
      'text/csv': ['.csv']
    },
    multiple: false,
    disabled
  });

  const handleDelete = () => {
    setUploadedFile(null);
    setUploadStatus({ status: 'idle' });
    onFileDelete?.();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = () => {
    switch (uploadStatus.status) {
      case 'success':
        return <CheckIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <UploadIcon />;
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus.status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'primary';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: disabled ? 'grey.300' : 'primary.main',
            backgroundColor: disabled ? 'transparent' : 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          {getStatusIcon()}
          <Typography variant="h6" color={getStatusColor()}>
            {isDragActive
              ? 'Drop the file here...'
              : uploadStatus.status === 'success'
              ? 'File uploaded successfully!'
              : 'Drag & drop your Ahrefs export file here'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to select a file
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {acceptedTypes.map((type) => (
              <Chip key={type} label={type} size="small" variant="outlined" />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary">
            Maximum file size: {formatFileSize(maxSize)}
          </Typography>
        </Box>
      </Paper>

      {uploadedFile && (
        <Box sx={{ mt: 2 }}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'background.paper'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {getStatusIcon()}
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {uploadedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(uploadedFile.size)}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleDelete} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          </Paper>
        </Box>
      )}

      {uploadStatus.status === 'uploading' && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant={uploadStatus.progress ? 'determinate' : 'indeterminate'}
            value={uploadStatus.progress}
            sx={{ mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary" align="center">
            Uploading file...
          </Typography>
        </Box>
      )}

      {uploadStatus.message && (
        <Box sx={{ mt: 2 }}>
          <Alert
            severity={uploadStatus.status === 'error' ? 'error' : 'success'}
            onClose={uploadStatus.status === 'error' ? () => setUploadStatus({ status: 'idle' }) : undefined}
          >
            {uploadStatus.message}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;