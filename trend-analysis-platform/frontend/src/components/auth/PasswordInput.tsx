/**
 * Enhanced password input component with strength validation
 */
import React, { useState, forwardRef } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Refresh,
  Security,
} from '@mui/icons-material';
import PasswordStrengthIndicator, { PasswordStrength } from './PasswordStrengthIndicator';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  showStrengthIndicator?: boolean;
  showGenerateButton?: boolean;
  onStrengthChange?: (strength: PasswordStrength) => void;
  className?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled' | 'standard';
}

export const PasswordInput = forwardRef<HTMLDivElement, PasswordInputProps>(
  ({
    value,
    onChange,
    onBlur,
    error = false,
    helperText,
    label = 'Password',
    placeholder = 'Enter your password',
    required = false,
    disabled = false,
    showStrengthIndicator = true,
    showGenerateButton = true,
    onStrengthChange,
    className,
    fullWidth = true,
    size = 'medium',
    variant = 'outlined',
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState<PasswordStrength | null>(null);

    const handleToggleVisibility = () => {
      setShowPassword(!showPassword);
    };

    const handleGeneratePassword = () => {
      // Generate a strong password (in real app, this would call the API)
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 16; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      onChange(password);
    };

    const handleStrengthChange = (newStrength: PasswordStrength) => {
      setStrength(newStrength);
      onStrengthChange?.(newStrength);
    };

    return (
      <Box className={className}>
        <TextField
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          label={label}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          error={error}
          helperText={helperText}
          fullWidth={fullWidth}
          size={size}
          variant={variant}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={showPassword ? 'Hide password' : 'Show password'}>
                  <IconButton
                    onClick={handleToggleVisibility}
                    edge="end"
                    disabled={disabled}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </Tooltip>
                {showGenerateButton && (
                  <Tooltip title="Generate strong password">
                    <IconButton
                      onClick={handleGeneratePassword}
                      edge="end"
                      disabled={disabled}
                      sx={{ ml: 1 }}
                    >
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                )}
              </InputAdornment>
            ),
            startAdornment: (
              <InputAdornment position="start">
                <Security color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* Password strength indicator */}
        {showStrengthIndicator && value && (
          <PasswordStrengthIndicator
            password={value}
            strength={strength}
            onStrengthChange={handleStrengthChange}
            showDetails={true}
            showSuggestions={true}
            showCrackTime={true}
          />
        )}

        {/* Quick actions */}
        {value && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleGeneratePassword}
              disabled={disabled}
            >
              Generate New
            </Button>
            {strength && !strength.is_valid && (
              <Button
                size="small"
                variant="text"
                color="error"
                disabled={disabled}
              >
                Fix Issues
              </Button>
            )}
          </Box>
        )}

        {/* Password requirements summary */}
        {!value && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Password must contain:
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                • At least 8 characters
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • Uppercase and lowercase letters
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • Numbers and special characters
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
