import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { seedStudio } from './seed.ts';
import type { Studio } from './types.ts';
import { findDependencyCycle, validateStudio } from './validate.ts';

const clone = (): Studio => structuredClone(seedStudio);

describe('validateStudio', () => {
  it('accepts the seed studio', () => {
    assert.deepEqual(validateStudio(seedStudio), []);
  });

  it('reports unknown dependencies and milestone references', () => {
    const s = clone();
    s.milestones[0]!.dependsOn.push('missing');
    s.blockers[0]!.milestoneId = 'nowhere';
    const errors = validateStudio(s);
    assert.ok(errors.some((e) => e.includes('depends on unknown "missing"')));
    assert.ok(errors.some((e) => e.includes('unknown milestone "nowhere"')));
  });

  it('reports invalid dates and progress', () => {
    const s = clone();
    s.milestones[0]!.due = '2020-01-01';
    s.milestones[1]!.percentComplete = 140;
    s.asOf = 'yesterday';
    const errors = validateStudio(s);
    assert.ok(errors.some((e) => e.includes('is due before it starts')));
    assert.ok(errors.some((e) => e.includes('between 0 and 100')));
    assert.ok(errors.some((e) => e.includes('asOf')));
  });

  it('reports duplicate ids and negative budgets', () => {
    const s = clone();
    s.milestones.push({ ...s.milestones[0]! });
    s.budget[0]!.spent = -1;
    const errors = validateStudio(s);
    assert.ok(errors.some((e) => e.startsWith('Duplicate milestone id')));
    assert.ok(errors.some((e) => e.includes('cannot be negative')));
  });
});

describe('findDependencyCycle', () => {
  it('returns undefined for the seed schedule', () => {
    assert.equal(findDependencyCycle(seedStudio), undefined);
  });

  it('finds a cycle and names the milestones in it', () => {
    const s = clone();
    s.milestones.find((m) => m.id === 'd-core')!.dependsOn.push('p-vs');
    const cycle = findDependencyCycle(s);
    assert.ok(cycle);
    assert.equal(cycle[0], cycle.at(-1));
    assert.ok(cycle.includes('p-vs') && cycle.includes('d-core'));
    assert.ok(validateStudio(s).some((e) => e.startsWith('Dependency cycle')));
  });
});
