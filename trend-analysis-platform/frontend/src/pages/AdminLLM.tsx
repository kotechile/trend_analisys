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
  Chip,
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
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  LinearProgress
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as TestIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material'

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
  last_used?: string
}

interface LLMConfig {
  enable_llm_analysis: boolean
  enable_auto_fallback: boolean
  enable_cost_tracking: boolean
  global_rate_limit_per_minute: number
  user_rate_limit_per_minute: number
  daily_cost_limit: number
  monthly_cost_limit: number
}

const AdminLLM: React.FC = () => {
  const [providers, setProviders] = useState<LLMProvider[]>([])
  const [config, setConfig] = useState<LLMConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTab, setCurrentTab] = useState(0)
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null)
  
  // Form states
  const [newProvider, setNewProvider] = useState({
    name: '',
    provider_type: 'openai',
    model_name: '',
    api_key_env_var: '',
    base_url: '',
    max_tokens: 2000,
    temperature: 0.7,
    cost_per_1k_tokens: 0.0,
    priority: 0
  })
  
  const [testTopic, setTestTopic] = useState('best wireless headphones')
  const [testResult, setTestResult] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [providersRes, configRes] = await Promise.all([
        fetch('/api/admin/llm/providers'),
        fetch('/api/admin/llm/config')
      ])
      
      if (providersRes.ok) {
        const providersData = await providersRes.json()
        setProviders(providersData)
      }
      
      if (configRes.ok) {
        const configData = await configRes.json()
        setConfig(configData)
      }
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProvider = async () => {
    try {
      const response = await fetch('/api/admin/llm/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProvider)
      })
      
      if (response.ok) {
        setCreateDialogOpen(false)
        setNewProvider({
          name: '',
          provider_type: 'openai',
          model_name: '',
          api_key_env_var: '',
          base_url: '',
          max_tokens: 2000,
          temperature: 0.7,
          cost_per_1k_tokens: 0.0,
          priority: 0
        })
        loadData()
      }
    } catch (err) {
      setError('Failed to create provider')
    }
  }

  const handleSetDefault = async (providerId: string) => {
    try {
      const response = await fetch(`/api/admin/llm/providers/${providerId}/set-default`, {
        method: 'POST'
      })
      
      if (response.ok) {
        loadData()
      }
    } catch (err) {
      setError('Failed to set default provider')
    }
  }

  const handleTestProvider = async () => {
    if (!selectedProvider) return
    
    try {
      setTesting(true)
      const response = await fetch(`/api/admin/llm/providers/${selectedProvider.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_topic: testTopic })
      })
      
      const result = await response.json()
      setTestResult(result)
    } catch (err) {
      setError('Failed to test provider')
    } finally {
      setTesting(false)
    }
  }

  const handleUpdateConfig = async () => {
    if (!config) return
    
    try {
      const response = await fetch('/api/admin/llm/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      if (response.ok) {
        setConfigDialogOpen(false)
        loadData()
      }
    } catch (err) {
      setError('Failed to update configuration')
    }
  }

  const getProviderTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      openai: '#10a37f',
      anthropic: '#d97706',
      google: '#4285f4',
      local: '#6b7280',
      custom: '#8b5cf6'
    }
    return colors[type] || '#6b7280'
  }

  const getSuccessRate = (provider: LLMProvider) => {
    if (provider.total_requests === 0) return 0
    return Math.round((provider.successful_requests / provider.total_requests) * 100)
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading LLM configuration...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>LLM Configuration</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ mb: 3 }}>
        <Tab label="Providers" />
        <Tab label="Configuration" />
        <Tab label="Analytics" />
      </Tabs>

      {/* Providers Tab */}
      {currentTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">LLM Providers</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Add Provider
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Total Cost</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {provider.name}
                        </Typography>
                        {provider.is_default && (
                          <Chip label="Default" size="small" color="primary" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={provider.provider_type}
                        size="small"
                        sx={{ backgroundColor: getProviderTypeColor(provider.provider_type), color: 'white' }}
                      />
                    </TableCell>
                    <TableCell>{provider.model_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={provider.is_active ? 'Active' : 'Inactive'}
                        color={provider.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {getSuccessRate(provider)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({provider.successful_requests}/{provider.total_requests})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>${provider.total_cost.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedProvider(provider)
                          setTestDialogOpen(true)
                        }}
                      >
                        <TestIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleSetDefault(provider.id)}
                        disabled={provider.is_default}
                      >
                        <SettingsIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Configuration Tab */}
      {currentTab === 1 && config && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Global Configuration</Typography>
            <Button
              variant="outlined"
              onClick={() => setConfigDialogOpen(true)}
            >
              Edit Configuration
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Feature Flags</Typography>
                  <FormControlLabel
                    control={<Switch checked={config.enable_llm_analysis} disabled />}
                    label="Enable LLM Analysis"
                  />
                  <FormControlLabel
                    control={<Switch checked={config.enable_auto_fallback} disabled />}
                    label="Enable Auto Fallback"
                  />
                  <FormControlLabel
                    control={<Switch checked={config.enable_cost_tracking} disabled />}
                    label="Enable Cost Tracking"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Rate Limits</Typography>
                  <Typography variant="body2">
                    Global Rate Limit: {config.global_rate_limit_per_minute} requests/min
                  </Typography>
                  <Typography variant="body2">
                    User Rate Limit: {config.user_rate_limit_per_minute} requests/min
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Cost Limits</Typography>
                  <Typography variant="body2">
                    Daily Limit: ${config.daily_cost_limit}
                  </Typography>
                  <Typography variant="body2">
                    Monthly Limit: ${config.monthly_cost_limit}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Analytics Tab */}
      {currentTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Usage Analytics</Typography>
          <Typography variant="body2" color="text.secondary">
            Analytics data will be displayed here
          </Typography>
        </Box>
      )}

      {/* Create Provider Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New LLM Provider</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Provider Name"
              value={newProvider.name}
              onChange={(e) => setNewProvider({...newProvider, name: e.target.value})}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Provider Type</InputLabel>
              <Select
                value={newProvider.provider_type}
                onChange={(e) => setNewProvider({...newProvider, provider_type: e.target.value})}
              >
                <MenuItem value="openai">OpenAI</MenuItem>
                <MenuItem value="anthropic">Anthropic</MenuItem>
                <MenuItem value="google">Google</MenuItem>
                <MenuItem value="local">Local (Ollama)</MenuItem>
                <MenuItem value="custom">Custom API</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Model Name</InputLabel>
              <Select
                value={newProvider.model_name}
                onChange={(e) => setNewProvider({...newProvider, model_name: e.target.value})}
              >
                {newProvider.provider_type === 'openai' && (
                  <>
                    <MenuItem value="gpt-5-mini">GPT-5 Mini (Latest)</MenuItem>
                    <MenuItem value="gpt-4-turbo">GPT-4 Turbo</MenuItem>
                    <MenuItem value="gpt-4">GPT-4</MenuItem>
                    <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                  </>
                )}
                {newProvider.provider_type === 'anthropic' && (
                  <>
                    <MenuItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Latest)</MenuItem>
                    <MenuItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</MenuItem>
                    <MenuItem value="claude-3-haiku-20240307">Claude 3 Haiku</MenuItem>
                    <MenuItem value="claude-3-opus-20240229">Claude 3 Opus</MenuItem>
                  </>
                )}
                {newProvider.provider_type === 'google' && (
                  <>
                    <MenuItem value="gemini-2.5-flash">Gemini 2.5 Flash (Latest)</MenuItem>
                    <MenuItem value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</MenuItem>
                    <MenuItem value="gemini-pro">Gemini Pro</MenuItem>
                    <MenuItem value="gemini-pro-vision">Gemini Pro Vision</MenuItem>
                  </>
                )}
                {newProvider.provider_type === 'local' && (
                  <>
                    <MenuItem value="llama3.1">Llama 3.1 (Latest)</MenuItem>
                    <MenuItem value="llama3">Llama 3</MenuItem>
                    <MenuItem value="mistral">Mistral</MenuItem>
                    <MenuItem value="codellama">CodeLlama</MenuItem>
                    <MenuItem value="phi3">Phi-3</MenuItem>
                  </>
                )}
                {newProvider.provider_type === 'custom' && (
                  <MenuItem value="custom">Custom Model</MenuItem>
                )}
              </Select>
            </FormControl>
            <TextField
              label="API Key Environment Variable"
              value={newProvider.api_key_env_var}
              onChange={(e) => setNewProvider({...newProvider, api_key_env_var: e.target.value})}
              fullWidth
            />
            <TextField
              label="Base URL (for custom/local)"
              value={newProvider.base_url}
              onChange={(e) => setNewProvider({...newProvider, base_url: e.target.value})}
              fullWidth
            />
            <TextField
              label="Max Tokens"
              type="number"
              value={newProvider.max_tokens}
              onChange={(e) => setNewProvider({...newProvider, max_tokens: parseInt(e.target.value)})}
            />
            <TextField
              label="Temperature"
              type="number"
              step="0.1"
              value={newProvider.temperature}
              onChange={(e) => setNewProvider({...newProvider, temperature: parseFloat(e.target.value)})}
            />
            <TextField
              label="Cost per 1K Tokens"
              type="number"
              step="0.001"
              value={newProvider.cost_per_1k_tokens}
              onChange={(e) => setNewProvider({...newProvider, cost_per_1k_tokens: parseFloat(e.target.value)})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateProvider} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Test Provider Dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Test LLM Provider</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Test Topic"
              value={testTopic}
              onChange={(e) => setTestTopic(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            
            {testing && <LinearProgress sx={{ mb: 2 }} />}
            
            {testResult && (
              <Box>
                <Typography variant="h6" gutterBottom>Test Results</Typography>
                {testResult.success ? (
                  <Box>
                    <Typography variant="body2" color="success.main">
                      ✅ Test successful! Response time: {testResult.response_time_ms}ms
                    </Typography>
                    <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                      {JSON.stringify(testResult.result, null, 2)}
                    </pre>
                  </Box>
                ) : (
                  <Typography variant="body2" color="error.main">
                    ❌ Test failed: {testResult.error}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Close</Button>
          <Button onClick={handleTestProvider} variant="contained" disabled={testing}>
            {testing ? 'Testing...' : 'Run Test'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminLLM
