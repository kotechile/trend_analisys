import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material'
import {
  Edit as EditIcon,
  PlayArrow as TestIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'

import { apiService } from '../../services/api';

interface LLMProvider {
  id: string
  name: string
  provider_type: string
  model_name: string
  is_active: boolean
  is_default: boolean
  priority: number
  total_requests: number
  successful_requests: number
  failed_requests: number
  total_tokens_used: number
  total_cost: number
  last_used: string | null
  created_at: string
}

interface EditProviderData {
  name: string
  provider_type: string
  model_name: string
  is_active: boolean
  is_default: boolean
  priority: number
}

const LLMManagement: React.FC = () => {
  const [providers, setProviders] = useState<LLMProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<LLMProvider | null>(null)
  const [editData, setEditData] = useState<EditProviderData>({
    name: '',
    provider_type: '',
    model_name: '',
    is_active: true,
    is_default: false,
    priority: 0
  })
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  // Load providers on component mount
  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      setLoading(true)
      const data = await apiService.get<LLMProvider[]>('/api/admin/llm/providers')
      setProviders(data)
    } catch (error) {
      console.error('Error loading providers:', error)
      setSnackbar({
        open: true,
        message: 'Failed to load LLM providers',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (provider: LLMProvider) => {
    setEditingProvider(provider)
    setEditData({
      name: provider.name,
      provider_type: provider.provider_type,
      model_name: provider.model_name,
      is_active: provider.is_active,
      is_default: provider.is_default,
      priority: provider.priority
    })
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingProvider) return

    setSaving(true)
    try {
      // Simulate API call - in real implementation, this would call the backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update local state
      setProviders(prev => prev.map(p => 
        p.id === editingProvider.id 
          ? { ...p, ...editData }
          : p
      ))

      setSnackbar({
        open: true,
        message: 'LLM provider updated successfully!',
        severity: 'success'
      })
      
      setEditDialogOpen(false)
      setEditingProvider(null)
    } catch (error) {
      console.error('Error saving provider:', error)
      setSnackbar({
        open: true,
        message: 'Failed to update LLM provider',
        severity: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditDialogOpen(false)
    setEditingProvider(null)
    setEditData({
      name: '',
      provider_type: '',
      model_name: '',
      is_active: true,
      is_default: false,
      priority: 0
    })
  }

  const handleTest = async (provider: LLMProvider) => {
    try {
      setSnackbar({
        open: true,
        message: `Testing ${provider.name}...`,
        severity: 'info'
      })

      // Test the provider with a sample request
      await apiService.post('/api/topic-analysis/analyze', {
        topic: 'test topic',
        provider_id: provider.id
      })

      setSnackbar({
        open: true,
        message: `${provider.name} test successful!`,
        severity: 'success'
      })
    } catch (error) {
      console.error('Error testing provider:', error)
      setSnackbar({
        open: true,
        message: `Failed to test ${provider.name}`,
        severity: 'error'
      })
    }
  }

  const handleDefaultChange = (providerId: string, isDefault: boolean) => {
    if (isDefault) {
      // Set all others to false, this one to true
      setProviders(prev => prev.map(p => ({
        ...p,
        is_default: p.id === providerId
      })))
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          LLM Provider Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ px: 3 }}
        >
          Add Provider
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Providers
              </Typography>
              <Typography variant="h4">
                {providers.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Providers
              </Typography>
              <Typography variant="h4">
                {providers.filter(p => p.is_active).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Requests
              </Typography>
              <Typography variant="h4">
                {providers.reduce((sum, p) => sum + p.total_requests, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Success Rate
              </Typography>
              <Typography variant="h4">
                {providers.length > 0 
                  ? Math.round(
                      (providers.reduce((sum, p) => sum + p.successful_requests, 0) / 
                       Math.max(providers.reduce((sum, p) => sum + p.total_requests, 0), 1)) * 100
                    )
                  : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Providers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Requests</TableCell>
              <TableCell>Success Rate</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {provider.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={provider.provider_type} 
                    size="small" 
                    color="secondary"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {provider.model_name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={provider.is_default ? 'Default' : (provider.is_active ? 'Active' : 'Inactive')}
                    size="small"
                    color={provider.is_default ? 'success' : (provider.is_active ? 'primary' : 'default')}
                  />
                </TableCell>
                <TableCell>
                  {provider.priority}
                </TableCell>
                <TableCell>
                  {provider.total_requests}
                </TableCell>
                <TableCell>
                  {provider.total_requests > 0 
                    ? Math.round((provider.successful_requests / provider.total_requests) * 100)
                    : 0}%
                </TableCell>
                <TableCell>
                  ${provider.total_cost.toFixed(4)}
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => handleTest(provider)}
                    title="Test Provider"
                  >
                    <TestIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleEdit(provider)}
                    title="Edit Provider"
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit LLM Provider: {editingProvider?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Provider Name"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            />
            
            <FormControl fullWidth>
              <InputLabel>Provider Type</InputLabel>
              <Select
                value={editData.provider_type}
                onChange={(e) => setEditData({ ...editData, provider_type: e.target.value })}
                label="Provider Type"
              >
                <MenuItem value="openai">OpenAI</MenuItem>
                <MenuItem value="google">Google</MenuItem>
                <MenuItem value="anthropic">Anthropic</MenuItem>
                <MenuItem value="local">Local</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Model Name"
              value={editData.model_name}
              onChange={(e) => setEditData({ ...editData, model_name: e.target.value })}
            />
            
            <TextField
              fullWidth
              label="Priority"
              type="number"
              value={editData.priority}
              onChange={(e) => setEditData({ ...editData, priority: parseInt(e.target.value) || 0 })}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={editData.is_active}
                  onChange={(e) => setEditData({ ...editData, is_active: e.target.checked })}
                />
              }
              label="Active"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={editData.is_default}
                  onChange={(e) => {
                    setEditData({ ...editData, is_default: e.target.checked })
                    if (e.target.checked) {
                      handleDefaultChange(editingProvider?.id || '', true)
                    }
                  }}
                />
              }
              label="Default Provider"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default LLMManagement