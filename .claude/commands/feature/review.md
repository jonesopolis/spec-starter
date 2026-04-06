---
description: Review a feature in its current state and take the appropriate next action
argument-hint: "<MM.DD-slug>"
allowed-tools: Read, Write, Edit, Glob
---

Review a feature and take the next appropriate action based on its current state. Either Claude or the user can set `[?]` on any stage to flag it for review.

**Arguments:** $ARGUMENTS

## Progress Checkbox Format

- `[ ]` not started · `[?]` needs attention · `[o]` in progress · `[x]` complete · `[!]` blocked

---

## Mode Detection

- If empty or blank → **BROWSE MODE**
- Otherwise → **REVIEW MODE**

---

## BROWSE MODE

### Step 1: Find flagged features

Use Glob to find all `.claude/_features/*/1-feature.md`. Read each one and collect features that have any `[?]` checkbox.

If none:

```
No features are flagged for review.

To flag a feature: set any checkbox to [?] in its 1-feature.md,
or run /feature:start <idea> to create a new one.
```

Then stop.

### Step 2: Display numbered list

```
Features needing review:

1. <feature-title> (<MM.DD-slug>) — [?] <stage>
2. <feature-title> (<MM.DD-slug>) — [?] <stage>

Run /feature:review <MM.DD-slug> to review one.
```

Then stop.

---

## REVIEW MODE

### Step 1: Read feature state

Read `.claude/_features/$ARGUMENTS/1-feature.md`.

If the folder doesn't exist:

```
No feature found: $ARGUMENTS
Run /feature:start <idea> to create one.
```

Then stop.

### Step 2: Determine active state and act

Find which checkbox has `[?]` and act accordingly:

**`[?] Brief`:**
1. Read `.claude/_features/$ARGUMENTS/2-brief.md`
2. Answer any unanswered "Questions from User" using codebase research
3. Review "Questions from Claude" — if the user has answered them, incorporate those answers into the relevant brief sections (Overview, Goals, Requirements, etc.)
4. Identify any remaining gaps — if the brief is still incomplete, add new questions and keep `[?] Brief`
5. **E2E gate:** Before marking the brief complete, verify the "Does this feature need e2e test planning?" question in `2-brief.md` has an answer of `yes` or `no`.
   - If unanswered: surface it as a blocking question, keep `[?] Brief`, and stop — do not proceed to step 6.
   - If answered: extract the value (`yes` or `no`) and update `**E2E Tests:**` in `1-feature.md` to that value.
6. If the brief is otherwise complete (no other unanswered Questions from Claude remain), update `1-feature.md`:
   - Change `- [?] Brief` to `- [x] Brief`
7. **State update:** Always update `1-feature.md` after taking action.
8. Output what changed and what the next step is.

**`[?] Blueprint`:**
1. Read `.claude/_features/$ARGUMENTS/2-brief.md` and `.claude/_features/$ARGUMENTS/3-blueprint.md`
2. Review the blueprint for completeness, gaps, or errors
3. Update `3-blueprint.md` with corrections or additions
4. If complete, change `- [?] Blueprint` to `- [x] Blueprint` in `1-feature.md`
5. **State update:** Always update `1-feature.md` after taking action.

**`[?] Implement`:**
1. Read `.claude/_features/$ARGUMENTS/1-feature.md` and relevant implementation files
2. Surface any issues found — summarize what needs attention
3. Suggest next action to the user

**Any other `[?]` state:**
1. Read the relevant artifact for that stage
2. Surface what needs attention
3. Suggest next action

**No `[?]` found:**
Summarize the feature's current state and suggest the logical next command:
- `[x] Brief` + `[ ] Blueprint` → suggest `/feature:blueprint $ARGUMENTS`
- `[x] Blueprint` + `[ ] Implement` → suggest `/feature:implement $ARGUMENTS`
- `[x] Implement` + `[o] E2E` → suggest `/feature:test $ARGUMENTS`
- `[x] Implement` + `[x] E2E` + `[o] Review` → suggest `/feature:finish $ARGUMENTS`
- `[x] Done` → feature is complete, nothing to do
