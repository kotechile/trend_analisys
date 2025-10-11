/**
 * Loading State Management Utilities
 * Centralized loading state management for async operations
 */

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
  error?: string;
}

export interface LoadingConfig {
  showProgress?: boolean;
  progressSteps?: string[];
  timeout?: number;
  retryable?: boolean;
}

/**
 * Loading state manager (for use in React components)
 */
export const createLoadingStateManager = () => {
  let currentState: LoadingState = { isLoading: false };

  const startLoading = (message?: string) => {
    currentState = {
      isLoading: true,
      progress: 0,
      message: message || 'Loading...',
      error: undefined,
    };
  };

  const updateProgress = (progress: number, message?: string) => {
    currentState = {
      ...currentState,
      progress: Math.min(100, Math.max(0, progress)),
      message: message || currentState.message,
    };
  };

  const setError = (error: string) => {
    currentState = {
      isLoading: false,
      error,
    };
  };

  const stopLoading = () => {
    currentState = { isLoading: false };
  };

  const getState = () => currentState;

  return {
    getState,
    startLoading,
    updateProgress,
    setError,
    stopLoading,
  };
};

/**
 * Progress step manager
 */
export const createProgressStepManager = (steps: string[]) => {
  let currentStep = 0;

  const getCurrentStep = () => currentStep;
  const getCurrentStepName = () => steps[currentStep] || '';
  const getProgress = () => (currentStep / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      currentStep++;
    }
  };

  const reset = () => {
    currentStep = 0;
  };

  return {
    getCurrentStep,
    getCurrentStepName,
    getProgress,
    nextStep,
    reset,
  };
};

/**
 * Loading timeout manager
 */
export const createLoadingTimeoutManager = (timeout: number = 30000) => {
  let timeoutId: number | null = null;

  const startTimeout = (onTimeout: () => void) => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(onTimeout, timeout);
  };

  const clearTimeout = () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return {
    startTimeout,
    clearTimeout,
  };
};

/**
 * Retry manager for failed operations
 */
export const createRetryManager = (maxRetries: number = 3, delay: number = 1000) => {
  let retryCount = 0;

  const canRetry = () => retryCount < maxRetries;
  const getRetryCount = () => retryCount;
  const incrementRetry = () => retryCount++;
  const resetRetry = () => retryCount = 0;

  const getRetryDelay = () => delay * Math.pow(2, retryCount); // Exponential backoff

  return {
    canRetry,
    getRetryCount,
    incrementRetry,
    resetRetry,
    getRetryDelay,
  };
};

/**
 * Loading state factory for different operation types
 */
export const createLoadingStates = () => {
  const states = {
    idle: { isLoading: false },
    loading: { isLoading: true, progress: 0, message: 'Loading...' },
    success: { isLoading: false, progress: 100, message: 'Success!' },
    error: { isLoading: false, error: 'An error occurred' },
  };

  return {
    ...states,
    withProgress: (progress: number, message?: string) => ({
      isLoading: true,
      progress,
      message: message || 'Loading...',
    }),
    withError: (error: string) => ({
      isLoading: false,
      error,
    }),
  };
};

/**
 * Workflow step progress manager
 */
export const createWorkflowProgressManager = () => {
  const steps = [
    '🔍 Processing search terms...',
    '🤖 Running AI analysis...',
    '📊 Generating subtopics...',
    '✅ Topic decomposition complete!',
  ];

  const affiliateSteps = [
    '🔍 Querying affiliate databases...',
    '🌐 Searching LinkUp.so...',
    '🤖 AI-powered offer matching...',
    '✅ Affiliate research complete!',
  ];

  const trendSteps = [
    '📈 Analyzing trend data...',
    '🔍 Processing CSV files...',
    '📊 Generating insights...',
    '✅ Trend analysis complete!',
  ];

  const contentSteps = [
    '💡 Generating content ideas...',
    '🎯 Analyzing target audience...',
    '📝 Creating descriptions...',
    '✅ Content generation complete!',
  ];

  const keywordSteps = [
    '🔤 Processing keywords...',
    '🤖 Running clustering algorithm...',
    '📊 Organizing clusters...',
    '✅ Keyword clustering complete!',
  ];

  const externalSteps = [
    '🔗 Connecting to external tools...',
    '📤 Uploading data...',
    '⏳ Processing results...',
    '✅ External integration complete!',
  ];

  const getStepsForWorkflow = (workflowType: string) => {
    switch (workflowType) {
      case 'topic-decomposition':
        return steps;
      case 'affiliate-research':
        return affiliateSteps;
      case 'trend-analysis':
        return trendSteps;
      case 'content-generation':
        return contentSteps;
      case 'keyword-clustering':
        return keywordSteps;
      case 'external-integration':
        return externalSteps;
      default:
        return steps;
    }
  };

  return {
    getStepsForWorkflow,
    steps,
    affiliateSteps,
    trendSteps,
    contentSteps,
    keywordSteps,
    externalSteps,
  };
};