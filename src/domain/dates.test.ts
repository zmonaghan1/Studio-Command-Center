import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { daysBetween, elapsedFraction, isValidDate, parseDate } from './dates.ts';

describe('parseDate', () => {
  it('parses ISO dates as UTC midnight', () => {
    assert.equal(parseDate('2026-01-02'), Date.UTC(2026, 0, 2));
  });

  it('rejects malformed and impossible dates', () => {
    assert.throws(() => parseDate('2026-1-2'));
    assert.throws(() => parseDate('2026-02-30'));
    assert.equal(isValidDate('not a date'), false);
  });
});

describe('daysBetween', () => {
  it('counts whole days in either direction', () => {
    assert.equal(daysBetween('2026-09-01', '2026-09-30'), 29);
    assert.equal(daysBetween('2026-09-30', '2026-09-01'), -29);
  });

  it('is not affected by daylight saving changes', () => {
    assert.equal(daysBetween('2026-03-07', '2026-03-09'), 2);
  });
});

describe('elapsedFraction', () => {
  it('returns the share of the span that has passed', () => {
    assert.equal(elapsedFraction('2026-01-01', '2026-01-11', '2026-01-06'), 0.5);
  });

  it('clamps to the range 0 to 1', () => {
    assert.equal(elapsedFraction('2026-01-01', '2026-01-11', '2025-12-01'), 0);
    assert.equal(elapsedFraction('2026-01-01', '2026-01-11', '2026-02-01'), 1);
  });

  it('handles zero-length spans', () => {
    assert.equal(elapsedFraction('2026-01-01', '2026-01-01', '2025-12-31'), 0);
    assert.equal(elapsedFraction('2026-01-01', '2026-01-01', '2026-01-01'), 1);
  });
});
