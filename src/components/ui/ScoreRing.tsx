import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography } from '../../config/theme';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  showPercentage?: boolean;
}

export function ScoreRing({
  score,
  maxScore = 100,
  size = 140,
  strokeWidth = 10,
  color,
  backgroundColor = colors.slate[100],
  label,
  showPercentage = true,
}: ScoreRingProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const ringColor = color ?? getColorForScore(percentage);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.score, { color: ringColor }]}>
          {score}
          {showPercentage && <Text style={styles.percent}>%</Text>}
        </Text>
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    </View>
  );
}

function getColorForScore(pct: number): string {
  if (pct >= 70) return colors.emerald[500];
  if (pct >= 40) return colors.warning;
  return colors.error;
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 36,
    textAlign: 'center',
  },
  percent: {
    fontSize: 20,
    fontFamily: typography.fontFamily.regular,
  },
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.slate[500],
    marginTop: 2,
  },
});
