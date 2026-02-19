---
description: Plan the deep technical implementation for a feature spec
argument-hint: <feature-slug>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
model: claude-opus-4-6
---

You are a senior engineer creating a deep technical implementation plan from a feature spec. You must enter plan mode before doing any work.

**Feature slug:** $ARGUMENTS

## Progress Checkbox Format

Feature progress is tracked in `feature.md` using checkboxes:
- `[ ]` not started · `[o]` in progress · `[x]` complete · `[!]` blocked

A feature is **ready to plan** when: `- [x] Spec` and `- [ ] Plan`

---

## Step 0 — Mode Detection

Check `$ARGUMENTS`:

- If empty or blank: Follow **BROWSE MODE** below
- Otherwise: Enter plan mode immediately (call `EnterPlanMode`) and continue to **Step 1**

---

## BROWSE MODE

Use this mode when the user provides no arguments.

### Find features ready to plan

Use Glob to find all `.claude/_todos/*/feature.md` files. Read each one and collect features where the Progress section shows `- [x] Spec` and `- [ ] Plan`.

If none are found, output:
```
No features are ready to plan.

Features need Spec complete before planning.
Run /todo <idea> to create a spec, then /todo update <slug> once the spec is ready.
```

Then stop.

### Display options

```
Features ready to plan:

  • <feature-title> (<feature-slug>)
  • <feature-title> (<feature-slug>)

Run /plan <feature-slug> to plan one.
```

Then stop.

---

## Step 1 — Read the feature spec and check progress

Read both files from `.claude/_todos/$ARGUMENTS/`:
- `feature.md` — check the Progress checkboxes
- `spec.md` — detailed requirements, edge cases, and success criteria

If the folder or spec doesn't exist, exit plan mode and tell the user:
```
No spec found for: $ARGUMENTS
Run /todo <idea> to create the feature folder.
```

**Progress check:**

- `[x] Spec` + `[ ] Plan` — proceed normally (ready to plan)
- `[o] Spec` — warn: _"Spec is still in progress. Run /todo update $ARGUMENTS to complete the spec first."_ Then stop.
- `[x] Plan` — warn: _"A plan already exists. Re-running will overwrite plan.md."_ Then continue.
- `[o] Plan` — warn: _"Plan is already in progress. Re-running will overwrite plan.md."_ Then continue.
- `[o] Build` or later — warn: _"Feature is already past planning (`<active stage>`). Re-planning is unusual."_ Then continue.
- `[!] <stage>` — warn: _"Feature is blocked at `<stage>`. Proceeding with planning anyway."_ Then continue.

---

## Step 2 — Update Plan checkbox to `[o]`

In `.claude/_todos/$ARGUMENTS/feature.md`, change:
```
- [ ] Plan
```
to:
```
- [o] Plan
```

---

## Step 3 — Explore the codebase

Before planning, deeply understand the existing codebase so the plan uses real file paths, real patterns, and real conventions. Do not guess.

Explore:
1. **Project structure** — root layout, src folders, test folders, config files
2. **Existing patterns** — find 2–3 similar features already implemented; read them to understand conventions (naming, file structure, test style, error handling)
3. **Entry points** — identify where this feature hooks in (routes, components, services, DB schema, API handlers)
4. **Dependencies** — check package.json / lock files for relevant libs already available
5. **Test setup** — read one existing test file to understand the test framework, helpers, and assertion style

Take thorough notes on exact file paths and line ranges — the plan must reference these precisely.

---

## Step 4 — Write the implementation plan

Write the plan to `.claude/_todos/$ARGUMENTS/plan.md` using `.claude/_templates/plan.md` as the structure.

The plan must be:
- **Precise** — exact file paths, not "create a file for X"
- **Complete** — every task includes the failing test, implementation, and commit
- **Ordered** — tasks build on each other; no task depends on something not yet done
- **TDD throughout** — every functional task follows Red → Green → Commit
- **Codebase-aware** — match existing naming conventions, import styles, test patterns
- **Deep** — cover data models, API contracts, state changes, error paths, and edge cases from the spec

Include a "Key Decisions" table for any architectural trade-offs that required a judgment call.

---

## Step 5 — Update Plan checkbox to `[x]` and exit plan mode

1. In `.claude/_todos/$ARGUMENTS/feature.md`, change `- [o] Plan` to `- [x] Plan`.

2. Call `ExitPlanMode` immediately — the plan is already written, no approval gate needed.

3. Output:

```
Plan written: .claude/_todos/$ARGUMENTS/plan.md

Progress: [x] Spec  [x] Plan  [ ] Build  [ ] Review  [ ] Done

To implement:
- Run /implement $ARGUMENTS
```
