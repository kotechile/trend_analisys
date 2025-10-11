/**
 * Workflow Results Dashboard Component
 * Displays comprehensive results from the enhanced workflow
 */

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material';
import { Download, Save, Share } from '@mui/icons-material';
import { WorkflowResultsDashboardProps } from '../../types/workflow';

const WorkflowResultsDashboard: React.FC<WorkflowResultsDashboardProps> = ({
  sessionId,
  onExport,
  onSave,
}) => {
  // This would typically fetch data from the API based on sessionId
  // For now, we'll show a placeholder structure

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      // Default export functionality
      console.log('Exporting workflow results...');
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    } else {
      // Default save functionality
      console.log('Saving workflow results...');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          📊 Workflow Results
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
          >
            Export Results
          </Button>
          <Button
            variant="outlined"
            startIcon={<Save />}
            onClick={handleSave}
          >
            Save Session
          </Button>
          <Button
            variant="outlined"
            startIcon={<Share />}
          >
            Share
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Topic Decomposition Results */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🧠 Topic Decomposition
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Generated subtopics from your search query
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Electric cars in California"
                    secondary="Electric vehicle trends and opportunities"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Car dealers"
                    secondary="Automotive dealership opportunities"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Affiliate Research Results */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💰 Affiliate Research
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Found affiliate offers for your topics
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Tesla Affiliate Program" color="primary" variant="outlined" />
                <Chip label="CarMax Partner Program" color="primary" variant="outlined" />
                <Chip label="AutoTrader Affiliate" color="primary" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Trend Analysis Results */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Trend Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Key trends and insights
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Electric cars" color="success" variant="outlined" />
                <Chip label="Rising trend" color="success" variant="outlined" />
                <Chip label="High opportunity" color="success" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Content Ideas Results */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ✍️ Content Ideas
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Generated content ideas
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Best Electric Cars for East Coast Living"
                    secondary="Comprehensive guide to electric vehicles"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Car Buying Guide for Beginners"
                    secondary="Step-by-step car purchasing process"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Keyword Clusters */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🏷️ Keyword Clusters
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Organized keyword groups
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Electric Vehicles (15 keywords)" color="info" variant="outlined" />
                <Chip label="Car Buying (12 keywords)" color="info" variant="outlined" />
                <Chip label="Automotive (8 keywords)" color="info" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* External Tool Results */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔗 External Tools
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enhanced with external data
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Semrush Data" color="secondary" variant="outlined" />
                <Chip label="500+ keywords" color="secondary" variant="outlined" />
                <Chip label="3 clusters" color="secondary" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="h4" color="primary">
                    2
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Subtopics
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="h4" color="primary">
                    3
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Affiliate Offers
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="h4" color="primary">
                    2
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Content Ideas
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="h4" color="primary">
                    35
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Keywords
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkflowResultsDashboard;
