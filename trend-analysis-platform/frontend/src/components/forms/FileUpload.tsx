/**
 * File Upload Component with CSV Validation
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Description as FileIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

// Types
export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  multiple?: boolean;
  disabled?: boolean;
  validateCSV?: boolean;
  requiredColumns?: string[];
  className?: string;
}

export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data: any[];
  columns: string[];
  rowCount: number;
}

// CSV validation function
const validateCSV = (file: File, requiredColumns?: string[]): Promise<CSVValidationResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        resolve({
          isValid: false,
          errors: ['File is empty'],
          warnings: [],
          data: [],
          columns: [],
          rowCount: 0,
        });
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });
      
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Check required columns
      if (requiredColumns) {
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        if (missingColumns.length > 0) {
          errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
        }
      }
      
      // Check for empty rows
      const emptyRows = data.filter(row => Object.values(row).every(val => !val));
      if (emptyRows.length > 0) {
        warnings.push(`${emptyRows.length} empty rows found`);
      }
      
      // Check for inconsistent column counts
      const expectedColumns = headers.length;
      const inconsistentRows = lines.slice(1).filter(line => {
        const values = line.split(',');
        return values.length !== expectedColumns;
      });
      
      if (inconsistentRows.length > 0) {
        errors.push(`${inconsistentRows.length} rows have inconsistent column counts`);
      }
      
      resolve({
        isValid: errors.length === 0,
        errors,
        warnings,
        data,
        columns: headers,
        rowCount: data.length,
      });
    };
    
    reader.onerror = () => {
      resolve({
        isValid: false,
        errors: ['Failed to read file'],
        warnings: [],
        data: [],
        columns: [],
        rowCount: 0,
      });
    };
    
    reader.readAsText(file);
  });
};

// File size formatter
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// File Upload Component
export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  acceptedTypes = ['.csv', '.txt'],
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = false,
  disabled = false,
  validateCSV = true,
  requiredColumns,
  className,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<CSVValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setSelectedFile(file);
    setIsValidating(true);
    
    try {
      if (validateCSV && file.name.toLowerCase().endsWith('.csv')) {
        const result = await validateCSV(file, requiredColumns);
        setValidationResult(result);
        
        if (result.isValid) {
          onFileSelect(file);
        }
      } else {
        onFileSelect(file);
      }
    } catch (error) {
      console.error('File validation error:', error);
      setValidationResult({
        isValid: false,
        errors: ['File validation failed'],
        warnings: [],
        data: [],
        columns: [],
        rowCount: 0,
      });
    } finally {
      setIsValidating(false);
    }
  }, [onFileSelect, validateCSV, requiredColumns]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple,
    disabled,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationResult(null);
    onFileRemove();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box className={className}>
      {/* Drop zone */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: '2px dashed',
          borderColor: isDragActive || dragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive || dragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: disabled ? 'grey.300' : 'primary.main',
            backgroundColor: disabled ? 'background.paper' : 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <UploadIcon
          sx={{
            fontSize: 48,
            color: isDragActive || dragActive ? 'primary.main' : 'grey.400',
            mb: 2,
          }}
        />
        
        <Typography variant="h6" gutterBottom>
          {isDragActive || dragActive ? 'Drop files here' : 'Drag & drop files here'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          or{' '}
          <Button
            variant="text"
            onClick={handleClick}
            disabled={disabled}
            sx={{ textTransform: 'none' }}
          >
            browse files
          </Button>
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Accepted formats: {acceptedTypes.join(', ')}
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            Max size: {formatFileSize(maxSize)}
          </Typography>
        </Box>
      </Paper>

      {/* Selected file info */}
      {selectedFile && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" flex={1}>
              <FileIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Box flex={1}>
                <Typography variant="body1" noWrap>
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              {validationResult && (
                <Tooltip title={validationResult.isValid ? 'Valid file' : 'Invalid file'}>
                  {validationResult.isValid ? (
                    <CheckIcon color="success" />
                  ) : (
                    <ErrorIcon color="error" />
                  )}
                </Tooltip>
              )}
              
              <IconButton
                size="small"
                onClick={handleRemoveFile}
                disabled={disabled}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Validation progress */}
          {isValidating && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Validating file...
              </Typography>
              <LinearProgress sx={{ mt: 1 }} />
            </Box>
          )}

          {/* Validation results */}
          {validationResult && !isValidating && (
            <Box sx={{ mt: 2 }}>
              {/* Errors */}
              {validationResult.errors.length > 0 && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Validation Errors:
                  </Typography>
                  {validationResult.errors.map((error, index) => (
                    <Typography key={index} variant="body2">
                      • {error}
                    </Typography>
                  ))}
                </Alert>
              )}

              {/* Warnings */}
              {validationResult.warnings.length > 0 && (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Warnings:
                  </Typography>
                  {validationResult.warnings.map((warning, index) => (
                    <Typography key={index} variant="body2">
                      • {warning}
                    </Typography>
                  ))}
                </Alert>
              )}

              {/* Success info */}
              {validationResult.isValid && (
                <Alert severity="success" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    File is valid!
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip
                      label={`${validationResult.rowCount} rows`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`${validationResult.columns.length} columns`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Alert>
              )}

              {/* Column info */}
              {validationResult.columns.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Columns: {validationResult.columns.join(', ')}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default FileUpload;
