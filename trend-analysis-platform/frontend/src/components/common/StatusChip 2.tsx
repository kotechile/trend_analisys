/**
 * Status Chip Component
 */

import React from 'react';
import { Chip, ChipProps } from '@mui/material';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: string;
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  variant = 'filled',
  size = 'small',
  ...props
}) => {
  const getStatusColor = (status: string): ChipProps['color'] => {
    const normalizedStatus = status.toLowerCase();
    
    // Success statuses
    if (['completed', 'success', 'active', 'approved', 'healthy', 'connected'].includes(normalizedStatus)) {
      return 'success';
    }
    
    // Warning statuses
    if (['pending', 'processing', 'in_progress', 'warning', 'scheduled', 'planned'].includes(normalizedStatus)) {
      return 'warning';
    }
    
    // Error statuses
    if (['failed', 'error', 'rejected', 'unhealthy', 'disconnected', 'missed'].includes(normalizedStatus)) {
      return 'error';
    }
    
    // Info statuses
    if (['info', 'generated', 'idea', 'archived'].includes(normalizedStatus)) {
      return 'info';
    }
    
    // Default
    return 'default';
  };

  const getStatusLabel = (status: string): string => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Chip
      label={getStatusLabel(status)}
      color={getStatusColor(status)}
      variant={variant}
      size={size}
      {...props}
    />
  );
};
