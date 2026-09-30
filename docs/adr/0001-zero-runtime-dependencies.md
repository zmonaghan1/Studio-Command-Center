# ADR 0001: Zero runtime dependencies, plain TypeScript

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

Studio Command Center is a single-page dashboard with a modest amount of UI and a meaningful amount of scheduling and budget logic. It needs to be easy to host as static files, fast to load, and cheap to maintain for a small team.

Popular options were a framework (React, Svelte) with a bundler (Vite), or plain TypeScript compiled by `tsc` to native ES modules.

## Decision

Use plain TypeScript with native browser modules and no runtime dependencies. The only development dependencies are the TypeScript compiler, Prettier and Node type definitions. Tests use Node's built-in test runner.

## Consequences

- **Positive:** nothing to upgrade or patch at runtime; tiny, fast bundle; the build is one compiler call; all complexity lives in tested domain logic rather than framework code.
- **Negative:** UI rendering is hand-written, so views must stay small and composable. Rich interactions (drag to reschedule in the slip simulator) will need more code than a library would.
- **Revisit if:** the UI grows complex enough that hand-rendering slows feature work. A framework can be introduced then, view by view, because domain logic is kept separate from rendering.
