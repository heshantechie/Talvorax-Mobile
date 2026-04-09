import { supabase } from './supabase';

// ==========================================
// Interview Sessions
// ==========================================

export interface InterviewSession {
  id?: string;
  user_id: string;
  mode: string;
  domain: string;
  topic?: string;
  experience_level?: string;
  candidate_name?: string;
  total_questions: number;
  score?: number;
  duration?: string;
  feedback_summary?: string;
  created_at?: string;
}

export async function createInterviewSession(session: Omit<InterviewSession, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('interview_sessions')
    .insert(session)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInterviewSessions(userId: string) {
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getInterviewSession(sessionId: string) {
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateInterviewSession(sessionId: string, updates: Partial<InterviewSession>) {
  const { data, error } = await supabase
    .from('interview_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// Interview Questions
// ==========================================

export interface InterviewQuestion {
  id?: string;
  session_id: string;
  question_number: number;
  question_text: string;
  keywords?: string[];
  created_at?: string;
}

export async function saveInterviewQuestions(questions: Omit<InterviewQuestion, 'id' | 'created_at'>[]) {
  const { data, error } = await supabase
    .from('interview_questions')
    .insert(questions)
    .select();

  if (error) throw error;
  return data;
}

export async function getInterviewQuestions(sessionId: string) {
  const { data, error } = await supabase
    .from('interview_questions')
    .select('*')
    .eq('session_id', sessionId)
    .order('question_number', { ascending: true });

  if (error) throw error;
  return data;
}

// ==========================================
// Interview Answers
// ==========================================

export interface InterviewAnswer {
  id?: string;
  session_id: string;
  question_id: string;
  answer_text: string;
  score?: number;
  feedback?: string;
  ideal_answer?: string;
  knowledge_gaps?: string[];
  created_at?: string;
}

export async function saveInterviewAnswer(answer: Omit<InterviewAnswer, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('interview_answers')
    .insert(answer)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInterviewAnswers(sessionId: string) {
  const { data, error } = await supabase
    .from('interview_answers')
    .select('*')
    .eq('session_id', sessionId);

  if (error) throw error;
  return data;
}

// ==========================================
// Interview Feedback
// ==========================================

export interface InterviewFeedback {
  id?: string;
  session_id: string;
  overall_score: number;
  technical_accuracy?: number;
  problem_solving?: number;
  communication?: number;
  summary_points?: string[];
  focus_topics?: string[];
  weakness_map?: Record<string, any>;
  created_at?: string;
}

export async function saveInterviewFeedback(feedback: Omit<InterviewFeedback, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('interview_feedback')
    .insert(feedback)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInterviewFeedback(sessionId: string) {
  const { data, error } = await supabase
    .from('interview_feedback')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// Resume Analyses
// ==========================================

export interface ResumeAnalysis {
  id?: string;
  user_id: string;
  file_name: string;
  file_url?: string;
  domain: string;
  keywords?: string;
  ats_score?: number;
  match_score?: number;
  strengths?: string[];
  gaps?: string[];
  risk_of_rejection?: string;
  suggested_roles?: string[];
  required_skills?: string[];
  added_skills?: string[];
  template?: string;
  optimized_url?: string;
  created_at?: string;
}

export async function saveResumeAnalysis(analysis: Omit<ResumeAnalysis, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('resume_analyses')
    .insert(analysis)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getResumeAnalyses(userId: string) {
  const { data, error } = await supabase
    .from('resume_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getLatestResumeAnalysis(userId: string) {
  const { data, error } = await supabase
    .from('resume_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// Minute Talk Sessions
// ==========================================

export interface MinuteTalkSession {
  id?: string;
  user_id: string;
  category: string;
  difficulty: string;
  topic: string;
  transcript?: string;
  overall_score?: number;
  content_quality?: number;
  structure?: number;
  fluency?: number;
  confidence?: number;
  speaking_speed_wpm?: number;
  filler_words_count?: number;
  filler_words_most?: string;
  actionable_tips?: string[];
  created_at?: string;
}

export async function saveMinuteTalkSession(session: Omit<MinuteTalkSession, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('minute_talk_sessions')
    .insert(session)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMinuteTalkSessions(userId: string) {
  const { data, error } = await supabase
    .from('minute_talk_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getMinuteTalkStats(userId: string) {
  const { data, error } = await supabase
    .from('minute_talk_sessions')
    .select('overall_score')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  if (!data || data.length === 0) {
    return { bestScore: 0, lastScore: 0, totalSessions: 0 };
  }

  const scores = data.map(s => s.overall_score ?? 0);
  return {
    bestScore: Math.max(...scores),
    lastScore: scores[0] ?? 0,
    totalSessions: data.length,
  };
}
