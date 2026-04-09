import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform, Alert } from 'react-native';

/**
 * Speech-to-text hook.
 * 
 * NOTE: @react-native-voice/voice must be installed and linked separately.
 * This hook provides a graceful fallback if the native module isn't available.
 * For development/testing, you can type in the text manually.
 */

interface UseSpeechToTextOptions {
  locale?: string;
  onResult?: (text: string) => void;
  onPartialResult?: (text: string) => void;
  onError?: (error: string) => void;
}

interface SpeechToTextState {
  isListening: boolean;
  transcript: string;
  partialTranscript: string;
  error: string | null;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const { locale = 'en-US', onResult, onPartialResult, onError } = options;

  const [state, setState] = useState<SpeechToTextState>({
    isListening: false,
    transcript: '',
    partialTranscript: '',
    error: null,
  });

  const voiceRef = useRef<any>(null);
  const isInitialized = useRef(false);

  // Try to load the Voice module
  useEffect(() => {
    const initVoice = async () => {
      try {
        const Voice = require('@react-native-voice/voice').default;
        voiceRef.current = Voice;

        Voice.onSpeechStart = () => {
          setState(prev => ({ ...prev, isListening: true, error: null }));
        };

        Voice.onSpeechEnd = () => {
          setState(prev => ({ ...prev, isListening: false }));
        };

        Voice.onSpeechResults = (e: any) => {
          const text = e.value?.[0] ?? '';
          setState(prev => ({ ...prev, transcript: prev.transcript + ' ' + text }));
          onResult?.(text);
        };

        Voice.onSpeechPartialResults = (e: any) => {
          const partial = e.value?.[0] ?? '';
          setState(prev => ({ ...prev, partialTranscript: partial }));
          onPartialResult?.(partial);
        };

        Voice.onSpeechError = (e: any) => {
          const errorMsg = e.error?.message ?? 'Speech recognition error';
          setState(prev => ({ ...prev, isListening: false, error: errorMsg }));
          onError?.(errorMsg);
        };

        isInitialized.current = true;
      } catch {
        // Voice module not installed — use fallback mode
        console.warn('Speech recognition not available. Using manual input fallback.');
      }
    };

    initVoice();

    return () => {
      if (voiceRef.current) {
        voiceRef.current.destroy().then(voiceRef.current.removeAllListeners);
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    if (!voiceRef.current) {
      Alert.alert(
        'Speech Not Available',
        'Speech recognition is not available on this device. Please type your response manually.',
      );
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        error: null,
        partialTranscript: '',
      }));
      await voiceRef.current.start(locale);
    } catch (err: any) {
      const errorMsg = err?.message ?? 'Failed to start speech recognition';
      setState(prev => ({ ...prev, error: errorMsg }));
      onError?.(errorMsg);
    }
  }, [locale, onError]);

  const stopListening = useCallback(async () => {
    if (!voiceRef.current) return;

    try {
      await voiceRef.current.stop();
    } catch (err: any) {
      console.warn('Error stopping speech recognition:', err);
    }
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  const resetTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      partialTranscript: '',
      error: null,
    }));
  }, []);

  const appendManualText = useCallback((text: string) => {
    setState(prev => ({
      ...prev,
      transcript: prev.transcript ? prev.transcript + ' ' + text : text,
    }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    appendManualText,
    isAvailable: !!voiceRef.current,
  };
}
