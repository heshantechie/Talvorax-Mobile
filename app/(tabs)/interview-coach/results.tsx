import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { ScoreRing } from '../../../src/components/ui/ScoreRing';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import { getInterviewSession, getInterviewAnswers, getInterviewFeedback, getInterviewQuestions } from '../../../src/lib/db';
import { colors, typography, spacing, borderRadius, shadows } from '../../../src/config/theme';

export default function InterviewResults() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any>(null);
  const [selectedQ, setSelectedQ] = useState(0);
  const [activeTab, setActiveTab] = useState<'comparison' | 'gaps'>('comparison');

  useEffect(() => {
    const loadResults = async () => {
      try {
        if (sessionId) {
          const [s, qs, ans, fb] = await Promise.all([
            getInterviewSession(sessionId).catch(() => null),
            getInterviewQuestions(sessionId).catch(() => []),
            getInterviewAnswers(sessionId).catch(() => []),
            getInterviewFeedback(sessionId).catch(() => null),
          ]);
          setSession(s);
          setQuestions(qs || []);
          setAnswers(ans || []);
          setFeedback(fb);
        }
      } catch {
        // Mock data for demo
        setFeedback({
          overall_score: 30,
          technical_accuracy: 2,
          problem_solving: 4,
          communication: 5,
          focus_topics: ['System Design', 'Algorithms', 'React Hooks'],
          weakness_map: [
            { topic: 'Scaling Databases', description: 'Lacks understanding of horizontal scaling, sharding strategies, and read replicas.', severity: 'High' },
            { topic: 'React State Management', description: 'Unfamiliar with Context API patterns and Redux middleware.', severity: 'Medium' },
          ],
          summary_points: [
            'The candidate showed basic understanding but lacked depth in technical concepts.',
            'Communication was clear but answers were too brief.',
          ],
        });
        setQuestions([
          { question_text: 'What is the Virtual DOM in React?', question_number: 1 },
          { question_text: 'Explain database indexing.', question_number: 2 },
          { question_text: 'How do you handle state in React?', question_number: 3 },
        ]);
        setAnswers([
          { answer_text: 'Virtual DOM is a copy of the real DOM that React uses.', ideal_answer: 'The Virtual DOM is a lightweight JavaScript representation of the real DOM. React uses it to batch updates and minimize actual DOM manipulations through a diffing algorithm, improving performance.', score: 4 },
          { answer_text: 'Indexing helps queries run faster.', ideal_answer: 'Database indexing creates data structures (B-trees, hash indexes) that allow the database engine to find rows without scanning the entire table. Proper indexing on frequently queried columns dramatically improves read performance.', score: 3 },
          { answer_text: 'I use useState hook for state management.', ideal_answer: 'React offers multiple state management approaches: useState for local state, useReducer for complex state logic, Context API for shared state, and external libraries like Redux or Zustand for large-scale applications.', score: 4 },
        ]);
      }
      setLoading(false);
    };
    loadResults();
  }, [sessionId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.emerald[500]} />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const overallScore = feedback?.overall_score ?? 30;
  const currentAnswer = answers[selectedQ];
  const currentQuestion = questions[selectedQ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/interview-coach')}>
          <Ionicons name="arrow-back" size={24} color={colors.slate[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interview Results</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/dashboard')}>
          <Ionicons name="home-outline" size={24} color={colors.slate[700]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Score Header */}
        <Card style={styles.scoreHeader} variant="elevated">
          <View style={styles.scoreRow}>
            <ScoreRing score={overallScore} size={110} />
            <View style={styles.scoreDetails}>
              <Text style={styles.scoreTitle}>Overall Performance</Text>
              <Badge
                text={overallScore >= 70 ? 'Excellent' : overallScore >= 40 ? 'Average' : 'Needs Work'}
                variant={overallScore >= 70 ? 'success' : overallScore >= 40 ? 'warning' : 'error'}
                size="md"
              />
              <Text style={styles.sessionInfo}>
                {session?.domain ?? 'Software Engineering'} • {questions.length} Questions
              </Text>
            </View>
          </View>

          {/* Breakdown progress bars */}
          <View style={styles.breakdownSection}>
            <ProgressBar label="Technical Accuracy" value={feedback?.technical_accuracy ?? 2} maxValue={10} />
            <ProgressBar label="Problem Solving" value={feedback?.problem_solving ?? 4} maxValue={10} />
            <ProgressBar label="Communication" value={feedback?.communication ?? 5} maxValue={10} />
          </View>
        </Card>

        {/* Question Selector */}
        <Text style={styles.sectionLabel}>QUESTIONS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.questionScroll}>
          {questions.map((q: any, i: number) => (
            <TouchableOpacity
              key={i}
              style={[styles.questionTab, selectedQ === i && styles.questionTabActive]}
              onPress={() => setSelectedQ(i)}
            >
              <Text style={[styles.questionTabText, selectedQ === i && styles.questionTabTextActive]}>
                Q{i + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Question detail */}
        <Card style={styles.questionCard}>
          <Text style={styles.questionText}>
            {currentQuestion?.question_text ?? `Question ${selectedQ + 1}`}
          </Text>
        </Card>

        {/* Answer Comparison / Knowledge Gaps tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'comparison' && styles.tabActive]}
            onPress={() => setActiveTab('comparison')}
          >
            <Text style={[styles.tabText, activeTab === 'comparison' && styles.tabTextActive]}>
              Answer Comparison
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'gaps' && styles.tabActive]}
            onPress={() => setActiveTab('gaps')}
          >
            <Text style={[styles.tabText, activeTab === 'gaps' && styles.tabTextActive]}>
              Knowledge Gaps
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'comparison' ? (
          <>
            {/* Candidate's Answer */}
            <Card style={[styles.answerCard, { borderLeftColor: colors.indigo[500] }]}>
              <Text style={styles.answerLabel}>CANDIDATE'S ANSWER</Text>
              <Text style={styles.answerText}>
                {currentAnswer?.answer_text ?? 'No answer provided.'}
              </Text>
              <View style={styles.scoreChip}>
                <Text style={styles.scoreChipText}>Score: {currentAnswer?.score ?? 0}/10</Text>
              </View>
            </Card>

            {/* Ideal Answer */}
            <Card style={[styles.answerCard, { borderLeftColor: colors.emerald[500] }]}>
              <Text style={[styles.answerLabel, { color: colors.emerald[600] }]}>IDEAL ANSWER</Text>
              <Text style={styles.answerText}>
                {currentAnswer?.ideal_answer ?? 'Comprehensive ideal answer not available.'}
              </Text>
            </Card>
          </>
        ) : (
          <>
            {/* Topic Weakness Map */}
            <Text style={styles.sectionLabel}>TOPIC WEAKNESS MAP</Text>
            {(feedback?.weakness_map ?? []).map((weakness: any, i: number) => (
              <Card
                key={i}
                style={[
                  styles.weaknessCard,
                  { borderLeftColor: weakness.severity === 'High' ? colors.error : colors.warning },
                ]}
              >
                <View style={styles.weaknessHeader}>
                  <Text style={styles.weaknessTopic}>{weakness.topic}</Text>
                  <Badge
                    text={weakness.severity}
                    variant={weakness.severity === 'High' ? 'error' : 'warning'}
                  />
                </View>
                <Text style={styles.weaknessDesc}>{weakness.description}</Text>
              </Card>
            ))}
          </>
        )}

        {/* Motivational Quote */}
        <Card style={styles.quoteCard}>
          <Text style={styles.quoteEmoji}>💡</Text>
          <Text style={styles.quoteText}>
            "Every expert was once a beginner. Keep practicing and you'll see improvement!"
          </Text>
        </Card>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.replace('/(tabs)/interview-coach')}
          >
            <Text style={styles.actionText}>Practice Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => router.replace('/(tabs)/dashboard')}
          >
            <Text style={[styles.actionText, styles.actionTextPrimary]}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate[50] },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.lg,
    color: colors.slate[900], marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.slate[100],
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.lg, color: colors.slate[900],
  },
  content: { flex: 1 },
  scrollContent: { padding: spacing.lg },

  // Score header
  scoreHeader: { padding: spacing.lg, marginBottom: spacing.lg },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.lg },
  scoreDetails: { flex: 1, gap: spacing.sm },
  scoreTitle: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.xl, color: colors.slate[900],
  },
  sessionInfo: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.sm, color: colors.slate[500],
  },
  breakdownSection: { marginTop: spacing.sm },

  // Questions
  sectionLabel: {
    fontFamily: typography.fontFamily.semiBold, fontSize: typography.fontSize.xs,
    color: colors.slate[500], letterSpacing: typography.letterSpacing.uppercase,
    marginBottom: spacing.sm,
  },
  questionScroll: { marginBottom: spacing.md },
  questionTab: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: colors.white, borderRadius: borderRadius.full,
    borderWidth: 1, borderColor: colors.slate[200], marginRight: spacing.sm,
  },
  questionTabActive: { backgroundColor: colors.emerald[500], borderColor: colors.emerald[500] },
  questionTabText: {
    fontFamily: typography.fontFamily.semiBold, fontSize: typography.fontSize.sm, color: colors.slate[600],
  },
  questionTabTextActive: { color: colors.white },
  questionCard: { padding: spacing.base, marginBottom: spacing.lg },
  questionText: {
    fontFamily: typography.fontFamily.semiBold, fontSize: typography.fontSize.base,
    color: colors.slate[800], lineHeight: 22,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: colors.slate[200],
    marginBottom: spacing.lg,
  },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.emerald[500] },
  tabText: {
    fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.sm, color: colors.slate[500],
  },
  tabTextActive: { color: colors.emerald[500], fontFamily: typography.fontFamily.semiBold },

  // Answers
  answerCard: {
    padding: spacing.lg, marginBottom: spacing.md, borderLeftWidth: 4,
  },
  answerLabel: {
    fontFamily: typography.fontFamily.semiBold, fontSize: typography.fontSize.xs,
    color: colors.indigo[500], letterSpacing: typography.letterSpacing.uppercase,
    marginBottom: spacing.sm,
  },
  answerText: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.sm,
    color: colors.slate[700], lineHeight: 22,
  },
  scoreChip: {
    alignSelf: 'flex-start', backgroundColor: colors.emerald[50],
    borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    marginTop: spacing.md,
  },
  scoreChipText: {
    fontFamily: typography.fontFamily.semiBold, fontSize: typography.fontSize.xs, color: colors.emerald[600],
  },

  // Weakness
  weaknessCard: { padding: spacing.lg, marginBottom: spacing.md, borderLeftWidth: 4 },
  weaknessHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  weaknessTopic: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.base, color: colors.slate[900],
  },
  weaknessDesc: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.sm,
    color: colors.slate[600], lineHeight: 20,
  },

  // Quote
  quoteCard: { padding: spacing.lg, alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.lg },
  quoteEmoji: { fontSize: 28, marginBottom: spacing.sm },
  quoteText: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.sm,
    color: colors.slate[600], textAlign: 'center', fontStyle: 'italic', lineHeight: 22,
  },

  // Actions
  actionsRow: { flexDirection: 'row', gap: spacing.md },
  actionButton: {
    flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.base,
    borderWidth: 1.5, borderColor: colors.slate[200], alignItems: 'center',
  },
  actionButtonPrimary: { backgroundColor: colors.emerald[500], borderColor: colors.emerald[500] },
  actionText: {
    fontFamily: typography.fontFamily.semiBold, fontSize: typography.fontSize.sm, color: colors.slate[700],
  },
  actionTextPrimary: { color: colors.white },
});
