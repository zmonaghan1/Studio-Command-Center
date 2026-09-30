import { blockerAge, isStale, productionOverview } from '../../domain/metrics.ts';
import type { BudgetStatus, MilestoneStatus } from '../../domain/metrics.ts';
import type { DisciplineId, Severity, Studio } from '../../domain/types.ts';
import { h } from '../dom.ts';
import { formatDate, formatDays, formatMoney, formatPercent, formatVariance } from '../format.ts';

const STATUS_LABEL: Record<MilestoneStatus, string> = {
  done: 'Done',
  late: 'Late',
  'at-risk': 'At risk',
  'on-track': 'On track',
  upcoming: 'Upcoming',
};

const BUDGET_LABEL: Record<BudgetStatus, string> = {
  over: 'Over plan',
  'on-plan': 'On plan',
  under: 'Under plan',
};

const SEVERITY_LABEL: Record<Severity, string> = { high: 'High', medium: 'Medium', low: 'Low' };

export function renderOverview(studio: Studio): HTMLElement {
  const o = productionOverview(studio);
  const disciplineName = (id: DisciplineId) =>
    studio.disciplines.find((d) => d.id === id)?.name ?? id;
  const money = (n: number) => formatMoney(n, studio.currency);

  const kpis = h(
    'section',
    { class: 'kpis', 'aria-label': 'Headline numbers' },
    kpi(
      'Days to ship',
      String(o.daysToShip),
      `${formatPercent(o.timeElapsed)} of schedule elapsed · ships ${formatDate(studio.shipDate)}`,
    ),
    kpi(
      'Budget spent',
      money(o.budget.spent),
      `of ${money(o.budget.planned)} · ${formatVariance(o.budget.variance, studio.currency)} vs plan to date`,
      o.budget.status === 'over' ? 'bad' : undefined,
    ),
    kpi(
      'Milestones needing attention',
      String(o.milestoneCounts.late + o.milestoneCounts['at-risk']),
      `${o.milestoneCounts.late} late · ${o.milestoneCounts['at-risk']} at risk · ${o.milestoneCounts.done} done`,
      o.milestoneCounts.late > 0 ? 'bad' : undefined,
    ),
    kpi(
      'Open blockers',
      String(o.openBlockers.length),
      `${o.staleBlockers} open ${o.staleBlockers === 1 ? 'is' : 'are'} stale and need escalation`,
      o.staleBlockers > 0 ? 'warn' : undefined,
    ),
  );

  const attention = panel(
    'Milestones needing attention',
    'Late or at-risk work, soonest due first.',
    o.needsAttention.length === 0
      ? h('p', { class: 'empty' }, 'Every milestone is on track.')
      : h(
          'ul',
          { class: 'rows' },
          o.needsAttention.map(({ milestone, health }) =>
            h(
              'li',
              { class: 'row' },
              h(
                'div',
                { class: 'row-main' },
                h('span', { class: 'row-title' }, milestone.name),
                h(
                  'span',
                  { class: 'row-meta' },
                  `${disciplineName(milestone.discipline)} · due ${formatDate(milestone.due)} · ${milestone.percentComplete}% complete`,
                ),
                h(
                  'ul',
                  { class: 'reasons' },
                  health.reasons.map((r) => h('li', {}, r)),
                ),
              ),
              pill(STATUS_LABEL[health.status], health.status),
            ),
          ),
        ),
  );

  const blockers = panel(
    'Open blockers',
    'Most severe first, then oldest. Stale after 3 days.',
    o.openBlockers.length === 0
      ? h('p', { class: 'empty' }, 'Nobody is blocked.')
      : h(
          'ul',
          { class: 'rows' },
          o.openBlockers.map((b) => {
            const stale = isStale(b, studio.asOf);
            const milestone = studio.milestones.find((m) => m.id === b.milestoneId);
            return h(
              'li',
              { class: 'row' },
              h(
                'div',
                { class: 'row-main' },
                h('span', { class: 'row-title' }, b.title),
                h(
                  'span',
                  { class: 'row-meta' },
                  `${disciplineName(b.discipline)} blocked · owner ${b.owner}`,
                  milestone ? ` · threatens "${milestone.name}"` : '',
                ),
              ),
              h(
                'div',
                { class: 'row-side' },
                pill(SEVERITY_LABEL[b.severity], `sev-${b.severity}`),
                h(
                  'span',
                  { class: stale ? 'age stale' : 'age' },
                  formatDays(blockerAge(b, studio.asOf)),
                  stale ? ' · escalate' : '',
                ),
              ),
            );
          }),
        ),
  );

  const budget = panel(
    'Budget by discipline',
    'Bar shows spend against the full budget; the tick marks planned spend to date.',
    h(
      'ul',
      { class: 'budget' },
      o.budget.byDiscipline.map((line) => {
        const spentPct = line.planned > 0 ? (line.spent / line.planned) * 100 : 0;
        const planPct = line.planned > 0 ? (line.plannedToDate / line.planned) * 100 : 0;
        return h(
          'li',
          { class: `budget-line ${line.status}` },
          h(
            'div',
            { class: 'budget-head' },
            h('span', { class: 'row-title' }, disciplineName(line.discipline)),
            pill(BUDGET_LABEL[line.status], `budget-${line.status}`),
          ),
          h(
            'div',
            {
              class: 'bar',
              role: 'img',
              'aria-label': `${money(line.spent)} spent of ${money(line.planned)}; planned to date ${money(line.plannedToDate)}`,
            },
            h('span', { class: 'bar-fill', style: `width: ${Math.min(100, spentPct)}%` }),
            h('span', { class: 'bar-mark', style: `left: ${Math.min(100, planPct)}%` }),
          ),
          h(
            'span',
            { class: 'row-meta' },
            `${money(line.spent)} of ${money(line.planned)} · ${formatVariance(line.variance, studio.currency)} vs plan to date`,
          ),
        );
      }),
    ),
  );

  return h(
    'div',
    { class: 'overview' },
    kpis,
    h('div', { class: 'grid' }, attention, blockers),
    budget,
  );
}

function kpi(label: string, value: string, detail: string, tone?: 'bad' | 'warn'): HTMLElement {
  return h(
    'div',
    { class: tone ? `kpi ${tone}` : 'kpi' },
    h('span', { class: 'kpi-label' }, label),
    h('span', { class: 'kpi-value' }, value),
    h('span', { class: 'kpi-detail' }, detail),
  );
}

function panel(title: string, subtitle: string, body: HTMLElement): HTMLElement {
  return h(
    'section',
    { class: 'panel' },
    h('header', {}, h('h2', {}, title), h('p', { class: 'panel-sub' }, subtitle)),
    body,
  );
}

function pill(text: string, variant: string): HTMLElement {
  return h('span', { class: `pill ${variant}` }, text);
}
