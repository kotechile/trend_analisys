/**
 * Affiliate Programs List Component
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
  Button,
  Checkbox,
  Alert,
  CircularProgress,
  TablePagination,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useAffiliate } from '../../hooks/useAffiliate';

interface AffiliateProgramsListProps {
  researchId: string;
}

export const AffiliateProgramsList: React.FC<AffiliateProgramsListProps> = ({
  researchId,
}) => {
  const { usePrograms, selectPrograms, isSelectingPrograms, selectProgramsError } = useAffiliate();
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: programsData, isLoading, error } = usePrograms(researchId);

  const programs = programsData?.data || [];
  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.network.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProgram = (programId: string) => {
    setSelectedPrograms(prev =>
      prev.includes(programId)
        ? prev.filter(id => id !== programId)
        : [...prev, programId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPrograms.length === filteredPrograms.length) {
      setSelectedPrograms([]);
    } else {
      setSelectedPrograms(filteredPrograms.map(program => program.id));
    }
  };

  const handleSaveSelection = async () => {
    try {
      await selectPrograms(researchId, selectedPrograms);
    } catch (error) {
      console.error('Failed to select programs:', error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        {error.message || 'Failed to load affiliate programs'}
      </Alert>
    );
  }

  const paginatedPrograms = filteredPrograms.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Affiliate Programs ({filteredPrograms.length})
          </Typography>
          <Box display="flex" gap={1}>
            <TextField
              size="small"
              placeholder="Search programs..."
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
              variant="contained"
              onClick={handleSaveSelection}
              disabled={selectedPrograms.length === 0 || isSelectingPrograms}
              startIcon={isSelectingPrograms ? <CircularProgress size={20} /> : null}
            >
              {isSelectingPrograms ? 'Saving...' : `Save Selection (${selectedPrograms.length})`}
            </Button>
          </Box>
        </Box>

        {selectProgramsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {selectProgramsError.message || 'Failed to save selection'}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedPrograms.length > 0 && selectedPrograms.length < filteredPrograms.length}
                    checked={filteredPrograms.length > 0 && selectedPrograms.length === filteredPrograms.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Program Name</TableCell>
                <TableCell>Network</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">EPC</TableCell>
                <TableCell align="right">Commission</TableCell>
                <TableCell align="right">Cookie Length</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPrograms.map((program) => (
                <TableRow key={program.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedPrograms.includes(program.id)}
                      onChange={() => handleSelectProgram(program.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" noWrap>
                        {program.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {program.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={program.network} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={program.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    ${program.epc.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {program.commission}%
                  </TableCell>
                  <TableCell align="right">
                    {program.cookie_length} days
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={program.is_selected ? 'Selected' : 'Available'}
                      color={program.is_selected ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPrograms.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </CardContent>
    </Card>
  );
};
