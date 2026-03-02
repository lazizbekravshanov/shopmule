'use client';

import { useState } from 'react';
import {
  Brain,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Calculator,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIStatusPanelProps {
  aiStatus: string | null;
  aiDiagnosis: Record<string, unknown> | null;
  aiEstimate: Record<string, unknown> | null;
  aiSummary: Record<string, unknown> | null;
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
  aiStatus,
  aiDiagnosis,
  aiEstimate,
  aiSummary,
}: AIStatusPanelProps) {
  const isProcessing = !!aiStatus;
  const hasAnyData = !!(aiDiagnosis || aiEstimate || aiSummary);

  if (!isProcessing && !hasAnyData) return null;

  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
      <div className="flex items-center gap-2 text-neutral-500 mb-4">
        <Brain className="h-4 w-4" />
        <span className="text-sm font-medium">AI Analysis</span>
        {isProcessing && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-[#ee7a14]">
            <Loader2 className="h-3 w-3 animate-spin" />
            {aiStatus === 'DIAGNOSING' && 'Diagnosing...'}
            {aiStatus === 'ESTIMATING' && 'Estimating...'}
            {aiStatus === 'SUMMARIZING' && 'Summarizing...'}
          </span>
        )}
        {!isProcessing && hasAnyData && (
          <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />
        )}
      </div>

      <div className="space-y-2">
        {/* Diagnosis */}
        <CollapsibleSection
          title="Diagnosis"
          icon={Stethoscope}
          isLoading={aiStatus === 'DIAGNOSING'}
          isAvailable={!!aiDiagnosis}
        >
          {aiDiagnosis && <DiagnosisContent data={aiDiagnosis} />}
        </CollapsibleSection>

        {/* Estimate */}
        <CollapsibleSection
          title="Estimate"
          icon={Calculator}
          isLoading={aiStatus === 'ESTIMATING'}
          isAvailable={!!aiEstimate}
        >
          {aiEstimate && <EstimateContent data={aiEstimate} />}
        </CollapsibleSection>

        {/* Summary */}
        <CollapsibleSection
          title="Summary"
          icon={FileText}
          isLoading={aiStatus === 'SUMMARIZING'}
          isAvailable={!!aiSummary}
        >
          {aiSummary && <SummaryContent data={aiSummary} />}
        </CollapsibleSection>
      </div>
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
              <li key={i} className="text-sm">{c}</li>
            ))}
          </ul>
        </div>
      )}
      {recommendedActions && recommendedActions.length > 0 && (
        <div>
          <div className="text-xs font-medium text-neutral-500 mb-1">Recommended Actions</div>
          <ul className="list-disc list-inside space-y-0.5">
            {recommendedActions.map((a, i) => (
              <li key={i} className="text-sm">{a}</li>
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
    amount: number;
  }> | undefined;
  const totalEstimate = data.totalEstimate as number | undefined;
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
                  ${typeof item.amount === 'number' ? item.amount.toFixed(2) : item.amount}
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
              <li key={i} className="text-sm">{w}</li>
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
