import type { Studio } from '../domain/types.ts';
import { h } from './dom.ts';
import { formatDate } from './format.ts';
import { renderOverview } from './views/overview.ts';
import { renderPlaceholder } from './views/placeholder.ts';

interface Route {
  path: string;
  label: string;
  render: (studio: Studio) => HTMLElement;
}

const routes: Route[] = [
  { path: 'overview', label: 'Overview', render: renderOverview },
  {
    path: 'milestones',
    label: 'Milestones',
    render: () => renderPlaceholder('Milestones', '“Are we on track?”', 'v0.2 Milestones', 9),
  },
  {
    path: 'blockers',
    label: 'Blockers',
    render: () => renderPlaceholder('Blockers', '“Who’s blocked?”', 'v0.3 Blockers', 11),
  },
  {
    path: 'budget',
    label: 'Budget',
    render: () => renderPlaceholder('Budget', '“Can we afford this?”', 'v0.4 Budget', 13),
  },
];

function currentRoute(): Route {
  const path = location.hash.replace(/^#\/?/, '');
  return routes.find((r) => r.path === path) ?? routes[0]!;
}

export function mountApp(root: HTMLElement, studio: Studio): void {
  const main = h('main', { id: 'main', tabindex: -1 });
  const nav = h('nav', { 'aria-label': 'Sections' });

  const render = () => {
    const route = currentRoute();
    nav.replaceChildren(
      ...routes.map((r) =>
        h('a', { href: `#/${r.path}`, 'aria-current': r === route ? 'page' : undefined }, r.label),
      ),
    );
    main.replaceChildren(route.render(studio));
    document.title = `${route.label} · ${studio.projectName} · Studio Command Center`;
  };

  root.replaceChildren(
    h('a', { class: 'skip-link', href: '#main' }, 'Skip to content'),
    h(
      'header',
      { class: 'app-header' },
      h(
        'div',
        { class: 'brand' },
        h('span', { class: 'brand-mark', 'aria-hidden': 'true' }),
        h(
          'div',
          {},
          h('h1', {}, studio.projectName),
          h('span', { class: 'brand-sub' }, studio.studioName),
        ),
      ),
      h('span', { class: 'status-date' }, `Status as of ${formatDate(studio.asOf)}`),
      nav,
    ),
    main,
    h(
      'footer',
      { class: 'app-footer' },
      'Studio Command Center · sample data for a fictional studio',
    ),
  );

  window.addEventListener('hashchange', () => {
    render();
    main.focus();
  });
  render();
}
