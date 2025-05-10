import {TextStyle} from 'react-native';

export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
} as const;

export const fontWeights = {
  light: '300' as TextStyle['fontWeight'],
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
} as const;

export const lineHeights = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.5,
  loose: 1.6,
} as const;

export const typography = {
  // Headings
  h1: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.xxxl * lineHeights.tight,
  },
  h2: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.xxl * lineHeights.normal,
  },
  h3: {
    fontSize: 20,
    fontWeight: fontWeights.semibold,
    lineHeight: 20 * lineHeights.normal,
  },
  h4: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xl * lineHeights.normal,
  },
  h5: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.lg * lineHeights.relaxed,
  },
  h6: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.md * lineHeights.relaxed,
  },

  // Body
  bodyLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.lg * lineHeights.relaxed,
  },
  bodyRegular: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.md * lineHeights.relaxed,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.xs * lineHeights.normal,
  },

  // Buttons
  buttonLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * lineHeights.normal,
  },
  buttonMedium: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.md * lineHeights.normal,
  },
  buttonSmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
} as const;
