# spec-starter

A Claude Code project template for spec-driven feature development. Drop this into any project to get a structured workflow for taking features from idea to implementation.

## How it works

Features move through a simple lifecycle tracked with checkboxes in each feature's `feature.md`:

```
- [ ] Spec       ← write the spec
- [ ] Plan       ← write the technical plan
- [ ] Implement  ← write the code
- [ ] Review     ← manual e2e testing
- [ ] Done
```

Each stage has a matching slash command. Stages can be marked `[o]` (in progress), `[x]` (complete), or `[!]` (blocked — e.g. `[!] Implement`).

## Commands

| Command | What it does |
|---|---|
| `/project-init` | Bootstrap a new project — generates `CLAUDE.md`, asks context questions, writes an initial todo list |
| `/todo` | No args: show backlog. With idea: create a feature spec. `update <slug>`: refine an existing spec |
| `/plan <slug>` | Write a deep technical implementation plan from a spec |
| `/implement <slug>` | Implement the plan task-by-task with TDD, then write an e2e checklist and decisions log |
| `/status` | List all features and their current progress |

All commands are interactive when called without arguments — they show what's available at that stage rather than failing silently.

## Feature lifecycle

```
Backlog idea (.claude/_todos/todo.md)
    ↓
/todo <idea>          → .claude/_todos/<slug>/feature.md + spec.md   [o] Spec
/todo update <slug>   → refines spec, marks [x] Spec when complete
    ↓
/plan <slug>          → .claude/_todos/<slug>/plan.md                [o→x] Plan
    ↓
/implement <slug>     → writes code (TDD), e2e checklist,            [o→x] Implement
                        implementation-decisions.md
    ↓
Manual review         → check off e2e-checklist.md                   [o→x] Review
    ↓
Done
```

## Files per feature

```
.claude/_todos/<slug>/
  feature.md                  — title, branch, progress checkboxes
  spec.md                     — detailed requirements and edge cases
  plan.md                     — step-by-step TDD implementation tasks
  e2e-checklist.md            — manual testing scenarios
  implementation-decisions.md — key technical decisions log
```

## Hooks

Two PostToolUse hooks run automatically (registered in `.claude/settings.json`):

- **post-edit.sh** — auto-commits file edits with a minor/moderate/major size label
- **post-write.sh** — auto-commits newly created files

## Getting started

1. Copy this repo's `.claude/` folder into your project
2. Run `/project-init` to generate `CLAUDE.md` and an initial todo list
3. Add ideas to `.claude/_todos/todo.md`, then run `/todo` to start speccing
