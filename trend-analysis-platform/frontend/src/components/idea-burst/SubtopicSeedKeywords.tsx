import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, Chip, Alert } from '@mui/material';
import { ContentCopy, Search } from '@mui/icons-material';

type GeneratedKeyword = {
  keyword: string;
  intent?: string;
  difficulty?: number;
  search_volume?: number;
  related_keywords?: string[];
  content_angles?: string[];
  category?: string;
};

interface SubtopicSeedKeywordsProps {
  apiBase?: string; // e.g., '' when proxied, or 'http://localhost:8000'
  subtopics?: string[]; // Pre-defined subtopics to generate keywords for
  onKeywordsGenerated?: (keywordsBySubtopic: Record<string, GeneratedKeyword[]>) => void;
  hideKeywordDisplay?: boolean; // Hide the keyword display (for use in main page)
}

const SubtopicSeedKeywords: React.FC<SubtopicSeedKeywordsProps> = ({ apiBase = '', subtopics = [], onKeywordsGenerated, hideKeywordDisplay = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [keywordsBySubtopic, setKeywordsBySubtopic] = useState<Record<string, GeneratedKeyword[]>>({});
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    if (subtopics.length === 0) {
      setError('No subtopics available to generate keywords for.');
      return;
    }
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const results: Record<string, GeneratedKeyword[]> = {};
      for (const sub of subtopics) {
        const resp = await fetch(`${apiBase}/api/keywords/generate-seed-keywords`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            search_term: sub,
            selected_trends: [],
            content_ideas: [],
          }),
        });
        if (!resp.ok) throw new Error(`Failed to generate keywords for ${sub}`);
        const json = await resp.json();
        // Expect data.categorized_keywords: { category: [{ keyword, ... }] }
        const categorized = json?.data?.categorized_keywords || {};
        const flat: GeneratedKeyword[] = Object.values(categorized).flat() as GeneratedKeyword[];
        results[sub] = flat;
      }
      setKeywordsBySubtopic(results);
      setSuccess(`Keywords generated successfully for ${subtopics.length} subtopics!`);
      setHasGenerated(true);
      if (onKeywordsGenerated) {
        onKeywordsGenerated(results);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to generate keywords');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCsv = (subtopic?: string) => {
    const keywords: string[] = [];
    if (subtopic) {
      const kws = keywordsBySubtopic[subtopic] || [];
      keywords.push(...kws.map(k => k.keyword || '').filter(Boolean));
    } else {
      Object.values(keywordsBySubtopic).forEach(kws => {
        keywords.push(...kws.map(k => k.keyword || '').filter(Boolean));
      });
    }
    const csvContent = keywords.join(', ');
    navigator.clipboard.writeText(csvContent).then(() => {
      setSuccess(`Copied ${keywords.length} keywords to clipboard!`);
    }).catch(() => {
      setError('Failed to copy to clipboard');
    });
  };

  // const escapeCsv = (value: string) => {
  //   if (value == null) return '';
  //   const needsQuotes = value.includes(',') || value.includes('"') || value.includes('\n');
  //   if (needsQuotes) {
  //     return '"' + value.replace(/"/g, '""') + '"';
  //   }
  //   return value;
  // };

  // const sanitizeFilename = (name: string) => name.replace(/[^a-z0-9\-_.]+/gi, '_');

  // const downloadCsv = (content: string, filename: string) => {
  //   const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = filename;
  //   a.click();
  //   window.URL.revokeObjectURL(url);
  // };

  return (
    <Box sx={{ mt: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔎 Generate Seed Keywords
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Generate 10+ related seed keywords for each selected subtopic. Keywords will be used to create SEO-optimized content ideas.
          </Typography>

          {subtopics.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Subtopics to generate keywords for:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {subtopics.map((subtopic, index) => (
                  <Chip key={index} label={subtopic} color="primary" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<Search />} 
              onClick={handleGenerate} 
              disabled={isLoading || subtopics.length === 0}
            >
              {isLoading ? 'Generating…' : `Generate Keywords for ${subtopics.length} Subtopics`}
            </Button>
            {hasGenerated && (
              <Button variant="outlined" startIcon={<ContentCopy />} onClick={() => handleCopyCsv()} disabled={!Object.keys(keywordsBySubtopic).length}>
                Copy All as CSV
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Results - only show if not hidden */}
          {!hideKeywordDisplay && Object.keys(keywordsBySubtopic).length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                💡 <strong>Tip:</strong> Copy the keywords to Ahrefs for enhanced SEO data, or proceed to generate ideas with these seed keywords.
              </Alert>
              <Grid container spacing={2}>
                {Object.entries(keywordsBySubtopic).map(([sub, kws]) => (
                  <Grid item xs={12} md={6} key={sub}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{sub}</Typography>
                          <Button size="small" variant="text" startIcon={<ContentCopy />} onClick={() => handleCopyCsv(sub)}>
                            Copy CSV
                          </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxHeight: 220, overflowY: 'auto' }}>
                          {kws.map((k, idx) => (
                            <Chip key={`${sub}-${idx}-${k.keyword}`} label={k.keyword} size="small" />
                          ))}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          {kws.length} keywords
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SubtopicSeedKeywords;


