import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, borderRadius } from '../../config/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'emerald' | 'purple';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export function Badge({ text, variant = 'default', style, size = 'sm' }: BadgeProps) {
  return (
    <View style={[styles.base, styles[`size_${size}`], styles[variant], style]}>
      <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>
        {text}
      </Text>
    </View>
  );
}

const variantColors = {
  success: { bg: '#dcfce7', text: colors.emerald[700] },
  warning: { bg: '#fef3c7', text: '#92400e' },
  error: { bg: '#fef2f2', text: '#991b1b' },
  info: { bg: '#e0e7ff', text: colors.indigo[600] },
  default: { bg: colors.slate[100], text: colors.slate[600] },
  emerald: { bg: colors.emerald[50], text: colors.emerald[600] },
  purple: { bg: '#f3e8ff', text: '#7c3aed' },
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
  },

  size_sm: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  size_md: {
    paddingHorizontal: 14,
    paddingVertical: 5,
  },

  // Variant backgrounds
  success: { backgroundColor: variantColors.success.bg },
  warning: { backgroundColor: variantColors.warning.bg },
  error: { backgroundColor: variantColors.error.bg },
  info: { backgroundColor: variantColors.info.bg },
  default: { backgroundColor: variantColors.default.bg },
  emerald: { backgroundColor: variantColors.emerald.bg },
  purple: { backgroundColor: variantColors.purple.bg },

  // Text
  text: {
    fontFamily: typography.fontFamily.semiBold,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  textSize_sm: {
    fontSize: 10,
  },
  textSize_md: {
    fontSize: typography.fontSize.xs,
  },

  // Variant text colors
  text_success: { color: variantColors.success.text },
  text_warning: { color: variantColors.warning.text },
  text_error: { color: variantColors.error.text },
  text_info: { color: variantColors.info.text },
  text_default: { color: variantColors.default.text },
  text_emerald: { color: variantColors.emerald.text },
  text_purple: { color: variantColors.purple.text },
});
