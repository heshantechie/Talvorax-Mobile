import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../src/contexts/AuthContext';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { useTimer } from '../../src/hooks/useTimer';
import { useSpeechToText } from '../../src/hooks/useSpeechToText';
import { getMinuteTalkStats, saveMinuteTalkSession } from '../../src/lib/db';
import { analyzeMinuteTalk } from '../../src/services/api';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/config/theme';

const TOPICS = [
  { topic: 'The impact of artificial intelligence on healthcare', category: 'Technology', difficulty: 'Moderate' },
  { topic: 'Why remote work is the future of employment', category: 'Business', difficulty: 'Easy' },
  { topic: 'The role of renewable energy in combating climate change', category: 'Science', difficulty: 'Hard' },
  { topic: 'How social media affects mental health', category: 'Psychology', difficulty: 'Moderate' },
  { topic: 'The importance of financial literacy in schools', category: 'Education', difficulty: 'Easy' },
  { topic: 'Should governments regulate big tech companies?', category: 'Politics', difficulty: 'Extreme' },
  { topic: 'The future of space exploration and colonization', category: 'Science', difficulty: 'Hard' },
  { topic: 'Benefits and risks of autonomous vehicles', category: 'Technology', difficulty: 'Moderate' },
];

type ScreenState = 'ready' | 'recording' | 'results';

export default function MinuteTalkScreen() {
  const { user } = useAuth();

  // Stats
  const [stats, setStats] = useState({ bestScore: 0, lastScore: 0, totalSessions: 0 });

  // Topic
  const [topicIndex, setTopicIndex] = useState(0);
  const currentTopic = TOPICS[topicIndex];

  // State
  const [screenState, setScreenState] = useState<ScreenState>('ready');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const timer = useTimer({
    initialSeconds: 60,
    onComplete: () => handleStopRecording(),
  });

  const speech = useSpeechToText({
    onResult: () => {},
  });

  // Load stats
  useEffect(() => {
    if (user) {
      getMinuteTalkStats(user.id).then(setStats).catch(() => {});
    }
  }, [user]);

  const shuffleTopic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTopicIndex((prev) => (prev + 1) % TOPICS.length);
  };

  const handleStartRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScreenState('recording');
    timer.start();
    speech.startListening();
  };

  const handleStopRecording = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    timer.pause();
    speech.stopListening();

    // Analyze
    try {
      const result = await analyzeMinuteTalk({
        topic: currentTopic.topic,
        category: currentTopic.category,
        difficulty: currentTopic.difficulty,
        transcript: speech.transcript,
        durationSeconds: 60 - timer.seconds,
      });
      setAnalysisResult(result);
    } catch {
      // Mock results for demo
      setAnalysisResult({
        overallScore: 73,
        contentQuality: 75,
        structure: 68,
        fluency: 80,
        confidence: 70,
        speakingSpeedWpm: 142,
        fillerWordsCount: 5,
        fillerWordsMost: 'um',
        actionableTips: [
          'Try to speak at a slightly slower pace for better clarity.',
          'Use transition phrases like "Furthermore" or "In addition" to improve structure.',
          'Reduce filler words by pausing briefly instead of saying "um".',
          'Provide specific examples to support your main points.',
        ],
      });
    }

    setScreenState('results');
  }, [timer, speech, currentTopic]);

  const handleReset = () => {
    setScreenState('ready');
    setAnalysisResult(null);
    timer.reset();
    speech.resetTranscript();
    shuffleTopic();
  };

  const getDifficultyVariant = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'success';
      case 'Moderate': return 'warning';
      case 'Hard': return 'error';
      case 'Extreme': return 'purple';
      default: return 'default';
    }
  };

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
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.bestScore}%</Text>
            <Text style={styles.statLabel}>BEST SCORE</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.lastScore}%</Text>
            <Text style={styles.statLabel}>LAST SCORE</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>SESSIONS</Text>
          </Card>
        </View>

        {screenState === 'ready' && (
          <>
            {/* Topic Card */}
            <Card style={styles.topicCard} variant="elevated">
              <View style={styles.topicBadges}>
                <Badge text={currentTopic.category} variant="info" size="md" />
                <Badge
                  text={currentTopic.difficulty}
                  variant={getDifficultyVariant(currentTopic.difficulty) as any}
                  size="md"
                />
              </View>
              <Text style={styles.topicQuote}>"{currentTopic.topic}"</Text>
              <TouchableOpacity style={styles.skipTopicButton} onPress={shuffleTopic}>
                <Ionicons name="shuffle" size={18} color={colors.slate[500]} />
                <Text style={styles.skipTopicText}>Skip Topic</Text>
              </TouchableOpacity>
            </Card>

            {/* Timer Display */}
            <View style={styles.timerSection}>
              <Text style={styles.timerLarge}>01:00</Text>
              <Text style={styles.timerLabel}>You have 1 minute to speak on this topic</Text>
            </View>

            {/* Start Button */}
            <TouchableOpacity style={styles.micButtonLarge} onPress={handleStartRecording}>
              <View style={styles.micButtonInner}>
                <Ionicons name="mic" size={36} color={colors.white} />
              </View>
              <Text style={styles.micButtonLabel}>Tap to Start</Text>
            </TouchableOpacity>
          </>
        )}

        {screenState === 'recording' && (
          <>
            {/* Recording Timer */}
            <View style={styles.timerSection}>
              <Text style={[styles.timerLarge, { color: colors.error }]}>
                {timer.formattedTime}
              </Text>
              <View style={styles.recordingDotRow}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingLabel}>Recording...</Text>
              </View>
            </View>

            {/* Stop Button */}
            <TouchableOpacity style={styles.stopButtonLarge} onPress={handleStopRecording}>
              <View style={styles.stopButtonInner}>
                <Ionicons name="stop" size={36} color={colors.white} />
              </View>
              <Text style={styles.micButtonLabel}>Tap to Stop</Text>
            </TouchableOpacity>

            {/* Live Transcription */}
            <Card style={styles.transcriptCard}>
              <Text style={styles.transcriptLabel}>LIVE TRANSCRIPTION</Text>
              <Text style={styles.transcriptText}>
                {speech.transcript || speech.partialTranscript || 'Listening... Start speaking about the topic.'}
              </Text>
            </Card>
          </>
        )}

        {screenState === 'results' && analysisResult && (
          <>
            {/* Performance Report */}
            <Card style={styles.reportCard} variant="elevated">
              <Text style={styles.reportTitle}>PERFORMANCE REPORT</Text>

              <View style={styles.overallScoreRow}>
                <Text style={styles.overallScoreLabel}>Overall Score</Text>
                <Text style={[styles.overallScoreValue, {
                  color: analysisResult.overallScore >= 70 ? colors.emerald[500] : colors.warning,
                }]}>
                  {analysisResult.overallScore}%
                </Text>
              </View>

              <ProgressBar
                label="Content Quality"
                value={analysisResult.contentQuality}
                maxValue={100}
                height={8}
              />
              <ProgressBar
                label="Structure"
                value={analysisResult.structure}
                maxValue={100}
                height={8}
              />
              <ProgressBar
                label="Fluency"
                value={analysisResult.fluency}
                maxValue={100}
                height={8}
              />
              <ProgressBar
                label="Confidence"
                value={analysisResult.confidence}
                maxValue={100}
                height={8}
              />
            </Card>

            {/* Speaking Stats */}
            <View style={styles.speakingStatsRow}>
              <Card style={styles.speakingStat}>
                <Text style={styles.speakingStatValue}>{analysisResult.speakingSpeedWpm}</Text>
                <Text style={styles.speakingStatLabel}>Words/Min</Text>
              </Card>
              <Card style={styles.speakingStat}>
                <Text style={styles.speakingStatValue}>{analysisResult.fillerWordsCount}</Text>
                <Text style={styles.speakingStatLabel}>Filler Words</Text>
                <Text style={styles.fillerMost}>Most used: "{analysisResult.fillerWordsMost}"</Text>
              </Card>
            </View>

            {/* Transcript */}
            {speech.transcript ? (
              <Card style={styles.transcriptCard}>
                <Text style={styles.transcriptLabel}>YOUR TRANSCRIPT</Text>
                <Text style={styles.transcriptText}>{speech.transcript}</Text>
              </Card>
            ) : null}

            {/* Actionable Tips */}
            <Card style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 ACTIONABLE TIPS</Text>
              {(analysisResult.actionableTips ?? []).map((tip: string, i: number) => (
                <View key={i} style={styles.tipItem}>
                  <View style={styles.tipDot} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </Card>

            {/* Try Again */}
            <Button
              title="Try Another Topic"
              onPress={handleReset}
              fullWidth
              size="lg"
              icon={<Ionicons name="refresh" size={20} color={colors.white} />}
            />
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate[50] },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.slate[100],
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoBox: {
    width: 36, height: 36, backgroundColor: colors.emerald[500],
    borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm,
  },
  logoLetter: {
    fontFamily: typography.fontFamily.extraBold, fontSize: 20, color: colors.white,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.lg, color: colors.slate[900],
  },
  content: { flex: 1 },
  scrollContent: { padding: spacing.lg },

  // Stats
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, padding: spacing.md, alignItems: 'center' },
  statValue: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.xl, color: colors.emerald[500],
  },
  statLabel: {
    fontFamily: typography.fontFamily.semiBold, fontSize: 9,
    color: colors.slate[500], letterSpacing: typography.letterSpacing.uppercase,
    marginTop: 2,
  },

  // Topic
  topicCard: { padding: spacing.xl, marginBottom: spacing.xl, alignItems: 'center' },
  topicBadges: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  topicQuote: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.xl,
    color: colors.slate[900], textAlign: 'center', lineHeight: 28, fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  skipTopicButton: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.base,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.slate[200],
  },
  skipTopicText: {
    fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.sm, color: colors.slate[500],
  },

  // Timer
  timerSection: { alignItems: 'center', marginBottom: spacing.xl },
  timerLarge: {
    fontFamily: typography.fontFamily.extraBold, fontSize: 64, color: colors.slate[900],
    letterSpacing: 4,
  },
  timerLabel: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.sm,
    color: colors.slate[500], marginTop: spacing.sm,
  },
  recordingDotRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm,
  },
  recordingDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error,
  },
  recordingLabel: {
    fontFamily: typography.fontFamily.semiBold, fontSize: typography.fontSize.sm, color: colors.error,
  },

  // Mic button
  micButtonLarge: { alignItems: 'center', marginBottom: spacing.xl },
  micButtonInner: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.emerald[500], alignItems: 'center', justifyContent: 'center',
    ...shadows.lg,
  },
  micButtonLabel: {
    fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.sm,
    color: colors.slate[500], marginTop: spacing.sm,
  },

  // Stop button
  stopButtonLarge: { alignItems: 'center', marginBottom: spacing.xl },
  stopButtonInner: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center',
    ...shadows.lg,
  },

  // Transcript
  transcriptCard: { padding: spacing.lg, marginBottom: spacing.lg },
  transcriptLabel: {
    fontFamily: typography.fontFamily.semiBold, fontSize: typography.fontSize.xs,
    color: colors.emerald[500], letterSpacing: typography.letterSpacing.uppercase,
    marginBottom: spacing.sm,
  },
  transcriptText: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.base,
    color: colors.slate[700], lineHeight: 24,
  },

  // Report
  reportCard: { padding: spacing.lg, marginBottom: spacing.lg },
  reportTitle: {
    fontFamily: typography.fontFamily.semiBold, fontSize: typography.fontSize.xs,
    color: colors.emerald[500], letterSpacing: typography.letterSpacing.uppercase,
    marginBottom: spacing.md,
  },
  overallScoreRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  overallScoreLabel: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.lg, color: colors.slate[900],
  },
  overallScoreValue: {
    fontFamily: typography.fontFamily.extraBold, fontSize: typography.fontSize['3xl'],
  },

  // Speaking stats
  speakingStatsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  speakingStat: { flex: 1, padding: spacing.lg, alignItems: 'center' },
  speakingStatValue: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize['2xl'], color: colors.emerald[500],
  },
  speakingStatLabel: {
    fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.sm, color: colors.slate[700],
    marginTop: 2,
  },
  fillerMost: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.xs, color: colors.slate[500],
    marginTop: 2,
  },

  // Tips
  tipsCard: { padding: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.emerald[50] },
  tipsTitle: {
    fontFamily: typography.fontFamily.semiBold, fontSize: typography.fontSize.xs,
    color: colors.emerald[600], letterSpacing: typography.letterSpacing.uppercase,
    marginBottom: spacing.md,
  },
  tipItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  tipDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: colors.emerald[500],
    marginTop: 6, marginRight: spacing.sm,
  },
  tipText: {
    flex: 1, fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.sm,
    color: colors.slate[700], lineHeight: 20,
  },
});
