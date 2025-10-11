import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TableSortLabel,
  TablePagination,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Button,
  Checkbox
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon
} from '@mui/icons-material';

interface Keyword {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  intents: string[];
  opportunity_score: number;
}

interface KeywordTableProps {
  keywords: Keyword[];
  onKeywordSelect?: (keyword: Keyword) => void;
  onKeywordBookmark?: (keyword: Keyword) => void;
  onKeywordShare?: (keyword: Keyword) => void;
  selectable?: boolean;
  showFilters?: boolean;
  maxRows?: number;
}

type SortField = 'keyword' | 'volume' | 'difficulty' | 'cpc' | 'opportunity_score';
type SortDirection = 'asc' | 'desc';

const KeywordTable: React.FC<KeywordTableProps> = ({
  keywords,
  onKeywordSelect,
  onKeywordBookmark,
  onKeywordShare,
  selectable = false,
  showFilters = true,
  maxRows: _maxRows = 50
}) => {
  const [sortField, setSortField] = useState<SortField>('opportunity_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [bookmarkedKeywords, setBookmarkedKeywords] = useState<Set<string>>(new Set());
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [intentFilter, setIntentFilter] = useState<string>('all');
  const [difficultyFilter, _setDifficultyFilter] = useState<[number, number]>([0, 100]);
  const [volumeFilter, _setVolumeFilter] = useState<[number, number]>([0, 100000]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return 'success';
    if (difficulty <= 60) return 'warning';
    return 'error';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 30) return 'Easy';
    if (difficulty <= 60) return 'Medium';
    return 'Hard';
  };

  const getIntentColor = (intent: string) => {
    switch (intent.toLowerCase()) {
      case 'informational': return 'info';
      case 'commercial': return 'warning';
      case 'navigational': return 'primary';
      case 'transactional': return 'success';
      default: return 'default';
    }
  };

  const filteredAndSortedKeywords = useMemo(() => {
    let filtered = keywords.filter(keyword => {
      // Search filter
      if (searchTerm && !keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Intent filter
      if (intentFilter !== 'all' && !keyword.intents.includes(intentFilter)) {
        return false;
      }

      // Difficulty filter
      if (keyword.difficulty < difficultyFilter[0] || keyword.difficulty > difficultyFilter[1]) {
        return false;
      }

      // Volume filter
      if (keyword.volume < volumeFilter[0] || keyword.volume > volumeFilter[1]) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'keyword':
          aValue = a.keyword.toLowerCase();
          bValue = b.keyword.toLowerCase();
          break;
        case 'volume':
          aValue = a.volume;
          bValue = b.volume;
          break;
        case 'difficulty':
          aValue = a.difficulty;
          bValue = b.difficulty;
          break;
        case 'cpc':
          aValue = a.cpc;
          bValue = b.cpc;
          break;
        case 'opportunity_score':
          aValue = a.opportunity_score;
          bValue = b.opportunity_score;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [keywords, searchTerm, intentFilter, difficultyFilter, volumeFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectKeyword = (keyword: Keyword) => {
    if (selectable) {
      const newSelected = new Set(selectedKeywords);
      if (newSelected.has(keyword.keyword)) {
        newSelected.delete(keyword.keyword);
      } else {
        newSelected.add(keyword.keyword);
      }
      setSelectedKeywords(newSelected);
    }
    onKeywordSelect?.(keyword);
  };

  const handleBookmarkKeyword = (keyword: Keyword) => {
    const newBookmarked = new Set(bookmarkedKeywords);
    if (newBookmarked.has(keyword.keyword)) {
      newBookmarked.delete(keyword.keyword);
    } else {
      newBookmarked.add(keyword.keyword);
    }
    setBookmarkedKeywords(newBookmarked);
    onKeywordBookmark?.(keyword);
  };

  const handleCopyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const intentOptions = ['all', 'Informational', 'Commercial', 'Navigational', 'Transactional'];

  const paginatedKeywords = filteredAndSortedKeywords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Keywords ({filteredAndSortedKeywords.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {showFilters && (
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleFilterMenuOpen}
            >
              Filters
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<SortIcon />}
          >
            Sort
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search keywords..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Filters Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterMenuClose}
      >
        <MenuItem>
          <Typography variant="subtitle2">Intent Filter</Typography>
        </MenuItem>
        {intentOptions.map((intent) => (
          <MenuItem
            key={intent}
            onClick={() => {
              setIntentFilter(intent);
              handleFilterMenuClose();
            }}
            selected={intentFilter === intent}
          >
            {intent}
          </MenuItem>
        ))}
        <MenuItem>
          <Typography variant="subtitle2">Difficulty Range</Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant="subtitle2">Volume Range</Typography>
        </MenuItem>
      </Menu>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedKeywords.size > 0 && selectedKeywords.size < filteredAndSortedKeywords.length}
                    checked={selectedKeywords.size === filteredAndSortedKeywords.length && filteredAndSortedKeywords.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedKeywords(new Set(filteredAndSortedKeywords.map(k => k.keyword)));
                      } else {
                        setSelectedKeywords(new Set());
                      }
                    }}
                  />
                </TableCell>
              )}
              <TableCell>
                <TableSortLabel
                  active={sortField === 'keyword'}
                  direction={sortField === 'keyword' ? sortDirection : 'asc'}
                  onClick={() => handleSort('keyword')}
                >
                  Keyword
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'volume'}
                  direction={sortField === 'volume' ? sortDirection : 'asc'}
                  onClick={() => handleSort('volume')}
                >
                  Volume
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'difficulty'}
                  direction={sortField === 'difficulty' ? sortDirection : 'asc'}
                  onClick={() => handleSort('difficulty')}
                >
                  Difficulty
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'cpc'}
                  direction={sortField === 'cpc' ? sortDirection : 'asc'}
                  onClick={() => handleSort('cpc')}
                >
                  CPC
                </TableSortLabel>
              </TableCell>
              <TableCell>Intents</TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'opportunity_score'}
                  direction={sortField === 'opportunity_score' ? sortDirection : 'asc'}
                  onClick={() => handleSort('opportunity_score')}
                >
                  Score
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedKeywords.map((keyword, index) => {
              const isSelected = selectedKeywords.has(keyword.keyword);
              const isBookmarked = bookmarkedKeywords.has(keyword.keyword);

              return (
                <TableRow
                  key={index}
                  hover
                  selected={isSelected}
                  onClick={() => handleSelectKeyword(keyword)}
                  sx={{ cursor: 'pointer' }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectKeyword(keyword)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {keyword.keyword}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatNumber(keyword.volume)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${keyword.difficulty.toFixed(1)} (${getDifficultyLabel(keyword.difficulty)})`}
                      color={getDifficultyColor(keyword.difficulty)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      ${keyword.cpc.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {keyword.intents.map((intent) => (
                        <Chip
                          key={intent}
                          label={intent}
                          color={getIntentColor(intent)}
                          size="small"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${keyword.opportunity_score.toFixed(1)} (${getScoreLabel(keyword.opportunity_score)})`}
                      color={getScoreColor(keyword.opportunity_score)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Copy keyword">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyKeyword(keyword.keyword);
                          }}
                        >
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmarkKeyword(keyword);
                          }}
                        >
                          {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Share">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onKeywordShare?.(keyword);
                          }}
                        >
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredAndSortedKeywords.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Selected Keywords Summary */}
      {selectable && selectedKeywords.size > 0 && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Selected Keywords ({selectedKeywords.size})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Array.from(selectedKeywords).map((keyword) => (
              <Chip
                key={keyword}
                label={keyword}
                onDelete={() => {
                  const newSelected = new Set(selectedKeywords);
                  newSelected.delete(keyword);
                  setSelectedKeywords(newSelected);
                }}
                color="primary"
              />
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default KeywordTable;
