/**
 * Accessibility Utilities
 * Tools for ensuring WCAG 2.1 AA compliance
 */

import React from 'react';

export interface AccessibilityConfig {
  skipLinks: boolean;
  focusManagement: boolean;
  screenReaderSupport: boolean;
  keyboardNavigation: boolean;
  colorContrast: boolean;
  textScaling: boolean;
}

/**
 * Default accessibility configuration
 */
export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  skipLinks: true,
  focusManagement: true,
  screenReaderSupport: true,
  keyboardNavigation: true,
  colorContrast: true,
  textScaling: true,
};

/**
 * Skip link component for keyboard navigation
 */
export const SkipLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => (
  <a
    href={href}
    className="skip-link"
    style={{
      position: 'absolute',
      top: '-40px',
      left: '6px',
      background: '#000',
      color: '#fff',
      padding: '8px',
      textDecoration: 'none',
      zIndex: 1000,
      borderRadius: '4px',
    }}
    onFocus={(e) => {
      e.currentTarget.style.top = '6px';
    }}
    onBlur={(e) => {
      e.currentTarget.style.top = '-40px';
    }}
  >
    {children}
  </a>
);

/**
 * Focus trap hook for modal dialogs
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    firstElement?.focus();
    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
};

/**
 * ARIA live region hook for screen reader announcements
 */
export const useAriaLiveRegion = () => {
  const [message, setMessage] = React.useState('');

  const announce = React.useCallback((text: string) => {
    setMessage(text);
    // Clear message after announcement
    setTimeout(() => setMessage(''), 1000);
  }, []);

  const LiveRegion = () => (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      {message}
    </div>
  );

  return { announce, LiveRegion };
};

/**
 * Keyboard navigation hook
 */
export const useKeyboardNavigation = (
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void
) => {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          onEnter?.();
          break;
        case 'Escape':
          onEscape?.();
          break;
        case 'ArrowUp':
          onArrowUp?.();
          break;
        case 'ArrowDown':
          onArrowDown?.();
          break;
        case 'ArrowLeft':
          onArrowLeft?.();
          break;
        case 'ArrowRight':
          onArrowRight?.();
          break;
      }
    },
    [onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight]
  );

  return { handleKeyDown };
};

/**
 * Color contrast checker
 */
export const checkColorContrast = (
  foreground: string,
  background: string
): { ratio: number; passes: boolean; level: 'AA' | 'AAA' | 'FAIL' } => {
  // Simplified contrast calculation
  const getLuminance = (color: string): number => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };

  const lum1 = getLuminance(foreground);
  const lum2 = getLuminance(background);
  const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);

  const passesAA = ratio >= 4.5;
  const passesAAA = ratio >= 7;

  return {
    ratio,
    passes: passesAA,
    level: passesAAA ? 'AAA' : passesAA ? 'AA' : 'FAIL',
  };
};

/**
 * Screen reader only text component
 */
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span
    style={{
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0,
    }}
  >
    {children}
  </span>
);

/**
 * Accessible button component
 */
export const AccessibleButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
}> = ({
  onClick,
  children,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  className,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    className={className}
    style={{
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
    }}
  >
    {children}
  </button>
);

/**
 * Accessible form field component
 */
export const AccessibleFormField: React.FC<{
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, id, error, required = false, children }) => (
  <div>
    <label htmlFor={id} style={{ display: 'block', marginBottom: '4px' }}>
      {label}
      {required && <span aria-label="required">*</span>}
    </label>
    {children}
    {error && (
      <div
        id={`${id}-error`}
        role="alert"
        aria-live="polite"
        style={{ color: 'red', fontSize: '0.875rem', marginTop: '4px' }}
      >
        {error}
      </div>
    )}
  </div>
);