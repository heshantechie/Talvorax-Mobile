import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { colors, typography, spacing, borderRadius } from '../../../src/config/theme';

const DOMAINS = [
  'Software Engineering', 'Data Science', 'Web Development',
  'Mobile Development', 'DevOps', 'Cloud Computing',
  'Cybersecurity', 'Machine Learning', 'Product Management',
  'UI/UX Design',
];

const EXPERIENCE_LEVELS = ['Fresher', 'Junior', 'Mid-Level', 'Senior', 'Lead'];
const INTERVIEW_LENGTHS = [
  { label: '5 Questions', value: 5 },
  { label: '10 Questions', value: 10 },
  { label: '15 Questions', value: 15 },
];

export default function InterviewSetup() {
  const { mode, modeTitle } = useLocalSearchParams<{ mode: string; modeTitle: string }>();
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [showDomainPicker, setShowDomainPicker] = useState(false);
  const [experience, setExperience] = useState('Fresher');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleStartInterview = () => {
    if (!name.trim()) return;
    if (!domain) return;

    router.push({
      pathname: '/(tabs)/interview-coach/session',
      params: {
        mode: mode ?? 'domain',
        name,
        domain,
        experience,
        numQuestions: numQuestions.toString(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.slate[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{modeTitle ?? 'Setup Interview'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Configure Your Interview</Text>
          <Text style={styles.pageSubtitle}>
            Set up your mock interview preferences
          </Text>

          {/* Name */}
          <Card style={styles.formCard}>
            <Input
              label="Your Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              leftIcon={<Ionicons name="person-outline" size={20} color={colors.slate[400]} />}
            />

            {/* Domain */}
            <Text style={styles.fieldLabel}>INTERVIEW DOMAIN</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowDomainPicker(!showDomainPicker)}
            >
              <Text style={domain ? styles.dropdownText : styles.dropdownPlaceholder}>
                {domain || 'Select domain...'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.slate[400]} />
            </TouchableOpacity>

            {showDomainPicker && (
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                {DOMAINS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.dropdownItem, domain === d && styles.dropdownItemActive]}
                    onPress={() => { setDomain(d); setShowDomainPicker(false); }}
                  >
                    <Text style={[styles.dropdownItemText, domain === d && styles.dropdownItemTextActive]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Card>

          {/* Experience Level */}
          <Card style={styles.formCard}>
            <Text style={styles.fieldLabel}>EXPERIENCE LEVEL</Text>
            <View style={styles.toggleGroup}>
              {EXPERIENCE_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[styles.toggleButton, experience === level && styles.toggleButtonActive]}
                  onPress={() => setExperience(level)}
                >
                  <Text
                    style={[styles.toggleText, experience === level && styles.toggleTextActive]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Number of Questions */}
          <Card style={styles.formCard}>
            <Text style={styles.fieldLabel}>INTERVIEW LENGTH</Text>
            <View style={styles.toggleGroup}>
              {INTERVIEW_LENGTHS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.toggleButton,
                    styles.lengthToggle,
                    numQuestions === opt.value && styles.toggleButtonActive,
                  ]}
                  onPress={() => setNumQuestions(opt.value)}
                >
                  <Text
                    style={[styles.toggleText, numQuestions === opt.value && styles.toggleTextActive]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Start Button */}
          <Button
            title="Start Interview"
            onPress={handleStartInterview}
            disabled={!name.trim() || !domain}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.startButton}
            icon={<Ionicons name="mic" size={20} color={colors.white} />}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate[50] },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.slate[100],
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg, color: colors.slate[900],
  },
  content: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  pageTitle: {
    fontFamily: typography.fontFamily.extraBold,
    fontSize: typography.fontSize['2xl'], color: colors.slate[900],
    letterSpacing: typography.letterSpacing.tight, marginBottom: spacing.xs,
  },
  pageSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base, color: colors.slate[500],
    marginBottom: spacing.xl,
  },
  formCard: { padding: spacing.lg, marginBottom: spacing.md },
  fieldLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs, color: colors.slate[600],
    letterSpacing: typography.letterSpacing.uppercase,
    marginBottom: spacing.sm, marginTop: spacing.sm,
  },
  dropdown: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.slate[50], borderWidth: 1, borderColor: colors.slate[200],
    borderRadius: borderRadius.md, paddingHorizontal: spacing.base, paddingVertical: spacing.md,
  },
  dropdownText: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.base, color: colors.slate[900],
  },
  dropdownPlaceholder: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.base, color: colors.slate[400],
  },
  dropdownList: {
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.slate[200],
    borderRadius: borderRadius.md, marginTop: spacing.xs, maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.slate[100],
  },
  dropdownItemActive: { backgroundColor: colors.emerald[50] },
  dropdownItemText: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.base, color: colors.slate[700],
  },
  dropdownItemTextActive: { color: colors.emerald[600], fontFamily: typography.fontFamily.semiBold },
  toggleGroup: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
  },
  toggleButton: {
    borderWidth: 1.5, borderColor: colors.slate[200], borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base, paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  lengthToggle: { flex: 1, alignItems: 'center', minWidth: 80 },
  toggleButtonActive: {
    borderColor: colors.emerald[500], backgroundColor: colors.emerald[50],
  },
  toggleText: {
    fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.sm, color: colors.slate[600],
  },
  toggleTextActive: { color: colors.emerald[600], fontFamily: typography.fontFamily.semiBold },
  startButton: { marginTop: spacing.lg },
});
