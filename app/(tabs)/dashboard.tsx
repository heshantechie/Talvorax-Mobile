import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { ScoreRing } from '../../src/components/ui/ScoreRing';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { getInterviewSessions, getInterviewFeedback } from '../../src/lib/db';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/config/theme';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [feedback, setFeedback] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  const loadData = async () => {
    try {
      if (!user) return;
      const sessionsData = await getInterviewSessions(user.id);
      setSessions(sessionsData || []);

      if (sessionsData && sessionsData.length > 0) {
        const latestSession = sessionsData[0];
        setLastScore(latestSession.score || 0);

        try {
          const fb = await getInterviewFeedback(latestSession.id);
          setFeedback(fb);
        } catch {
          // No feedback yet
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const userEmail = user?.email || 'user@example.com';
  const userName = user?.user_metadata?.full_name || userEmail.split('@')[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>T</Text>
          </View>
          <Text style={styles.headerTitle}>Talvorax</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => setShowProfile(!showProfile)}
        >
          <Text style={styles.profileButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Profile dropdown */}
      {showProfile && (
        <View style={styles.profileDropdown}>
          <Text style={styles.profileLabel}>LOGGED IN AS</Text>
          <Text style={styles.profileEmail}>{userEmail}</Text>
          <TouchableOpacity style={styles.profileMenuItem}>
            <Ionicons name="person-outline" size={18} color={colors.slate[700]} />
            <Text style={styles.profileMenuText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileMenuItem} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={[styles.profileMenuText, { color: colors.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.emerald[500]}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Welcome to your{'\n'}Dashboard.
          </Text>
          <Text style={styles.welcomeSubtitle}>
            You are logged in as <Text style={styles.emailHighlight}>{userEmail}</Text>
          </Text>
        </View>

        {/* Recent Interview Performance */}
        <Text style={styles.sectionTitle}>Recent Interview Performance</Text>
        <View style={styles.divider} />

        <Card style={styles.performanceCard}>
          <View style={styles.performanceGrid}>
            {/* Score Ring */}
            <View style={styles.scoreSection}>
              <Text style={styles.scoreLabel}>LAST INTERVIEW SCORE</Text>
              <ScoreRing score={lastScore} size={120} />
              <Badge
                text={lastScore >= 70 ? 'Great Performance' : lastScore >= 40 ? 'Good Effort' : 'Needs Work Performance'}
                variant={lastScore >= 70 ? 'success' : lastScore >= 40 ? 'warning' : 'error'}
                style={styles.scoreBadge}
              />
              {sessions.length > 0 && (
                <Text style={styles.scoreDate}>
                  From {new Date(sessions[0]?.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              )}
            </View>

            {/* Areas to Improve */}
            <View style={styles.areasSection}>
              <Text style={styles.areasTitle}>AREAS TO IMPROVE</Text>
              <Text style={styles.areasSubtitle}>
                Based on all {sessions.length} interviews
              </Text>
              <ProgressBar
                label="Technical Accuracy"
                value={feedback?.technical_accuracy ?? 0}
                maxValue={10}
              />
              <ProgressBar
                label="Problem Solving"
                value={feedback?.problem_solving ?? 0}
                maxValue={10}
              />
              <ProgressBar
                label="Communication"
                value={feedback?.communication ?? 0}
                maxValue={10}
              />
            </View>
          </View>
        </Card>

        {/* Focus Topics */}
        {feedback?.focus_topics && feedback.focus_topics.length > 0 && (
          <View style={styles.topicsSection}>
            <Text style={styles.topicsTitle}>FOCUS TOPICS</Text>
            <View style={styles.topicsList}>
              {feedback.focus_topics.map((topic: string, idx: number) => (
                <Badge key={idx} text={topic} variant="emerald" size="md" style={styles.topicBadge} />
              ))}
            </View>
          </View>
        )}

        {/* Interview Analysis Summary */}
        {feedback?.summary_points && feedback.summary_points.length > 0 && (
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>INTERVIEW ANALYSIS SUMMARY</Text>
            {feedback.summary_points.map((point: string, idx: number) => (
              <View key={idx} style={styles.summaryItem}>
                <View style={styles.summaryDot} />
                <Text style={styles.summaryText}>{point}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Stats footer */}
        <View style={styles.statsFooter}>
          <Text style={styles.statsText}>
            Avg score across {sessions.length} attempts:{' '}
            <Text style={styles.statsBold}>
              {sessions.length > 0
                ? Math.round(sessions.reduce((acc: number, s: any) => acc + (s.score || 0), 0) / sessions.length)
                : 0}
              %
            </Text>
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/interview-coach')}>
            <Text style={styles.ctaText}>Take another interview {'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Empty state */}
        {sessions.length === 0 && (
          <Card style={styles.emptyCard}>
            <Ionicons name="rocket-outline" size={48} color={colors.emerald[500]} />
            <Text style={styles.emptyTitle}>No interviews yet</Text>
            <Text style={styles.emptySubtitle}>
              Start your first mock interview to see your performance here
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/interview-coach')}
            >
              <Text style={styles.emptyButtonText}>Start Practice →</Text>
            </TouchableOpacity>
          </Card>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate[50],
  },

  // Header
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 36,
    height: 36,
    backgroundColor: colors.emerald[500],
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  logoLetter: {
    fontFamily: typography.fontFamily.extraBold,
    fontSize: 20,
    color: colors.white,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.slate[900],
  },
  profileButton: {
    borderWidth: 1.5,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  profileButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.slate[700],
  },

  // Profile dropdown
  profileDropdown: {
    position: 'absolute',
    right: spacing.lg,
    top: 100,
    backgroundColor: colors.white,
    borderRadius: borderRadius.base,
    padding: spacing.base,
    minWidth: 200,
    zIndex: 100,
    ...shadows.lg,
  },
  profileLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 10,
    color: colors.slate[500],
    letterSpacing: typography.letterSpacing.uppercase,
    marginBottom: 2,
  },
  profileEmail: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.sm,
    color: colors.slate[900],
    marginBottom: spacing.md,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  profileMenuText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.slate[700],
  },

  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },

  // Welcome
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  welcomeTitle: {
    fontFamily: typography.fontFamily.extraBold,
    fontSize: typography.fontSize['4xl'],
    color: colors.slate[900],
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: 44,
  },
  welcomeSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.slate[500],
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emailHighlight: {
    color: colors.emerald[500],
    fontFamily: typography.fontFamily.semiBold,
  },

  // Section titles
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.slate[900],
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.slate[200],
    marginBottom: spacing.lg,
  },

  // Performance card
  performanceCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  performanceGrid: {
    gap: spacing.xl,
  },
  scoreSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  scoreLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.emerald[500],
    letterSpacing: typography.letterSpacing.uppercase,
    marginBottom: spacing.md,
  },
  scoreBadge: {
    marginTop: spacing.md,
  },
  scoreDate: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.slate[500],
    marginTop: spacing.sm,
  },
  areasSection: {
    paddingTop: spacing.md,
  },
  areasTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.emerald[500],
    letterSpacing: typography.letterSpacing.uppercase,
    marginBottom: 4,
  },
  areasSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.slate[500],
    marginBottom: spacing.md,
  },

  // Topics
  topicsSection: {
    marginBottom: spacing.lg,
  },
  topicsTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.slate[500],
    letterSpacing: typography.letterSpacing.uppercase,
    marginBottom: spacing.sm,
  },
  topicsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  topicBadge: {
    marginBottom: 4,
  },

  // Summary
  summaryCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.emerald[500],
    letterSpacing: typography.letterSpacing.uppercase,
    marginBottom: spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.emerald[500],
    marginTop: 6,
    marginRight: spacing.md,
  },
  summaryText: {
    flex: 1,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    color: colors.slate[800],
    lineHeight: 20,
  },

  // Stats footer
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  statsText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.slate[500],
  },
  statsBold: {
    fontFamily: typography.fontFamily.bold,
    color: colors.slate[900],
  },
  ctaText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    color: colors.emerald[500],
  },

  // Empty state
  emptyCard: {
    alignItems: 'center',
    padding: spacing['2xl'],
    marginTop: spacing.lg,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.slate[900],
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.slate[500],
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: colors.emerald[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.base,
    marginTop: spacing.lg,
  },
  emptyButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
    color: colors.white,
  },
});
