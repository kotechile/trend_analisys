/**
 * Settings Page Component
 * User settings and preferences management
 */

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Switch,
  FormControlLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save,
  Refresh,
  Edit,
  Delete,
  Add,
  Security,
  Notifications,
  Palette,
  Language,
  Storage,
  Api,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import LLMProviderSelector from '../components/settings/LLMProviderSelector';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    // General Settings
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    researchComplete: true,
    trendAlerts: true,
    calendarReminders: true,
    
    // API Settings
    googleTrendsApiKey: '',
    dataforseoApiKey: '',
    openaiApiKey: '',
    
    // Export Settings
    defaultExportFormat: 'google-docs',
    autoExport: false,
    exportTemplate: 'default',
    
    // Privacy Settings
    dataRetention: '1year',
    analyticsTracking: true,
    crashReporting: true,
  });

  const { user, isAuthenticated, isLoading } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [updateProfileError, setUpdateProfileError] = useState<Error | null>(null);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsUpdatingProfile(true);
      setUpdateProfileError(null);
      
      // TODO: Implement settings save to backend
      console.log('Saving settings:', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      setUpdateProfileError(error as Error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading settings..." fullHeight />;
  }

  if (!isAuthenticated) {
    return (
      <Alert severity="error">
        Please log in to access settings
      </Alert>
    );
  }

  const tabs = [
    { label: 'General', icon: <Palette /> },
    { label: 'Notifications', icon: <Notifications /> },
    { label: 'LLM Models', icon: <Api /> },
    { label: 'API Keys', icon: <Api /> },
    { label: 'Export', icon: <Storage /> },
    { label: 'Privacy', icon: <Security /> },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSaveSettings}
          disabled={isUpdatingProfile}
        >
          Save Settings
        </Button>
      </Box>

      {updateProfileError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {updateProfileError.message || 'Failed to save settings'}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Settings Navigation */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Settings Categories
              </Typography>
              <List>
                {tabs.map((tab, index) => (
                  <ListItem
                    key={index}
                    button
                    selected={activeTab === index}
                    onClick={() => setActiveTab(index)}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      {tab.icon}
                      <ListItemText primary={tab.label} />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Settings Content */}
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              {/* General Settings */}
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    General Settings
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Theme</InputLabel>
                        <Select
                          value={settings.theme}
                          onChange={(e) => handleSettingChange('theme', e.target.value)}
                          label="Theme"
                        >
                          <MenuItem value="light">Light</MenuItem>
                          <MenuItem value="dark">Dark</MenuItem>
                          <MenuItem value="auto">Auto</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Language</InputLabel>
                        <Select
                          value={settings.language}
                          onChange={(e) => handleSettingChange('language', e.target.value)}
                          label="Language"
                        >
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="es">Spanish</MenuItem>
                          <MenuItem value="fr">French</MenuItem>
                          <MenuItem value="de">German</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Timezone</InputLabel>
                        <Select
                          value={settings.timezone}
                          onChange={(e) => handleSettingChange('timezone', e.target.value)}
                          label="Timezone"
                        >
                          <MenuItem value="UTC">UTC</MenuItem>
                          <MenuItem value="America/New_York">Eastern Time</MenuItem>
                          <MenuItem value="America/Chicago">Central Time</MenuItem>
                          <MenuItem value="America/Denver">Mountain Time</MenuItem>
                          <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Date Format</InputLabel>
                        <Select
                          value={settings.dateFormat}
                          onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                          label="Date Format"
                        >
                          <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                          <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                          <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Notification Settings */}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Notification Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.emailNotifications}
                            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                          />
                        }
                        label="Email Notifications"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.pushNotifications}
                            onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                          />
                        }
                        label="Push Notifications"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.researchComplete}
                            onChange={(e) => handleSettingChange('researchComplete', e.target.checked)}
                          />
                        }
                        label="Research Complete Notifications"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.trendAlerts}
                            onChange={(e) => handleSettingChange('trendAlerts', e.target.checked)}
                          />
                        }
                        label="Trend Alerts"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.calendarReminders}
                            onChange={(e) => handleSettingChange('calendarReminders', e.target.checked)}
                          />
                        }
                        label="Calendar Reminders"
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* LLM Models Settings */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    LLM Model Configuration
                  </Typography>
                  <LLMProviderSelector />
                </Box>
              )}

              {/* API Keys Settings */}
              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    API Keys
                  </Typography>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    API keys are encrypted and stored securely. They are used to integrate with external services.
                  </Alert>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Google Trends API Key"
                        type="password"
                        value={settings.googleTrendsApiKey}
                        onChange={(e) => handleSettingChange('googleTrendsApiKey', e.target.value)}
                        helperText="Required for trend analysis"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="DataForSEO API Key"
                        type="password"
                        value={settings.dataforseoApiKey}
                        onChange={(e) => handleSettingChange('dataforseoApiKey', e.target.value)}
                        helperText="Required for keyword research"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="OpenAI API Key"
                        type="password"
                        value={settings.openaiApiKey}
                        onChange={(e) => handleSettingChange('openaiApiKey', e.target.value)}
                        helperText="Required for content generation"
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Export Settings */}
              {activeTab === 4 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Export Settings
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Default Export Format</InputLabel>
                        <Select
                          value={settings.defaultExportFormat}
                          onChange={(e) => handleSettingChange('defaultExportFormat', e.target.value)}
                          label="Default Export Format"
                        >
                          <MenuItem value="google-docs">Google Docs</MenuItem>
                          <MenuItem value="notion">Notion</MenuItem>
                          <MenuItem value="wordpress">WordPress</MenuItem>
                          <MenuItem value="pdf">PDF</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Export Template</InputLabel>
                        <Select
                          value={settings.exportTemplate}
                          onChange={(e) => handleSettingChange('exportTemplate', e.target.value)}
                          label="Export Template"
                        >
                          <MenuItem value="default">Default</MenuItem>
                          <MenuItem value="minimal">Minimal</MenuItem>
                          <MenuItem value="detailed">Detailed</MenuItem>
                          <MenuItem value="custom">Custom</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.autoExport}
                            onChange={(e) => handleSettingChange('autoExport', e.target.checked)}
                          />
                        }
                        label="Auto-export completed content"
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Privacy Settings */}
              {activeTab === 5 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Privacy Settings
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Data Retention</InputLabel>
                        <Select
                          value={settings.dataRetention}
                          onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                          label="Data Retention"
                        >
                          <MenuItem value="30days">30 Days</MenuItem>
                          <MenuItem value="6months">6 Months</MenuItem>
                          <MenuItem value="1year">1 Year</MenuItem>
                          <MenuItem value="forever">Forever</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.analyticsTracking}
                            onChange={(e) => handleSettingChange('analyticsTracking', e.target.checked)}
                          />
                        }
                        label="Analytics Tracking"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.crashReporting}
                            onChange={(e) => handleSettingChange('crashReporting', e.target.checked)}
                          />
                        }
                        label="Crash Reporting"
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
