import { type WorkOrder } from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────────────────────

export type SlaRisk = 'low' | 'med' | 'high';
export type BlockerType = 'parts' | 'approval' | 'tech' | 'customer';

export type ActionKey =
  | 'generate_estimate'
  | 'send_reminder'
  | 'order_parts'
  | 'update_customer'
  | 'assign_tech'
  | 'escalate';

export interface AIAction {
  key: ActionKey;
  label: string;
  reason: string;
}

export interface WorkOrderAI {
  priorityScore: number;          // 0-100
  slaRisk: SlaRisk;
  predictedEta: string;           // display string like "2 days" or "Overdue"
  revenueEstimate: number;        // $
  marginEstimatePct: number;      // 0-100
  blockers: BlockerType[];
  confidence: number;             // 0-1
  nextBestActions: AIAction[];
}

export interface WorkOrderWithAI extends WorkOrder {
  ai: WorkOrderAI;
}

export interface AIInsights {
  slaRiskCount: number;
  pendingApprovalsAmount: number;
  partsBlockersCount: number;
  customersWaitingCount: number;
  techOverloadWarning: boolean;
  techOverloadNames: string[];
}

export interface ShopHealthScore {
  overall: number;              // 0-100
  efficiency: number;           // 0-100
  approvalLatencyHrs: number;   // avg hours
  utilization: number;          // 0-100
  avgTurnaroundDays: number;    // avg days
}

export interface AIRecommendation {
  id: string;
  workOrderId: string;
  workOrder: WorkOrder;
  action: AIAction;
  priorityScore: number;
  confidence: number;
  slaRisk: SlaRisk;
  revenueAtStake: number;
  reason: string;
}

// ─── Mock AI Engine ─────────────────────────────────────────────────────────
// Generates realistic AI signals from actual work order data.
// In production, this would call an AI scoring endpoint.

const ACTION_TEMPLATES: Record<ActionKey, { label: string; reasons: string[] }> = {
  generate_estimate: {
    label: 'Generate Estimate',
    reasons: [
      'No estimate on file — customer waiting for pricing',
      'Diagnosis complete, ready for estimate generation',
      'Similar jobs averaged $%revenue% — auto-generate to save time',
    ],
  },
  send_reminder: {
    label: 'Send Approval Reminder',
    reasons: [
      'Estimate sent %days% days ago with no response',
      'Customer viewed estimate but hasn\'t approved — follow up',
      'Approval pending — revenue at risk of loss',
    ],
  },
  order_parts: {
    label: 'Order Parts',
    reasons: [
      'Parts needed are out of stock — order now to avoid delays',
      'Lead time for parts is 3-5 days — order immediately',
      'Backordered part holding up repair — check alternate suppliers',
    ],
  },
  update_customer: {
    label: 'Update Customer',
    reasons: [
      'No customer update in %days% days — send status notification',
      'Job status changed — customer hasn\'t been notified',
      'Customer called yesterday asking for an update',
    ],
  },
  assign_tech: {
    label: 'Assign Technician',
    reasons: [
      'Approved work order has no technician assigned',
      'Current tech is overloaded — reassign for faster completion',
      'This job matches specialist skills available today',
    ],
  },
  escalate: {
    label: 'Escalate to Manager',
    reasons: [
      'SLA breach imminent — needs manager intervention',
      'Customer dispute requires management review',
      'Job stalled for %days% days with no progress',
    ],
  },
};

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (h * 1103515245 + 12345) | 0;
    return ((h >>> 16) & 0x7fff) / 0x7fff;
  };
}

function daysSince(dateStr?: string): number {
  if (!dateStr) return 0;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function pickReason(reasons: string[], rand: () => number, vars: Record<string, string>): string {
  const template = reasons[Math.floor(rand() * reasons.length)];
  return template.replace(/%(\w+)%/g, (_, key) => vars[key] || '?');
}

export function computeWorkOrderAI(wo: WorkOrder): WorkOrderAI {
  const rand = seededRandom(wo.id);
  const age = daysSince(wo.createdAt);
  const hasAssignment = (wo.assignments?.length ?? 0) > 0;
  const hasParts = (wo.partsUsed?.length ?? 0) > 0;
  const hasLabor = (wo.laborEntries?.length ?? 0) > 0;

  // Revenue estimate: actual totals or simulated
  const laborTotal = wo.laborHours * wo.laborRate;
  const partsTotal = wo.partsTotal || 0;
  const revenueEstimate = laborTotal + partsTotal || Math.floor(800 + rand() * 4200);

  // Margin estimate based on parts markup and labor
  const marginEstimatePct = Math.round(35 + rand() * 30);

  // Priority score: higher = more urgent
  let priorityScore = 50;

  // Status-based adjustments
  if (wo.status === 'DIAGNOSED') priorityScore += 15; // needs attention
  if (wo.status === 'APPROVED') priorityScore += 10;  // ready to work
  if (wo.status === 'IN_PROGRESS') priorityScore += 5;
  if (wo.status === 'COMPLETED') priorityScore -= 30;

  // Age-based urgency
  if (age > 14) priorityScore += 20;
  else if (age > 7) priorityScore += 10;
  else if (age > 3) priorityScore += 5;

  // Revenue-based priority
  if (revenueEstimate > 3000) priorityScore += 10;
  if (revenueEstimate > 5000) priorityScore += 5;

  // No tech assigned for approved jobs
  if (!hasAssignment && wo.status === 'APPROVED') priorityScore += 15;

  priorityScore = Math.max(0, Math.min(100, Math.round(priorityScore + (rand() * 10 - 5))));

  // SLA risk
  let slaRisk: SlaRisk = 'low';
  if (priorityScore >= 75 || age > 10) slaRisk = 'high';
  else if (priorityScore >= 55 || age > 5) slaRisk = 'med';

  // Blockers
  const blockers: BlockerType[] = [];
  if (wo.status === 'DIAGNOSED' && !hasLabor) blockers.push('approval');
  // Use real partsStatus field; fall back to inference only if no status set
  if (wo.partsStatus === 'WAITING' || wo.partsStatus === 'ORDERED') {
    blockers.push('parts');
  }
  if (!hasAssignment && wo.status !== 'COMPLETED') blockers.push('tech');
  if (wo.status === 'DIAGNOSED' && age > 3) blockers.push('customer');

  // Predicted ETA
  let predictedEta: string;
  if (wo.status === 'COMPLETED') {
    predictedEta = 'Done';
  } else if (slaRisk === 'high' && age > 14) {
    predictedEta = 'Overdue';
  } else {
    const daysLeft = Math.max(1, Math.round(2 + rand() * 5));
    predictedEta = `${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
  }

  // Confidence
  const confidence = Math.round((0.6 + rand() * 0.35) * 100) / 100;

  // Next best actions based on actual state
  const nextBestActions: AIAction[] = [];
  const vars = { days: String(age), revenue: String(revenueEstimate) };

  if (wo.status === 'DIAGNOSED') {
    nextBestActions.push({
      key: 'generate_estimate',
      label: ACTION_TEMPLATES.generate_estimate.label,
      reason: pickReason(ACTION_TEMPLATES.generate_estimate.reasons, rand, vars),
    });
    if (age > 2) {
      nextBestActions.push({
        key: 'update_customer',
        label: ACTION_TEMPLATES.update_customer.label,
        reason: pickReason(ACTION_TEMPLATES.update_customer.reasons, rand, vars),
      });
    }
  }

  if (wo.status === 'APPROVED' || (wo.status === 'DIAGNOSED' && age > 5)) {
    if (!hasAssignment) {
      nextBestActions.push({
        key: 'assign_tech',
        label: ACTION_TEMPLATES.assign_tech.label,
        reason: pickReason(ACTION_TEMPLATES.assign_tech.reasons, rand, vars),
      });
    }
  }

  if (blockers.includes('parts')) {
    nextBestActions.push({
      key: 'order_parts',
      label: ACTION_TEMPLATES.order_parts.label,
      reason: pickReason(ACTION_TEMPLATES.order_parts.reasons, rand, vars),
    });
  }

  if (wo.status === 'APPROVED' && age > 3) {
    nextBestActions.push({
      key: 'send_reminder',
      label: ACTION_TEMPLATES.send_reminder.label,
      reason: pickReason(ACTION_TEMPLATES.send_reminder.reasons, rand, vars),
    });
  }

  if (wo.status === 'IN_PROGRESS' && age > 5) {
    nextBestActions.push({
      key: 'update_customer',
      label: ACTION_TEMPLATES.update_customer.label,
      reason: pickReason(ACTION_TEMPLATES.update_customer.reasons, rand, vars),
    });
  }

  if (slaRisk === 'high' && age > 10) {
    nextBestActions.push({
      key: 'escalate',
      label: ACTION_TEMPLATES.escalate.label,
      reason: pickReason(ACTION_TEMPLATES.escalate.reasons, rand, vars),
    });
  }

  // Ensure at least one action
  if (nextBestActions.length === 0) {
    nextBestActions.push({
      key: 'update_customer',
      label: ACTION_TEMPLATES.update_customer.label,
      reason: 'Proactive customer communication improves satisfaction scores',
    });
  }

  return {
    priorityScore,
    slaRisk,
    predictedEta,
    revenueEstimate,
    marginEstimatePct,
    blockers,
    confidence,
    nextBestActions,
  };
}

export function enrichWorkOrders(workOrders: WorkOrder[]): WorkOrderWithAI[] {
  return workOrders.map((wo) => ({
    ...wo,
    ai: computeWorkOrderAI(wo),
  }));
}

export function computeAIInsights(enriched: WorkOrderWithAI[]): AIInsights {
  const active = enriched.filter((wo) => wo.status !== 'COMPLETED');

  const slaRiskCount = active.filter((wo) => wo.ai.slaRisk === 'high').length;

  const pendingApprovalsAmount = active
    .filter((wo) => wo.status === 'DIAGNOSED')
    .reduce((sum, wo) => sum + wo.ai.revenueEstimate, 0);

  const partsBlockersCount = active.filter((wo) =>
    wo.ai.blockers.includes('parts')
  ).length;

  const customersWaitingCount = active.filter((wo) =>
    wo.ai.blockers.includes('customer')
  ).length;

  // Tech overload: count assignments per tech
  const techCounts: Record<string, { count: number; name: string }> = {};
  active.forEach((wo) => {
    wo.assignments?.forEach((a) => {
      const id = a.employee.id;
      if (!techCounts[id]) techCounts[id] = { count: 0, name: a.employee.name };
      techCounts[id].count++;
    });
  });

  const overloaded = Object.values(techCounts).filter((t) => t.count >= 4);

  return {
    slaRiskCount,
    pendingApprovalsAmount,
    partsBlockersCount,
    customersWaitingCount,
    techOverloadWarning: overloaded.length > 0,
    techOverloadNames: overloaded.map((t) => t.name),
  };
}

export function computeShopHealth(enriched: WorkOrderWithAI[]): ShopHealthScore {
  const total = enriched.length || 1;
  const completed = enriched.filter((wo) => wo.status === 'COMPLETED');
  const active = enriched.filter((wo) => wo.status !== 'COMPLETED');

  // Efficiency: ratio of completed to total
  const efficiency = Math.round((completed.length / total) * 100);

  // Approval latency: avg age of DIAGNOSED orders
  const diagnosed = enriched.filter((wo) => wo.status === 'DIAGNOSED');
  const approvalLatencyHrs = diagnosed.length > 0
    ? Math.round(diagnosed.reduce((sum, wo) => sum + daysSince(wo.createdAt) * 24, 0) / diagnosed.length)
    : 0;

  // Utilization: what % of active orders have techs assigned
  const assigned = active.filter((wo) => (wo.assignments?.length ?? 0) > 0);
  const utilization = active.length > 0
    ? Math.round((assigned.length / active.length) * 100)
    : 100;

  // Average turnaround for completed orders
  const avgTurnaroundDays = completed.length > 0
    ? Math.round(completed.reduce((sum, wo) => sum + daysSince(wo.createdAt), 0) / completed.length)
    : 0;

  // Overall health score (weighted composite)
  const overall = Math.round(
    efficiency * 0.3 +
    Math.max(0, 100 - approvalLatencyHrs) * 0.2 +
    utilization * 0.3 +
    Math.max(0, 100 - avgTurnaroundDays * 5) * 0.2
  );

  return {
    overall: Math.max(0, Math.min(100, overall)),
    efficiency,
    approvalLatencyHrs,
    utilization,
    avgTurnaroundDays,
  };
}

export function generateRecommendations(enriched: WorkOrderWithAI[]): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];

  enriched
    .filter((wo) => wo.status !== 'COMPLETED')
    .forEach((wo) => {
      wo.ai.nextBestActions.forEach((action) => {
        recommendations.push({
          id: `${wo.id}-${action.key}`,
          workOrderId: wo.id,
          workOrder: wo,
          action,
          priorityScore: wo.ai.priorityScore,
          confidence: wo.ai.confidence,
          slaRisk: wo.ai.slaRisk,
          revenueAtStake: wo.ai.revenueEstimate,
          reason: action.reason,
        });
      });
    });

  // Sort by priority score descending, then confidence
  recommendations.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    return b.confidence - a.confidence;
  });

  return recommendations;
}
