---
description: Implement a planned feature — creates branch, writes code, runs tests, writes e2e checklist
argument-hint: <feature-slug>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

You are implementing a planned feature. Follow these steps exactly.

**Feature slug:** $ARGUMENTS

## Progress Checkbox Format

Feature progress is tracked in `feature.md` using checkboxes:
- `[ ]` not started · `[o]` in progress · `[x]` complete · `[!]` blocked

A feature is **ready to implement** when: `- [x] Plan` and `- [ ] Build`

---

## Step 0 — Mode Detection

Check `$ARGUMENTS`:

- If empty or blank: Follow **BROWSE MODE** below
- Otherwise: Continue to **Step 1**

---

## BROWSE MODE

Use this mode when the user provides no arguments.

### Find features ready to implement

Use Glob to find all `.claude/_todos/*/feature.md` files. Read each one and collect features where the Progress section shows `- [x] Plan` and `- [ ] Build`.

If none are found, output:
```
No features are ready to implement.

Features need Plan complete before building.
Run /plan <feature-slug> to plan a feature first.
```

Then stop.

### Display options

```
Features ready to implement:

  • <feature-title> (<feature-slug>)
  • <feature-title> (<feature-slug>)

Run /implement <feature-slug> to implement one.
```

Then stop.

---

## Step 1 — Read feature context and check progress

Read `.claude/_todos/$ARGUMENTS/feature.md` and `.claude/_todos/$ARGUMENTS/plan.md`.

If the feature folder doesn't exist:
```
No feature found for: $ARGUMENTS
Run /todo first to create the feature folder.
```

If `plan.md` doesn't exist:
```
No plan found for: $ARGUMENTS
Run /plan $ARGUMENTS first.
```

**Progress check:**

- `[x] Plan` + `[ ] Build` — proceed normally (ready to build)
- `[o] Spec` or `[x] Spec` + `[ ] Plan` — warn: _"No plan exists yet. Run /plan $ARGUMENTS first."_ Then stop.
- `[o] Plan` — warn: _"Plan is still being written. Wait for /plan to finish."_ Then stop.
- `[o] Build` — warn: _"Already building. Continuing will resume from current progress."_ Then continue.
- `[x] Build` or `[o] Review` or `[x] Done` — warn: _"Feature is already in `<active stage>`. Proceeding anyway."_ Then continue.
- `[!] <stage>` — warn: _"Feature is blocked at `<stage>`. Resolve the blocker before implementing."_ Then stop.

---

## Step 2 — Update Build checkbox to `[o]`

In `.claude/_todos/$ARGUMENTS/feature.md`, change:
```
- [ ] Build
```
to:
```
- [o] Build
```

---

## Step 3 — Create the feature branch

Check if the repo has a git remote:

```bash
git status
```

If this is a git repo, create and check out the feature branch from `feature.md`'s `**Branch:**` value:

```bash
git checkout -b <branch_name>
```

If the branch already exists, check it out:

```bash
git checkout <branch_name>
```

If not a git repo, skip this step and note it in the output.

---

## Step 4 — Implement the plan

Read each task in `plan.md` in order. For each task:

1. Dispatch a fresh subagent (via the Task tool) to implement that task
2. The subagent must follow strict TDD: write the failing test first, confirm it fails, write minimal implementation, confirm it passes, then commit
3. Review the subagent's output before moving to the next task — if it failed or skipped the test step, do not proceed
4. Commit after each passing task using the commit command in the plan

Do not skip tasks. Do not batch multiple tasks into one subagent. Each task gets its own fresh subagent.

---

## Step 5 — Update Build to `[x]` and Review to `[o]`

Once all plan tasks are complete and committed:
1. Change `- [o] Build` to `- [x] Build`
2. Change `- [ ] Review` to `- [o] Review`

---

## Step 6 — Write the e2e checklist

Create `.claude/_todos/$ARGUMENTS/e2e-checklist.md` using `.claude/_templates/e2e-checklist.md` as the structure.

Populate it based on:
- The **User Experience** section of `spec.md`
- The **Success Criteria** section of `spec.md`
- The **Edge Cases** section of `spec.md`
- Any integration points identified in the plan

Every scenario must be specific enough to follow without reading the spec — include exact UI labels, URLs, API endpoints, or CLI commands as appropriate.

---

## Step 7 — Output summary

```
Implementation complete: $ARGUMENTS

Progress: [x] Spec  [x] Plan  [x] Build  [o] Review  [ ] Done

Branch: <branch_name>
Tasks completed: <N>

E2E checklist written: .claude/_todos/$ARGUMENTS/e2e-checklist.md
Review and check off each item manually before marking Done.
```
