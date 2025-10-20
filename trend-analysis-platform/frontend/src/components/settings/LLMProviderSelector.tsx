import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { settingsService, LLMProviderSettings } from '../../services/settingsService';

const LLMProviderSelector: React.FC = () => {
  const [settings, setSettings] = useState<LLMProviderSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getLLMProviders();
      setSettings(data);
    } catch (error) {
      console.warn('LLM providers endpoint not available, using mock data:', error);
      // Fallback to mock data if API endpoint doesn't exist
      setSettings({
        default_provider: 'openai',
        available_providers: ['openai', 'anthropic', 'google', 'azure_openai']
      });
      setMessage({ type: 'error', text: 'Using default LLM providers (API endpoint not available)' });
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (provider: string) => {
    if (settings) {
      setSettings({ ...settings, default_provider: provider });
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await settingsService.setDefaultLLMProvider(settings);
      setMessage({ type: 'success', text: `Default LLM provider set to ${settings.default_provider}` });
    } catch (error) {
      console.warn('Save failed, storing locally:', error);
      // Fallback to localStorage if API doesn't exist
      localStorage.setItem('llm_provider_settings', JSON.stringify(settings));
      setMessage({ type: 'success', text: `LLM provider saved locally: ${settings.default_provider}` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!settings) {
    return (
      <Alert severity="error">
        Failed to load LLM provider settings
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        LLM Provider Configuration
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose your preferred LLM provider for topic decomposition and analysis.
      </Typography>

      {message && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel>Default LLM Provider</InputLabel>
                <Select
                  value={settings.default_provider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  label="Default LLM Provider"
                >
                  {settings.available_providers.map((provider) => (
                    <MenuItem key={provider} value={provider}>
                      {provider.charAt(0).toUpperCase() + provider.slice(1).replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Providers
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {settings.available_providers.map((provider) => (
                  <Chip
                    key={provider}
                    label={provider.charAt(0).toUpperCase() + provider.slice(1).replace('_', ' ')}
                    color={provider === settings.default_provider ? 'primary' : 'default'}
                    variant={provider === settings.default_provider ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button
          variant="outlined"
          onClick={loadSettings}
          disabled={saving}
        >
          Refresh
        </Button>
      </Box>
    </Box>
  );
};

export default LLMProviderSelector;

