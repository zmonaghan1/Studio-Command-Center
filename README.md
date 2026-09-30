# Studio Command Center

A production dashboard for game studios: see every discipline's milestones, the blockers slowing the team down, and where the budget stands, all in one place.

Built as a producer's tool, for the three things a game producer is accountable for:

| Producer responsibility                    | How Studio Command Center helps                                                                |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| **Manage studio budgets**                  | Plan vs. actual spend by discipline, burn rate and forecast to ship                            |
| **Coordinate cross-discipline milestones** | One timeline across art, design, engineering, audio and QA, with the dependencies between them |
| **Eliminate roadblocks**                   | A blocker board showing who is stuck, for how long, and which milestone is at risk             |

The app ships with a fictional studio, **Lantern Forge Studios**, producing the game _Ember Tides_, so it is useful the moment it opens.

## Status

Early development. See the [roadmap](docs/PLAN.md) for what's planned in each release.

## Getting started

Requirements: [Node.js](https://nodejs.org/) 22.18 or newer (it runs the TypeScript tests natively).

```bash
npm install      # install development tools
npm run build    # compile to dist/
npm start        # serve dist/ at http://localhost:4173
```

| Script              | What it does                                               |
| ------------------- | ---------------------------------------------------------- |
| `npm run build`     | Type-checks and compiles the app into `dist/`              |
| `npm start`         | Serves the built app locally                               |
| `npm test`          | Runs the unit tests                                        |
| `npm run typecheck` | Type-checks without emitting files                         |
| `npm run format`    | Formats all files with Prettier                            |
| `npm run check`     | Everything CI runs: format check, type-check, tests, build |

## How this project is run

This repository is managed the way a production is: work is planned as GitHub Issues grouped into Milestones (one per release), every change lands through a reviewed pull request that must pass automated checks, and each release is tagged with notes. See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and [docs/adr](docs/adr) for the key decisions and why they were made.

## License

[MIT](LICENSE)
