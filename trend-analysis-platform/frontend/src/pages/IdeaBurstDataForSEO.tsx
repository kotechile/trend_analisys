/**
 * IdeaBurstDataForSEO - Enhanced keyword research page with DataForSEO integration
 * 
 * This page provides intelligent keyword research with commercial intent prioritization
 * powered by DataForSEO APIs while preserving all existing functionality.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link
} from '@mui/material';
import {
  Search,
  FilterList,
  Refresh,
  Star,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  ExpandMore,
  ExpandLess,
  AttachMoney,
  Speed,
  Visibility,
  People,
  Settings,
  Lightbulb
} from '@mui/icons-material';
import { keywordService } from '../services/keywordService';
import { supabase } from '../lib/supabase';

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
      id={`keyword-tabpanel-${index}`}
      aria-labelledby={`keyword-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Helper function to get trend icon and color
const getTrendIcon = (trend: number | null) => {
  if (trend === null || trend === undefined) return <TrendingFlat sx={{ color: 'text.secondary' }} />;
  if (trend > 0) return <TrendingUp sx={{ color: 'success.main' }} />;
  if (trend < 0) return <TrendingDown sx={{ color: 'error.main' }} />;
  return <TrendingFlat sx={{ color: 'text.secondary' }} />;
};

// Helper function to get difficulty color
const getDifficultyColor = (difficulty: number | null) => {
  if (difficulty === null || difficulty === undefined) return 'text.secondary';
  if (difficulty <= 30) return 'success.main';
  if (difficulty <= 60) return 'warning.main';
  return 'error.main';
};

// Helper function to get intent color
const getIntentColor = (intent: string | null) => {
  switch (intent?.toLowerCase()) {
    case 'commercial': return '#e3f2fd';
    case 'transactional': return '#f3e5f5';
    case 'informational': return '#f1f8e9';
    case 'navigational': return '#fff3e0';
    default: return '#f5f5f5';
  }
};

// Helper function to get intent text color
const getIntentTextColor = (intent: string | null) => {
  switch (intent?.toLowerCase()) {
    case 'commercial': return '#1565c0';
    case 'transactional': return '#7b1fa2';
    case 'informational': return '#388e3c';
    case 'navigational': return '#ef6c00';
    default: return '#666';
  }
};

// Helper function to format numbers
const formatNumber = (num: number | null) => {
  if (num === null || num === undefined) return 'N/A';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

// Enhanced Keyword Row Component
interface EnhancedKeywordRowProps {
  keyword: any;
  index: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const EnhancedKeywordRow: React.FC<EnhancedKeywordRowProps> = ({ 
  keyword, 
  index, 
  isExpanded, 
  onToggleExpanded 
}) => {
  const keywordText = keyword.keyword || (typeof keyword === 'string' ? keyword : 'Unknown keyword');
  const hasRelatedKeywords = keyword.related_keywords && keyword.related_keywords.length > 0;
  
  return (
    <>
      <tr 
        key={index} 
        style={{ 
          backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
          cursor: 'pointer'
        }}
        onClick={onToggleExpanded}
      >
        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
            <Box>
              <strong>{keywordText}</strong>
              {hasRelatedKeywords && (
                <div style={{ fontSize: '0.8em', color: '#666', marginTop: '2px' }}>
                  Related: {keyword.related_keywords.slice(0, 3).join(', ')}
                  {keyword.related_keywords.length > 3 && ` +${keyword.related_keywords.length - 3} more`}
                </div>
              )}
            </Box>
          </Box>
        </td>
        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
            {formatNumber(keyword.search_volume)}
          </Box>
        </td>
        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Speed sx={{ fontSize: 16, color: getDifficultyColor(keyword.difficulty) }} />
            <span style={{ color: getDifficultyColor(keyword.difficulty), fontWeight: 'bold' }}>
              {keyword.difficulty !== null && keyword.difficulty !== undefined ? keyword.difficulty : 'N/A'}
            </span>
          </Box>
        </td>
        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AttachMoney sx={{ fontSize: 16, color: 'text.secondary' }} />
            {keyword.cpc ? `$${keyword.cpc.toFixed(2)}` : 'N/A'}
          </Box>
        </td>
        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
          <Chip
            label={keyword.competition_level || 'UNKNOWN'}
            size="small"
            sx={{
              backgroundColor: keyword.competition_level === 'HIGH' ? '#ffebee' : 
                             keyword.competition_level === 'MEDIUM' ? '#fff3e0' : '#e8f5e8',
              color: keyword.competition_level === 'HIGH' ? '#c62828' : 
                     keyword.competition_level === 'MEDIUM' ? '#ef6c00' : '#2e7d32',
              fontWeight: 'bold'
            }}
          />
        </td>
        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
          <Chip
            label={keyword.main_intent || 'N/A'}
            size="small"
            sx={{
              backgroundColor: getIntentColor(keyword.main_intent),
              color: getIntentTextColor(keyword.main_intent),
              fontWeight: 'bold'
            }}
          />
        </td>
        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
          <Chip
            label={keyword.source || 'unknown'}
            size="small"
            sx={{
              backgroundColor: keyword.source === 'keyword_ideas' ? '#e8f5e8' : '#fff3e0',
              color: keyword.source === 'keyword_ideas' ? '#2e7d32' : '#ef6c00',
              fontWeight: 'bold'
            }}
          />
        </td>
        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>
          {keyword.priority_score ? keyword.priority_score.toFixed(1) : 'N/A'}
        </td>
      </tr>
      
      {/* Expanded Row with Comprehensive Data */}
      {isExpanded && (
        <tr style={{ backgroundColor: '#f8f9fa' }}>
          <td colSpan={8} style={{ padding: '16px', border: '1px solid #ddd' }}>
            <Accordion>
              {/* Search Metrics Section */}
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  <TrendingUp sx={{ fontSize: 16, mr: 1 }} />
                  Search Metrics
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Search Volume Trends</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getTrendIcon(keyword.monthly_trend)}
                        <Typography variant="body2">Monthly: {keyword.monthly_trend || 0}%</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getTrendIcon(keyword.quarterly_trend)}
                        <Typography variant="body2">Quarterly: {keyword.quarterly_trend || 0}%</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getTrendIcon(keyword.yearly_trend)}
                        <Typography variant="body2">Yearly: {keyword.yearly_trend || 0}%</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Bid Information</Typography>
                    <Typography variant="body2">
                      Low: {keyword.low_top_of_page_bid ? `$${keyword.low_top_of_page_bid.toFixed(2)}` : 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      High: {keyword.high_top_of_page_bid ? `$${keyword.high_top_of_page_bid.toFixed(2)}` : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Categories</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {keyword.categories && keyword.categories.length > 0 ? 
                        keyword.categories.map((cat: string, idx: number) => (
                          <Chip key={idx} label={cat} size="small" variant="outlined" />
                        )) : 
                        <Typography variant="body2" color="text.secondary">No categories</Typography>
                      }
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Language Info</Typography>
                    <Typography variant="body2">
                      Detected: {keyword.detected_language || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Different from requested: {keyword.is_another_language ? 'Yes' : 'No'}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>

              {/* SERP Analysis Section */}
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  <Search sx={{ fontSize: 16, mr: 1 }} />
                  SERP Analysis
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>SERP Information</Typography>
                    <Typography variant="body2">
                      Results Count: {keyword.se_results_count || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Last Updated: {keyword.serp_last_updated_time || 'N/A'}
                    </Typography>
                    {keyword.serp_check_url && (
                      <Typography variant="body2">
                        <Link href={keyword.serp_check_url} target="_blank" rel="noopener">
                          View SERP Results
                        </Link>
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>SERP Item Types</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {keyword.serp_item_types && keyword.serp_item_types.length > 0 ? 
                        keyword.serp_item_types.map((type: string, idx: number) => (
                          <Chip key={idx} label={type} size="small" variant="outlined" />
                        )) : 
                        <Typography variant="body2" color="text.secondary">No SERP data</Typography>
                      }
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>

              {/* Backlink Data Section */}
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  <Link sx={{ fontSize: 16, mr: 1 }} />
                  Backlink Data
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Backlink Metrics</Typography>
                    <Typography variant="body2">
                      Avg Backlinks: {formatNumber(keyword.avg_backlinks)}
                    </Typography>
                    <Typography variant="body2">
                      Dofollow Links: {formatNumber(keyword.avg_dofollow)}
                    </Typography>
                    <Typography variant="body2">
                      Referring Pages: {formatNumber(keyword.avg_referring_pages)}
                    </Typography>
                    <Typography variant="body2">
                      Referring Domains: {formatNumber(keyword.avg_referring_domains)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Ranking Metrics</Typography>
                    <Typography variant="body2">
                      Avg Rank: {keyword.avg_rank || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Main Domain Rank: {keyword.avg_main_domain_rank || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Referring Main Domains: {formatNumber(keyword.avg_referring_main_domains)}
                    </Typography>
                    <Typography variant="body2">
                      Last Updated: {keyword.backlinks_last_updated_time || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>

              {/* Clickstream Data Section */}
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  <People sx={{ fontSize: 16, mr: 1 }} />
                  Clickstream Data
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>Search Volume</Typography>
                    <Typography variant="body2">
                      Clickstream Volume: {formatNumber(keyword.clickstream_search_volume)}
                    </Typography>
                    <Typography variant="body2">
                      Last Updated: {keyword.clickstream_last_updated_time || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>Gender Distribution</Typography>
                    {keyword.clickstream_gender_distribution ? (
                      <Box>
                        <Typography variant="body2">
                          Male: {keyword.clickstream_gender_distribution.male || 0}%
                        </Typography>
                        <Typography variant="body2">
                          Female: {keyword.clickstream_gender_distribution.female || 0}%
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No gender data</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>Age Distribution</Typography>
                    {keyword.clickstream_age_distribution ? (
                      <Box>
                        {Object.entries(keyword.clickstream_age_distribution).map(([age, count]) => (
                          <Typography key={age} variant="body2">
                            {age}: {count as number}%
                          </Typography>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No age data</Typography>
                    )}
                  </Grid>
                </Grid>
              </AccordionDetails>

              {/* Advanced Section */}
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  <Settings sx={{ fontSize: 16, mr: 1 }} />
                  Advanced Data
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Keyword Properties</Typography>
                    <Typography variant="body2">
                      Core Keyword: {keyword.core_keyword || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Clustering Algorithm: {keyword.synonym_clustering_algorithm || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Foreign Intent: {keyword.foreign_intent && keyword.foreign_intent.length > 0 ? 
                        keyword.foreign_intent.join(', ') : 'None'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Normalized Data</Typography>
                    <Typography variant="body2">
                      Bing Normalized: {keyword.normalized_bing_search_volume || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Clickstream Normalized: {keyword.normalized_clickstream_search_volume || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Depth: {keyword.depth || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </td>
        </tr>
      )}
    </>
  );
};

interface IdeaBurstDataForSEOProps {
  className?: string;
  selectedTopicId?: string;
  selectedTopicTitle?: string;
  selectedSubtopics?: string[];
}

const IdeaBurstDataForSEO: React.FC<IdeaBurstDataForSEOProps> = ({ 
  className, 
  selectedTopicId, 
  selectedTopicTitle, 
  selectedSubtopics 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Authentication guard
  console.log('🔐 Auth state check - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'user:', user);
  
  if (isLoading) {
    console.log('🔐 Auth guard - showing loading screen');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('🔐 Auth guard - not authenticated, showing login message');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography color="error">Please log in to access keyword research functionality.</Typography>
      </Box>
    );
  }

  console.log('🔐 Auth guard - authenticated, rendering component');
  
  // State management
  const [seedKeywords, setSeedKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState<string>('');
  const [maxDifficulty, setMaxDifficulty] = useState<number>(50);
  const [minVolume, setMinVolume] = useState<number>(100);
  const [intentTypes, setIntentTypes] = useState<string[]>(['COMMERCIAL', 'TRANSACTIONAL']);
  const [allKeywords, setAllKeywords] = useState<any[]>([]); // Store all keywords without filtering
  const [maxResults, setMaxResults] = useState<number>(100);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showPrioritization, setShowPrioritization] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState<number>(0);
  
  // Research topics state
  const [researchTopics, setResearchTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [topicsLoading, setTopicsLoading] = useState<boolean>(false);
  const [topicsError, setTopicsError] = useState<string | null>(null);
  
  // LLM keyword generation state
  const [isGeneratingLLMKeywords, setIsGeneratingLLMKeywords] = useState<boolean>(false);
  const [llmKeywordError, setLlmKeywordError] = useState<string | null>(null);
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [newSubtopic, setNewSubtopic] = useState<string>('');

  // Simplified state for keyword management
  const [keywords, setKeywords] = useState<any[]>([]);
  const [prioritizedKeywords, setPrioritizedKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Helper function to toggle expanded rows
  const toggleExpandedRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  // Helper function to get filtered keywords for different tabs
  const getFilteredKeywords = (tabIndex: number) => {
    if (!keywords || keywords.length === 0) return [];
    
    switch (tabIndex) {
      case 1: // Prioritized
        return prioritizedKeywords || [];
      case 2: // High Volume
        return keywords
          .filter(k => k.search_volume && k.search_volume >= 10000)
          .sort((a, b) => (b.search_volume || 0) - (a.search_volume || 0));
      case 3: // Low Difficulty
        return keywords
          .filter(k => k.difficulty && k.difficulty <= 30)
          .sort((a, b) => (a.difficulty || 100) - (b.difficulty || 100));
      default:
        return keywords;
    }
  };

  // Reusable Enhanced Table Component
  const EnhancedKeywordTable: React.FC<{ keywords: any[], title: string }> = ({ keywords, title }) => {
    if (!keywords || keywords.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Search sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Keywords Found
          </Typography>
          <Typography color="text.secondary">
            No keywords match the current filter criteria
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {title} ({keywords.length})
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Search sx={{ fontSize: 16 }} />
                    Keyword
                  </Box>
                </th>
                <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                    <Visibility sx={{ fontSize: 16 }} />
                    Search Volume
                  </Box>
                </th>
                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                    <Speed sx={{ fontSize: 16 }} />
                    Difficulty
                  </Box>
                </th>
                <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                    <AttachMoney sx={{ fontSize: 16 }} />
                    CPC
                  </Box>
                </th>
                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>Competition</th>
                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>Intent</th>
                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>Source</th>
                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>Priority</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((keyword, index) => (
                <EnhancedKeywordRow
                  key={index}
                  keyword={keyword}
                  index={index}
                  isExpanded={expandedRows.has(index)}
                  onToggleExpanded={() => toggleExpandedRow(index)}
                />
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    );
  };

  // Intent type options
  const intentTypeOptions = [
    { value: 'INFORMATIONAL', label: 'Informational' },
    { value: 'NAVIGATIONAL', label: 'Navigational' },
    { value: 'COMMERCIAL', label: 'Commercial' },
    { value: 'TRANSACTIONAL', label: 'Transactional' }
  ];

  // Initialize subtopics from navigation state
  useEffect(() => {
    if (selectedSubtopics && selectedSubtopics.length > 0) {
      setSubtopics(selectedSubtopics);
    }
  }, [selectedSubtopics]);

  // Update selected topic from navigation state
  useEffect(() => {
    if (selectedTopicTitle) {
      setSelectedTopic(selectedTopicTitle);
    }
  }, [selectedTopicTitle]);

  // Load research topics on component mount
  useEffect(() => {
    loadResearchTopics();
  }, []);

  // Handle pre-selected topic
  useEffect(() => {
    if (selectedTopicId && researchTopics.length > 0) {
      const topic = researchTopics.find(t => t.id === selectedTopicId);
      if (topic) {
        setSelectedTopic(topic);
        if (selectedSubtopics && selectedSubtopics.length > 0) {
          setSubtopics(selectedSubtopics);
        } else {
          loadSubtopicsForTopic(topic);
        }
        // Load existing keywords for the selected topic
        loadExistingKeywords(selectedTopicId);
      } else {
        // If the selectedTopicId doesn't match any loaded topics, clear the selection
        console.warn(`Selected topic ID ${selectedTopicId} not found in loaded topics`);
        setSelectedTopic(null);
      }
    }
  }, [selectedTopicId, researchTopics, selectedSubtopics]);

  // Load keywords when selectedTopic changes
  useEffect(() => {
    if (selectedTopic?.id && user?.id) {
      console.log('useEffect triggered - selectedTopicId:', selectedTopic.id, 'user?.id:', user?.id);
      loadExistingKeywords(selectedTopic.id);
    }
  }, [selectedTopic?.id, user?.id]);

  // Load research topics from API
  const loadResearchTopics = async () => {
    try {
      setTopicsLoading(true);
      setTopicsError(null);
      
      const { supabaseResearchTopicsService } = await import('../services/supabaseResearchTopicsService');
      const response = await supabaseResearchTopicsService.listResearchTopics();
      
      // Handle the response format - it might be wrapped in an object
      const topics = Array.isArray(response) ? response : (response?.items || []);
      setResearchTopics(topics);
      
      console.log('Loaded research topics:', topics);
    } catch (error) {
      console.error('Failed to load research topics:', error);
      setTopicsError('Failed to load research topics. Please try again.');
    } finally {
      setTopicsLoading(false);
    }
  };

  // Handle topic selection
  const handleTopicChange = async (topicId: string) => {
    const topic = researchTopics.find(t => t.id === topicId);
    if (topic) {
      // Clear existing keyword data when topic changes
      console.log('Topic changed, clearing keyword data and loading existing keywords');
      setKeywords([]);
      setPrioritizedKeywords([]);
      setSeedKeywords([]);
      setError(null);
      
      setSelectedTopic(topic);
      await loadSubtopicsForTopic(topic);
      
      // Load existing keywords for this topic
      await loadExistingKeywords(topicId);
    }
  };

  // Load subtopics for a specific topic
  const loadSubtopicsForTopic = async (topic: any) => {
    try {
      if (!user?.id) {
        console.log('No user ID available, using topic title only');
        setSubtopics([topic.title]);
        return;
      }
      
      console.log('Loading subtopics for topic:', topic.title, 'ID:', topic.id);
      
      // Query Supabase directly for subtopics
      const { data, error } = await supabase
        .from('topic_decompositions')
        .select('subtopics, research_topic_id, user_id, created_at')
        .eq('research_topic_id', topic.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching subtopics from Supabase:', error);
        setSubtopics([topic.title]);
        return;
      }

      if (data && data.length > 0) {
        const existingSubtopics = data[0].subtopics || [];
        if (existingSubtopics.length > 0) {
          const allSubtopics = [topic.title, ...existingSubtopics];
          setSubtopics(allSubtopics);
          console.log('Loaded subtopics from database:', allSubtopics);
        } else {
          setSubtopics([topic.title]);
        }
      } else {
        setSubtopics([topic.title]);
      }
    } catch (error) {
      console.error('Failed to load subtopics:', error);
      setSubtopics([topic.title]);
    }
  };

  // Load existing keywords from Supabase for a topic
  const loadExistingKeywords = async (topicId: string) => {
    try {
      if (!user?.id) {
        console.log('No user ID available, cannot load keywords');
        return;
      }

      console.log('Loading existing keywords for topic:', topicId);
      
      // Query Supabase for existing keyword research data
      const { data, error } = await supabase
        .from('keyword_research_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching keywords from Supabase:', error);
        return;
      }

      if (data && data.length > 0) {
        console.log(`Loaded ${data.length} existing keywords from database`);
        
        // Process the keywords and set them with ALL fields from database
        const processedKeywords = data.map(item => ({
          keyword: item.keyword,
          search_volume: item.search_volume ?? 0,
          keyword_difficulty: item.keyword_difficulty ?? item.difficulty ?? 0,
          cpc: item.cpc ?? 0,
          competition: item.competition ?? item.competition_value ?? 0,
          competition_level: item.competition_level ?? 'UNKNOWN',
          difficulty: item.difficulty ?? item.keyword_difficulty ?? 0,
          low_top_of_page_bid: item.low_top_of_page_bid,
          high_top_of_page_bid: item.high_top_of_page_bid,
          main_intent: item.main_intent,
          intent_type: item.intent_type ?? item.main_intent ?? 'INFORMATIONAL',
          priority_score: item.priority_score ?? 0,
          monthly_trend: item.monthly_trend ?? {},
          quarterly_trend: item.quarterly_trend ?? {},
          yearly_trend: item.yearly_trend ?? {},
          avg_backlinks: item.avg_backlinks,
          avg_referring_domains: item.avg_referring_domains,
          last_updated_time: item.last_updated_time,
          source: item.source ?? 'unknown',
          seed_keywords: item.seed_keywords ?? [],
          related_keyword: item.related_keyword,
          seed_keyword: item.seed_keyword,
          related_keywords: item.related_keywords ?? [],
          created_at: item.created_at,
          // Additional fields that might be useful
          core_keyword: item.core_keyword,
          detected_language: item.detected_language,
          is_another_language: item.is_another_language ?? false,
          foreign_intent: item.foreign_intent ?? [],
          search_intent_last_updated_time: item.search_intent_last_updated_time,
          clickstream_search_volume: item.clickstream_search_volume,
          clickstream_gender_distribution: item.clickstream_gender_distribution ?? {},
          clickstream_age_distribution: item.clickstream_age_distribution ?? {},
          serp_item_types: item.serp_item_types ?? [],
          categories: item.categories ?? [],
          depth: item.depth ?? 1
        }));

        setKeywords(processedKeywords);
        
        // Calculate priority scores for the loaded keywords
        const prioritized = processedKeywords
          .map(keyword => ({
            ...keyword,
            priority_score: calculatePriorityScore(keyword)
          }))
          .sort((a, b) => b.priority_score - a.priority_score);
        
        setPrioritizedKeywords(prioritized);
      } else {
        console.log('No existing keywords found for this topic');
        // Clear keywords if none found
        setKeywords([]);
        setPrioritizedKeywords([]);
      }
    } catch (error) {
      console.error('Failed to load existing keywords:', error);
      // Clear keywords on error
      setKeywords([]);
      setPrioritizedKeywords([]);
    }
  };

  // Event handlers
  const handleAddKeyword = () => {
    if (newKeyword.trim() && !seedKeywords.includes(newKeyword.trim())) {
      setSeedKeywords(prev => [...prev, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setSeedKeywords(prev => prev.filter(k => k !== keyword));
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddKeyword();
    }
  };

  const handleResearchKeywords = async () => {
    if (seedKeywords.length === 0) return;
    
    try {
      setLoading(true);
      console.log('Researching keywords with DataForSEO services:', seedKeywords);
      
      // Call DataForSEO services for each seed keyword with depth parameter
      const keywordPromises = seedKeywords.map(async (keyword) => {
        const [keywordIdeasResponse, relatedKeywordsResponse] = await Promise.all([
          // Call keyword research service for single keyword
          fetch('http://localhost:8000/api/v1/keyword-research/keyword-ideas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              seed_keywords: [keyword],
              location_code: 2840, // United States
              language_code: "en",
              limit: Math.ceil(maxResults / seedKeywords.length)
            }),
          }),
          
          // Call related keywords service for single keyword
          fetch('http://localhost:8000/api/v1/keyword-research/related-keywords', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              keywords: [keyword],
              location_code: 2840, // United States
              language_code: "en",
              depth: 2,
              limit: Math.max(3, Math.ceil(50 / seedKeywords.length)) // Increased from 10 to 50, minimum 3 per keyword
            }),
          })
        ]);
        
        return { keyword, keywordIdeasResponse, relatedKeywordsResponse };
      });
      
      // Wait for all keyword research to complete
      const keywordResults = await Promise.all(keywordPromises);
      
      // Process results from all keywords
      let allKeywordIdeas = [];
      let allRelatedKeywords = [];
      
      for (const result of keywordResults) {
        const { keyword, keywordIdeasResponse, relatedKeywordsResponse } = result;
        
        // Check if both requests were successful
        if (!keywordIdeasResponse.ok) {
          console.warn(`Keyword ideas API error for "${keyword}": ${keywordIdeasResponse.status}`);
          continue;
        }
        if (!relatedKeywordsResponse.ok) {
          console.warn(`Related keywords API error for "${keyword}": ${relatedKeywordsResponse.status}`);
          continue;
        }

        // Parse responses
        const keywordIdeasData = await keywordIdeasResponse.json();
        const relatedKeywordsData = await relatedKeywordsResponse.json();
        
        // Add keywords to combined results
        if (keywordIdeasData && Array.isArray(keywordIdeasData)) {
          allKeywordIdeas.push(...keywordIdeasData);
        }
        if (relatedKeywordsData && Array.isArray(relatedKeywordsData)) {
          allRelatedKeywords.push(...relatedKeywordsData);
        } else if (relatedKeywordsData && relatedKeywordsData.related_keywords && Array.isArray(relatedKeywordsData.related_keywords)) {
          allRelatedKeywords.push(...relatedKeywordsData.related_keywords);
        }
      }
      
      console.log('DataForSEO keyword ideas results:', allKeywordIdeas);
      console.log('DataForSEO related keywords results:', allRelatedKeywords);
      
      // Debug first keyword idea
      if (allKeywordIdeas.length > 0) {
        console.log('DEBUG - First keyword idea:', {
          keyword: allKeywordIdeas[0].keyword,
          difficulty: allKeywordIdeas[0].difficulty,
          keyword_difficulty: allKeywordIdeas[0].keyword_difficulty,
          search_volume: allKeywordIdeas[0].search_volume,
          cpc: allKeywordIdeas[0].cpc
        });
      }
      
      // Combine and process the data
      const keywordData = processKeywordData(allKeywordIdeas, allRelatedKeywords);
      
      console.log(`Received ${keywordData.length} keywords from backend`);
      
      // Store all keywords without filtering
      setAllKeywords(keywordData);
      
      // Apply client-side intent filtering
      const filteredKeywords = applyIntentFilter(keywordData, intentTypes);
      
      console.log(`Filtered to ${filteredKeywords.length} keywords matching intent types: ${intentTypes}`);
      
      // Store in Supabase
      await storeKeywordDataInSupabase(filteredKeywords);
      
      // Update the keywords state with the filtered results
      console.log('Setting keywords state with:', filteredKeywords.length, 'keywords');
      setKeywords(filteredKeywords);
      
      // Also update prioritized keywords for the table display
      setPrioritizedKeywords(filteredKeywords);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching keywords:', err);
      setError(err instanceof Error ? err.message : 'Failed to research keywords');
      setLoading(false);
    }
  };

  // Apply intent type filtering to keywords
  const applyIntentFilter = (keywords: any[], intentTypes: string[]) => {
    if (!intentTypes || intentTypes.length === 0) {
      return keywords;
    }
    
    return keywords.filter(keyword => {
      const keywordIntent = keyword.intent_type || keyword.main_intent || 'INFORMATIONAL';
      return intentTypes.includes(keywordIntent);
    });
  };

  // Process and combine keyword data from both services
  const processKeywordData = (keywordIdeas: any[], relatedKeywords: any[]) => {
    const processedKeywords: any[] = [];
    
    // Process keyword ideas data
    keywordIdeas.forEach((item, index) => {
      if (index < 3) { // Debug first 3 items
        console.log(`DEBUG processKeywordData item ${index}:`, {
          keyword: item.keyword,
          difficulty: item.difficulty,
          keyword_difficulty: item.keyword_difficulty,
          search_volume: item.search_volume,
          cpc: item.cpc
        });
      }
      
      const difficultyValue = item.keyword_difficulty || item.difficulty || 0;
      
      const processedItem = {
        keyword: item.keyword,
        search_volume: item.search_volume,
        keyword_difficulty: difficultyValue,
        difficulty: difficultyValue, // Add this field for display compatibility
        cpc: item.cpc,
        competition: item.competition,
        competition_level: item.competition_level,
        main_intent: item.main_intent || 'COMMERCIAL',
        intent_type: item.main_intent || 'COMMERCIAL',
        priority_score: calculatePriorityScore({
          search_volume: item.search_volume,
          keyword_difficulty: difficultyValue,
          cpc: item.cpc
        }),
        related_keywords: [],
        created_at: item.created_at,
        source: 'keyword_ideas'
      };
      
      if (index < 3) { // Debug first 3 processed items
        console.log(`DEBUG processed item ${index}:`, {
          keyword: processedItem.keyword,
          difficulty: processedItem.keyword_difficulty,
          search_volume: processedItem.search_volume,
          cpc: processedItem.cpc
        });
      }
      
      processedKeywords.push(processedItem);
    });
    
    // Process related keywords data
    relatedKeywords.forEach(item => {
      // Check if this keyword already exists
      const existingIndex = processedKeywords.findIndex(k => k.keyword === item.related_keyword);
      
      if (existingIndex >= 0) {
        // Add to related keywords of existing item
        if (!processedKeywords[existingIndex].related_keywords) {
          processedKeywords[existingIndex].related_keywords = [];
        }
        processedKeywords[existingIndex].related_keywords.push(item.seed_keyword);
      } else {
        // Create new keyword entry
        const relatedDifficultyValue = item.keyword_difficulty || item.difficulty || 0;
        
        processedKeywords.push({
          keyword: item.related_keyword,
          search_volume: item.search_volume || 0,
          keyword_difficulty: relatedDifficultyValue,
          difficulty: relatedDifficultyValue, // Add this field for display compatibility
          cpc: item.cpc || 0,
          competition: item.competition || 0,
          competition_level: item.competition_level || 'UNKNOWN',
          main_intent: item.main_intent || 'INFORMATIONAL',
          intent_type: item.main_intent || 'INFORMATIONAL',
          priority_score: calculatePriorityScore({
            search_volume: item.search_volume || 0,
            keyword_difficulty: relatedDifficultyValue,
            cpc: item.cpc || 0
          }),
          related_keywords: [item.seed_keyword],
          created_at: item.created_at,
          source: 'related_keywords'
        });
      }
    });
    
    return processedKeywords;
  };

  // Store keyword data in Supabase
  const storeKeywordDataInSupabase = async (keywordData: any[]) => {
    console.log('💾 Store function called - selectedTopic:', selectedTopic, 'user:', user);
    console.log('💾 Auth state in store function - isAuthenticated:', isAuthenticated, 'user?.id:', user?.id);
    
    try {
      if (!selectedTopic?.id) {
        console.warn('No topic selected, cannot store keyword data');
        return;
      }

      if (!user?.id) {
        console.warn('User not authenticated, cannot store keyword data');
        return;
      }

      // Add topic_id and user_id to each keyword
      const keywordsWithTopic = keywordData.map(keyword => ({
        ...keyword,
        topic_id: selectedTopic.id,
        user_id: user?.id
      }));

      console.log('Storing keywords with topic_id:', selectedTopic.id, 'user_id:', user?.id);
      console.log('First keyword sample:', keywordsWithTopic[0]);

      const response = await fetch('http://localhost:8000/api/v1/keyword-research/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(keywordsWithTopic),
      });

      if (!response.ok) {
        console.warn('Failed to store keyword data in Supabase:', response.status);
      } else {
        console.log('Successfully stored keyword data in Supabase for topic:', selectedTopic.id);
      }
    } catch (err) {
      console.warn('Error storing keyword data in Supabase:', err);
    }
  };

  const handlePrioritizeKeywords = async () => {
    if (!keywords || keywords.length === 0) return;
    
    try {
      setLoading(true);
      console.log('Prioritizing keywords:', keywords);
      
      // Simple client-side prioritization based on search volume, difficulty, and CPC
      const prioritized = [...keywords].sort((a, b) => {
        // Calculate priority score for each keyword
        const scoreA = calculatePriorityScore(a);
        const scoreB = calculatePriorityScore(b);
        return scoreB - scoreA; // Higher score = higher priority
      });
      
      console.log('Client-side keyword prioritization results:', prioritized);
      
      // Update the prioritized keywords state
      setPrioritizedKeywords(prioritized);
      setShowPrioritization(true);
      setLoading(false);
    } catch (err) {
      console.error('Error prioritizing keywords:', err);
      setError(err instanceof Error ? err.message : 'Failed to prioritize keywords');
      setLoading(false);
    }
  };

  // Helper function to calculate priority score
  const calculatePriorityScore = (keyword: any) => {
    const searchVolume = keyword.search_volume || 0;
    const difficulty = keyword.keyword_difficulty || keyword.difficulty || 50;
    const cpc = keyword.cpc || 0;
    
    // Higher search volume = higher score
    // Lower difficulty = higher score  
    // Higher CPC = higher score (indicates commercial value)
    const volumeScore = Math.log10(searchVolume + 1) * 10;
    const difficultyScore = (100 - difficulty) * 0.5;
    const cpcScore = cpc * 2;
    
    return volumeScore + difficultyScore + cpcScore;
  };

  const handleGenerateLLMKeywords = async () => {
    if (subtopics.length === 0) {
      setLlmKeywordError('Please add subtopics first');
      return;
    }

    setIsGeneratingLLMKeywords(true);
    setLlmKeywordError(null);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await keywordService.generateKeywordsWithLLM({
        subtopics: subtopics,
        topicTitle: selectedTopic?.title || 'Unknown Topic',
        topicId: selectedTopicId || 'demo-topic-id',
        userId: user.id
      });

      if (response.success && response.keywords.length > 0) {
        // Add LLM-generated keywords to the seed keywords
        const newKeywords = response.keywords.filter(kw => !seedKeywords.includes(kw));
        setSeedKeywords(prev => [...prev, ...newKeywords]);
        
        // Show success message
        console.log(`Added ${newKeywords.length} LLM-generated seed keywords`);
      } else {
        setLlmKeywordError(response.message || 'Failed to generate keywords');
      }
    } catch (err) {
      console.error('Error generating LLM keywords:', err);
      setLlmKeywordError('Failed to generate keywords. Please try again.');
    } finally {
      setIsGeneratingLLMKeywords(false);
    }
  };


  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Auto-research when parameters change (disabled - user must click Research Keywords button)
  // useEffect(() => {
  //   if (seedKeywords.length > 0) {
  //     handleResearchKeywords();
  //   }
  // }, [seedKeywords, maxDifficulty, minVolume, intentTypes, maxResults]);

  return (
    <Container maxWidth="xl" className={className}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Seed Keyword Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Enhanced keyword research with commercial intent prioritization powered by DataForSEO APIs
        </Typography>
      </Box>

      {/* Topic Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Research Topic
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Choose a research topic</InputLabel>
          <Select
            value={selectedTopic?.id || ''}
            onChange={(e) => handleTopicChange(e.target.value)}
            label="Choose a research topic"
            disabled={topicsLoading || !Array.isArray(researchTopics)}
            error={selectedTopic && !researchTopics.find(t => t.id === selectedTopic.id)}
          >
            {topicsLoading ? (
              <MenuItem disabled>Loading topics...</MenuItem>
            ) : Array.isArray(researchTopics) && researchTopics.length > 0 ? (
              researchTopics.map((topic) => (
                <MenuItem key={topic.id} value={topic.id}>
                  {topic.title}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No topics available</MenuItem>
            )}
          </Select>
        </FormControl>
        
        {selectedTopic && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Selected: <strong>{selectedTopic.title}</strong>
            </Typography>
            <Chip
              label={`${subtopics.length} subtopics`}
              color="primary"
              size="small"
            />
          </Box>
        )}
      </Paper>

      {/* Subtopics Display */}
      {selectedTopic && subtopics.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Subtopics ({subtopics.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {subtopics.map((subtopic, index) => (
              <Chip
                key={index}
                label={subtopic}
                color={index === 0 ? "primary" : "default"}
                variant={index === 0 ? "filled" : "outlined"}
                size="small"
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* Topics Error Alert */}
      {topicsError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setTopicsError(null)}>
          {topicsError}
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Subtopics Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Subtopics for LLM Generation
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Enter subtopic (e.g., Solar panels, Energy efficiency)"
            value={newSubtopic}
            onChange={(e) => setNewSubtopic(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                if (newSubtopic.trim() && !subtopics.includes(newSubtopic.trim())) {
                  setSubtopics(prev => [...prev, newSubtopic.trim()]);
                  setNewSubtopic('');
                }
              }
            }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              if (newSubtopic.trim() && !subtopics.includes(newSubtopic.trim())) {
                setSubtopics(prev => [...prev, newSubtopic.trim()]);
                setNewSubtopic('');
              }
            }}
            disabled={!newSubtopic.trim()}
          >
            Add
          </Button>
        </Box>
        
        {/* Subtopics Chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {subtopics.map((subtopic) => (
            <Chip
              key={subtopic}
              label={subtopic}
              onDelete={() => setSubtopics(prev => prev.filter(s => s !== subtopic))}
              color="secondary"
              variant="outlined"
            />
          ))}
        </Box>
        
        {/* LLM Generation Button */}
        <Button
          variant="contained"
          color="primary"
          startIcon={isGeneratingLLMKeywords ? <CircularProgress size={20} /> : <Search />}
          onClick={handleGenerateLLMKeywords}
          disabled={subtopics.length === 0 || isGeneratingLLMKeywords}
          sx={{ mb: 2 }}
        >
          {isGeneratingLLMKeywords ? 'Generating...' : 'Generate Keywords with LLM'}
        </Button>
        
        {llmKeywordError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {llmKeywordError}
          </Alert>
        )}
      </Paper>

      {/* Seed Keywords Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Seed Keywords
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Enter seed keyword"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={handleKeywordKeyPress}
          />
          <Button
            variant="outlined"
            onClick={handleAddKeyword}
            disabled={!newKeyword.trim()}
          >
            Add
          </Button>
        </Box>
        
        {/* Keyword Chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {seedKeywords.map((keyword) => (
            <Chip
              key={keyword}
              label={keyword}
              onDelete={() => handleRemoveKeyword(keyword)}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      </Paper>

      {/* Research Configuration Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Research Configuration
        </Typography>
        
        <Grid container spacing={3}>
          {/* Filters */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                label="Max Difficulty"
                type="number"
                value={maxDifficulty}
                onChange={(e) => setMaxDifficulty(Number(e.target.value))}
                inputProps={{ min: 0, max: 100 }}
                sx={{ width: 120 }}
              />
              
              <TextField
                size="small"
                label="Min Volume"
                type="number"
                value={minVolume}
                onChange={(e) => setMinVolume(Number(e.target.value))}
                inputProps={{ min: 0 }}
                sx={{ width: 120 }}
              />
              
              <TextField
                size="small"
                label="Max Results"
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                inputProps={{ min: 1, max: 1000 }}
                sx={{ width: 120 }}
              />
            </Box>
            
            {/* Intent Types */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Intent Types
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {intentTypeOptions.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    onClick={() => {
                      const newIntentTypes = intentTypes.includes(option.value)
                        ? intentTypes.filter(t => t !== option.value)
                        : [...intentTypes, option.value];
                      
                      setIntentTypes(newIntentTypes);
                      
                      // Apply filtering immediately when intent types change
                      if (allKeywords.length > 0) {
                        const filteredKeywords = applyIntentFilter(allKeywords, newIntentTypes);
                        setKeywords(filteredKeywords);
                        setPrioritizedKeywords(filteredKeywords);
                        console.log(`Filtered to ${filteredKeywords.length} keywords matching intent types: ${newIntentTypes}`);
                      }
                    }}
                    color={intentTypes.includes(option.value) ? 'primary' : 'default'}
                    variant={intentTypes.includes(option.value) ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={handleResearchKeywords}
            disabled={seedKeywords.length === 0 || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Research Keywords'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Star />}
            onClick={handlePrioritizeKeywords}
            disabled={!keywords || keywords.length === 0 || loading}
          >
            Prioritize Keywords
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Advanced Filters
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
          
          {/* Go to Idea Burst Button - only show if we have keywords */}
          {keywords && keywords.length > 0 && selectedTopic?.id && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Lightbulb />}
              onClick={() => navigate('/idea-burst-generation', {
                state: {
                  selectedTopicId: selectedTopic.id,
                  selectedTopicTitle: selectedTopic.title,
                  selectedSubtopics: subtopics
                }
              })}
              sx={{ ml: 'auto' }}
            >
              Go to Idea Burst
            </Button>
          )}
        </Box>
      </Paper>

      {/* Advanced Filters */}
      {showFilters && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Advanced Filters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Filter functionality will be implemented here
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Results Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All Keywords" />
          <Tab label="Prioritized" />
          <Tab label="High Volume" />
          <Tab label="Low Difficulty" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <EnhancedKeywordTable 
            keywords={getFilteredKeywords(0)} 
            title="All Keywords" 
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <EnhancedKeywordTable 
            keywords={getFilteredKeywords(1)} 
            title="Prioritized Keywords" 
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <EnhancedKeywordTable 
            keywords={getFilteredKeywords(2)} 
            title="High Volume Keywords" 
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <EnhancedKeywordTable 
            keywords={getFilteredKeywords(3)} 
            title="Low Difficulty Keywords" 
          />
        </TabPanel>
      </Paper>

      {/* Prioritization Dialog */}
      <Dialog
        open={showPrioritization}
        onClose={() => setShowPrioritization(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Keyword Prioritization Results</DialogTitle>
        <DialogContent>
          {prioritizedKeywords && prioritizedKeywords.length > 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Prioritized Keywords ({prioritizedKeywords.length})
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Rank</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Keyword</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Priority Score</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Search Volume</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Difficulty</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>CPC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prioritizedKeywords.map((keyword, index) => (
                      <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fafafa' : 'white' }}>
                        <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{index + 1}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{keyword.keyword || keyword}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', color: '#1976d2' }}>{keyword.priority_score || calculatePriorityScore(keyword).toFixed(1)}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{keyword.search_volume || 'N/A'}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                          {keyword.keyword_difficulty !== null && keyword.keyword_difficulty !== undefined ? keyword.keyword_difficulty : 
                           keyword.difficulty !== null && keyword.difficulty !== undefined ? keyword.difficulty : 'N/A'}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>${keyword.cpc || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Box>
          ) : (
            <Typography>No prioritized keywords available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPrioritization(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default IdeaBurstDataForSEO;