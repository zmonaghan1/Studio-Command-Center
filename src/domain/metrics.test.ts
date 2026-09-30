import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  blockerAge,
  budgetSummary,
  isStale,
  milestoneHealth,
  openBlockers,
  productionOverview,
} from './metrics.ts';
import type { Blocker, Milestone, Studio } from './types.ts';

function milestone(overrides: Partial<Milestone> = {}): Milestone {
  return {
    id: 'm1',
    name: 'Milestone',
    discipline: 'design',
    start: '2026-01-01',
    due: '2026-01-31',
    percentComplete: 50,
    dependsOn: [],
    ...overrides,
  };
}

function blocker(overrides: Partial<Blocker> = {}): Blocker {
  return {
    id: 'b1',
    title: 'Blocked',
    discipline: 'design',
    owner: 'Alex',
    raisedOn: '2026-01-10',
    milestoneId: 'm1',
    severity: 'medium',
    ...overrides,
  };
}

function studio(overrides: Partial<Studio> = {}): Studio {
  return {
    studioName: 'Test',
    projectName: 'Test',
    currency: 'USD',
    projectStart: '2026-01-01',
    shipDate: '2026-12-31',
    asOf: '2026-01-16',
    disciplines: [{ id: 'design', name: 'Design', lead: 'Alex', headcount: 1 }],
    milestones: [],
    blockers: [],
    budget: [],
    ...overrides,
  };
}

describe('milestoneHealth', () => {
  it('reports done at 100% regardless of dates', () => {
    const m = milestone({ percentComplete: 100 });
    assert.equal(milestoneHealth(m, studio({ asOf: '2026-06-01' })).status, 'done');
  });

  it('reports late with the number of days overdue', () => {
    const health = milestoneHealth(milestone(), studio({ asOf: '2026-02-03' }));
    assert.deepEqual(health, { status: 'late', reasons: ['3 days past due'] });
  });

  it('is on track when progress keeps pace with time', () => {
    assert.equal(milestoneHealth(milestone(), studio()).status, 'on-track');
  });

  it('is at risk when progress falls well behind the calendar', () => {
    const health = milestoneHealth(milestone({ percentComplete: 20 }), studio());
    assert.equal(health.status, 'at-risk');
    assert.match(health.reasons[0] ?? '', /20% complete, 50% expected/);
  });

  it('is at risk while a high-severity blocker is open', () => {
    const s = studio({ blockers: [blocker({ severity: 'high' })] });
    const health = milestoneHealth(milestone(), s);
    assert.equal(health.status, 'at-risk');
    assert.deepEqual(health.reasons, ['Blocked: Blocked']);
  });

  it('ignores resolved and lower-severity blockers', () => {
    const s = studio({
      blockers: [
        blocker({ severity: 'high', resolvedOn: '2026-01-12' }),
        blocker({ id: 'b2', severity: 'medium' }),
      ],
    });
    assert.equal(milestoneHealth(milestone(), s).status, 'on-track');
  });

  it('is at risk when a dependency is late', () => {
    const dep = milestone({ id: 'dep', name: 'Rigs', due: '2026-01-10', percentComplete: 60 });
    const m = milestone({ id: 'm2', start: '2026-02-01', due: '2026-03-01', dependsOn: ['dep'] });
    const health = milestoneHealth(m, studio({ milestones: [dep, m] }));
    assert.equal(health.status, 'at-risk');
    assert.deepEqual(health.reasons, ['Waiting on "Rigs", which is late']);
  });

  it('is upcoming when it has not started and nothing threatens it', () => {
    const m = milestone({ start: '2026-03-01', due: '2026-04-01', percentComplete: 0 });
    assert.equal(milestoneHealth(m, studio()).status, 'upcoming');
  });
});

describe('blockers', () => {
  it('ages open blockers to the status date and resolved ones to resolution', () => {
    assert.equal(blockerAge(blocker(), '2026-01-16'), 6);
    assert.equal(blockerAge(blocker({ resolvedOn: '2026-01-12' }), '2026-01-16'), 2);
  });

  it('flags open blockers as stale after three days', () => {
    assert.equal(isStale(blocker({ raisedOn: '2026-01-14' }), '2026-01-16'), false);
    assert.equal(isStale(blocker({ raisedOn: '2026-01-13' }), '2026-01-16'), true);
    assert.equal(
      isStale(blocker({ raisedOn: '2026-01-01', resolvedOn: '2026-01-02' }), '2026-01-16'),
      false,
    );
  });

  it('orders open blockers by severity, then oldest first', () => {
    const s = studio({
      blockers: [
        blocker({ id: 'low-old', severity: 'low', raisedOn: '2026-01-01' }),
        blocker({ id: 'high-new', severity: 'high', raisedOn: '2026-01-15' }),
        blocker({ id: 'high-old', severity: 'high', raisedOn: '2026-01-05' }),
        blocker({ id: 'resolved', severity: 'high', resolvedOn: '2026-01-11' }),
      ],
    });
    assert.deepEqual(
      openBlockers(s).map((b) => b.id),
      ['high-old', 'high-new', 'low-old'],
    );
  });
});

describe('budgetSummary', () => {
  // The project is exactly half over on 2026-07-02 (182 of 364 days).
  const halfway = { projectStart: '2026-01-01', shipDate: '2026-12-31', asOf: '2026-07-02' };

  it('compares spend with the planned spend to date', () => {
    const summary = budgetSummary(
      studio({ ...halfway, budget: [{ discipline: 'design', planned: 1000, spent: 500 }] }),
    );
    assert.equal(summary.plannedToDate, 500);
    assert.equal(summary.variance, 0);
    assert.equal(summary.status, 'on-plan');
  });

  it('flags overspend beyond 5% and underspend beyond 15%', () => {
    const summary = budgetSummary(
      studio({
        ...halfway,
        budget: [
          { discipline: 'design', planned: 1000, spent: 530 },
          { discipline: 'art', planned: 1000, spent: 420 },
          { discipline: 'qa', planned: 1000, spent: 520 },
        ],
      }),
    );
    assert.deepEqual(
      summary.byDiscipline.map((d) => d.status),
      ['over', 'under', 'on-plan'],
    );
    assert.equal(summary.planned, 3000);
    assert.equal(summary.spent, 1470);
  });
});

describe('productionOverview', () => {
  it('summarizes schedule, attention list and blockers', () => {
    const late = milestone({ id: 'late', due: '2026-01-10' });
    const risky = milestone({ id: 'risky', percentComplete: 10, due: '2026-01-20' });
    const fine = milestone({ id: 'fine' });
    const s = studio({
      milestones: [fine, risky, late],
      blockers: [
        blocker({ raisedOn: '2026-01-01' }),
        blocker({ id: 'b2', raisedOn: '2026-01-15' }),
      ],
    });

    const overview = productionOverview(s);
    assert.equal(overview.daysToShip, 349);
    assert.equal(overview.milestoneCounts.late, 1);
    assert.equal(overview.milestoneCounts['at-risk'], 1);
    assert.equal(overview.milestoneCounts['on-track'], 1);
    assert.deepEqual(
      overview.needsAttention.map((m) => m.milestone.id),
      ['late', 'risky'],
    );
    assert.equal(overview.openBlockers.length, 2);
    assert.equal(overview.staleBlockers, 1);
  });
});
