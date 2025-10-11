/**
 * Responsive Design Utilities
 */
import { useMediaQuery, useTheme } from '@mui/material';

// Breakpoint utilities
export const useBreakpoints = () => {
  const theme = useTheme();
  
  return {
    isXs: useMediaQuery(theme.breakpoints.only('xs')),
    isSm: useMediaQuery(theme.breakpoints.only('sm')),
    isMd: useMediaQuery(theme.breakpoints.only('md')),
    isLg: useMediaQuery(theme.breakpoints.only('lg')),
    isXl: useMediaQuery(theme.breakpoints.only('xl')),
    
    isXsUp: useMediaQuery(theme.breakpoints.up('xs')),
    isSmUp: useMediaQuery(theme.breakpoints.up('sm')),
    isMdUp: useMediaQuery(theme.breakpoints.up('md')),
    isLgUp: useMediaQuery(theme.breakpoints.up('lg')),
    isXlUp: useMediaQuery(theme.breakpoints.up('xl')),
    
    isXsDown: useMediaQuery(theme.breakpoints.down('sm')),
    isSmDown: useMediaQuery(theme.breakpoints.down('md')),
    isMdDown: useMediaQuery(theme.breakpoints.down('lg')),
    isLgDown: useMediaQuery(theme.breakpoints.down('xl')),
    
    isMobile: useMediaQuery(theme.breakpoints.down('md')),
    isTablet: useMediaQuery(theme.breakpoints.between('sm', 'md')),
    isDesktop: useMediaQuery(theme.breakpoints.up('lg')),
  };
};

// Responsive value utilities
export const getResponsiveValue = <T>(
  values: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
  },
  breakpoints: ReturnType<typeof useBreakpoints>
): T | undefined => {
  if (breakpoints.isXl && values.xl !== undefined) return values.xl;
  if (breakpoints.isLg && values.lg !== undefined) return values.lg;
  if (breakpoints.isMd && values.md !== undefined) return values.md;
  if (breakpoints.isSm && values.sm !== undefined) return values.sm;
  if (breakpoints.isXs && values.xs !== undefined) return values.xs;
  
  // Fallback to first available value
  return values.xl || values.lg || values.md || values.sm || values.xs;
};

// Grid utilities
export const getGridColumns = (breakpoints: ReturnType<typeof useBreakpoints>) => {
  if (breakpoints.isMobile) return 1;
  if (breakpoints.isTablet) return 2;
  return 3;
};

export const getGridSpacing = (breakpoints: ReturnType<typeof useBreakpoints>) => {
  if (breakpoints.isMobile) return 2;
  if (breakpoints.isTablet) return 3;
  return 4;
};

// Typography utilities
export const getResponsiveFontSize = (breakpoints: ReturnType<typeof useBreakpoints>) => {
  return {
    h1: breakpoints.isMobile ? '1.5rem' : '2.5rem',
    h2: breakpoints.isMobile ? '1.25rem' : '2rem',
    h3: breakpoints.isMobile ? '1.125rem' : '1.75rem',
    h4: breakpoints.isMobile ? '1rem' : '1.5rem',
    h5: breakpoints.isMobile ? '0.875rem' : '1.25rem',
    h6: breakpoints.isMobile ? '0.75rem' : '1rem',
    body1: breakpoints.isMobile ? '0.875rem' : '1rem',
    body2: breakpoints.isMobile ? '0.75rem' : '0.875rem',
  };
};

// Layout utilities
export const getResponsivePadding = (breakpoints: ReturnType<typeof useBreakpoints>) => {
  if (breakpoints.isMobile) return 2;
  if (breakpoints.isTablet) return 3;
  return 4;
};

export const getResponsiveMargin = (breakpoints: ReturnType<typeof useBreakpoints>) => {
  if (breakpoints.isMobile) return 1;
  if (breakpoints.isTablet) return 2;
  return 3;
};

// Component visibility utilities
export const getVisibleComponents = (breakpoints: ReturnType<typeof useBreakpoints>) => {
  return {
    showSidebar: breakpoints.isDesktop,
    showMobileMenu: breakpoints.isMobile,
    showTabletMenu: breakpoints.isTablet,
    showDesktopMenu: breakpoints.isDesktop,
    showMobileFilters: breakpoints.isMobile,
    showDesktopFilters: breakpoints.isDesktop,
  };
};

// Responsive hook for common patterns
export const useResponsive = () => {
  const breakpoints = useBreakpoints();
  
  return {
    ...breakpoints,
    gridColumns: getGridColumns(breakpoints),
    gridSpacing: getGridSpacing(breakpoints),
    fontSize: getResponsiveFontSize(breakpoints),
    padding: getResponsivePadding(breakpoints),
    margin: getResponsiveMargin(breakpoints),
    visible: getVisibleComponents(breakpoints),
  };
};
