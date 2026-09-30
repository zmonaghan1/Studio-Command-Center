# Roadmap

Studio Command Center gives a game producer one view of the three things they own: **budgets**, **cross-discipline milestones**, and **roadblocks**. Each release below is a GitHub Milestone; each bullet becomes one or more Issues.

## Guiding principles

- **Useful on first open.** A fictional studio (Lantern Forge Studios, shipping _Ember Tides_) is preloaded so anyone can explore without setup.
- **Answer producer questions, not just show data.** Every view should answer a question a producer is asked in a real studio: _Are we on track? Who's blocked? Can we afford this?_
- **Small, releasable increments.** Every release is usable on its own.

## Releases

| Release                 | Theme                 | Scope                                                                                                                                                                   |
| ----------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v0.1 Foundation**     | Build the pipeline    | Toolchain, CI, contribution workflow; data model for disciplines, milestones, dependencies, blockers and budget; seed studio; app shell with an overview of key numbers |
| **v0.2 Milestones**     | "Are we on track?"    | Timeline by discipline, cross-team dependencies, critical path highlighted                                                                                              |
| **v0.3 Blockers**       | "Who's blocked?"      | Blocker board with owner, age and impacted milestones; auto-escalation when a blocker goes stale                                                                        |
| **v0.4 Budget**         | "Can we afford this?" | Plan vs. actual by discipline, burn rate, forecast to ship, over/under alerts                                                                                           |
| **v0.5 Slip simulator** | "What if?"            | Move a milestone and see the cascade to other teams and the cost impact                                                                                                 |
| **v1.0 Launch**         | Ship it               | Save and load via JSON, responsive layout, accessibility pass, README screenshots, producer case study, hosted deployment                                               |

## Out of scope for v1.0

- Multi-user accounts and a backend (data stays in the browser, with JSON import/export)
- Integrations with Jira, Shotgrid or similar tools (a natural v2 theme)
