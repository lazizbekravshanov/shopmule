'use client';

import { useState } from 'react';
import { CheckCircle2, ThumbsUp, ThumbsDown, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface AIFeedbackCardProps {
  workOrderId: string;
  existingAccuracy?: string | null;
  onFeedbackSubmitted?: () => void;
}

const ACCURACY_OPTIONS = [
  { value: 'SPOT_ON', label: 'Spot On', emoji: '🎯', color: 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  { value: 'MOSTLY_RIGHT', label: 'Mostly Right', emoji: '👍', color: 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { value: 'PARTIALLY_RIGHT', label: 'Partial', emoji: '🤏', color: 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100' },
  { value: 'WRONG', label: 'Wrong', emoji: '❌', color: 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100' },
] as const;

export function AIFeedbackCard({ workOrderId, existingAccuracy, onFeedbackSubmitted }: AIFeedbackCardProps) {
  const { toast } = useToast();
  const [selectedAccuracy, setSelectedAccuracy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [matchedRepair, setMatchedRepair] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingAccuracy);

  if (submitted) {
    return (
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">AI diagnosis rated: {existingAccuracy || selectedAccuracy}</span>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedAccuracy) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/work-orders/${workOrderId}/ai-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accuracy: selectedAccuracy,
          feedback: feedback.trim() || undefined,
          diagnosisMatchedRepair: matchedRepair ?? undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit feedback');
      setSubmitted(true);
      toast({ title: 'Feedback recorded', description: 'Thanks — this helps the AI improve.' });
      onFeedbackSubmitted?.();
    } catch {
      toast({ variant: 'destructive', title: 'Failed to save feedback' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
      <div className="flex items-center gap-2 text-neutral-500 mb-3">
        <MessageSquare className="h-4 w-4" />
        <span className="text-sm font-medium">Rate AI Diagnosis</span>
      </div>
      <p className="text-xs text-neutral-500 mb-3">How accurate was the AI diagnosis for this job?</p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {ACCURACY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelectedAccuracy(opt.value)}
            className={cn(
              'text-xs px-3 py-2 rounded-lg border font-medium transition-all',
              opt.color,
              selectedAccuracy === opt.value && 'ring-2 ring-offset-1 ring-current',
              selectedAccuracy && selectedAccuracy !== opt.value && 'opacity-50'
            )}
          >
            {opt.emoji} {opt.label}
          </button>
        ))}
      </div>

      {selectedAccuracy && (
        <>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-neutral-500">Repair matched AI suggestion?</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setMatchedRepair(true)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-full border transition-all',
                  matchedRepair === true
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-neutral-200 text-neutral-400 hover:border-neutral-300'
                )}
              >
                <ThumbsUp className="h-3 w-3 inline mr-1" />Yes
              </button>
              <button
                onClick={() => setMatchedRepair(false)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-full border transition-all',
                  matchedRepair === false
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-neutral-200 text-neutral-400 hover:border-neutral-300'
                )}
              >
                <ThumbsDown className="h-3 w-3 inline mr-1" />No
              </button>
            </div>
          </div>

          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Optional: What did the AI miss or get right?"
            rows={2}
            className="text-xs mb-3 resize-none"
          />

          <Button
            size="sm"
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
            Submit Feedback
          </Button>
        </>
      )}
    </div>
  );
}
