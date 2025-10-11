import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  TablePagination,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  FileDownload as FileDownloadIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

interface Report {
  id: string;
  file_id: string;
  filename: string;
  status: string;
  keywords_count: number;
  content_opportunities_count: number;
  seo_content_ideas_count: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

interface ReportsPageProps {
  onNavigate?: (page: string) => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({
  onNavigate
}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockReports: Report[] = [
      {
        id: 'report_1',
        file_id: 'file_1',
        filename: 'ahrefs_keywords_2024.tsv',
        status: 'completed',
        keywords_count: 1250,
        content_opportunities_count: 45,
        seo_content_ideas_count: 12,
        created_at: '2024-01-15T10:30:00Z',
        completed_at: '2024-01-15T10:35:00Z'
      },
      {
        id: 'report_2',
        file_id: 'file_2',
        filename: 'competitor_analysis.tsv',
        status: 'completed',
        keywords_count: 890,
        content_opportunities_count: 32,
        seo_content_ideas_count: 8,
        created_at: '2024-01-14T14:20:00Z',
        completed_at: '2024-01-14T14:25:00Z'
      },
      {
        id: 'report_3',
        file_id: 'file_3',
        filename: 'long_tail_keywords.tsv',
        status: 'processing',
        keywords_count: 0,
        content_opportunities_count: 0,
        seo_content_ideas_count: 0,
        created_at: '2024-01-16T09:15:00Z'
      },
      {
        id: 'report_4',
        file_id: 'file_4',
        filename: 'invalid_file.tsv',
        status: 'error',
        keywords_count: 0,
        content_opportunities_count: 0,
        seo_content_ideas_count: 0,
        created_at: '2024-01-13T16:45:00Z',
        error_message: 'Invalid file format'
      }
    ];
    setReports(mockReports);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'processing': return 'Processing';
      case 'error': return 'Error';
      default: return status;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    handleFilterMenuClose();
  };

  const handleSelectReport = (reportId: string) => {
    const newSelected = new Set(selectedReports);
    if (newSelected.has(reportId)) {
      newSelected.delete(reportId);
    } else {
      newSelected.add(reportId);
    }
    setSelectedReports(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedReports.size === filteredReports.length) {
      setSelectedReports(new Set());
    } else {
      setSelectedReports(new Set(filteredReports.map(r => r.id)));
    }
  };

  const handleViewReport = (reportId: string) => {
    // Navigate to report details
    onNavigate?.(`/reports/${reportId}`);
  };

  const handleExportReport = (reportId: string, format: string) => {
    // Export report in specified format
    console.log(`Exporting report ${reportId} in ${format} format`);
  };

  const handleDeleteReport = (reportId: string) => {
    setReportToDelete(reportId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (reportToDelete) {
      setReports(reports.filter(r => r.id !== reportToDelete));
      setSelectedReports(new Set());
      setReportToDelete(null);
    }
    setShowDeleteDialog(false);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedReports = filteredReports.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Analysis Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your keyword analysis reports
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            disabled={selectedReports.size === 0}
          >
            Export Selected
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Reports</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {reports.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Completed</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {reports.filter(r => r.status === 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Processing</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {reports.filter(r => r.status === 'processing').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssessmentIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Errors</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {reports.filter(r => r.status === 'error').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search reports..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={handleFilterMenuOpen}
          >
            Filter
          </Button>
        </Box>
      </Paper>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterMenuClose}
      >
        <MenuItem onClick={() => handleStatusFilter('all')}>
          All Status
        </MenuItem>
        <MenuItem onClick={() => handleStatusFilter('completed')}>
          Completed
        </MenuItem>
        <MenuItem onClick={() => handleStatusFilter('processing')}>
          Processing
        </MenuItem>
        <MenuItem onClick={() => handleStatusFilter('error')}>
          Error
        </MenuItem>
      </Menu>

      {/* Reports Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <input
                  type="checkbox"
                  checked={selectedReports.size === filteredReports.length && filteredReports.length > 0}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Report ID</TableCell>
              <TableCell>Filename</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Keywords</TableCell>
              <TableCell align="right">Opportunities</TableCell>
              <TableCell align="right">Content Ideas</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedReports.map((report) => (
              <TableRow key={report.id} hover>
                <TableCell padding="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedReports.has(report.id)}
                    onChange={() => handleSelectReport(report.id)}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {report.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {report.filename}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(report.status)}
                    color={getStatusColor(report.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {report.keywords_count.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {report.content_opportunities_count.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {report.seo_content_ideas_count.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(report.created_at)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="View Report">
                      <IconButton
                        size="small"
                        onClick={() => handleViewReport(report.id)}
                        disabled={report.status !== 'completed'}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export JSON">
                      <IconButton
                        size="small"
                        onClick={() => handleExportReport(report.id, 'json')}
                        disabled={report.status !== 'completed'}
                      >
                        <FileDownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteReport(report.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredReports.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Selected Reports Actions */}
      {selectedReports.size > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedReports.size} report(s) selected
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => console.log('Export selected reports')}
              >
                Export Selected
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={() => console.log('Share selected reports')}
              >
                Share
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => console.log('Delete selected reports')}
              >
                Delete Selected
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>
          Delete Report
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this report? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReportsPage;
