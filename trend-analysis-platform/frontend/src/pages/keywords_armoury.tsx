/**
 * Keywords Armoury Page Component - DataForSEO Version
 * Enhanced keyword research with DataForSEO integration
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import IdeaBurstDataForSEO from './IdeaBurstDataForSEO';

export const KeywordsArmoury: React.FC = () => {
  const location = useLocation();
  const navigationState = location.state as { 
    selectedTopicId?: string; 
    selectedTopicTitle?: string; 
    selectedSubtopics?: string[] 
  } | null;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <IdeaBurstDataForSEO 
        selectedTopicId={navigationState?.selectedTopicId}
        selectedTopicTitle={navigationState?.selectedTopicTitle}
        selectedSubtopics={navigationState?.selectedSubtopics}
      />
    </Box>
  );
};

