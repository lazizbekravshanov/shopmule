'use client';

import { useState } from 'react';
import {
  Brain,
  Camera,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Calculator,
  FileText,
  Sparkles,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface AIStatusPanelProps {
  workOrderId: string;
  aiStatus: string | null;
  aiDiagnosis: Record<string, unknown> | null;
  aiEstimate: Record<string, unknown> | null;
  aiSummary: Record<string, unknown> | null;
  photoCount?: number;
  onAIComplete?: () => void;
}

function CollapsibleSection({
  title,
  icon: Icon,
  isLoading,
  isAvailable,
  children,
}: {
  title: string;
  icon: React.ElementType;
  isLoading: boolean;
  isAvailable: boolean;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!isAvailable && !isLoading) return null;

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
      <button
        onClick={() => isAvailable && setExpanded((e) => !e)}
        disabled={!isAvailable}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
      >
        <Icon className="h-4 w-4 text-neutral-500 shrink-0" />
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex-1">
          {title}
        </span>
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 text-[#ee7a14] animate-spin" />
        ) : isAvailable ? (
          expanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
          )
        ) : null}
      </button>
      {expanded && isAvailable && (
        <div className="px-3 pb-3 text-sm text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 pt-2">
          {children}
        </div>
      )}
    </div>
  );
}

export function AIStatusPanel({
  workOrderId,
  aiStatus,
  aiDiagnosis,
  aiEstimate,
  aiSummary,
  photoCount = 0,
  onAIComplete,
}: AIStatusPanelProps) {
  const { toast } = useToast();
  const [runningDiagnosis, setRunningDiagnosis] = useState(false);
  const [runningEstimate, setRunningEstimate] = useState(false);

  const isProcessing = !!aiStatus || runningDiagnosis || runningEstimate;
  const hasAnyData = !!(aiDiagnosis || aiEstimate || aiSummary);

  const handleRunDiagnosis = async () => {
    setRunningDiagnosis(true);
    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workOrderId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(err.error || 'Failed to run diagnosis');
      }
      toast({ title: 'AI Diagnosis complete', description: 'Analysis has been generated.' });
      onAIComplete?.();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Diagnosis failed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setRunningDiagnosis(false);
    }
  };

  const handleRunEstimate = async () => {
    setRunningEstimate(true);
    try {
      const res = await fetch('/api/ai/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workOrderId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(err.error || 'Failed to generate estimate');
      }
      toast({ title: 'AI Estimate complete', description: 'Cost estimate has been generated.' });
      onAIComplete?.();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Estimate failed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setRunningEstimate(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
      <div className="flex items-center gap-2 text-neutral-500 mb-4">
        <Brain className="h-4 w-4" />
        <span className="text-sm font-medium">AI Analysis</span>
        {isProcessing && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-[#ee7a14]">
            <Loader2 className="h-3 w-3 animate-spin" />
            {(aiStatus === 'DIAGNOSING' || runningDiagnosis) && 'Diagnosing...'}
            {(aiStatus === 'ESTIMATING' || runningEstimate) && 'Estimating...'}
            {aiStatus === 'SUMMARIZING' && 'Summarizing...'}
          </span>
        )}
        {!isProcessing && hasAnyData && (
          <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />
        )}
      </div>

      {/* AI Action Buttons — always visible */}
      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={aiDiagnosis ? 'outline' : 'default'}
          className={cn(
            'flex-1 gap-1.5 text-xs h-9',
            !aiDiagnosis && 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0'
          )}
          disabled={runningDiagnosis || !!aiStatus}
          onClick={handleRunDiagnosis}
        >
          {runningDiagnosis ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Stethoscope className="h-3.5 w-3.5" />
          )}
          {aiDiagnosis ? 'Re-run Diagnosis' : 'AI Diagnosis'}
          {photoCount > 0 && (
            <span className="inline-flex items-center gap-0.5 ml-0.5 text-[10px] bg-white/20 rounded px-1">
              <Camera className="h-2.5 w-2.5" />
              {photoCount}
            </span>
          )}
        </Button>
        <Button
          size="sm"
          variant={aiEstimate ? 'outline' : 'default'}
          className={cn(
            'flex-1 gap-1.5 text-xs h-9',
            !aiEstimate && 'bg-gradient-to-r from-[#ee7a14] to-orange-500 hover:from-[#d96a0a] hover:to-orange-600 text-white border-0'
          )}
          disabled={runningEstimate || !!aiStatus}
          onClick={handleRunEstimate}
        >
          {runningEstimate ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Calculator className="h-3.5 w-3.5" />
          )}
          {aiEstimate ? 'Re-run Estimate' : 'AI Estimate'}
        </Button>
      </div>

      {/* No data prompt */}
      {!hasAnyData && !isProcessing && (
        <div className="text-center py-3 px-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <Sparkles className="h-5 w-5 text-neutral-400 mx-auto mb-1.5" />
          <p className="text-xs text-neutral-500">
            Run AI analysis to get instant diagnosis, cost estimates, and repair recommendations.
          </p>
        </div>
      )}

      {/* Results */}
      {hasAnyData && (
        <div className="space-y-2">
          <CollapsibleSection
            title="Diagnosis"
            icon={Stethoscope}
            isLoading={aiStatus === 'DIAGNOSING' || runningDiagnosis}
            isAvailable={!!aiDiagnosis}
          >
            {aiDiagnosis && <DiagnosisContent data={aiDiagnosis} />}
          </CollapsibleSection>

          <CollapsibleSection
            title="Estimate"
            icon={Calculator}
            isLoading={aiStatus === 'ESTIMATING' || runningEstimate}
            isAvailable={!!aiEstimate}
          >
            {aiEstimate && <EstimateContent data={aiEstimate} />}
          </CollapsibleSection>

          <CollapsibleSection
            title="Summary"
            icon={FileText}
            isLoading={aiStatus === 'SUMMARIZING'}
            isAvailable={!!aiSummary}
          >
            {aiSummary && <SummaryContent data={aiSummary} />}
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}

function DiagnosisContent({ data }: { data: Record<string, unknown> }) {
  const confidence = data.confidence as number | undefined;
  const primaryDiagnosis = data.primaryDiagnosis as string | undefined;
  const possibleCauses = data.possibleCauses as string[] | undefined;
  const recommendedActions = data.recommendedActions as string[] | undefined;
  const safetyConcerns = data.safetyConcerns as string[] | undefined;

  return (
    <div className="space-y-3">
      {primaryDiagnosis && (
        <div>
          <div className="text-xs font-medium text-neutral-500 mb-1">Primary Diagnosis</div>
          <p className="text-sm text-neutral-800 dark:text-neutral-200">{primaryDiagnosis}</p>
        </div>
      )}
      {confidence != null && (
        <div>
          <div className="text-xs font-medium text-neutral-500 mb-1">Confidence</div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  confidence >= 0.7
                    ? 'bg-emerald-500'
                    : confidence >= 0.4
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                )}
                style={{ width: `${Math.round(confidence * 100)}%` }}
              />
            </div>
            <span className="text-xs text-neutral-500">{Math.round(confidence * 100)}%</span>
          </div>
        </div>
      )}
      {possibleCauses && possibleCauses.length > 0 && (
        <div>
          <div className="text-xs font-medium text-neutral-500 mb-1">Possible Causes</div>
          <ul className="list-disc list-inside space-y-0.5">
            {possibleCauses.map((c, i) => (
              <li key={i} className="text-sm">{typeof c === 'string' ? c : (c as { cause?: string })?.cause || JSON.stringify(c)}</li>
            ))}
          </ul>
        </div>
      )}
      {recommendedActions && recommendedActions.length > 0 && (
        <div>
          <div className="text-xs font-medium text-neutral-500 mb-1">Recommended Actions</div>
          <ul className="list-disc list-inside space-y-0.5">
            {recommendedActions.map((a, i) => (
              <li key={i} className="text-sm">{typeof a === 'string' ? a : (a as { action?: string })?.action || JSON.stringify(a)}</li>
            ))}
          </ul>
        </div>
      )}
      {safetyConcerns && safetyConcerns.length > 0 && (
        <div>
          <div className="flex items-center gap-1 text-xs font-medium text-amber-600 mb-1">
            <AlertTriangle className="h-3 w-3" />
            Safety Concerns
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {safetyConcerns.map((s, i) => (
              <li key={i} className="text-sm text-amber-700 dark:text-amber-400">{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EstimateContent({ data }: { data: Record<string, unknown> }) {
  const lineItems = data.lineItems as Array<{
    description: string;
    type: string;
    amount?: number;
    total?: number;
  }> | undefined;
  const totalEstimate = (data.totalEstimate ?? data.estimatedTotal) as number | undefined;
  const complexity = data.complexity as string | undefined;
  const confidence = data.confidence as number | undefined;
  const caveats = data.caveats as string[] | undefined;

  return (
    <div className="space-y-3">
      {lineItems && lineItems.length > 0 && (
        <div>
          <div className="text-xs font-medium text-neutral-500 mb-1">Line Items</div>
          <div className="space-y-1">
            {lineItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-neutral-700 dark:text-neutral-300">{item.description}</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  ${typeof (item.total ?? item.amount) === 'number' ? (item.total ?? item.amount)!.toFixed(2) : (item.total ?? item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {totalEstimate != null && (
        <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700">
          <span className="text-sm font-medium">Total</span>
          <span className="text-sm font-semibold">${totalEstimate.toFixed(2)}</span>
        </div>
      )}
      {(complexity || confidence != null) && (
        <div className="flex gap-4 text-xs text-neutral-500">
          {complexity && <span>Complexity: {complexity}</span>}
          {confidence != null && <span>Confidence: {Math.round(confidence * 100)}%</span>}
        </div>
      )}
      {caveats && caveats.length > 0 && (
        <div>
          <div className="text-xs font-medium text-neutral-500 mb-1">Caveats</div>
          <ul className="list-disc list-inside space-y-0.5 text-xs text-neutral-500">
            {caveats.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SummaryContent({ data }: { data: Record<string, unknown> }) {
  const customerSummary = data.customerSummary as string | undefined;
  const technicalSummary = data.technicalSummary as string | undefined;
  const workPerformed = data.workPerformed as string[] | undefined;
  const recommendations = data.recommendations as string[] | undefined;

  return (
    <div className="space-y-3">
      {customerSummary && (
        <div>
          <div className="text-xs font-medium text-neutral-500 mb-1">Customer Summary</div>
          <p className="text-sm">{customerSummary}</p>
        </div>
      )}
      {technicalSummary && (
        <div>
          <div className="text-xs font-medium text-neutral-500 mb-1">Technical Summary</div>
          <p className="text-sm">{technicalSummary}</p>
        </div>
      )}
      {workPerformed && workPerformed.length > 0 && (
        <div>
          <div className="text-xs font-medium text-neutral-500 mb-1">Work Performed</div>
          <ul className="list-disc list-inside space-y-0.5">
            {workPerformed.map((w, i) => (
              <li key={i} className="text-sm">{typeof w === 'string' ? w : (w as { description?: string })?.description || JSON.stringify(w)}</li>
            ))}
          </ul>
        </div>
      )}
      {recommendations && recommendations.length > 0 && (
        <div>
          <div className="text-xs font-medium text-neutral-500 mb-1">Recommendations</div>
          <ul className="list-disc list-inside space-y-0.5">
            {recommendations.map((r, i) => (
              <li key={i} className="text-sm">{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
