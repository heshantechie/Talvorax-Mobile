import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, borderRadius } from '../../config/theme';

interface ProgressBarProps {
  value: number;
  maxValue?: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  value,
  maxValue = 10,
  color,
  backgroundColor = colors.slate[100],
  height = 6,
  showLabel = true,
  label,
  style,
}: ProgressBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  // Auto-color based on score percentage
  const barColor = color ?? getColorForPercentage(percentage);

  return (
    <View style={[styles.container, style]}>
      {(showLabel || label) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          <Text style={[styles.value, { color: barColor }]}>
            {value}/{maxValue}
          </Text>
        </View>
      )}
      <View style={[styles.track, { backgroundColor, height, borderRadius: height / 2 }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              width: `${percentage}%`,
              height,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

function getColorForPercentage(pct: number): string {
  if (pct >= 70) return colors.emerald[500];
  if (pct >= 40) return colors.warning;
  return colors.error;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    color: colors.slate[800],
  },
  value: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.sm,
  },
  track: {
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
