/**
 * Password strength indicator component
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Tooltip,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  VisibilityOff,
  Info,
  Warning,
} from '@mui/icons-material';

// Types
export interface PasswordStrength {
  is_valid: boolean;
  strength: 'very_weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';
  score: number;
  feedback: string[];
  suggestions: string[];
  requirements_met: Record<string, boolean>;
  entropy: number;
  crack_time: string;
  crack_time_seconds: number;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  strength?: PasswordStrength;
  showDetails?: boolean;
  showSuggestions?: boolean;
  showCrackTime?: boolean;
  onStrengthChange?: (strength: PasswordStrength) => void;
  className?: string;
}

// Constants
const STRENGTH_COLORS = {
  very_weak: '#ff0000',
  weak: '#ff6600',
  fair: '#ffcc00',
  good: '#99cc00',
  strong: '#66cc00',
  very_strong: '#00cc00',
};

const STRENGTH_LABELS = {
  very_weak: 'Very Weak',
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
  very_strong: 'Very Strong',
};


const REQUIREMENT_LABELS = {
  min_length: 'Minimum length',
  uppercase: 'Uppercase letter',
  lowercase: 'Lowercase letter',
  digits: 'Number',
  special_chars: 'Special character',
  min_special_chars: 'Special character count',
  max_consecutive: 'No consecutive chars',
  max_repeated: 'No repeated chars',
  no_common_passwords: 'Not common password',
};

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  strength,
  showDetails = true,
  showSuggestions = true,
  showCrackTime = true,
  onStrengthChange,
  className,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showDetailsExpanded, setShowDetailsExpanded] = useState(false);
  const [localStrength, setLocalStrength] = useState<PasswordStrength | null>(null);

  // Simulate password strength validation (in real app, this would call the API)
  useEffect(() => {
    if (!password) {
      setLocalStrength(null);
      return;
    }

    // Simple client-side validation (in real app, this would be more sophisticated)
    const requirements = {
      min_length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digits: /\d/.test(password),
      special_chars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      min_special_chars: (password.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length >= 1,
      max_consecutive: !/(.)\1{2,}/.test(password),
      max_repeated: !/(.)\1{2,}/.test(password),
      no_common_passwords: !['password', '123456', 'qwerty', 'abc123'].includes(password.toLowerCase()),
    };

    const score = Object.values(requirements).filter(Boolean).length * 11;
    const strengthLevel = score < 20 ? 'very_weak' : 
                         score < 40 ? 'weak' : 
                         score < 60 ? 'fair' : 
                         score < 80 ? 'good' : 
                         score < 95 ? 'strong' : 'very_strong';

    const mockStrength: PasswordStrength = {
      is_valid: Object.values(requirements).every(Boolean),
      strength: strengthLevel as any,
      score,
      feedback: [],
      suggestions: [],
      requirements_met: requirements,
      entropy: password.length * 4, // Simplified entropy calculation
      crack_time: score < 40 ? 'instant' : score < 60 ? 'seconds' : score < 80 ? 'minutes' : 'hours',
      crack_time_seconds: score < 40 ? 0 : score < 60 ? 1 : score < 80 ? 60 : 3600,
    };

    setLocalStrength(mockStrength);
    onStrengthChange?.(mockStrength);
  }, [password, onStrengthChange]);

  const currentStrength = strength || localStrength;

  if (!currentStrength) {
    return null;
  }

  const strengthColor = STRENGTH_COLORS[currentStrength.strength];
  const strengthLabel = STRENGTH_LABELS[currentStrength.strength];

  return (
    <Box className={className} sx={{ mt: 1 }}>
      {/* Password visibility toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          Password Strength
        </Typography>
        <IconButton
          size="small"
          onClick={() => setShowPassword(!showPassword)}
          edge="end"
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </Box>

      {/* Password display */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            backgroundColor: 'grey.100',
            padding: 1,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.300',
          }}
        >
          {showPassword ? password : '•'.repeat(password.length)}
        </Typography>
      </Box>

      {/* Strength indicator */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={currentStrength.score}
            sx={{
              flexGrow: 1,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: strengthColor,
                borderRadius: 4,
              },
            }}
          />
          <Chip
            label={strengthLabel}
            size="small"
            sx={{
              ml: 2,
              backgroundColor: strengthColor,
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>

        {/* Score and crack time */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Score: {currentStrength.score}/100
          </Typography>
          {showCrackTime && (
            <Tooltip title={`Crack time: ${currentStrength.crack_time}`}>
              <Typography variant="caption" color="text.secondary">
                {currentStrength.crack_time}
              </Typography>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Requirements checklist */}
      {showDetails && (
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              mb: 1,
            }}
            onClick={() => setShowDetailsExpanded(!showDetailsExpanded)}
          >
            <Info fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Requirements Details
            </Typography>
          </Box>

          <Collapse in={showDetailsExpanded}>
            <List dense>
              {Object.entries(currentStrength.requirements_met).map(([key, met]) => (
                <ListItem key={key} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {met ? (
                      <CheckCircle color="success" fontSize="small" />
                    ) : (
                      <Cancel color="error" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={REQUIREMENT_LABELS[key as keyof typeof REQUIREMENT_LABELS] || key}
                    primaryTypographyProps={{ variant: 'body2' }}
                    sx={{
                      color: met ? 'success.main' : 'error.main',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>
      )}

      {/* Feedback */}
      {currentStrength.feedback.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
            Issues:
          </Typography>
          <List dense>
            {currentStrength.feedback.map((item, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Warning color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{ variant: 'body2', color: 'error' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Suggestions */}
      {showSuggestions && currentStrength.suggestions.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Suggestions:
          </Typography>
          <List dense>
            {currentStrength.suggestions.map((item, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Info color="info" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Entropy info */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Entropy: {currentStrength.entropy.toFixed(1)} bits
        </Typography>
      </Box>
    </Box>
  );
};

export default PasswordStrengthIndicator;
