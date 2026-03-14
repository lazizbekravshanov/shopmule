'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: Event & { results: SpeechRecognitionResultList }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

interface VoiceInputProps {
  onStructuredResult: (result: {
    customerName?: string | null;
    vehicleDescription?: string | null;
    complaint?: string | null;
    techNotes?: string | null;
    priority?: string;
  }) => void;
  disabled?: boolean;
}

export function VoiceInput({ onStructuredResult, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const hasSpeechRecognition =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const stopAndProcess = useCallback(async (finalTranscript: string) => {
    if (!finalTranscript.trim()) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/ai/voice-to-wo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: finalTranscript }),
      });
      if (!res.ok) throw new Error('Failed to process voice input');
      const data = await res.json();
      onStructuredResult(data.structured);
    } catch {
      // Fall back to just using the raw transcript as the complaint
      onStructuredResult({ complaint: finalTranscript });
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  }, [onStructuredResult]);

  const toggleListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      stopAndProcess(transcript);
      return;
    }

    const recognition = new (SpeechRecognitionAPI as { new (): SpeechRecognitionInstance })();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event: Event & { results: SpeechRecognitionResultList }) => {
      let current = '';
      for (let i = 0; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript = current;
        }
      }
      setTranscript(current);
    };

    recognition.onerror = () => {
      setIsListening(false);
      if (finalTranscript) stopAndProcess(finalTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript) stopAndProcess(finalTranscript);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    setTranscript('');
  }, [isListening, transcript, stopAndProcess]);

  if (!hasSpeechRecognition) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={isListening ? 'destructive' : 'outline'}
          size="sm"
          className={cn('gap-1.5 text-xs', isListening && 'animate-pulse')}
          onClick={toggleListening}
          disabled={disabled || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Processing...
            </>
          ) : isListening ? (
            <>
              <MicOff className="h-3.5 w-3.5" />
              Stop & Process
            </>
          ) : (
            <>
              <Mic className="h-3.5 w-3.5" />
              Voice Input
            </>
          )}
        </Button>
        {isProcessing && (
          <span className="text-xs text-neutral-500 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-[#ee7a14]" />
            AI is extracting work order details...
          </span>
        )}
      </div>

      {(isListening || transcript) && (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className={cn('h-2 w-2 rounded-full', isListening ? 'bg-red-500 animate-pulse' : 'bg-neutral-300')} />
            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              {isListening ? 'Listening...' : 'Transcript'}
            </span>
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {transcript || 'Start speaking...'}
          </p>
        </div>
      )}
    </div>
  );
}
