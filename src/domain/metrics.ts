import { daysBetween, elapsedFraction } from './dates.ts';
import type { Blocker, BudgetLine, DisciplineId, Milestone, Severity, Studio } from './types.ts';

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

export type MilestoneStatus = 'done' | 'late' | 'at-risk' | 'on-track' | 'upcoming';

export interface MilestoneHealth {
  status: MilestoneStatus;
  /** Plain-language reasons a producer can repeat in a status meeting. */
  reasons: string[];
}

/** How far behind the time-based expectation a milestone may fall before it is at risk. */
export const PROGRESS_TOLERANCE = 20;

export function milestoneHealth(milestone: Milestone, studio: Studio): MilestoneHealth {
  const { asOf } = studio;
  if (milestone.percentComplete >= 100) return { status: 'done', reasons: [] };

  const overdue = daysBetween(milestone.due, asOf);
  if (overdue > 0) {
    return { status: 'late', reasons: [`${overdue} ${plural(overdue, 'day')} past due`] };
  }

  const reasons: string[] = [];

  const expected = Math.round(elapsedFraction(milestone.start, milestone.due, asOf) * 100);
  if (expected - milestone.percentComplete >= PROGRESS_TOLERANCE) {
    reasons.push(`${milestone.percentComplete}% complete, ${expected}% expected by now`);
  }

  for (const blocker of openBlockers(studio)) {
    if (blocker.milestoneId === milestone.id && blocker.severity === 'high') {
      reasons.push(`Blocked: ${blocker.title}`);
    }
  }

  for (const depId of milestone.dependsOn) {
    const dep = studio.milestones.find((m) => m.id === depId);
    if (dep && dep.percentComplete < 100 && daysBetween(dep.due, asOf) > 0) {
      reasons.push(`Waiting on "${dep.name}", which is late`);
    }
  }

  if (reasons.length > 0) return { status: 'at-risk', reasons };
  if (daysBetween(asOf, milestone.start) > 0) return { status: 'upcoming', reasons: [] };
  return { status: 'on-track', reasons: [] };
}

// ---------------------------------------------------------------------------
// Blockers
// ---------------------------------------------------------------------------

/** Days a blocker has been open, or was open before it was resolved. */
export function blockerAge(blocker: Blocker, asOf: string): number {
  return daysBetween(blocker.raisedOn, blocker.resolvedOn ?? asOf);
}

/** Open blockers older than this many days should be escalated. */
export const STALE_AFTER_DAYS = 3;

export function isStale(blocker: Blocker, asOf: string, threshold = STALE_AFTER_DAYS): boolean {
  return blocker.resolvedOn === undefined && blockerAge(blocker, asOf) >= threshold;
}

const SEVERITY_RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

/** Unresolved blockers, most urgent first: by severity, then oldest first. */
export function openBlockers(studio: Studio): Blocker[] {
  return studio.blockers
    .filter((b) => b.resolvedOn === undefined)
    .sort(
      (a, b) =>
        SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
        blockerAge(b, studio.asOf) - blockerAge(a, studio.asOf),
    );
}

// ---------------------------------------------------------------------------
// Budget
// ---------------------------------------------------------------------------

export type BudgetStatus = 'over' | 'on-plan' | 'under';

export interface BudgetFigures {
  planned: number;
  spent: number;
  /** Planned spend by the status date, assuming spend is spread evenly over the project. */
  plannedToDate: number;
  /** Spent minus planned-to-date. Positive means overspending. */
  variance: number;
  status: BudgetStatus;
}

export interface BudgetSummary extends BudgetFigures {
  byDiscipline: (BudgetFigures & { discipline: DisciplineId })[];
}

/** Overspend beyond this fraction of planned-to-date counts as "over". */
export const OVERSPEND_TOLERANCE = 0.05;
/** Underspend beyond this fraction often means work is behind, so it is flagged too. */
export const UNDERSPEND_TOLERANCE = 0.15;

function figures(planned: number, spent: number, elapsed: number): BudgetFigures {
  const plannedToDate = Math.round(planned * elapsed);
  const variance = spent - plannedToDate;
  let status: BudgetStatus = 'on-plan';
  if (variance > plannedToDate * OVERSPEND_TOLERANCE) status = 'over';
  else if (variance < -plannedToDate * UNDERSPEND_TOLERANCE) status = 'under';
  return { planned, spent, plannedToDate, variance, status };
}

export function budgetSummary(studio: Studio): BudgetSummary {
  const elapsed = elapsedFraction(studio.projectStart, studio.shipDate, studio.asOf);
  const sum = (key: keyof Pick<BudgetLine, 'planned' | 'spent'>) =>
    studio.budget.reduce((total, line) => total + line[key], 0);

  return {
    ...figures(sum('planned'), sum('spent'), elapsed),
    byDiscipline: studio.budget.map((line) => ({
      discipline: line.discipline,
      ...figures(line.planned, line.spent, elapsed),
    })),
  };
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export interface MilestoneWithHealth {
  milestone: Milestone;
  health: MilestoneHealth;
}

export interface ProductionOverview {
  daysToShip: number;
  timeElapsed: number;
  budget: BudgetSummary;
  milestoneCounts: Record<MilestoneStatus, number>;
  /** Late and at-risk milestones, soonest due first. */
  needsAttention: MilestoneWithHealth[];
  openBlockers: Blocker[];
  staleBlockers: number;
}

export function productionOverview(studio: Studio): ProductionOverview {
  const withHealth = studio.milestones.map((milestone) => ({
    milestone,
    health: milestoneHealth(milestone, studio),
  }));

  const milestoneCounts: Record<MilestoneStatus, number> = {
    done: 0,
    late: 0,
    'at-risk': 0,
    'on-track': 0,
    upcoming: 0,
  };
  for (const { health } of withHealth) milestoneCounts[health.status] += 1;

  const open = openBlockers(studio);

  return {
    daysToShip: daysBetween(studio.asOf, studio.shipDate),
    timeElapsed: elapsedFraction(studio.projectStart, studio.shipDate, studio.asOf),
    budget: budgetSummary(studio),
    milestoneCounts,
    needsAttention: withHealth
      .filter(({ health }) => health.status === 'late' || health.status === 'at-risk')
      .sort((a, b) => daysBetween(b.milestone.due, a.milestone.due)),
    openBlockers: open,
    staleBlockers: open.filter((b) => isStale(b, studio.asOf)).length,
  };
}

function plural(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}
