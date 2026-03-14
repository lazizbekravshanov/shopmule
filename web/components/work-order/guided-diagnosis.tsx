'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Stethoscope,
  Send,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface GuidedDiagnosisProps {
  workOrderId: string;
  onDiagnosisComplete?: () => void;
}

interface DiagnosticQuestion {
  type: 'question';
  step: number;
  phase: string;
  question: string;
  why?: string;
  tip?: string;
}

interface DiagnosticConclusion {
  type: 'diagnosis';
  step: number;
  phase: string;
  primaryDiagnosis: string;
  confidence: number;
  possibleCauses: Array<{ cause: string; likelihood: string; explanation: string }>;
  recommendedActions: Array<{ action: string; priority: string; reason: string }>;
  safetyConerns?: string[];
  additionalNotes?: string;
}

type DiagnosticResponse = DiagnosticQuestion | DiagnosticConclusion;

interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  response?: DiagnosticResponse;
}

const PHASE_LABELS: Record<string, string> = {
  symptoms: 'Symptom Gathering',
  measurements: 'Measurements',
  hypothesis: 'Hypothesis Testing',
  conclusion: 'Conclusion',
};

const PHASE_ORDER = ['symptoms', 'measurements', 'hypothesis', 'conclusion'];

export function GuidedDiagnosis({ workOrderId, onDiagnosisComplete }: GuidedDiagnosisProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [currentResponse, setCurrentResponse] = useState<DiagnosticResponse | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation, currentResponse]);

  useEffect(() => {
    if (expanded && !isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded, isLoading]);

  const handleStart = async () => {
    setExpanded(true);
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/diagnose/guided', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', workOrderId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(err.error || 'Failed to start diagnostic session');
      }
      const data = await res.json();
      setSessionId(data.sessionId);
      setCurrentStep(data.currentStep);
      setCurrentResponse(data.response);
      setConversation([{ role: 'assistant', content: data.response.question || '', response: data.response }]);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to start',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
      setExpanded(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !sessionId) return;

    const answer = inputValue.trim();
    setInputValue('');
    setConversation((prev) => [...prev, { role: 'user', content: answer }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/diagnose/guided', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'respond', sessionId, answer }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(err.error || 'Failed to process response');
      }
      const data = await res.json();
      setCurrentStep(data.currentStep);
      setCurrentResponse(data.response);
      setConversation((prev) => [
        ...prev,
        { role: 'assistant', content: data.response.question || data.response.primaryDiagnosis || '', response: data.response },
      ]);

      if (data.status === 'COMPLETED') {
        setIsComplete(true);
        onDiagnosisComplete?.();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentPhase = currentResponse
    ? PHASE_ORDER.indexOf((currentResponse as DiagnosticQuestion).phase || 'symptoms')
    : -1;

  if (!expanded) {
    return (
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
        <div className="flex items-center gap-2 text-neutral-500 mb-3">
          <Stethoscope className="h-4 w-4" />
          <span className="text-sm font-medium">Guided Diagnosis</span>
        </div>
        <p className="text-xs text-neutral-500 mb-3">
          Walk through a step-by-step diagnostic with AI — it asks questions, you answer, and it builds a diagnosis.
        </p>
        <Button
          size="sm"
          className="w-full gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
          onClick={handleStart}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Stethoscope className="h-3.5 w-3.5" />}
          Start Guided Diagnosis
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-2 text-white">
          <Stethoscope className="h-4 w-4" />
          <span className="text-sm font-medium">Guided Diagnosis</span>
          {isComplete && <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/70">Step {currentStep}/8</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-white/70" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/70" />
          )}
        </div>
      </div>

      {/* Phase progress bar */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        {PHASE_ORDER.map((phase, i) => (
          <div
            key={phase}
            className={cn(
              'flex-1 text-center py-1.5 text-[10px] font-medium border-b-2 transition-colors',
              i < currentPhase
                ? 'border-violet-500 text-violet-600 bg-violet-50 dark:bg-violet-950'
                : i === currentPhase
                  ? 'border-violet-500 text-violet-700 bg-violet-50 dark:bg-violet-950'
                  : 'border-transparent text-neutral-400'
            )}
          >
            {PHASE_LABELS[phase]}
          </div>
        ))}
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="max-h-[350px] overflow-y-auto p-4 space-y-3">
        {conversation.map((entry, i) => (
          <div key={i} className={cn('flex gap-2', entry.role === 'user' ? 'justify-end' : 'justify-start')}>
            {entry.role === 'assistant' && (
              <div className="h-7 w-7 rounded-md bg-violet-100 dark:bg-violet-900 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="h-3.5 w-3.5 text-violet-600" />
              </div>
            )}
            <div
              className={cn(
                'rounded-xl px-3 py-2 max-w-[85%] text-sm',
                entry.role === 'user'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800'
              )}
            >
              {entry.role === 'assistant' && entry.response?.type === 'question' ? (
                <div className="space-y-1.5">
                  <p>{(entry.response as DiagnosticQuestion).question}</p>
                  {(entry.response as DiagnosticQuestion).why && (
                    <p className="text-xs text-neutral-500 italic">{(entry.response as DiagnosticQuestion).why}</p>
                  )}
                  {(entry.response as DiagnosticQuestion).tip && (
                    <p className="text-xs text-violet-600 dark:text-violet-400">
                      Tip: {(entry.response as DiagnosticQuestion).tip}
                    </p>
                  )}
                </div>
              ) : entry.role === 'assistant' && entry.response?.type === 'diagnosis' ? (
                <DiagnosisResult data={entry.response as DiagnosticConclusion} />
              ) : (
                <p>{entry.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
            <div className="h-7 w-7 rounded-md bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
              <Stethoscope className="h-3.5 w-3.5 text-violet-600" />
            </div>
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      {!isComplete && (
        <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 text-sm"
            disabled={isLoading}
          />
          <Button type="submit" size="sm" disabled={isLoading || !inputValue.trim()} className="bg-violet-600 hover:bg-violet-700 text-white">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      )}
    </div>
  );
}

function DiagnosisResult({ data }: { data: DiagnosticConclusion }) {
  return (
    <div className="space-y-2">
      <div className="font-medium text-sm">{data.primaryDiagnosis}</div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-neutral-500">Confidence:</span>
        <div className="h-1.5 flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full',
              data.confidence >= 0.7 ? 'bg-emerald-500' : data.confidence >= 0.4 ? 'bg-amber-500' : 'bg-red-500'
            )}
            style={{ width: `${Math.round(data.confidence * 100)}%` }}
          />
        </div>
        <span className="text-neutral-500">{Math.round(data.confidence * 100)}%</span>
      </div>
      {data.possibleCauses.length > 0 && (
        <div>
          <div className="text-xs font-medium text-neutral-500 mb-1">Causes</div>
          <ul className="text-xs space-y-0.5 list-disc list-inside">
            {data.possibleCauses.map((c, i) => (
              <li key={i}>{c.cause} ({c.likelihood})</li>
            ))}
          </ul>
        </div>
      )}
      {data.recommendedActions.length > 0 && (
        <div>
          <div className="text-xs font-medium text-neutral-500 mb-1">Recommended Actions</div>
          <ul className="text-xs space-y-0.5 list-disc list-inside">
            {data.recommendedActions.map((a, i) => (
              <li key={i}>
                <span className={cn(
                  'font-medium',
                  a.priority === 'immediate' ? 'text-red-600' : a.priority === 'soon' ? 'text-amber-600' : 'text-neutral-600'
                )}>
                  [{a.priority}]
                </span>{' '}
                {a.action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
