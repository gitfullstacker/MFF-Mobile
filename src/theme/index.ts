import {borderRadius} from './borderRadius';
import {colors} from './colors';
import {shadows} from './shadows';
import {spacing} from './spacing';
import {typography} from './typography';

export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
} as const;

export type Theme = typeof theme;
