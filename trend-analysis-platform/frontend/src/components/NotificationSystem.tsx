/**
 * Notification System Component
 * Centralized notification management for user actions
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Slide,
  SlideProps,
} from '@mui/material';
import { Close, CheckCircle, Error, Warning, Info } from '@mui/icons-material';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationState {
  notifications: Notification[];
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' };

const NotificationContext = createContext<{
  state: NotificationState;
  dispatch: React.Dispatch<NotificationAction>;
} | null>(null);

const notificationReducer = (
  state: NotificationState,
  action: NotificationAction
): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            ...action.payload,
            id: Date.now().toString(),
          },
        ],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };
    default:
      return state;
  }
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, { notifications: [] });

  return (
    <NotificationContext.Provider value={{ state, dispatch }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const context = useContext(NotificationContext);
  if (!context) return null;

  const { state, dispatch } = context;

  const handleClose = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  return (
    <>
      {state.notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => handleClose(notification.id)}
          index={index}
        />
      ))}
    </>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
  index: number;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClose,
  index,
}) => {
  const { type, title, message, duration = 6000, action } = notification;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <Error />;
      case 'warning':
        return <Warning />;
      case 'info':
        return <Info />;
      default:
        return <Info />;
    }
  };

  const getSeverity = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <Snackbar
      open={true}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={(props: SlideProps) => (
        <Slide {...props} direction="left" />
      )}
      sx={{
        mt: `${index * 80}px`,
        zIndex: 9999,
      }}
    >
      <Alert
        severity={getSeverity() as any}
        icon={getIcon()}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={onClose}
          >
            <Close fontSize="small" />
          </IconButton>
        }
        sx={{ minWidth: 300 }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
        {action && (
          <IconButton
            size="small"
            onClick={action.onClick}
            sx={{ ml: 1 }}
          >
            {action.label}
          </IconButton>
        )}
      </Alert>
    </Snackbar>
  );
};

// Hook for using notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new (Error as any)('useNotifications must be used within a NotificationProvider');
  }

  const { dispatch } = context;

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const showSuccess = (message: string, title?: string, options?: Partial<Notification>) => {
    showNotification({
      type: 'success',
      message,
      title,
      ...options,
    });
  };

  const showError = (message: string, title?: string, options?: Partial<Notification>) => {
    showNotification({
      type: 'error',
      message,
      title,
      duration: 8000, // Errors stay longer
      ...options,
    });
  };

  const showWarning = (message: string, title?: string, options?: Partial<Notification>) => {
    showNotification({
      type: 'warning',
      message,
      title,
      ...options,
    });
  };

  const showInfo = (message: string, title?: string, options?: Partial<Notification>) => {
    showNotification({
      type: 'info',
      message,
      title,
      ...options,
    });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  };

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll,
  };
};

// Workflow-specific notification helpers
export const useWorkflowNotifications = () => {
  const { showSuccess, showError, showWarning } = useNotifications();

  const notifyTopicDecompositionSuccess = (subtopicsCount: number) => {
    showSuccess(
      `Successfully generated ${subtopicsCount} subtopics`,
      'Topic Decomposition Complete'
    );
  };

  const notifyAffiliateResearchSuccess = (offersCount: number) => {
    showSuccess(
      `Found ${offersCount} relevant affiliate offers`,
      'Affiliate Research Complete'
    );
  };

  const notifyTrendAnalysisSuccess = (trendsCount: number) => {
    showSuccess(
      `Analyzed ${trendsCount} trends with opportunity scores`,
      'Trend Analysis Complete'
    );
  };

  const notifyContentGenerationSuccess = (ideasCount: number) => {
    showSuccess(
      `Generated ${ideasCount} content ideas`,
      'Content Generation Complete'
    );
  };

  const notifyKeywordClusteringSuccess = (clustersCount: number) => {
    showSuccess(
      `Organized keywords into ${clustersCount} clusters`,
      'Keyword Clustering Complete'
    );
  };

  const notifyExternalToolSuccess = (keywordsCount: number) => {
    showSuccess(
      `Processed ${keywordsCount} keywords from external tool`,
      'External Tool Integration Complete'
    );
  };

  const notifyWorkflowComplete = () => {
    showSuccess(
      'Your enhanced research workflow is complete! Review your results below.',
      'Workflow Complete',
      { duration: 10000 }
    );
  };

  const notifyWorkflowError = (step: string, error: string) => {
    showError(
      `Failed to complete ${step}: ${error}`,
      'Workflow Error',
      { duration: 10000 }
    );
  };

  const notifyValidationError = (message: string) => {
    showWarning(message, 'Validation Error');
  };

  const notifyApiError = (operation: string, error: string) => {
    showError(
      `Failed to ${operation}: ${error}`,
      'API Error'
    );
  };

  return {
    notifyTopicDecompositionSuccess,
    notifyAffiliateResearchSuccess,
    notifyTrendAnalysisSuccess,
    notifyContentGenerationSuccess,
    notifyKeywordClusteringSuccess,
    notifyExternalToolSuccess,
    notifyWorkflowComplete,
    notifyWorkflowError,
    notifyValidationError,
    notifyApiError,
  };
};
