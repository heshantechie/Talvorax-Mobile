import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button } from '../../../src/components/ui/Button';
import { colors, typography, spacing, borderRadius } from '../../../src/config/theme';

export default function InterviewComplete() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [evaluating, setEvaluating] = useState(true);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Simulate AI evaluation time
    const timer = setTimeout(() => {
      setEvaluating(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Celebration */}
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Interview Complete!</Text>
        <Text style={styles.subtitle}>
          Great job! Your interview has been recorded and is being analyzed.
        </Text>

        {/* AI Evaluation Status */}
        <View style={styles.statusCard}>
          {evaluating ? (
            <>
              <ActivityIndicator size="small" color={colors.emerald[500]} />
              <Text style={styles.statusText}>AI is evaluating your answers...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color={colors.emerald[500]} />
              <Text style={styles.statusText}>Evaluation complete! View your results.</Text>
            </>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="View Results"
            onPress={() =>
              router.replace({
                pathname: '/(tabs)/interview-coach/results',
                params: { sessionId: sessionId ?? '' },
              })
            }
            disabled={evaluating}
            fullWidth
            size="lg"
            icon={<Ionicons name="bar-chart-outline" size={20} color={colors.white} />}
          />

          <Button
            title="Test Again"
            onPress={() => router.replace('/(tabs)/interview-coach')}
            variant="outline"
            fullWidth
            size="lg"
            style={styles.retryButton}
            icon={<Ionicons name="refresh" size={20} color={colors.emerald[500]} />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  emoji: { fontSize: 64, marginBottom: spacing.lg },
  title: {
    fontFamily: typography.fontFamily.extraBold,
    fontSize: typography.fontSize['3xl'],
    color: colors.slate[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.slate[500],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing['2xl'],
  },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.emerald[50], borderRadius: borderRadius.base,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.base,
    marginBottom: spacing['2xl'],
  },
  statusText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.emerald[700],
  },
  actions: { width: '100%', gap: spacing.md },
  retryButton: { marginTop: 0 },
});
