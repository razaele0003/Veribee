import type { TextStyle } from 'react-native';

export const Fonts = {
  epilogueBold: 'Epilogue_700Bold',
  epilogueSemiBold: 'Epilogue_600SemiBold',
  manropeRegular: 'Manrope_400Regular',
  manropeMedium: 'Manrope_500Medium',
  manropeSemiBold: 'Manrope_600SemiBold',
  manropeBold: 'Manrope_700Bold',
} as const;

export const Type: Record<
  'h1' | 'h2' | 'h3' | 'bodyLg' | 'bodyMd' | 'bodySm' | 'labelCaps' | 'labelMd',
  TextStyle
> = {
  h1: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: 0,
  },
  h2: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 0,
  },
  h3: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 24,
    lineHeight: 31,
  },
  bodyLg: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 18,
    lineHeight: 29,
  },
  bodyMd: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    lineHeight: 20,
  },
  labelCaps: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  labelMd: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 14,
    lineHeight: 18,
  },
};
