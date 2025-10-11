/**
 * Settings Page
 * Comprehensive settings interface with user profile and configuration options
 */

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Avatar, 
  Divider, 
  Chip,
  Tabs,
  Tab,
  Container,
  Card,
  CardContent,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  Person, 
  Email, 
  CalendarToday,
  Security as SecurityIcon,
  Api as ApiIcon,
  Notifications as NotificationsIcon,
  Save as SaveIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import LLMProviderSelector from '../components/settings/LLMProviderSelector';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // User profile state
  const [profile, setProfile] = useState({
    name: user?.name || 'User',
    email: user?.email || '',
    avatar: '',
    bio: 'AI Research Enthusiast',
    company: 'Tech Corp',
    website: 'https://example.com'
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    pushNotifications: false,
    weeklyDigest: true,
    marketingEmails: false,
    securityAlerts: true
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage(`${section} settings saved successfully!`);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage(`Failed to save ${section} settings`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom color="primary">
        ⚙️ Settings
      </Typography>
      <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
        Manage your TrendTap preferences and configuration
      </Typography>

      {saveMessage && (
        <Alert 
          severity={saveMessage.includes('successfully') ? 'success' : 'error'} 
          sx={{ mb: 3 }}
          onClose={() => setSaveMessage(null)}
        >
          {saveMessage}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<Person />} 
            label="Profile" 
            iconPosition="start"
          />
          <Tab 
            icon={<SecurityIcon />} 
            label="Security" 
            iconPosition="start"
          />
          <Tab 
            icon={<ApiIcon />} 
            label="LLM Providers" 
            iconPosition="start"
          />
          <Tab 
            icon={<NotificationsIcon />} 
            label="Notifications" 
            iconPosition="start"
          />
        </Tabs>

        {/* Profile Tab */}
        <TabPanel value={currentTab} index={0}>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          
          {/* Current User Information */}
          {isAuthenticated && user && (
            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1 }} />
                Current User
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    mr: 3,
                    bgcolor: 'primary.main',
                    fontSize: '1.5rem'
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {user.name || 'User'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Email sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={user.role || 'user'} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    {user.isEmailVerified && (
                      <Chip 
                        label="Verified" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <CalendarToday sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">
                  Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                </Typography>
              </Box>
            </Paper>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                    src={profile.avatar}
                  >
                    {profile.name.charAt(0)}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {profile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {profile.email}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    sx={{ mt: 1 }}
                  >
                    Change Avatar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => handleSave('Profile')}
              disabled={saving}
            >
              Save Profile
            </Button>
            <Button variant="outlined">
              Cancel
            </Button>
          </Box>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={currentTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Password & Authentication
                  </Typography>
                  <Button variant="contained" sx={{ mb: 2 }}>
                    Change Password
                  </Button>
                  <br />
                  <Button variant="outlined" sx={{ mb: 2 }}>
                    Enable Two-Factor Authentication
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => handleSave('Security')}
              disabled={saving}
            >
              Save Security Settings
            </Button>
          </Box>
        </TabPanel>

        {/* LLM Providers Tab */}
        <TabPanel value={currentTab} index={2}>
          <LLMProviderSelector />
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Notification Preferences
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Email Notifications
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.emailUpdates}
                          onChange={(e) => setNotifications({ ...notifications, emailUpdates: e.target.checked })}
                        />
                      }
                      label="Email updates"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.weeklyDigest}
                          onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })}
                        />
                      }
                      label="Weekly digest"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.securityAlerts}
                          onChange={(e) => setNotifications({ ...notifications, securityAlerts: e.target.checked })}
                        />
                      }
                      label="Security alerts"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => handleSave('Notifications')}
              disabled={saving}
            >
              Save Notification Settings
            </Button>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Settings;