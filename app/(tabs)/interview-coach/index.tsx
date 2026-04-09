import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../src/components/ui/Card';
import { colors, typography, spacing, borderRadius } from '../../../src/config/theme';

const INTERVIEW_MODES = [
  {
    id: 'domain',
    title: 'Domain Based',
    description: 'Practice interview questions specific to your professional domain',
    icon: 'grid-outline' as const,
    color: colors.emerald[500],
    available: true,
  },
  {
    id: 'jd',
    title: 'JD Based',
    description: 'Upload a job description and get tailored interview questions',
    icon: 'document-text-outline' as const,
    color: colors.indigo[500],
    available: true,
  },
  {
    id: 'resume',
    title: 'Resume Based',
    description: 'Get questions based on your resume content and experience',
    icon: 'person-outline' as const,
    color: '#8b5cf6',
    available: true,
  },
  {
    id: 'company',
    title: 'Company Specific',
    description: 'Practice with questions commonly asked at specific companies',
    icon: 'business-outline' as const,
    color: '#f59e0b',
    available: true,
  },
  {
    id: 'previous',
    title: 'Previous Interview Experience',
    description: 'Practice from real interview experiences shared by candidates',
    icon: 'chatbubbles-outline' as const,
    color: '#ec4899',
    available: true,
  },
  {
    id: 'custom',
    title: 'Custom Mode',
    description: 'Create your own custom interview format and questions',
    icon: 'create-outline' as const,
    color: colors.slate[400],
    available: false,
  },
];

export default function InterviewCoachIndex() {
  const handleSelectMode = (mode: typeof INTERVIEW_MODES[0]) => {
    if (!mode.available) return;
    router.push({
      pathname: '/(tabs)/interview-coach/setup',
      params: { mode: mode.id, modeTitle: mode.title },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>T</Text>
          </View>
          <Text style={styles.headerTitle}>Talvorax</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Interview Coach</Text>
        <Text style={styles.pageSubtitle}>
          Choose your interview mode to get started
        </Text>

        <View style={styles.modesGrid}>
          {INTERVIEW_MODES.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              activeOpacity={mode.available ? 0.7 : 1}
              onPress={() => handleSelectMode(mode)}
            >
              <Card
                style={[
                  styles.modeCard,
                  !mode.available && styles.modeCardDisabled,
                ]}
              >
                {!mode.available && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>COMING SOON</Text>
                  </View>
                )}
                <View style={[styles.modeIcon, { backgroundColor: mode.color + '15' }]}>
                  <Ionicons name={mode.icon} size={28} color={mode.color} />
                </View>
                <Text style={styles.modeTitle}>{mode.title}</Text>
                <Text style={styles.modeDescription}>{mode.description}</Text>
                {mode.available && (
                  <View style={styles.startRow}>
                    <Text style={[styles.startText, { color: mode.color }]}>
                      Start Practice
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color={mode.color} />
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate[50] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoBox: {
    width: 36, height: 36,
    backgroundColor: colors.emerald[500],
    borderRadius: borderRadius.sm,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm,
  },
  logoLetter: {
    fontFamily: typography.fontFamily.extraBold,
    fontSize: 20, color: colors.white,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.slate[900],
  },
  content: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  pageTitle: {
    fontFamily: typography.fontFamily.extraBold,
    fontSize: typography.fontSize['3xl'],
    color: colors.slate[900],
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.slate[500],
    marginBottom: spacing.xl,
  },
  modesGrid: { gap: spacing.md },
  modeCard: {
    padding: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  modeCardDisabled: { opacity: 0.6 },
  comingSoonBadge: {
    position: 'absolute', top: spacing.md, right: spacing.md,
    backgroundColor: colors.slate[100],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: 3,
  },
  comingSoonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 9,
    color: colors.slate[500],
    letterSpacing: typography.letterSpacing.uppercase,
  },
  modeIcon: {
    width: 56, height: 56,
    borderRadius: borderRadius.base,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modeTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.slate[900],
    marginBottom: spacing.xs,
  },
  modeDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.slate[500],
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  startRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
  },
  startText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
  },
});
