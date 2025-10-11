import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  CloudUpload,
  Visibility,
  Edit,
  Speed,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

interface AhrefsKeyword {
  keyword: string;
  search_volume: number;
  keyword_difficulty: number;
  cpc: number;
  traffic_potential: number;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  search_intent: string;
  competition_level: string;
  trend_score: number;
  opportunity_score: number;
  row_number: number;
}

interface IndividualKeywordUploadProps {
  onKeywordsUploaded: (keywords: AhrefsKeyword[], sessionId: string) => void;
  onOptimizationComplete: (optimizedKeywords: any[]) => void;
}

export const IndividualKeywordUpload: React.FC<IndividualKeywordUploadProps> = ({
  onKeywordsUploaded,
  onOptimizationComplete,
}) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedKeywords, setUploadedKeywords] = useState<AhrefsKeyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>('');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedKeywordForEdit, setSelectedKeywordForEdit] = useState<AhrefsKeyword | null>(null);

  const parseAhrefsCSV = (csvText: string): AhrefsKeyword[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw 'CSV file must have at least a header row and one data row';
    }

    const headers = lines[0].split('\t').map(h => h.trim().toLowerCase());
    
    // Map Ahrefs columns to our interface
    const columnMapping = {
      keyword: ['keyword', 'query', 'search term', 'search_term'],
      search_volume: ['search volume', 'search_volume', 'volume', 'monthly searches'],
      keyword_difficulty: ['keyword difficulty', 'keyword_difficulty', 'kd', 'difficulty'],
      cpc: ['cpc', 'cost per click', 'cost_per_click'],
      traffic_potential: ['traffic potential', 'traffic_potential', 'traffic', 'potential traffic'],
      clicks: ['clicks', 'total clicks'],
      impressions: ['impressions', 'total impressions'],
      ctr: ['ctr', 'click-through rate', 'click_through_rate'],
      position: ['position', 'avg position', 'average position', 'avg_position'],
    };

    const findColumnIndex = (targetColumns: string[]): number => {
      for (const target of targetColumns) {
        const index = headers.findIndex(h => h.includes(target));
        if (index !== -1) return index;
      }
      return -1;
    };

    const keywordIndex = findColumnIndex(columnMapping.keyword);
    if (keywordIndex === -1) {
      throw 'Keyword column not found. Please ensure your CSV has a "Keyword" column.';
    }

    const keywords: AhrefsKeyword[] = [];
    
    lines.slice(1).forEach((line, index) => {
      const values = line.split('\t');
      if (values.length < headers.length) return;

      const keyword: AhrefsKeyword = {
        keyword: values[keywordIndex]?.trim() || '',
        search_volume: parseInt(values[findColumnIndex(columnMapping.search_volume)] || '0') || 0,
        keyword_difficulty: parseInt(values[findColumnIndex(columnMapping.keyword_difficulty)] || '0') || 0,
        cpc: parseFloat(values[findColumnIndex(columnMapping.cpc)] || '0') || 0,
        traffic_potential: parseInt(values[findColumnIndex(columnMapping.traffic_potential)] || '0') || 0,
        clicks: parseInt(values[findColumnIndex(columnMapping.clicks)] || '0') || 0,
        impressions: parseInt(values[findColumnIndex(columnMapping.impressions)] || '0') || 0,
        ctr: parseFloat(values[findColumnIndex(columnMapping.ctr)] || '0') || 0,
        position: parseFloat(values[findColumnIndex(columnMapping.position)] || '0') || 0,
        search_intent: 'informational', // Default, will be analyzed by LLM
        competition_level: 'medium', // Default, will be calculated
        trend_score: 0, // Will be calculated
        opportunity_score: 0, // Will be calculated
        row_number: index + 2, // +2 because we skip header and 0-indexed
      };

      if (keyword.keyword) {
        keywords.push(keyword);
      }
    });

    return keywords;
  };

  const calculateMetrics = (keywords: AhrefsKeyword[]): AhrefsKeyword[] => {
    return keywords.map(keyword => {
      // Calculate competition level based on keyword difficulty
      let competition_level = 'low';
      if (keyword.keyword_difficulty >= 70) competition_level = 'high';
      else if (keyword.keyword_difficulty >= 40) competition_level = 'medium';

      // Calculate trend score based on search volume and difficulty
      const trend_score = Math.min(100, Math.max(0, 
        (keyword.search_volume / 1000) * 0.4 + 
        (100 - keyword.keyword_difficulty) * 0.6
      ));

      // Calculate opportunity score based on multiple factors
      const opportunity_score = Math.min(100, Math.max(0,
        (keyword.search_volume / 1000) * 0.3 +
        (100 - keyword.keyword_difficulty) * 0.3 +
        (keyword.cpc * 10) * 0.2 +
        (keyword.ctr * 100) * 0.2
      ));

      return {
        ...keyword,
        competition_level,
        trend_score: Math.round(trend_score * 100) / 100,
        opportunity_score: Math.round(opportunity_score * 100) / 100,
      };
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadStatus('uploading');
    setUploadProgress(0);
    setError('');

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

      const text = await file.text();
      const keywords = parseAhrefsCSV(text);
      const calculatedKeywords = calculateMetrics(keywords);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setUploadedKeywords(calculatedKeywords);
      setUploadStatus('success');

      // Create optimization session
      const session = {
        id: `session_${Date.now()}`,
        name: `Ahrefs Upload - ${file.name}`,
        type: 'ahrefs_upload',
        keywords_processed: calculatedKeywords.length,
        created_at: new Date().toISOString(),
      };

      if (onKeywordsUploaded) {
        onKeywordsUploaded(calculatedKeywords, session.id);
      }

    } catch (error) {
      setUploadStatus('error');
      setError(typeof error === 'string' ? error : 'Upload failed');
      console.error('Upload failed:', error);
    }
  }, [onKeywordsUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/tab-separated-values': ['.tsv'],
    },
    multiple: false,
    disabled: uploadStatus === 'uploading' || uploadStatus === 'processing',
  });

  const handleKeywordSelect = (keyword: string) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    setSelectedKeywords(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedKeywords.size === uploadedKeywords.length) {
      setSelectedKeywords(new Set());
    } else {
      setSelectedKeywords(new Set(uploadedKeywords.map(k => k.keyword)));
    }
  };

  const handleOptimizeSelected = async () => {
    if (selectedKeywords.size === 0) {
      setError('Please select keywords to optimize');
      return;
    }

    setUploadStatus('processing');
    setError('');

    try {
      const selectedKeywordData = uploadedKeywords.filter(k => selectedKeywords.has(k.keyword));
      
      // Here you would call the optimization API
      // For now, we'll simulate the optimization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const optimizedKeywords = selectedKeywordData.map(keyword => ({
        ...keyword,
        is_optimized: true,
        llm_optimized_title: `Best ${keyword.keyword} Guide 2024`,
        llm_optimized_description: `Complete guide to ${keyword.keyword} with expert tips and recommendations.`,
        content_suggestions: [
          `Focus on ${keyword.keyword} basics`,
          `Include ${keyword.keyword} examples`,
          `Add ${keyword.keyword} best practices`
        ],
        heading_suggestions: [
          `What is ${keyword.keyword}?`,
          `How to use ${keyword.keyword}`,
          `${keyword.keyword} Tips and Tricks`
        ],
        affiliate_potential_score: Math.round(keyword.opportunity_score * 0.8),
        suggested_affiliate_networks: ['Amazon', 'ShareASale', 'CJ Affiliate'],
        monetization_opportunities: [
          `${keyword.keyword} products`,
          `${keyword.keyword} tools`,
          `${keyword.keyword} services`
        ]
      }));

      setUploadStatus('success');
      if (onOptimizationComplete) {
        onOptimizationComplete(optimizedKeywords);
      }

    } catch (error) {
      setUploadStatus('error');
      setError(typeof error === 'string' ? error : 'Optimization failed');
    }
  };

  const handleEditKeyword = (keyword: AhrefsKeyword) => {
    setSelectedKeywordForEdit(keyword);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 70) return 'error';
    if (difficulty >= 40) return 'warning';
    return 'success';
  };

  const getOpportunityColor = (score: number) => {
    if (score >= 70) return 'success';
    if (score >= 40) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Individual Keyword Upload & Optimization
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload Ahrefs keyword data to optimize specific content ideas with detailed metrics and LLM analysis.
          </Typography>

          {/* Upload Area */}
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
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
              {isDragActive ? 'Drop your Ahrefs CSV file here' : 'Drag & drop Ahrefs CSV file'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supports .csv and .tsv files with keyword data
            </Typography>
          </Box>

          {/* Progress */}
          {uploadStatus === 'uploading' && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Uploading and processing... {uploadProgress}%
              </Typography>
            </Box>
          )}

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Success Message */}
          {uploadStatus === 'success' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Successfully uploaded {uploadedKeywords.length} keywords!
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Keywords Table */}
      {uploadedKeywords.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Uploaded Keywords ({uploadedKeywords.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handleSelectAll}
                  size="small"
                >
                  {selectedKeywords.size === uploadedKeywords.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleOptimizeSelected}
                  disabled={selectedKeywords.size === 0 || uploadStatus === 'processing'}
                  startIcon={<Speed />}
                >
                  Optimize Selected ({selectedKeywords.size})
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedKeywords.size === uploadedKeywords.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Keyword</TableCell>
                    <TableCell align="right">Search Volume</TableCell>
                    <TableCell align="right">Difficulty</TableCell>
                    <TableCell align="right">CPC</TableCell>
                    <TableCell align="right">Opportunity</TableCell>
                    <TableCell align="right">Competition</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uploadedKeywords.map((keyword, index) => (
                    <TableRow key={index} hover>
                      <TableCell padding="checkbox">
                        <input
                          type="checkbox"
                          checked={selectedKeywords.has(keyword.keyword)}
                          onChange={() => handleKeywordSelect(keyword.keyword)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {keyword.keyword}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {keyword.search_volume.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={keyword.keyword_difficulty}
                          color={getDifficultyColor(keyword.keyword_difficulty)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          ${keyword.cpc.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${keyword.opportunity_score.toFixed(1)}%`}
                          color={getOpportunityColor(keyword.opportunity_score)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={keyword.competition_level}
                          color={keyword.competition_level === 'high' ? 'error' : keyword.competition_level === 'medium' ? 'warning' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Preview">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedKeywordForEdit(keyword);
                              setPreviewDialogOpen(true);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditKeyword(keyword)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Keyword Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Keyword Details</DialogTitle>
        <DialogContent>
          {selectedKeywordForEdit && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedKeywordForEdit.keyword}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Search Volume
                  </Typography>
                  <Typography variant="h6">
                    {selectedKeywordForEdit.search_volume.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Keyword Difficulty
                  </Typography>
                  <Typography variant="h6">
                    {selectedKeywordForEdit.keyword_difficulty}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    CPC
                  </Typography>
                  <Typography variant="h6">
                    ${selectedKeywordForEdit.cpc.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Opportunity Score
                  </Typography>
                  <Typography variant="h6">
                    {selectedKeywordForEdit.opportunity_score.toFixed(1)}%
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IndividualKeywordUpload;

