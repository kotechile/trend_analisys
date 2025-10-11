# Research Topics Accessibility Guide

This document outlines accessibility features and best practices for the Research Topics feature, ensuring compliance with WCAG 2.1 AA standards.

## Accessibility Features

### 1. Keyboard Navigation

#### Tab Order
```typescript
// Ensure logical tab order
const ResearchTopicCard = ({ topic, onView, onEdit }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" tabIndex={0}>
        {topic.title}
      </Typography>
      <Button
        onClick={() => onView(topic)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onView(topic);
          }
        }}
        aria-label={`View dataflow for ${topic.title}`}
      >
        View Dataflow
      </Button>
    </CardContent>
  </Card>
);
```

#### Focus Management
```typescript
// Manage focus for modals and dialogs
const DataflowDialog = ({ open, onClose, topicId }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="dataflow-dialog-title"
      aria-describedby="dataflow-dialog-description"
    >
      <DialogTitle id="dataflow-dialog-title">
        Dataflow Viewer
      </DialogTitle>
      <DialogContent
        ref={dialogRef}
        tabIndex={-1}
        id="dataflow-dialog-description"
      >
        <DataflowViewer topicId={topicId} />
      </DialogContent>
    </Dialog>
  );
};
```

### 2. Screen Reader Support

#### ARIA Labels
```typescript
// Provide descriptive labels
const ResearchTopicForm = () => (
  <form>
    <TextField
      label="Research Topic Title"
      aria-label="Enter the title for your research topic"
      aria-describedby="title-help-text"
      required
    />
    <FormHelperText id="title-help-text">
      Choose a descriptive title that clearly identifies your research topic
    </FormHelperText>
  </form>
);
```

#### Live Regions
```typescript
// Announce dynamic content changes
const TopicList = ({ topics, loading, error }) => {
  const [announcement, setAnnouncement] = useState('');
  
  useEffect(() => {
    if (loading) {
      setAnnouncement('Loading research topics...');
    } else if (error) {
      setAnnouncement('Error loading research topics');
    } else if (topics.length > 0) {
      setAnnouncement(`${topics.length} research topics loaded`);
    }
  }, [topics, loading, error]);
  
  return (
    <>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      {/* Topic list content */}
    </>
  );
};
```

### 3. Color and Contrast

#### High Contrast Support
```typescript
// Use theme-aware colors
const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'primary';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };
  
  return (
    <Chip
      label={status}
      color={getStatusColor(status)}
      sx={{
        // Ensure sufficient contrast
        '&.MuiChip-colorSuccess': {
          backgroundColor: 'success.main',
          color: 'success.contrastText'
        }
      }}
    />
  );
};
```

#### Color Independence
```typescript
// Don't rely solely on color for information
const ProgressIndicator = ({ progress, hasSubtopics, hasAnalyses, hasIdeas }) => (
  <Box>
    <Typography variant="caption">
      Dataflow Progress: {progress}%
    </Typography>
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Avatar
        sx={{
          bgcolor: hasSubtopics ? 'success.main' : 'grey.300',
          color: hasSubtopics ? 'success.contrastText' : 'grey.600'
        }}
        aria-label={hasSubtopics ? 'Subtopics created' : 'No subtopics yet'}
      >
        S
      </Avatar>
      <Avatar
        sx={{
          bgcolor: hasAnalyses ? 'success.main' : 'grey.300',
          color: hasAnalyses ? 'success.contrastText' : 'grey.600'
        }}
        aria-label={hasAnalyses ? 'Trend analyses completed' : 'No trend analyses yet'}
      >
        T
      </Avatar>
      <Avatar
        sx={{
          bgcolor: hasIdeas ? 'success.main' : 'grey.300',
          color: hasIdeas ? 'success.contrastText' : 'grey.600'
        }}
        aria-label={hasIdeas ? 'Content ideas generated' : 'No content ideas yet'}
      >
        C
      </Avatar>
    </Box>
  </Box>
);
```

### 4. Form Accessibility

#### Form Labels and Descriptions
```typescript
const ResearchTopicForm = () => (
  <form noValidate>
    <FormControl fullWidth required>
      <InputLabel htmlFor="topic-title">Research Topic Title</InputLabel>
      <Input
        id="topic-title"
        aria-describedby="title-help"
        aria-required="true"
        error={!!errors.title}
      />
      <FormHelperText id="title-help">
        {errors.title || 'Enter a descriptive title for your research topic'}
      </FormHelperText>
    </FormControl>
    
    <FormControl fullWidth>
      <InputLabel htmlFor="topic-status">Status</InputLabel>
      <Select
        id="topic-status"
        aria-describedby="status-help"
        value={formData.status}
        onChange={handleStatusChange}
      >
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="completed">Completed</MenuItem>
        <MenuItem value="archived">Archived</MenuItem>
      </Select>
      <FormHelperText id="status-help">
        Select the current status of your research topic
      </FormHelperText>
    </FormControl>
  </form>
);
```

#### Error Handling
```typescript
const FormField = ({ error, children, ...props }) => (
  <FormControl error={!!error} {...props}>
    {children}
    {error && (
      <FormHelperText role="alert" aria-live="polite">
        {error}
      </FormHelperText>
    )}
  </FormControl>
);
```

### 5. Data Tables

#### Accessible Table Structure
```typescript
const TopicsTable = ({ topics }) => (
  <TableContainer>
    <Table aria-label="Research topics table">
      <TableHead>
        <TableRow>
          <TableCell>
            <TableSortLabel
              active={sortBy === 'title'}
              direction={sortDirection}
              onClick={() => handleSort('title')}
              aria-label="Sort by title"
            >
              Title
            </TableSortLabel>
          </TableCell>
          <TableCell>
            <TableSortLabel
              active={sortBy === 'status'}
              direction={sortDirection}
              onClick={() => handleSort('status')}
              aria-label="Sort by status"
            >
              Status
            </TableSortLabel>
          </TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {topics.map((topic) => (
          <TableRow key={topic.id}>
            <TableCell>
              <Typography variant="body2">
                {topic.title}
              </Typography>
            </TableCell>
            <TableCell>
              <StatusChip status={topic.status} />
            </TableCell>
            <TableCell>
              <IconButton
                aria-label={`Actions for ${topic.title}`}
                onClick={() => handleMenuOpen(topic)}
              >
                <MoreVertIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
```

### 6. Interactive Elements

#### Button Accessibility
```typescript
const ActionButton = ({ 
  icon, 
  label, 
  onClick, 
  disabled = false,
  variant = 'text',
  size = 'small'
}) => (
  <Button
    variant={variant}
    size={size}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    startIcon={icon}
    sx={{
      minWidth: 'auto',
      padding: '8px'
    }}
  >
    <span className="sr-only">{label}</span>
  </Button>
);
```

#### Menu Accessibility
```typescript
const TopicActionMenu = ({ topic, onClose, onView, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleClose = () => {
    setAnchorEl(null);
    onClose();
  };
  
  return (
    <>
      <IconButton
        aria-label={`Actions for ${topic.title}`}
        aria-controls={open ? 'topic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : 'false'}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="topic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'topic-menu-button'
        }}
      >
        <MenuItem onClick={() => { onView(topic); handleClose(); }}>
          <ListItemIcon>
            <ViewIcon />
          </ListItemIcon>
          <ListItemText>View Dataflow</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onEdit(topic); handleClose(); }}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => { onDelete(topic); handleClose(); }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
```

### 7. Loading States

#### Accessible Loading Indicators
```typescript
const LoadingState = ({ message = 'Loading...' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px'
    }}
  >
    <CircularProgress
      aria-label="Loading"
      size={40}
    />
    <Typography
      variant="body2"
      sx={{ mt: 2 }}
      aria-live="polite"
    >
      {message}
    </Typography>
  </Box>
);
```

#### Skeleton Loading
```typescript
const TopicCardSkeleton = () => (
  <Card>
    <CardContent>
      <Skeleton variant="text" width="80%" height={24} />
      <Skeleton variant="text" width="60%" height={20} />
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="circular" width={24} height={24} />
      </Box>
    </CardContent>
  </Card>
);
```

### 8. Error Handling

#### Accessible Error Messages
```typescript
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  
  if (hasError) {
    return (
      <Alert
        severity="error"
        role="alert"
        aria-live="assertive"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              setHasError(false);
              setError(null);
            }}
          >
            Try Again
          </Button>
        }
      >
        <AlertTitle>Something went wrong</AlertTitle>
        {error?.message || 'An unexpected error occurred'}
      </Alert>
    );
  }
  
  return children;
};
```

### 9. Responsive Design

#### Mobile Accessibility
```typescript
const ResponsiveTopicCard = ({ topic }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Card
      sx={{
        // Ensure touch targets are at least 44px
        minHeight: isMobile ? '44px' : 'auto',
        '& .MuiButton-root': {
          minHeight: '44px',
          minWidth: '44px'
        }
      }}
    >
      <CardContent>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          sx={{
            // Ensure text is readable on mobile
            fontSize: { xs: '1rem', sm: '1.25rem' },
            lineHeight: 1.2
          }}
        >
          {topic.title}
        </Typography>
      </CardContent>
    </Card>
  );
};
```

### 10. Testing Accessibility

#### Automated Testing
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Research Topics Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<ResearchTopics />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should be keyboard navigable', () => {
    render(<ResearchTopics />);
    
    // Test tab navigation
    const firstButton = screen.getByRole('button', { name: /new research topic/i });
    firstButton.focus();
    expect(document.activeElement).toBe(firstButton);
    
    // Test arrow key navigation
    fireEvent.keyDown(firstButton, { key: 'ArrowRight' });
    // Verify focus moves to next element
  });
});
```

#### Manual Testing Checklist
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible and clear
- [ ] Screen reader announces content changes
- [ ] Color is not the only means of conveying information
- [ ] Text has sufficient contrast ratio (4.5:1 for normal text)
- [ ] Forms have proper labels and error messages
- [ ] Tables have proper headers and structure
- [ ] Images have alt text or are decorative
- [ ] Videos have captions or transcripts
- [ ] Content is readable at 200% zoom

## Accessibility Resources

### Tools
- **axe-core**: Automated accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Performance and accessibility audit
- **Screen readers**: NVDA, JAWS, VoiceOver
- **Keyboard testing**: Tab, arrow keys, Enter, Space

### Guidelines
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Material-UI Accessibility](https://mui.com/material-ui/guides/accessibility/)

### Testing Commands
```bash
# Run accessibility tests
npm test -- --testPathPattern=accessibility

# Run axe-core tests
npm run test:a11y

# Run Lighthouse audit
npm run lighthouse
```

This accessibility guide ensures the Research Topics feature is usable by all users, regardless of their abilities or assistive technologies.
