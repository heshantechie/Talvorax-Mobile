import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows } from '../../config/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'glass' | 'outlined' | 'elevated';
  padding?: number;
}

export function Card({
  children,
  style,
  variant = 'default',
  padding = 16,
}: CardProps) {
  return (
    <View style={[styles.base, styles[variant], { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.base,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: colors.white,
    ...shadows.md,
  },
  glass: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.sm,
  },
  outlined: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  elevated: {
    backgroundColor: colors.white,
    ...shadows.lg,
  },
});
