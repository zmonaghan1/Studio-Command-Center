import { daysBetween, isValidDate } from './dates.ts';
import type { Studio } from './types.ts';

/**
 * Checks a studio for data problems that would make the dashboard misleading.
 * Returns human-readable errors; an empty array means the data is valid.
 */
export function validateStudio(studio: Studio): string[] {
  const errors: string[] = [];
  const disciplineIds = new Set(studio.disciplines.map((d) => d.id));
  const milestoneIds = new Set<string>();

  for (const [label, value] of [
    ['projectStart', studio.projectStart],
    ['shipDate', studio.shipDate],
    ['asOf', studio.asOf],
  ] as const) {
    if (!isValidDate(value)) errors.push(`Studio ${label} "${value}" is not a valid date`);
  }

  for (const m of studio.milestones) {
    if (milestoneIds.has(m.id)) errors.push(`Duplicate milestone id "${m.id}"`);
    milestoneIds.add(m.id);
    if (!disciplineIds.has(m.discipline)) {
      errors.push(`Milestone "${m.id}" has unknown discipline "${m.discipline}"`);
    }
    if (!isValidDate(m.start) || !isValidDate(m.due)) {
      errors.push(`Milestone "${m.id}" has an invalid date`);
    } else if (daysBetween(m.start, m.due) < 0) {
      errors.push(`Milestone "${m.id}" is due before it starts`);
    }
    if (m.percentComplete < 0 || m.percentComplete > 100) {
      errors.push(`Milestone "${m.id}" percentComplete must be between 0 and 100`);
    }
  }

  for (const m of studio.milestones) {
    for (const dep of m.dependsOn) {
      if (!milestoneIds.has(dep)) errors.push(`Milestone "${m.id}" depends on unknown "${dep}"`);
    }
  }

  const cycle = findDependencyCycle(studio);
  if (cycle) errors.push(`Dependency cycle: ${cycle.join(' -> ')}`);

  for (const b of studio.blockers) {
    if (!milestoneIds.has(b.milestoneId)) {
      errors.push(`Blocker "${b.id}" references unknown milestone "${b.milestoneId}"`);
    }
    if (!disciplineIds.has(b.discipline)) {
      errors.push(`Blocker "${b.id}" has unknown discipline "${b.discipline}"`);
    }
    if (b.resolvedOn !== undefined && daysBetween(b.raisedOn, b.resolvedOn) < 0) {
      errors.push(`Blocker "${b.id}" is resolved before it was raised`);
    }
  }

  for (const line of studio.budget) {
    if (line.planned < 0 || line.spent < 0) {
      errors.push(`Budget for "${line.discipline}" cannot be negative`);
    }
  }

  return errors;
}

/** Returns the ids forming a dependency cycle, or undefined if the schedule is acyclic. */
export function findDependencyCycle(studio: Studio): string[] | undefined {
  const deps = new Map(studio.milestones.map((m) => [m.id, m.dependsOn]));
  const state = new Map<string, 'visiting' | 'done'>();
  const path: string[] = [];

  const visit = (id: string): string[] | undefined => {
    if (state.get(id) === 'done') return undefined;
    if (state.get(id) === 'visiting') return [...path.slice(path.indexOf(id)), id];
    state.set(id, 'visiting');
    path.push(id);
    for (const dep of deps.get(id) ?? []) {
      const cycle = visit(dep);
      if (cycle) return cycle;
    }
    path.pop();
    state.set(id, 'done');
    return undefined;
  };

  for (const id of deps.keys()) {
    const cycle = visit(id);
    if (cycle) return cycle;
  }
  return undefined;
}
