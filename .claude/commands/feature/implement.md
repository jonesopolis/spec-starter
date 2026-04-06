---
description: Implement a feature from its blueprint, then generate e2e-checklist.md
argument-hint: "<slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

Implement a feature task-by-task using the blueprint, then generate the e2e checklist.

**Arguments:** $ARGUMENTS

## Progress Checkbox Format

- `[ ]` not started · `[?]` needs attention · `[o]` in progress · `[x]` complete · `[!]` blocked

A feature is **ready to implement** when: `- [x] Blueprint`

---

## Mode Detection

- If empty or blank → **BROWSE MODE**
- Otherwise → **IMPLEMENT MODE**

---

## BROWSE MODE

### Step 1: Find ready features

Glob all `.claude/_features/*/1-feature.md`. Collect features where Progress shows `- [x] Blueprint` and `- [ ] Implement`.

If none:

```
No features are ready to implement.

Features need Blueprint complete before implementing.
Run /feature:blueprint <slug> to generate a blueprint first.
```

Then stop.

### Step 2: Display numbered list

```
Features ready to implement:

1. <feature-title> (<slug>)
2. <feature-title> (<slug>)

Run /feature:implement <slug> to implement one.
```

Then stop.

---

## IMPLEMENT MODE

### Step 1: Resolve the folder name

`$ARGUMENTS` may be a full folder name (`[MM.dd] slug`) or just a slug word (`slug`).

- If `$ARGUMENTS` matches a folder in `.claude/_features/` exactly → use it.
- Otherwise → glob `.claude/_features/*/1-feature.md`, find the first folder whose name ends with `] $ARGUMENTS` (i.e. `[MM.dd] $ARGUMENTS`). Use that folder name.
- If multiple matches → list them and ask the user to be more specific. Stop.
- If no match → inform the user and stop.

### Step 2: Read feature and blueprint

Read `.claude/_features/<folder_name>/1-feature.md` and `.claude/_features/<folder_name>/3-blueprint.md`.

If folder or blueprint doesn't exist, inform the user and stop.

**Progress check:**
- `[x] Blueprint` + `[ ] Implement` — proceed
- `[?] Blueprint` — warn: _"Blueprint needs review. Run /feature:review <folder_name> first."_ Stop.
- `[ ] Blueprint` or `[o] Blueprint` — warn: _"No complete blueprint. Run /feature:blueprint <folder_name> first."_ Stop.
- `[o] Implement` — warn: _"Already implementing. Resuming from current progress."_ Continue.
- `[x] Implement` — warn: _"Already implemented. Proceeding will regenerate the e2e checklist."_ Continue.
- `[!] <stage>` — warn: _"Feature is blocked at <stage>."_ Stop.

### Step 3: Update Implement to `[o]`

In `1-feature.md`, change `- [ ] Implement` to `- [o] Implement`.

**State update:** Do this before starting any implementation work.

### Step 3: Create the feature branch

Check if this is a git repo:

```bash
git status
```

If it is, create the branch from `1-feature.md`'s `**Branch:**` value:

```bash
git checkout -b <branch_name>
```

If the branch already exists: `git checkout <branch_name>`.
If not a git repo, skip and note it.

### Step 4: Implement the blueprint

Read each task in `3-blueprint.md` in order. For each task:

1. Dispatch a fresh subagent (via the Task tool) to implement that task
2. The subagent must follow strict TDD: write the failing test first, confirm it fails, write minimal implementation, confirm it passes, then commit
3. Review the subagent's output before moving to the next task — if it failed or skipped TDD, do not proceed
4. Do not batch multiple tasks into one subagent

### Step 5: Update progress

Once all tasks are complete, read `**E2E Tests:**` from `1-feature.md`:

- If `yes` or `—` (unanswered — treat as yes for safety):
  - Change `- [o] Implement` to `- [x] Implement`
  - Change `- [ ] E2E` to `- [o] E2E`
- If `no`:
  - Change `- [o] Implement` to `- [x] Implement`
  - Change `- [ ] E2E` to `- [x] E2E`
  - Change `- [ ] Review` to `- [o] Review`

**State update:** Do this immediately after all tasks pass.

### Step 6: Write 5-implementation-decisions.md

Create `.claude/_features/<folder_name>/5-implementation-decisions.md`.

Reflect on the session — patterns chosen, trade-offs made — and write 3-5 key decisions.

```markdown
# Implementation Decisions: <folder_name>

Key technical decisions made during implementation.

---

## <Short title> — YYYY-MM-DD
- **Decision:** what was built or decided
- **Reasoning:** why this approach
- **Alternatives:** what was considered but not used

---
```

If the file already exists (resuming), append new entries.

### Step 7: Generate 4-e2e-checklist.md (if needed)

- If `E2E Tests: no`: skip this step entirely. Do not create `4-e2e-checklist.md`. Go directly to Step 8.
- If `E2E Tests: yes` or `—`: create `.claude/_features/<folder_name>/4-e2e-checklist.md` using `.claude/_templates/e2e-checklist.md` as structure.

Populate it from:
- The **User Experience** section of `2-brief.md`
- The **Success Criteria** section of `2-brief.md`
- The **Edge Cases** section of `2-brief.md`
- Integration points from `3-blueprint.md`

Every scenario must be specific enough to follow without reading the brief — include exact UI labels, URLs, endpoints, or CLI commands as appropriate.

### Step 8: Output summary

If `E2E Tests: yes` or `—`:
```
Implementation complete: <folder_name>

Progress: [x] Brief  [x] Blueprint  [x] Implement  [o] E2E  [ ] Review  [ ] Done

Branch: <branch_name>
Tasks completed: <N>

Files created:
- .claude/_features/<folder_name>/5-implementation-decisions.md
- .claude/_features/<folder_name>/4-e2e-checklist.md

Next: run /feature:test <slug> to work through the e2e checklist.
```

If `E2E Tests: no`:
```
Implementation complete: <folder_name>

Progress: [x] Brief  [x] Blueprint  [x] Implement  [x] E2E  [o] Review  [ ] Done

Branch: <branch_name>
Tasks completed: <N>

Files created:
- .claude/_features/<folder_name>/5-implementation-decisions.md

Next: review the implementation, then run /feature:finish <slug>.
```
