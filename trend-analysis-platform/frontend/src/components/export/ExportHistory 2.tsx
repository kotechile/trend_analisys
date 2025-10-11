/**
 * Export History Component
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Search as SearchIcon,
  OpenInNew,
  Download,
  Refresh,
  Delete,
  Visibility,
} from '@mui/icons-material';
import { useExport } from '../../hooks/useExport';

interface ExportHistoryProps {
  platform?: string;
}

export const ExportHistory: React.FC<ExportHistoryProps> = ({ platform }) => {
  const { useExportHistory } = useExport();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: historyData, isLoading, error, refetch } = useExportHistory({
    platform,
    skip: page * rowsPerPage,
    limit: rowsPerPage,
  });

  const exports = historyData?.data || [];
  const filteredExports = exports.filter((exportItem: any) =>
    exportItem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exportItem.platform?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exportItem.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'failed': return 'error';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'google-docs': return '📄';
      case 'notion': return '📝';
      case 'wordpress': return '🌐';
      case 'csv': return '📊';
      case 'pdf': return '📋';
      default: return '📤';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
        {error.message || 'Failed to load export history'}
      </Alert>
    );
  }

  const paginatedExports = filteredExports.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Export History ({filteredExports.length})
          </Typography>
          <Box display="flex" gap={1}>
            <TextField
              size="small"
              placeholder="Search exports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              size="small"
              startIcon={<Refresh />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {exports.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              No export history found. Start exporting content to see your history here.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Platform</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedExports.map((exportItem: any) => (
                    <TableRow key={exportItem.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" noWrap>
                            {exportItem.title || 'Untitled Export'}
                          </Typography>
                          {exportItem.description && (
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {exportItem.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {getPlatformIcon(exportItem.platform)}
                          </Typography>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {exportItem.platform?.replace('-', ' ')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={exportItem.content_type || 'Unknown'} 
                          size="small" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={exportItem.status}
                          color={getStatusColor(exportItem.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(exportItem.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          {exportItem.export_url && (
                            <Tooltip title="Open in platform">
                              <IconButton
                                size="small"
                                href={exportItem.export_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <OpenInNew fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {exportItem.download_url && (
                            <Tooltip title="Download">
                              <IconButton
                                size="small"
                                href={exportItem.download_url}
                                download
                              >
                                <Download fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="View details">
                            <IconButton size="small">
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error">
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredExports.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
