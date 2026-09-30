import { seedStudio } from './domain/seed.ts';
import { validateStudio } from './domain/validate.ts';
import { mountApp } from './ui/app.ts';

const root = document.querySelector<HTMLElement>('#app');

if (root) {
  const errors = validateStudio(seedStudio);
  if (errors.length > 0) {
    // Surface bad data loudly instead of showing a misleading dashboard.
    root.textContent = `Studio data is invalid:\n${errors.join('\n')}`;
    console.error(errors);
  } else {
    mountApp(root, seedStudio);
  }
}
