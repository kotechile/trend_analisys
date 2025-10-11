import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  Alert
} from '@mui/material'

const SettingsSimple: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom color="primary">
        ⚙️ Settings
      </Typography>
      <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
        Manage your TrendTap preferences and configuration
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🔧 LLM Provider Management
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Manage your AI language model providers and configurations.
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          LLM Management is being loaded...
        </Alert>
        <Button variant="contained" color="primary">
          Manage LLM Providers
        </Button>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          👤 Profile Settings
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Manage your personal information and account preferences.
        </Typography>
        <Button variant="outlined" sx={{ mr: 2 }}>
          Edit Profile
        </Button>
        <Button variant="outlined">
          Change Password
        </Button>
      </Paper>

      <Paper sx={{ p: 3, backgroundColor: '#e3f2fd' }}>
        <Typography variant="h6" gutterBottom color="primary">
          🔐 Security Settings
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Configure your security preferences and authentication settings.
        </Typography>
        <Button variant="outlined" color="primary">
          Security Options
        </Button>
      </Paper>
    </Container>
  )
}

export default SettingsSimple


