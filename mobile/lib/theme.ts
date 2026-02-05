// ShopMule iOS Theme - Dark mode optimized
export const colors = {
  // Primary
  primary: '#3b82f6',
  primaryLight: 'rgba(59, 130, 246, 0.15)',
  primaryDark: '#2563eb',

  // Background
  background: '#000000',
  backgroundSecondary: '#1c1c1e',
  backgroundTertiary: '#2c2c2e',
  backgroundElevated: '#1c1c1e',

  // Surface
  surface: '#1c1c1e',
  surfaceSecondary: '#2c2c2e',

  // Text
  text: '#ffffff',
  textSecondary: '#8e8e93',
  textTertiary: '#636366',

  // Status colors
  success: '#30d158',
  warning: '#ff9f0a',
  error: '#ff453a',
  info: '#0a84ff',

  // Work order status
  statusDiagnosed: '#ff9f0a',
  statusApproved: '#0a84ff',
  statusInProgress: '#bf5af2',
  statusCompleted: '#30d158',

  // Borders
  border: '#38383a',
  borderLight: '#48484a',

  // Separators
  separator: '#38383a',
  separatorOpaque: '#545458',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 34,
  title: 28,
  largeTitle: 34,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// iOS-style shadows
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Status badge configurations
export const workOrderStatusConfig = {
  DIAGNOSED: {
    color: colors.statusDiagnosed,
    label: 'Diagnosed',
    icon: 'search',
  },
  APPROVED: {
    color: colors.statusApproved,
    label: 'Approved',
    icon: 'checkmark-circle',
  },
  IN_PROGRESS: {
    color: colors.statusInProgress,
    label: 'In Progress',
    icon: 'hammer',
  },
  COMPLETED: {
    color: colors.statusCompleted,
    label: 'Completed',
    icon: 'checkmark-done',
  },
};
