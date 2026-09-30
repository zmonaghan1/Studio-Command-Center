import { h } from '../dom.ts';

/** Stand-in for views that are planned but not built yet, linked to their roadmap issue. */
export function renderPlaceholder(
  title: string,
  question: string,
  release: string,
  issue: number,
): HTMLElement {
  return h(
    'section',
    { class: 'panel placeholder' },
    h('h2', {}, title),
    h('p', { class: 'placeholder-question' }, question),
    h(
      'p',
      { class: 'panel-sub' },
      `Planned for ${release}. Follow progress in `,
      h(
        'a',
        {
          href: `https://github.com/zmonaghan1/Studio-Command-Center/issues/${issue}`,
          target: '_blank',
          rel: 'noopener',
        },
        `issue #${issue}`,
      ),
      '.',
    ),
  );
}
