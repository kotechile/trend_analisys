import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Upload as UploadIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  Assessment as AssessmentIcon,
  Lightbulb as LightbulbIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';

import FileUpload from '../components/FileUpload';
import AnalysisResults from '../components/AnalysisResults';
import KeywordTable from '../components/KeywordTable';
import SEOContentIdeas from '../components/SEOContentIdeas';
import OptimizationTips from '../components/OptimizationTips';

interface KeywordAnalysisPageProps {
  onNavigate?: (page: string) => void;
}

interface AnalysisData {
  file_id: string;
  analysis_id: string;
  status: string;
  summary: {
    total_keywords: number;
    total_volume: number;
    average_difficulty: number;
    average_cpc: number;
    intent_distribution: Record<string, number>;
  };
  keywords: any[];
  content_opportunities: any[];
  seo_content_ideas: any[];
  created_at: string;
  completed_at?: string;
}

const KeywordAnalysisPage: React.FC<KeywordAnalysisPageProps> = ({
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock file upload - in real implementation, this would call the API
      const mockFileId = `file_${Date.now()}`;
      setUploadedFile({
        id: mockFileId,
        filename: file.name,
        size: file.size,
        status: 'uploaded'
      });
      
      // Simulate analysis start
      setTimeout(() => {
        setAnalysisData({
          file_id: mockFileId,
          analysis_id: `analysis_${Date.now()}`,
          status: 'completed',
          summary: {
            total_keywords: 1250,
            total_volume: 45000,
            average_difficulty: 65.5,
            average_cpc: 2.3,
            intent_distribution: {
              'Informational': 450,
              'Commercial': 380,
              'Navigational': 250,
              'Transactional': 170
            }
          },
          keywords: [],
          content_opportunities: [],
          seo_content_ideas: [],
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        });
        setLoading(false);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setLoading(false);
    }
  };

  const handleFileDelete = () => {
    setUploadedFile(null);
    setAnalysisData(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleStartAnalysis = async () => {
    if (!uploadedFile) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Mock analysis start - in real implementation, this would call the API
      setTimeout(() => {
        setAnalysisData({
          file_id: uploadedFile.id,
          analysis_id: `analysis_${Date.now()}`,
          status: 'completed',
          summary: {
            total_keywords: 1250,
            total_volume: 45000,
            average_difficulty: 65.5,
            average_cpc: 2.3,
            intent_distribution: {
              'Informational': 450,
              'Commercial': 380,
              'Navigational': 250,
              'Transactional': 170
            }
          },
          keywords: [],
          content_opportunities: [],
          seo_content_ideas: [],
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        });
        setLoading(false);
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setLoading(false);
    }
  };

  const handleExport = (format: string) => {
    // Mock export functionality
    console.log(`Exporting analysis data in ${format} format`);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Keyword Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload Ahrefs keyword data and analyze content opportunities
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setShowUploadDialog(true)}
          >
            Upload File
          </Button>
          {analysisData && (
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('json')}
            >
              Export
            </Button>
          )}
        </Box>
      </Box>

      {/* Upload Section */}
      {!uploadedFile && (
        <Paper sx={{ p: 4, mb: 4, textAlign: 'center' }}>
          <UploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Upload Your Ahrefs Keyword Data
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Upload a TSV file exported from Ahrefs to start your keyword analysis
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<UploadIcon />}
            onClick={() => setShowUploadDialog(true)}
          >
            Choose File
          </Button>
        </Paper>
      )}

      {/* File Status */}
      {uploadedFile && !analysisData && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                File Uploaded Successfully
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {uploadedFile.filename} ({formatNumber(uploadedFile.size)} bytes)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<AnalyticsIcon />}
                onClick={handleStartAnalysis}
                disabled={loading}
              >
                Start Analysis
              </Button>
              <Button
                variant="outlined"
                onClick={handleFileDelete}
              >
                Remove File
              </Button>
            </Box>
          </Box>
          {loading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Analyzing keywords...
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Analysis Results */}
      {analysisData && (
        <Box>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SearchIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Keywords</Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {formatNumber(analysisData.summary.total_keywords)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Volume</Typography>
                  </Box>
                  <Typography variant="h4" color="success.main">
                    {formatNumber(analysisData.summary.total_volume)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AssessmentIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6">Avg Difficulty</Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main">
                    {analysisData.summary.average_difficulty.toFixed(1)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                    <Typography variant="h6">Avg CPC</Typography>
                  </Box>
                  <Typography variant="h4" color="info.main">
                    ${analysisData.summary.average_cpc.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Intent Distribution */}
          <Paper sx={{ p: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Intent Distribution
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.entries(analysisData.summary.intent_distribution).map(([intent, count]) => (
                <Chip
                  key={intent}
                  label={`${intent}: ${count}`}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>

          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Keywords" icon={<SearchIcon />} />
              <Tab label="Content Ideas" icon={<LightbulbIcon />} />
              <Tab label="Optimization Tips" icon={<AssessmentIcon />} />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {activeTab === 0 && (
            <KeywordTable
              keywords={analysisData.keywords}
              selectable={true}
              showFilters={true}
            />
          )}

          {activeTab === 1 && (
            <SEOContentIdeas
              ideas={analysisData.seo_content_ideas}
              showFilters={true}
            />
          )}

          {activeTab === 2 && (
            <OptimizationTips
              tips={[]}
              showCategories={true}
              showPriority={true}
            />
          )}
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Upload Dialog */}
      <Dialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Ahrefs Keyword Data
        </DialogTitle>
        <DialogContent>
          <FileUpload
            onFileUpload={handleFileUpload}
            onFileDelete={handleFileDelete}
            maxSize={10 * 1024 * 1024} // 10MB
            acceptedTypes={['.tsv', '.csv']}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default KeywordAnalysisPage;
