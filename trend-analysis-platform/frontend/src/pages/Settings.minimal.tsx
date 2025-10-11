import React from 'react'
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Alert
} from '@mui/material'

const SettingsMinimal: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom color="primary">
        ⚙️ Settings (Minimal Test)
      </Typography>
      
      <Alert severity="success" sx={{ mb: 3 }}>
        Settings page is loading correctly!
      </Alert>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🧪 Test Section
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          This is a minimal Settings page to test if the component loads.
        </Typography>
        <Button variant="contained" color="primary">
          Test Button
        </Button>
      </Paper>
      
      <Paper sx={{ p: 3, backgroundColor: '#e3f2fd' }}>
        <Typography variant="h6" gutterBottom color="primary">
          🔧 LLM Management
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          LLM management will be added here once the basic page loads.
        </Typography>
        <Button variant="outlined" color="primary">
          Manage LLM Providers
        </Button>
      </Paper>
    </Container>
  )
}

export default SettingsMinimal


