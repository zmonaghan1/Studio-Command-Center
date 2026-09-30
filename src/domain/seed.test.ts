import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { milestoneHealth, productionOverview } from './metrics.ts';
import { seedStudio } from './seed.ts';

// The seed studio is the first thing anyone sees, so these tests pin down the
// story it tells: a project halfway through with a few realistic problems.
describe('seed studio story', () => {
  const overview = productionOverview(seedStudio);
  const health = (id: string) =>
    milestoneHealth(seedStudio.milestones.find((m) => m.id === id)!, seedStudio);

  it('is halfway through production with a year to ship', () => {
    assert.equal(Math.round(overview.timeElapsed * 100), 50);
    assert.equal(overview.daysToShip, 366);
  });

  it('has a late save system that puts the performance pass at risk', () => {
    assert.equal(health('e-save').status, 'late');
    assert.equal(health('e-perf').status, 'at-risk');
  });

  it('has a hero asset at risk from a cross-discipline blocker', () => {
    const hero = health('a-hero');
    assert.equal(hero.status, 'at-risk');
    assert.ok(hero.reasons.some((r) => r.startsWith('Blocked:')));
  });

  it('has an engineering budget running over and audio under', () => {
    const status = Object.fromEntries(
      overview.budget.byDiscipline.map((d) => [d.discipline, d.status]),
    );
    assert.equal(status['engineering'], 'over');
    assert.equal(status['audio'], 'under');
    assert.equal(overview.budget.status, 'on-plan');
  });

  it('has stale blockers that need escalation', () => {
    assert.equal(overview.openBlockers.length, 5);
    assert.equal(overview.staleBlockers, 3);
  });
});
