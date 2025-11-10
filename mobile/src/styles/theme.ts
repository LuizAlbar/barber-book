export const theme = {
  colors: {
    background: '#1E1E1E',
    card: '#4A4A4A',
    primary: '#FFCB24',
    text: '#FFFFFF',
    success: '#4CAF50',
    warning: '#FFA726',
    info: '#29B6F6',
    error: '#EF5350',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
  fontSize: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
};

export type Theme = typeof theme;
