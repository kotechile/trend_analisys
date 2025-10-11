/**
 * External Tool Integration Step Component
 * Handles integration with external keyword research tools
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import { CloudUpload, ArrowForward, ArrowBack, CheckCircle } from '@mui/icons-material';
import { useExternalToolProcessing } from '../../hooks/useWorkflow';
import { WorkflowStepProps } from '../../types/workflow';

const ExternalToolIntegrationStep: React.FC<WorkflowStepProps> = React.memo(({
  onNext,
  onBack,
  data,
  loading = false,
  error,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toolName, setToolName] = useState<'semrush' | 'ahrefs' | 'ubersuggest'>('semrush');
  const [uploadProgress, setUploadProgress] = useState(0);

  const externalToolMutation = useExternalToolProcessing();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('toolName', toolName);
    formData.append('sessionId', data?.sessionId || 'temp-session');

    // Simulate upload progress
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    externalToolMutation.mutate(formData, {
      onSettled: () => {
        clearInterval(progressInterval);
        setUploadProgress(100);
      },
    });
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CloudUpload sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          🔗 External Tool Integration
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Upload keyword data from external tools to enhance your analysis with real search metrics.
      </Typography>

      {/* Tool Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select External Tool
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 300, mb: 2 }}>
            <InputLabel>Tool</InputLabel>
            <Select
              value={toolName}
              label="Tool"
              onChange={(e) => setToolName(e.target.value as any)}
            >
              <MenuItem value="semrush">Semrush</MenuItem>
              <MenuItem value="ahrefs">Ahrefs</MenuItem>
              <MenuItem value="ubersuggest">Ubersuggest</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a CSV file with keyword data from {toolName}. The file should include columns for:
            keyword, search volume, difficulty, and CPC.
          </Typography>

          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
              disabled={externalToolMutation.isPending}
            >
              Choose CSV File
            </Button>
          </label>
          
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {selectedFile.name}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {externalToolMutation.isPending && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CircularProgress size={20} sx={{ mr: 2 }} />
              <Typography>Processing {selectedFile?.name}...</Typography>
            </Box>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {uploadProgress}% complete
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {(error || externalToolMutation.isError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || externalToolMutation.error?.message || 'Failed to process file. Please try again.'}
        </Alert>
      )}

      {/* Success Display */}
      {externalToolMutation.isSuccess && externalToolMutation.data && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircle sx={{ mr: 2, color: 'success.main' }} />
              <Typography variant="h6">
                Successfully Processed {externalToolMutation.data.processedKeywords} Keywords
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your keyword data has been processed and integrated into the analysis.
            </Typography>

            {externalToolMutation.data.clusters.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Generated Clusters:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {externalToolMutation.data.clusters.map((cluster, index) => (
                    <Chip
                      key={index}
                      label={`${cluster.name} (${cluster.keywords.length} keywords)`}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      {selectedFile && !externalToolMutation.isPending && !externalToolMutation.isSuccess && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={handleUpload}
            startIcon={<CloudUpload />}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Upload and Process File
          </Button>
        </Box>
      )}

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForward />}
          onClick={handleNext}
          disabled={loading}
        >
          View Results
        </Button>
      </Box>
    </Box>
  );
});

ExternalToolIntegrationStep.displayName = 'ExternalToolIntegrationStep';

export default ExternalToolIntegrationStep;