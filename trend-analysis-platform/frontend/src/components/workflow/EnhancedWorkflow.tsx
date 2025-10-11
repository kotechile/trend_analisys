/**
 * Enhanced Workflow Component
 * Main orchestrator for the enhanced research workflow
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  Button,
} from '@mui/material';
import { useEnhancedWorkflow } from '../../contexts/EnhancedWorkflowContext';
import { useCreateWorkflowSession } from '../../hooks/useWorkflow';
import TopicDecompositionStep from './TopicDecompositionStep';
import AffiliateResearchStep from './AffiliateResearchStep';
import TrendAnalysisStep from './TrendAnalysisStep';
import ContentGenerationStep from './ContentGenerationStep';
import KeywordClusteringStep from './KeywordClusteringStep';
import ExternalToolIntegrationStep from './ExternalToolIntegrationStep';
import WorkflowProgressTracker from './WorkflowProgressTracker';
import WorkflowResultsDashboard from './WorkflowResultsDashboard';
import { WorkflowStep } from '../../types/workflow';

const steps = [
  { label: 'Topic Decomposition', key: WorkflowStep.TOPIC_DECOMPOSITION },
  { label: 'Affiliate Research', key: WorkflowStep.AFFILIATE_RESEARCH },
  { label: 'Trend Analysis', key: WorkflowStep.TREND_ANALYSIS },
  { label: 'Content Generation', key: WorkflowStep.CONTENT_GENERATION },
  { label: 'Keyword Clustering', key: WorkflowStep.KEYWORD_CLUSTERING },
  { label: 'External Tools', key: WorkflowStep.EXTERNAL_TOOL_INTEGRATION },
];

const EnhancedWorkflow: React.FC = () => {
  const { state, dispatch } = useEnhancedWorkflow();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const createWorkflowSession = useCreateWorkflowSession();

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  // Initialize workflow session
  useEffect(() => {
    if (!sessionId && !createWorkflowSession.isPending) {
      createWorkflowSession.mutate({
        searchQuery: state.searchQuery || 'Enhanced Research Workflow',
        userId: 'current-user', // This would come from auth context
      }, {
        onSuccess: (data) => {
          setSessionId(data.id);
          dispatch({ type: 'SET_SESSION', payload: data });
        },
        onError: (error) => {
          console.error('Failed to create workflow session:', error);
        },
      });
    }
  }, [sessionId, createWorkflowSession, state.searchQuery, dispatch]);

  const handleNext = () => {
    if (isLastStep) {
      setIsCompleted(true);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
    dispatch({ type: 'RESET_WORKFLOW' });
  };

  const renderCurrentStep = () => {
    const stepProps = {
      onNext: handleNext,
      onBack: handleBack,
      data: {
        ...state,
        sessionId: sessionId || 'temp-session',
      },
      loading: state.isLoading || createWorkflowSession.isPending,
      error: state.error || (createWorkflowSession.isError ? createWorkflowSession.error?.message : null),
    };

    switch (currentStep.key) {
      case WorkflowStep.TOPIC_DECOMPOSITION:
        return <TopicDecompositionStep {...stepProps} />;
      case WorkflowStep.AFFILIATE_RESEARCH:
        return <AffiliateResearchStep {...stepProps} />;
      case WorkflowStep.TREND_ANALYSIS:
        return <TrendAnalysisStep {...stepProps} />;
      case WorkflowStep.CONTENT_GENERATION:
        return <ContentGenerationStep {...stepProps} />;
      case WorkflowStep.KEYWORD_CLUSTERING:
        return <KeywordClusteringStep {...stepProps} />;
      case WorkflowStep.EXTERNAL_TOOL_INTEGRATION:
        return <ExternalToolIntegrationStep {...stepProps} />;
      default:
        return <TopicDecompositionStep {...stepProps} />;
    }
  };

  if (isCompleted) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          🎉 Workflow Complete!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Your enhanced research workflow has been completed successfully. Review your results below.
        </Typography>
        
        <WorkflowResultsDashboard sessionId={sessionId || ''} />
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleReset}
            size="large"
          >
            Start New Workflow
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🚀 Enhanced Research Workflow
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Follow the steps below to complete your research workflow and generate comprehensive content ideas.
      </Typography>

      {/* Progress Tracker */}
      <WorkflowProgressTracker
        currentStep={currentStep.key}
        completedSteps={state.completedSteps}
        totalSteps={steps.length}
      />

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={currentStepIndex} alternativeLabel>
          {steps.map((step) => (
            <Step key={step.key}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Error Display */}
      {state.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {state.error}
        </Alert>
      )}

      {/* Current Step */}
      <Paper sx={{ minHeight: '60vh' }}>
        {renderCurrentStep()}
      </Paper>
    </Box>
  );
};

export default EnhancedWorkflow;