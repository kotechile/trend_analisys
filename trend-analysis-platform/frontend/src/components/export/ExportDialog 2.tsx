/**
 * Export Dialog Component
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Box,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import { 
  CloudUpload, 
  Description, 
  Code, 
  CalendarToday,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useExport } from '../../hooks/useExport';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  contentType: 'content' | 'software' | 'calendar';
  itemId: string;
  itemTitle: string;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  contentType,
  itemId,
  itemTitle,
}) => {
  const { 
    exportToGoogleDocs, 
    exportToNotion, 
    exportToWordPress,
    exportSoftwareSolution,
    exportCalendarEntries,
    useTemplates,
    usePlatforms,
    isExportingToGoogleDocs,
    isExportingToNotion,
    isExportingToWordPress,
    isExportingSoftwareSolution,
    isExportingCalendarEntries,
  } = useExport();

  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | ''>('');
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [exportResult, setExportResult] = useState<any>(null);

  const { data: platformsData } = usePlatforms();
  const { data: templatesData } = useTemplates(selectedPlatform, contentType);

  const platforms = platformsData?.data || [];
  const templates = templatesData?.data?.templates || [];

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    setSelectedTemplate('');
  };

  const handleTemplateChange = (templateId: number) => {
    setSelectedTemplate(templateId);
  };

  const handleCustomFieldChange = (field: string, value: any) => {
    setCustomFields(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExport = async () => {
    if (!selectedPlatform) return;

    setExportStatus('exporting');

    try {
      let result;

      switch (contentType) {
        case 'content':
          result = selectedPlatform === 'google-docs' 
            ? await exportToGoogleDocs({ data_type: 'content', format: 'google-docs', filters: { content_id: itemId, template_id: selectedTemplate as number, custom_fields: customFields } })
            : selectedPlatform === 'notion'
            ? await exportToNotion({ data_type: 'content', format: 'notion', filters: { content_id: itemId, template_id: selectedTemplate as number, custom_fields: customFields } })
            : await exportToWordPress({ data_type: 'content', format: 'wordpress', filters: { content_id: itemId, template_id: selectedTemplate as number, custom_fields: customFields } });
          break;
        case 'software':
          result = await exportSoftwareSolution(itemId, selectedPlatform, selectedTemplate as number, customFields);
          break;
        case 'calendar':
          result = await exportCalendarEntries(
            customFields.start_date || new Date().toISOString().split('T')[0],
            customFields.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            selectedPlatform,
            selectedTemplate as number
          );
          break;
        default:
          throw new Error('Invalid content type');
      }

      if (result.success) {
        setExportStatus('success');
        setExportResult(result.data);
      } else {
        setExportStatus('error');
      }
    } catch (error) {
      setExportStatus('error');
      console.error('Export failed:', error);
    }
  };

  const handleClose = () => {
    setExportStatus('idle');
    setSelectedPlatform('');
    setSelectedTemplate('');
    setCustomFields({});
    setExportResult(null);
    onClose();
  };

  const getContentTypeIcon = () => {
    switch (contentType) {
      case 'content': return <Description />;
      case 'software': return <Code />;
      case 'calendar': return <CalendarToday />;
      default: return <CloudUpload />;
    }
  };

  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'content': return 'Content';
      case 'software': return 'Software Solution';
      case 'calendar': return 'Calendar Entries';
      default: return 'Item';
    }
  };

  const isExporting = isExportingToGoogleDocs || isExportingToNotion || isExportingToWordPress || 
                     isExportingSoftwareSolution || isExportingCalendarEntries;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {getContentTypeIcon()}
          <Typography variant="h6">
            Export {getContentTypeLabel()}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {itemTitle}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {exportStatus === 'idle' && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Export Platform</InputLabel>
                <Select
                  value={selectedPlatform}
                  onChange={(e) => handlePlatformChange(e.target.value)}
                  label="Export Platform"
                >
                  {platforms.map((platform: any) => (
                    <MenuItem key={platform.value} value={platform.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {platform.icon && <platform.icon />}
                        {platform.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {selectedPlatform && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Template</InputLabel>
                  <Select
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value as number)}
                    label="Template"
                  >
                    {templates.map((template: any) => (
                      <MenuItem key={template.id} value={template.id}>
                        <Box>
                          <Typography variant="body2">{template.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {template.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {contentType === 'calendar' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={customFields.start_date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleCustomFieldChange('start_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}

            {contentType === 'calendar' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={customFields.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  onChange={(e) => handleCustomFieldChange('end_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}

            {selectedTemplate && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Template Preview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {templates.find((t: any) => t.id === selectedTemplate)?.description}
                    </Typography>
                    {templates.find((t: any) => t.id === selectedTemplate)?.fields && (
                      <Box mt={1}>
                        <Typography variant="caption" color="text.secondary">
                          Available fields: {Object.keys(templates.find((t: any) => t.id === selectedTemplate)?.fields || {}).join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}

        {exportStatus === 'exporting' && (
          <Box textAlign="center" py={4}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Exporting to {selectedPlatform}...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we prepare your export.
            </Typography>
            <LinearProgress sx={{ mt: 2 }} />
          </Box>
        )}

        {exportStatus === 'success' && exportResult && (
          <Box textAlign="center" py={4}>
            <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom color="success.main">
              Export Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Your {getContentTypeLabel().toLowerCase()} has been exported to {selectedPlatform}.
            </Typography>
            {exportResult.export_url && (
              <Button
                variant="contained"
                href={exportResult.export_url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 2 }}
              >
                Open in {selectedPlatform}
              </Button>
            )}
          </Box>
        )}

        {exportStatus === 'error' && (
          <Box textAlign="center" py={4}>
            <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom color="error.main">
              Export Failed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There was an error exporting your {getContentTypeLabel().toLowerCase()}. Please try again.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {exportStatus === 'idle' && (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleExport}
              disabled={!selectedPlatform || !selectedTemplate || isExporting}
              startIcon={isExporting ? <CircularProgress size={20} /> : null}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </>
        )}
        {exportStatus === 'success' && (
          <Button onClick={handleClose}>Close</Button>
        )}
        {exportStatus === 'error' && (
          <>
            <Button onClick={handleClose}>Close</Button>
            <Button variant="contained" onClick={() => setExportStatus('idle')}>
              Try Again
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
