# spec-starter

A Claude Code project template for structured feature development. Run `npx spec-starter` in any project to get a repeatable workflow for taking features from raw idea to tested implementation.

## How it works

Every feature lives in `.claude/_features/<slug>/` and moves through five stages tracked as checkboxes in `1-feature.md`:

```
- [ ] Brief      ← define what to build (non-technical)
- [ ] Blueprint  ← define how to build it (technical)
- [ ] Implement  ← write the code (TDD)
- [ ] Review     ← manual e2e testing
- [ ] Done
```

Each stage has a matching slash command. Commands are interactive: called without arguments they show what is available at that stage rather than failing silently.

## Commands

| Command | No args | With arg |
|---|---|---|
| `/task` | List backlog tasks | Add idea to `.claude/tasks.md` |
| `/feature:start` | List backlog tasks | Create feature folder + `1-feature.md` + `2-brief.md` |
| `/feature:review` | List `[?]` features | Review current state and take next action |
| `/feature:blueprint` | List `[x]` Brief features ready to blueprint | Generate `3-blueprint.md` |
| `/feature:implement` | List `[x]` Blueprint features ready to implement | Implement + generate `4-e2e-checklist.md` |
| `/feature:finish` | List `[o]` Review features | Push branch, create PR into `dev`, optionally merge, mark Done |
| `/feature:test` | List `[x]` Done features | Walk through `4-e2e-checklist.md` interactively, marking pass/fail |
| `/feature:status` | List all features and their states | — |
| `/project-init` | Bootstrap a new project — generates `CLAUDE.md`, asks context questions, writes `.claude/testing.md` | — |

## Feature lifecycle

```
Backlog idea (.claude/tasks.md)
    ↓
/feature:start <idea>      → .claude/_features/<slug>/1-feature.md + 2-brief.md    [?] Brief
/feature:review <slug>     → iterate on brief, marks [x] Brief when complete
    ↓
/feature:blueprint <slug>  → .claude/_features/<slug>/3-blueprint.md             [x] Blueprint
    ↓
/feature:implement <slug>  → writes code (TDD), generates 4-e2e-checklist.md     [x] Implement
    ↓                                                                             [o] Review
    · manually work through 4-e2e-checklist.md
    ↓
/feature:finish <slug>     → push branch, PR into dev, merge, mark Done         [x] Review
    ↓                                                                             [x] Done
    ↓
/feature:test <slug>       → walk e2e checklist interactively (post-merge QA)
```

After `/feature:start`, Claude writes a draft brief and flags it `[?] Brief` — meaning it needs your attention. Answer the questions Claude left in `2-brief.md`, then run `/feature:review <slug>` to iterate until the brief is complete.

## Files per feature

```
.claude/_features/<slug>/
  1-feature.md                  — state checkboxes, title, slug, branch name
  2-brief.md                    — non-technical goals, requirements, Q&A
  3-blueprint.md                — technical implementation plan (TDD tasks)
  4-e2e-checklist.md            — manual testing scenarios (generated post-implement)
  5-implementation-decisions.md — key technical decisions log (generated post-implement)
```

## State symbols

| Symbol | Meaning |
|---|---|
| `[ ]` | Not started |
| `[?]` | Needs attention — Claude or you flagged this for review |
| `[o]` | In progress |
| `[x]` | Complete |
| `[!]` | Blocked |

Either Claude or you can set `[?]` on any stage to trigger a review. Running `/feature:review <slug>` reads the current `[?]` state in `1-feature.md` and takes the appropriate next action automatically.

## Hooks

Two `PostToolUse` hooks run automatically (registered in `.claude/settings.json`):

- **post-edit.sh** — auto-commits file edits to git with a `minor/moderate/major` size label based on lines changed
- **post-write.sh** — auto-commits newly created files

The hooks are no-ops outside of git repositories.

## Shared testing instructions

`/project-init` asks how to manually test the app and writes `.claude/testing.md` with the answers — start command, base URL, test accounts, browser requirements, etc. `/feature:test` reads this file automatically so it has the right context when walking through e2e scenarios.

You can also create or edit `.claude/testing.md` by hand at any time.

## Getting started

In your project root:

```bash
npx spec-starter
```

Then open Claude Code — `project-init` runs automatically on first open, generating `CLAUDE.md` and `.claude/testing.md`.

Add ideas to `.claude/tasks.md` (one per line), then run `/feature:start <idea>` to turn one into a feature.

## Updating

Run the same command again to sync the latest engine files. Your project data (`_features/`, `tasks.md`, `testing.md`, `CLAUDE.md`) is never touched. Claude will announce the update next time you open the project.

```bash
npx spec-starter
```

## Design principle

Every command owns its own state transitions in `1-feature.md`. Nothing relies on `CLAUDE.md` for workflow logic — `CLAUDE.md` is project-specific context that `/project-init` writes fresh for each project.
