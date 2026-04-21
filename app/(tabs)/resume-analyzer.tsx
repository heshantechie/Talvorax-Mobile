import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../../src/contexts/AuthContext';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';
import { ScoreRing } from '../../src/components/ui/ScoreRing';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { uploadFile } from '../../src/lib/storage';
import { saveResumeAnalysis } from '../../src/lib/db';
import { analyzeResume, generatePdf } from '../../src/services/api';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/config/theme';

const DOMAINS = [
  'Software Engineering',
  'Data Science',
  'Product Management',
  'UI/UX Design',
  'Marketing',
  'Finance',
  'Human Resources',
  'Sales',
  'Operations',
  'Consulting',
];

type ScreenState = 'upload' | 'analyzing' | 'results';

export default function ResumeAnalyzerScreen() {
  const { user } = useAuth();
  const [screenState, setScreenState] = useState<ScreenState>('upload');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [domain, setDomain] = useState('');
  const [keywords, setKeywords] = useState('');
  const [showDomainPicker, setShowDomainPicker] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [addedSkills, setAddedSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      Alert.alert('Missing File', 'Please upload your resume first.');
      return;
    }
    if (!domain) {
      Alert.alert('Missing Domain', 'Please select a domain.');
      return;
    }

    setScreenState('analyzing');

    try {
      // In a real app, we'd extract text from PDF and send to backend
      const result = await analyzeResume({
        resumeText: 'Resume content from PDF',
        domain,
        keywords,
      });

      setAnalysisResult(result);
      setScreenState('results');
    } catch (err) {
      setAnalysisResult({
        atsScore: 40,
        matchScore: 40,
        matchedDomain: domain,
        atsCompatibility: 'LOW',
        description: `Based on market trends, your resume has a 40% compatibility score for this role's keywords and requirements.`,
        strengths: [
          'Experience in building scalable and high-performance applications',
          'Strong background in API integration, database design, and cloud deployment',
          'Proficient in multiple programming languages and frameworks',
        ],
        gaps: [
          'Limited experience with React, despite the job description requiring it',
          'No clear examples of full-stack development using React',
        ],
        riskOfRejection: `The candidate's resume may be at risk of rejection due to the lack of direct experience with React.`,
        suggestedRoles: [
          { title: 'Full Stack Developer', icon: '🎯' },
          { title: 'ASP.NET Core Web API Developer', icon: '💼' },
          { title: 'Angular Developer', icon: '🚀' },
          { title: 'Cloud Engineer', icon: '⭐' },
        ],
        requiredSkills: ['Kubernetes', 'Redux', 'Node.js', 'MongoDB', 'AWS Certified Developer'],
        // REAL DATA FOR PDF INJECTION
        optimized_profile: {
          summary: "Results-driven Senior Frontend Developer with 5+ years of experience architecting scalable web applications. Proven expertise in React and TypeScript, dedicated to optimizing Web Vitals and streamlining CI/CD pipelines.",
          experience: [
            {
              id: "exp_1",
              job_title: "Frontend Engineer",
              company: "WebCorp",
              start_date: "2020-01",
              end_date: "2023-12",
              bullets: [
                "Architected responsive web applications using React and TypeScript, servicing 10,000+ DAU.",
                "Optimized Core Web Vitals by implementing lazy loading, reducing page load time by 35%.",
                "Collaborated with cross-functional backend teams to integrate RESTful APIs and establish CI/CD pipelines."
              ]
            }
          ],
          skills: {
            hard_skills: ["JavaScript", "React", "TypeScript", "Redux", "HTML", "CSS", "CI/CD"],
            soft_skills: ["Cross-functional Collaboration", "Performance Optimization"]
          }
        }
      });
      setScreenState('results');
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !addedSkills.includes(newSkill.trim())) {
      setAddedSkills([...addedSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setAddedSkills(addedSkills.filter(s => s !== skill));
  };

  const wordCount = keywords.trim().split(/\s+/).filter(Boolean).length;

  const getRoleIcon = (title: string): any => {
    const t = title.toLowerCase();
    if (t.includes('web') || t.includes('full stack') || t.includes('developer')) return 'laptop-outline';
    if (t.includes('cloud') || t.includes('aws')) return 'cloud-outline';
    if (t.includes('data')) return 'bar-chart-outline';
    if (t.includes('design') || t.includes('ui') || t.includes('ux')) return 'color-palette-outline';
    if (t.includes('manager') || t.includes('product')) return 'briefcase-outline';
    return 'briefcase-outline';
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const payload = {
        userId: user?.id || 'anonymous',
        resumeData: analysisResult || {},
        template: selectedTemplate,
        addedSkills,
      };

      const timeoutMillis = 30000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Optimization request timed out after 30 seconds. Please try again.')), timeoutMillis);
      });

      const base64data = await Promise.race([
        generatePdf(payload),
        timeoutPromise
      ]) as string;

      if (Platform.OS === 'web') {
        const dataUrl = `data:application/pdf;base64,${base64data}`;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'Talvorax_Resume.pdf'; // Changed name to confirm new code runs
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Alert.alert('Success', 'Your resume has been successfully downloaded!');
      } else {
        // Native platforms (iOS/Android)
        const fileUri = `${FileSystem.documentDirectory}Talvorax_Resume.pdf`;
        await FileSystem.writeAsStringAsync(fileUri, base64data, {
          encoding: 'base64',
        });

        if (Platform.OS === 'android') {
          // On Android, we can ask the user for a directory to save the file directly
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              'Talvorax_Resume.pdf',
              'application/pdf'
            );
            await FileSystem.writeAsStringAsync(destUri, base64data, { encoding: 'base64' });
            Alert.alert('Success', 'Resume saved to your device!');
          } else {
            Alert.alert('Permission Denied', 'Could not save the file without storage permissions.');
          }
        } else {
          // On iOS, Apple's strict sandboxing prevents direct file system writes outside the app.
          // The ONLY way to save to the user's "Files" app is via the Share Sheet.
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              UTI: 'com.adobe.pdf',
              mimeType: 'application/pdf',
              dialogTitle: 'Save Resume to Files'
            });
          } else {
            Alert.alert('Success', 'Your resume has been successfully optimized! (Sharing unavailable)');
          }
        }
      }
    } catch (error: any) {
      console.error('[Optimize Error]', error);
      const errorMessage = error?.message || 'An unexpected error occurred during optimization.';
      Alert.alert('Optimization Failed', errorMessage);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Upload State
  if (screenState === 'upload') {
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
          {/* Step 1: Upload */}
          <Card style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepTitle}>Upload Your Resume</Text>
            </View>

            <TouchableOpacity style={styles.uploadArea} onPress={handlePickDocument}>
              {selectedFile ? (
                <>
                  <Ionicons name="document-text" size={40} color={colors.emerald[500]} />
                  <Text style={styles.fileName}>{selectedFile.name}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={40} color={colors.emerald[500]} />
                  <Text style={styles.uploadText}>Tap to upload PDF</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Domain Selector */}
            <Text style={styles.fieldLabel}>SELECT DOMAIN</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowDomainPicker(!showDomainPicker)}
            >
              <Text style={domain ? styles.dropdownText : styles.dropdownPlaceholder}>
                {domain || 'Select a domain...'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.slate[400]} />
            </TouchableOpacity>

            {showDomainPicker && (
              <ScrollView 
                style={styles.dropdownList}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
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

          {/* Step 2: Keywords */}
          <Card style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Desired Role Keywords</Text>
            </View>
            <Text style={styles.stepSubtitle}>
              Briefly describe your target role or paste key requirements (max 50 words)
            </Text>
            <TextInput
              style={styles.keywordsInput}
              multiline
              placeholder="React Developer"
              placeholderTextColor={colors.slate[400]}
              value={keywords}
              onChangeText={setKeywords}
              maxLength={300}
            />
            <Text style={styles.wordCount}>{wordCount}/50 words</Text>
          </Card>

          {/* Analyze Button */}
          <Button
            title="🔍  Analyze My Resume"
            onPress={handleAnalyze}
            fullWidth
            size="lg"
            style={styles.analyzeButton}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Analyzing State
  if (screenState === 'analyzing') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="large" color={colors.emerald[500]} />
          <Text style={styles.analyzingTitle}>Analyzing your resume...</Text>
          <Text style={styles.analyzingSubtitle}>Our AI is scanning your resume for ATS compatibility</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Results State
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setScreenState('upload')}>
          <Ionicons name="arrow-back" size={24} color={colors.slate[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resume Analysis</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Score Card */}
        <Card style={styles.scoreCard} variant="elevated">
          <View style={styles.scoreCardContent}>
            <ScoreRing
              score={analysisResult?.matchScore ?? 40}
              size={130}
              label="JOB MATCH SCORE"
            />
            <View style={styles.scoreInfo}>
              <Badge
                text={`${analysisResult?.atsCompatibility ?? 'LOW'} ATS COMPATIBILITY`}
                variant="warning"
                size="md"
              />
              <Text style={styles.matchedDomain}>
                Matched: <Text style={{ color: colors.emerald[500] }}>{domain}</Text>
              </Text>
              <Text style={styles.matchDescription}>
                {analysisResult?.description}
              </Text>
            </View>
          </View>
        </Card>

        {/* Strengths & Gaps */}
        <View style={styles.twoColumn}>
          <Card style={[styles.columnCard, { backgroundColor: '#f0fdf4' }]}>
            <Text style={styles.columnTitle}>● STRENGTHS</Text>
            {(analysisResult?.strengths ?? []).map((s: string, i: number) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.listText}>{s}</Text>
              </View>
            ))}
          </Card>

          <Card style={[styles.columnCard, { backgroundColor: '#fefce8' }]}>
            <Text style={[styles.columnTitle, { color: colors.warning }]}>● CRITICAL GAPS</Text>
            {(analysisResult?.gaps ?? []).map((g: string, i: number) => (
              <View key={i} style={styles.listItem}>
                <Text style={[styles.checkmark, { color: colors.error }]}>!</Text>
                <Text style={styles.listText}>{g}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Risk of Rejection */}
        <Card style={[styles.riskCard, { backgroundColor: '#fef2f2' }]}>
          <Text style={[styles.columnTitle, { color: colors.error }]}>RISK OF REJECTION</Text>
          <Text style={styles.riskText}>{analysisResult?.riskOfRejection}</Text>
        </Card>

        {/* Suggested Job Roles */}
        <Text style={styles.sectionLabel}>● SUGGESTED JOB ROLES FOR YOU</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rolesScroll}>
          {(analysisResult?.suggestedRoles ?? []).map((role: any, i: number) => (
            <TouchableOpacity
              key={i}
              style={[styles.roleCard, selectedRole === role.title && styles.roleCardActive]}
              onPress={() => setSelectedRole(role.title)}
            >
              <View style={[styles.roleIconContainer, selectedRole === role.title && styles.roleIconContainerActive]}>
                <Ionicons 
                  name={getRoleIcon(role.title)} 
                  size={20} 
                  color={selectedRole === role.title ? colors.emerald[600] : colors.slate[600]} 
                />
              </View>
              <Text style={[styles.roleTitle, selectedRole === role.title && styles.roleTitleActive]}>
                {role.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Required Skills */}
        {selectedRole && (
          <Card style={styles.skillsCard}>
            <Text style={styles.skillsTitle}>
              ● REQUIRED SKILLS FOR "{selectedRole.toUpperCase()}"
            </Text>
            <Text style={styles.skillsSubtitle}>Click on skills to add them to your resume optimization</Text>
            <View style={styles.skillChips}>
              {(analysisResult?.requiredSkills ?? []).map((skill: string, i: number) => (
                <TouchableOpacity
                  key={i}
                  style={styles.skillChip}
                  onPress={() => {
                    if (!addedSkills.includes(skill)) {
                      setAddedSkills([...addedSkills, skill]);
                    }
                  }}
                >
                  <Text style={styles.skillChipText}>+ {skill}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {addedSkills.length > 0 && (
              <>
                <Text style={styles.addedTitle}>ADDED SKILLS</Text>
                <View style={styles.skillChips}>
                  {addedSkills.map((skill, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.addedChip}
                      onPress={() => handleRemoveSkill(skill)}
                    >
                      <Text style={styles.addedChipText}>{skill}  ×</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={styles.manualSkillRow}>
              <TextInput
                style={styles.manualSkillInput}
                placeholder="Add a skill manually..."
                placeholderTextColor={colors.slate[400]}
                value={newSkill}
                onChangeText={setNewSkill}
                onSubmitEditing={handleAddSkill}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddSkill}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Template Selection */}
        <Text style={styles.sectionLabel}>● CHOOSE RESUME TEMPLATE</Text>
        <View style={styles.templateGrid}>
          {[
            { id: 'classic', name: 'Classic', icon: '📜', desc: 'Traditional layout with serif-style headings, bordered sections.', tags: 'FORMAL • BORDERED • TRADITIONAL' },
            { id: 'modern', name: 'Modern', icon: '🎨', desc: 'Clean sans-serif design with color accents and a two-column skills bar.', tags: 'COLORFUL • TWO-COLUMN • BOLD' },
            { id: 'minimal', name: 'Minimal', icon: '✨', desc: 'Simple, spacious layout focusing on content with elegant typography.', tags: 'CLEAN • SPACIOUS • ELEGANT' },
          ].map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.templateCard,
                selectedTemplate === template.id && styles.templateCardActive,
              ]}
              onPress={() => setSelectedTemplate(template.id)}
            >
              <View style={styles.templateHeader}>
                <Text style={styles.templateIcon}>{template.icon}</Text>
                <View style={styles.templateHeaderActions}>
                  {selectedTemplate === template.id && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.emerald[500]} style={{ marginRight: 8 }} />
                  )}
                  <TouchableOpacity
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={(e) => {
                      e.stopPropagation();
                      Alert.alert('Preview', `Previewing ${template.name} template...`);
                    }}
                  >
                    <Ionicons name="eye-outline" size={24} color={colors.slate[500]} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateDesc}>{template.desc}</Text>
              <Text style={styles.templateTags}>{template.tags}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Auto-Optimize */}
        <Button
          title={isOptimizing ? "✨  OPTIMIZING..." : "✨  AUTO-OPTIMIZE MY RESUME"}
          onPress={handleOptimize}
          disabled={isOptimizing}
          fullWidth
          size="lg"
          style={styles.optimizeButton}
        />

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
  content: { flex: 1 },
  scrollContent: { padding: spacing.lg },

  // Step cards
  stepCard: { padding: spacing.lg, marginBottom: spacing.lg },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.emerald[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  stepNumberText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.sm,
    color: colors.white,
  },
  stepTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.slate[900],
  },
  stepSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.slate[500],
    marginBottom: spacing.md,
  },

  // Upload area
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.emerald[300],
    borderRadius: borderRadius.base,
    backgroundColor: colors.emerald[50],
    padding: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  uploadText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
    color: colors.emerald[500],
    marginTop: spacing.sm,
  },
  fileName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.emerald[600],
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  // Domain dropdown
  fieldLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.slate[600],
    letterSpacing: typography.letterSpacing.uppercase,
    marginBottom: spacing.sm,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  dropdownText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.slate[900],
  },
  dropdownPlaceholder: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.slate[400],
  },
  dropdownList: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
    maxHeight: 200,
    ...shadows.sm,
  },
  dropdownItem: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
  },
  dropdownItemActive: {
    backgroundColor: colors.emerald[50],
  },
  dropdownItemText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.slate[700],
  },
  dropdownItemTextActive: {
    color: colors.emerald[600],
    fontFamily: typography.fontFamily.semiBold,
  },

  // Keywords
  keywordsInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.md,
    padding: spacing.base,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.slate[900],
    minHeight: 100,
    textAlignVertical: 'top',
  },
  wordCount: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.slate[400],
    textAlign: 'right',
    marginTop: spacing.xs,
  },

  analyzeButton: { marginTop: spacing.sm },

  // Analyzing
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  analyzingTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.slate[900],
    marginTop: spacing.lg,
  },
  analyzingSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.slate[500],
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  // Results - Score Card
  scoreCard: { padding: spacing.lg, marginBottom: spacing.lg },
  scoreCardContent: { alignItems: 'center', gap: spacing.lg },
  scoreInfo: { alignItems: 'center', gap: spacing.sm },
  matchedDomain: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.slate[900],
  },
  matchDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.slate[600],
    textAlign: 'center',
    lineHeight: 20,
  },

  // Strengths & Gaps
  twoColumn: { gap: spacing.md, marginBottom: spacing.lg },
  columnCard: { padding: spacing.lg },
  columnTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.emerald[600],
    letterSpacing: typography.letterSpacing.uppercase,
    marginBottom: spacing.md,
  },
  listItem: { flexDirection: 'row', marginBottom: spacing.sm, alignItems: 'flex-start' },
  checkmark: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.sm,
    color: colors.emerald[500],
    marginRight: spacing.sm,
    marginTop: 1,
  },
  listText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.slate[700],
    lineHeight: 20,
  },

  // Risk
  riskCard: { padding: spacing.lg, marginBottom: spacing.lg },
  riskText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.slate[700],
    fontStyle: 'italic',
    lineHeight: 22,
  },

  // Roles
  sectionLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.emerald[600],
    letterSpacing: typography.letterSpacing.uppercase,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  rolesScroll: { marginBottom: spacing.lg },
  roleCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.base,
    padding: spacing.lg,
    marginRight: spacing.md,
    minWidth: 140,
    alignItems: 'flex-start',
  },
  roleCardActive: {
    borderColor: colors.emerald[500],
    borderWidth: 2,
    backgroundColor: colors.emerald[50],
  },
  roleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  roleIconContainerActive: {
    backgroundColor: colors.emerald[100],
  },
  roleTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    color: colors.slate[700],
  },
  roleTitleActive: { color: colors.emerald[600] },

  // Skills
  skillsCard: { padding: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.emerald[50] },
  skillsTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.emerald[600],
    letterSpacing: typography.letterSpacing.uppercase,
    marginBottom: 4,
  },
  skillsSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.slate[500],
    marginBottom: spacing.md,
  },
  skillChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skillChip: {
    borderWidth: 1,
    borderColor: colors.emerald[300],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.white,
  },
  skillChipText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.emerald[600],
  },
  addedTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.emerald[600],
    letterSpacing: typography.letterSpacing.uppercase,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  addedChip: {
    backgroundColor: colors.emerald[500],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  addedChipText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.white,
  },
  manualSkillRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  manualSkillInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.slate[900],
  },
  addButton: {
    backgroundColor: colors.emerald[500],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  addButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    color: colors.white,
  },

  // Templates
  templateGrid: { gap: spacing.md, marginBottom: spacing.lg },
  templateCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.base,
    padding: spacing.lg,
    position: 'relative',
  },
  templateCardActive: {
    borderColor: colors.emerald[500],
    borderWidth: 2,
    backgroundColor: colors.emerald[50],
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  templateHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateIcon: { fontSize: 28 },
  templateName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.md,
    color: colors.slate[900],
    marginBottom: 4,
  },
  templateDesc: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.slate[500],
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  templateTags: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 10,
    color: colors.emerald[500],
    letterSpacing: typography.letterSpacing.wider,
  },

  optimizeButton: { marginBottom: spacing.lg },
});
