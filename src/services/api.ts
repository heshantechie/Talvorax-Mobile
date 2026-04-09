import { env } from '../config/env';

/**
 * Backend API service for communicating with the Node.js Express server.
 * Handles PDF generation and other server-side operations.
 */

interface GeneratePdfPayload {
  userId: string;
  resumeData: Record<string, any>;
  template: string;
  addedSkills?: string[];
}

/**
 * Request PDF generation from the backend.
 * The backend renders an HTML template and generates a PDF via Puppeteer.
 */
export async function generatePdf(payload: GeneratePdfPayload): Promise<Blob> {
  const response = await fetch(`${env.API_URL}/api/generate-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PDF generation failed: ${errorText}`);
  }

  return response.blob();
}

/**
 * Check backend health.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${env.API_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Generate interview questions via backend AI.
 */
export async function generateInterviewQuestions(params: {
  mode: string;
  domain: string;
  topic?: string;
  experienceLevel: string;
  numberOfQuestions: number;
  jobDescription?: string;
  resumeText?: string;
  companyName?: string;
}): Promise<any[]> {
  const response = await fetch(`${env.API_URL}/api/generate-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to generate interview questions');
  }

  const data = await response.json();
  return data.questions;
}

/**
 * Get AI feedback on interview answer.
 */
export async function getAnswerFeedback(params: {
  question: string;
  answer: string;
  domain: string;
  keywords: string[];
}): Promise<{
  score: number;
  feedback: string;
  idealAnswer: string;
  knowledgeGaps: string[];
}> {
  const response = await fetch(`${env.API_URL}/api/evaluate-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to get answer feedback');
  }

  return response.json();
}

/**
 * Analyze resume via backend.
 */
export async function analyzeResume(params: {
  resumeText: string;
  domain: string;
  keywords: string;
}): Promise<Record<string, any>> {
  const response = await fetch(`${env.API_URL}/api/analyze-resume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze resume');
  }

  return response.json();
}

/**
 * Analyze minute talk performance.
 */
export async function analyzeMinuteTalk(params: {
  topic: string;
  category: string;
  difficulty: string;
  transcript: string;
  durationSeconds: number;
}): Promise<{
  overallScore: number;
  contentQuality: number;
  structure: number;
  fluency: number;
  confidence: number;
  speakingSpeedWpm: number;
  fillerWordsCount: number;
  fillerWordsMost: string;
  actionableTips: string[];
}> {
  const response = await fetch(`${env.API_URL}/api/analyze-minute-talk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze minute talk');
  }

  return response.json();
}
