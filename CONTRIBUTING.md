# Contributing

This project is run like a production: planned work, small reviewed changes, and a `main` branch that is always releasable.

## Workflow

1. **Start from an issue.** Every change traces back to a GitHub Issue with acceptance criteria. Issues are grouped into Milestones, one per release (see [docs/PLAN.md](docs/PLAN.md)).
2. **Branch from `main`.** Use a short-lived branch named `<type>/<short-description>`:
   - `feat/blocker-board`
   - `fix/budget-rounding`
   - `docs/readme-screenshots`
3. **Commit in small, meaningful steps** using [Conventional Commits](#commit-messages).
4. **Run `npm run check`** before pushing. It runs exactly what CI runs.
5. **Open a pull request** using the template. Link the issue with `Closes #<number>` so it closes automatically on merge.
6. **Merge with "Squash and merge"** once CI is green and the PR is reviewed. The PR title becomes the commit message on `main`, so it must follow Conventional Commits too.
7. **Delete the branch** after merging.

## Commit messages

Format: `<type>(<optional scope>): <summary in imperative mood>`

| Type       | Use for                                                 |
| ---------- | ------------------------------------------------------- |
| `feat`     | A new user-facing capability                            |
| `fix`      | A bug fix                                               |
| `docs`     | Documentation only                                      |
| `test`     | Adding or improving tests                               |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `style`    | Visual styling or formatting                            |
| `build`    | Build scripts, tooling, dependencies                    |
| `ci`       | GitHub Actions and automation                           |
| `chore`    | Maintenance that doesn't fit elsewhere                  |

Write the body to explain **why**, not what; the diff already shows what.

Good: `feat(blockers): escalate blockers open longer than three days`
Avoid: `updated stuff`, `fix`, `WIP`

## Definition of done

A change is done when:

- It meets the issue's acceptance criteria
- Domain logic has unit tests
- `npm run check` passes and CI is green
- User-visible changes are noted under **Unreleased** in [CHANGELOG.md](CHANGELOG.md)

## Releases

Each Milestone ships as a release. Versions follow [Semantic Versioning](https://semver.org/); before 1.0, minor versions (`0.2.0`, `0.3.0`) mark each milestone. To release: move the Unreleased notes in the changelog under the new version, bump `version` in `package.json`, merge that PR, then tag `main` (`git tag -a v0.2.0 -m "v0.2.0"`) and publish a GitHub Release from the tag.

## Decisions

Significant technical decisions are recorded as short Architecture Decision Records in [docs/adr](docs/adr), so the reasoning survives after the conversation is forgotten.
