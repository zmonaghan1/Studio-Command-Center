import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatDate, formatDays, formatMoney, formatPercent, formatVariance } from './format.ts';

describe('format', () => {
  it('formats money compactly', () => {
    assert.equal(formatMoney(7_180_000, 'USD'), '$7.18M');
    assert.equal(formatMoney(240_000, 'USD'), '$240K');
    assert.equal(formatMoney(950, 'USD'), '$950');
    assert.equal(formatMoney(99_450, 'USD'), '$99.5K');
  });

  it('signs variances', () => {
    assert.equal(formatVariance(240_000, 'USD'), '+$240K');
    assert.equal(formatVariance(-90_000, 'USD'), '−$90K');
    assert.equal(formatVariance(0, 'USD'), '$0');
  });

  it('formats calendar dates without time zone drift', () => {
    assert.equal(formatDate('2026-10-01'), 'Oct 1, 2026');
  });

  it('formats percents and day counts', () => {
    assert.equal(formatPercent(0.4986), '50%');
    assert.equal(formatDays(1), '1 day');
    assert.equal(formatDays(12), '12 days');
  });
});
