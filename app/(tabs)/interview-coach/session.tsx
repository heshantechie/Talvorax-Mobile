import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { useTimer } from '../../../src/hooks/useTimer';
import { useSpeechToText } from '../../../src/hooks/useSpeechToText';
import { generateInterviewQuestions, getAnswerFeedback } from '../../../src/services/api';
import { createInterviewSession, saveInterviewQuestions, saveInterviewAnswer } from '../../../src/lib/db';
import { colors, typography, spacing, borderRadius, shadows } from '../../../src/config/theme';

interface Question {
  id?: string;
  text: string;
  keywords: string[];
}

export default function InterviewSession() {
  const { mode, name, domain, experience, numQuestions } = useLocalSearchParams<{
    mode: string; name: string; domain: string; experience: string; numQuestions: string;
  }>();
  const { user } = useAuth();

  const totalQuestions = parseInt(numQuestions ?? '5', 10);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const scrollRef = useRef<ScrollView>(null);

  const { formattedTime, start: startTimer, reset: resetTimer } = useTimer({
    initialSeconds: 120,
    onComplete: () => handleSubmitAnswer(),
  });

  const speech = useSpeechToText({
    onResult: (text) => {
      setUserAnswer(prev => prev ? prev + ' ' + text : text);
    },
  });

  // Load questions
  useEffect(() => {
    const init = async () => {
      try {
        // Create session
        if (user) {
          const session = await createInterviewSession({
            user_id: user.id,
            mode: mode ?? 'domain',
            domain: domain ?? '',
            candidate_name: name,
            experience_level: experience,
            total_questions: totalQuestions,
          });
          setSessionId(session.id);
        }

        // Generate questions (use mock if API fails)
        try {
          const qs = await generateInterviewQuestions({
            mode: mode ?? 'domain',
            domain: domain ?? '',
            experienceLevel: experience ?? 'Fresher',
            numberOfQuestions: totalQuestions,
          });
          setQuestions(qs.map((q: any) => ({ text: q.question || q.text, keywords: q.keywords || [] })));
        } catch {
          // Mock questions for demo
          const mockQs: Question[] = Array.from({ length: totalQuestions }, (_, i) => ({
            text: `Sample interview question ${i + 1} for ${domain} domain at ${experience} level. Please describe your experience and approach.`,
            keywords: ['experience', 'approach', 'skills'],
          }));
          setQuestions(mockQs);
        }

        setLoading(false);
        startTimer();
      } catch (err) {
        console.error('Failed to initialize session:', err);
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      Alert.alert('Empty Answer', 'Please provide your answer before submitting.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitting(true);
    setAnswers({ ...answers, [currentIdx]: userAnswer });

    // Save answer to DB
    if (sessionId && questions[currentIdx]) {
      try {
        await saveInterviewAnswer({
          session_id: sessionId,
          question_id: questions[currentIdx].id ?? `q-${currentIdx}`,
          answer_text: userAnswer,
        });
      } catch (err) {
        console.error('Failed to save answer:', err);
      }
    }

    setSubmitting(false);

    if (currentIdx < totalQuestions - 1) {
      // Next question
      setCurrentIdx(currentIdx + 1);
      setUserAnswer('');
      speech.resetTranscript();
      resetTimer();
      startTimer();
    } else {
      // Interview complete
      router.replace({
        pathname: '/(tabs)/interview-coach/complete',
        params: { sessionId: sessionId ?? '' },
      });
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers({ ...answers, [currentIdx]: '[SKIPPED]' });

    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
      setUserAnswer('');
      speech.resetTranscript();
      resetTimer();
      startTimer();
    } else {
      router.replace({
        pathname: '/(tabs)/interview-coach/complete',
        params: { sessionId: sessionId ?? '' },
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.emerald[500]} />
          <Text style={styles.loadingText}>Preparing your interview...</Text>
          <Text style={styles.loadingSubtext}>Generating {totalQuestions} questions for {domain}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIdx];
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.roleName}>{domain}</Text>
          <Text style={styles.dateText}>{today}</Text>
        </View>
        <View style={styles.timerBadge}>
          <Ionicons name="time-outline" size={14} color={colors.emerald[500]} />
          <Text style={styles.timerText}>{formattedTime}</Text>
        </View>
      </View>

      {/* Progress dots */}
      <View style={styles.progressRow}>
        {Array.from({ length: totalQuestions }, (_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i < currentIdx && styles.progressDotDone,
              i === currentIdx && styles.progressDotCurrent,
            ]}
          />
        ))}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Question counter */}
          <Text style={styles.questionCounter}>
            Question {currentIdx + 1} of {totalQuestions}
          </Text>

          {/* AI Question Bubble */}
          <View style={styles.aiBubbleRow}>
            <View style={styles.aiAvatar}>
              <Ionicons name="school" size={20} color={colors.white} />
            </View>
            <View style={styles.aiBubble}>
              <Text style={styles.aiLabel}>AI Interviewer</Text>
              <Text style={styles.aiQuestion}>{currentQuestion?.text}</Text>
            </View>
          </View>

          {/* User answer area */}
          {userAnswer ? (
            <View style={styles.userBubbleRow}>
              <View style={styles.userBubble}>
                <Text style={styles.userLabel}>{name}</Text>
                <Text style={styles.userAnswerText}>{userAnswer}</Text>
              </View>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={20} color={colors.white} />
              </View>
            </View>
          ) : null}

          {/* Speech partial */}
          {speech.isListening && speech.partialTranscript ? (
            <View style={styles.partialRow}>
              <Text style={styles.partialText}>
                {speech.partialTranscript}...
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputArea}>
          {/* Manual text input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your answer or use mic..."
              placeholderTextColor={colors.slate[400]}
              value={userAnswer}
              onChangeText={setUserAnswer}
              multiline
              maxLength={2000}
            />
            {/* Mic button */}
            <TouchableOpacity
              style={[styles.micButton, speech.isListening && styles.micButtonActive]}
              onPress={speech.isListening ? speech.stopListening : speech.startListening}
            >
              <Ionicons
                name={speech.isListening ? 'stop' : 'mic'}
                size={22}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>

          {speech.isListening && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording...</Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip Question</Text>
            </TouchableOpacity>
            <Button
              title="Submit & Next →"
              onPress={handleSubmitAnswer}
              loading={submitting}
              size="md"
              style={styles.submitButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate[50] },
  flex: { flex: 1 },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing['2xl'] },
  loadingText: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.xl,
    color: colors.slate[900], marginTop: spacing.lg,
  },
  loadingSubtext: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.sm,
    color: colors.slate[500], marginTop: spacing.sm, textAlign: 'center',
  },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.slate[100],
  },
  headerInfo: {},
  roleName: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.md, color: colors.slate[900],
  },
  dateText: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.xs, color: colors.slate[500],
  },
  timerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.emerald[50], borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  timerText: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.sm, color: colors.emerald[600],
  },

  // Progress
  progressRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 6,
    paddingVertical: spacing.sm, backgroundColor: colors.white,
  },
  progressDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: colors.slate[200],
  },
  progressDotDone: { backgroundColor: colors.emerald[500] },
  progressDotCurrent: { backgroundColor: colors.indigo[500], width: 24, borderRadius: 5 },

  // Chat
  chatArea: { flex: 1 },
  chatContent: { padding: spacing.lg, paddingBottom: spacing.xl },
  questionCounter: {
    fontFamily: typography.fontFamily.semiBold, fontSize: typography.fontSize.xs,
    color: colors.slate[500], letterSpacing: typography.letterSpacing.uppercase,
    textAlign: 'center', marginBottom: spacing.lg,
  },

  // AI bubble
  aiBubbleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.lg },
  aiAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.indigo[500], alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm,
  },
  aiBubble: {
    flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.lg,
    borderTopLeftRadius: 4, padding: spacing.base,
    ...shadows.sm,
  },
  aiLabel: {
    fontFamily: typography.fontFamily.semiBold, fontSize: typography.fontSize.xs,
    color: colors.indigo[500], marginBottom: spacing.xs,
  },
  aiQuestion: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.base,
    color: colors.slate[800], lineHeight: 24,
  },

  // User bubble
  userBubbleRow: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-end',
    marginBottom: spacing.lg,
  },
  userBubble: {
    flex: 1, maxWidth: '80%', backgroundColor: colors.emerald[50],
    borderRadius: borderRadius.lg, borderTopRightRadius: 4,
    padding: spacing.base, marginRight: spacing.sm,
  },
  userLabel: {
    fontFamily: typography.fontFamily.semiBold, fontSize: typography.fontSize.xs,
    color: colors.emerald[600], marginBottom: spacing.xs,
  },
  userAnswerText: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.base,
    color: colors.slate[800], lineHeight: 22,
  },
  userAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.emerald[500], alignItems: 'center', justifyContent: 'center',
  },

  // Partial speech
  partialRow: { paddingHorizontal: spacing.base, marginBottom: spacing.md },
  partialText: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.sm,
    color: colors.slate[400], fontStyle: 'italic',
  },

  // Input area
  inputArea: {
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.slate[100],
    padding: spacing.base,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  textInput: {
    flex: 1, backgroundColor: colors.slate[50], borderWidth: 1, borderColor: colors.slate[200],
    borderRadius: borderRadius.base, paddingHorizontal: spacing.base, paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.base,
    color: colors.slate[900], maxHeight: 100, minHeight: 44,
  },
  micButton: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.emerald[500], alignItems: 'center', justifyContent: 'center',
  },
  micButtonActive: { backgroundColor: colors.error },
  recordingIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error },
  recordingText: {
    fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.xs, color: colors.error,
  },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: spacing.md,
  },
  skipButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.base },
  skipText: {
    fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.sm, color: colors.slate[500],
  },
  submitButton: { flex: 1, marginLeft: spacing.md },
});
