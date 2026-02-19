---
description: Start a feature — create folder, 2-brief.md, and 1-feature.md from a backlog task
argument-hint: "<idea or task number>"
allowed-tools: Read, Write, Edit, Glob, Bash
---

Turn a backlog task into a feature folder with `1-feature.md` and `2-brief.md`.

**Arguments:** $ARGUMENTS

## Mode Detection

- If empty or blank → **BROWSE MODE**
- Otherwise → **CREATE MODE**

---

## BROWSE MODE

### Step 1: Read the backlog

Read `.claude/tasks.md`.

If no items exist:

```
No backlog tasks found.

Add ideas to .claude/tasks.md or run /feature:start <idea> directly.
```

Then stop.

### Step 2: Display numbered options

```
Backlog tasks (pick one to start):

1. <task>
2. <task>
...

Run /feature:start <number> to create a feature, or /feature:start <new idea> to start fresh.
```

Then stop.

---

## CREATE MODE

### Step 1: Resolve the idea

If `$ARGUMENTS` is a number, read `.claude/tasks.md` and use the item at that position as the idea.
Otherwise use `$ARGUMENTS` directly as the idea.

### Step 2: Derive names

From the idea, derive:
- `feature_title` — short, Title Case, human readable
- `feature_slug` — lowercase kebab-case, only `a-z 0-9 -`, max 40 chars
- `branch_name` — `feature/<feature_slug>`
- `folder_name` — `MM.DD-<feature_slug>` using today's date (e.g. `02.22-my-feature`)

If you cannot infer a clear title and slug, ask the user to clarify.

### Step 3: Create the feature folder

```bash
mkdir -p .claude/_features/<folder_name>
```

### Step 4: Write 1-feature.md

Create `.claude/_features/<folder_name>/1-feature.md` using `.claude/_templates/feature.md` as the structure.

Fill in:
- Title, slug set to `<folder_name>`, branch name
- A 2-3 sentence description based on the idea
- 2-3 key points

Set Progress to:

```
- [?] Brief
- [ ] Blueprint
- [ ] Implement
- [ ] Review
- [ ] Done
```

**State update:** Setting `[?] Brief` signals that Claude has written the brief and it needs review.

### Step 5: Write 2-brief.md

Create `.claude/_features/<folder_name>/2-brief.md` using `.claude/_templates/brief.md` as the structure.

Fill in:
- Overview based on the idea
- Goals inferred from the idea
- Draft Requirements (must-have only — keep it lean)
- Placeholder User Experience
- 2-3 likely Edge Cases
- Out of Scope (anything clearly not included)
- Draft Success Criteria
- 2-4 Questions from Claude (things you genuinely need answered to finalize the brief)

### Step 6: Remove from backlog

If this idea came from a numbered item in `.claude/tasks.md`, remove that line using the Edit tool.

### Step 7: Output

```
Feature created: <feature_title>
Folder: .claude/_features/<folder_name>/
Branch (not created yet): <branch_name>

Progress: [?] Brief  [ ] Blueprint  [ ] Implement  [ ] Review  [ ] Done

Files:
- 1-feature.md (state + description)
- 2-brief.md (non-technical goals + questions)

Next: answer the questions in 2-brief.md, then run /feature:review <folder_name>.
```
