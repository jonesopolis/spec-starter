---
description: Create a feature folder with spec and brief from a short idea, or update an existing one
argument-hint: <idea> | "update <feature-slug>"
allowed-tools: Read, Write, Edit, Glob, Bash(mkdir)
---

You are helping to spin up a new feature folder for this application, from a short idea provided in the user input below. Always adhere to any rules or requirements set out in any CLAUDE.md files when responding.

User input: $ARGUMENTS

## Progress Checkbox Format

Feature progress is tracked in `feature.md` using checkboxes:

```
- [ ] Spec     ← not started
- [o] Spec     ← in progress
- [x] Spec     ← complete
- [!] Spec     ← blocked
```

Reading current state: find the checkbox that is `[o]` or `[!]` — that is the active stage. If all are `[ ]`, the feature hasn't started. If `[x] Done`, it's complete.

---

## Mode Detection

Check `$ARGUMENTS`:

- If empty or blank: Follow **BROWSE MODE** below
- If it starts with "update" (case-insensitive): Follow **UPDATE MODE** below
- Otherwise: Follow **CREATE MODE** below

---

## BROWSE MODE

Use this mode when the user provides no arguments.

### Step 1. Read the backlog

Read `.claude/_todos/todo.md`.

If the file doesn't exist or is empty, respond:

```
No backlog items found.

To add ideas to the backlog, edit .claude/_todos/todo.md — one idea per line.
Or run /todo <idea> to create a feature spec directly.
```

Then stop.

### Step 2. Display the backlog

List all backlog items numbered, then prompt:

```
Backlog ideas (from .claude/_todos/todo.md):

1. <idea>
2. <idea>
...

Reply with a number to spec out that idea, or provide a new idea directly.
```

Then stop and wait for the user to reply. Do not create anything yet — the user must confirm which idea to spec.

---

## UPDATE MODE

Use this mode when the user provides: `update <feature-slug>`

### Step 1. Parse the feature slug

Extract the `<feature-slug>` from the arguments (everything after "update").

### Step 2. Read existing files

Read the following files from `.claude/_todos/<feature-slug>/`:
- `feature.md` — check the Progress checkboxes
- `spec.md` — to update with the new information

If the folder doesn't exist, inform the user and exit.

### Step 2b. Check progress

Read the Progress checkboxes from `feature.md` to find the active stage (`[o]` or `[!]`).

- `[o] Spec` — actively speccing, proceed normally
- `[x] Spec` — spec already complete, warn: _"Spec is already marked complete. Updating may affect the plan if one exists."_ Then continue.
- `[o] Plan` or later — warn: _"This feature is past the spec stage. Spec edits may make the plan out of sync."_ Then continue.
- `[!] <stage>` — note: _"This feature is blocked at `<stage>`. Updating the spec is fine."_ Then continue.

### Step 3. Process both question sections

**Questions from Claude** (user-answered): Look in the "Questions from Claude" section for any questions where the "Answer:" line is not empty. These are clarifications the user has provided.

**Questions from User** (Claude must answer): Look in the "Questions from User" section for any questions where the "Answer:" line is empty. Claude must research and answer these using the codebase and context available.

### Step 4. Answer any unanswered "Questions from User"

For each unanswered question in the "Questions from User" section:
- Research the answer using the codebase, existing patterns, and spec context
- Fill in the "Answer:" line with a clear, specific response
- Use the Edit tool to update each answer in place

### Step 5. Update the spec.md from answered "Questions from Claude"

Based on the user-provided answers in "Questions from Claude", update the relevant sections of `spec.md`. Use the Edit tool to make targeted updates rather than rewriting the entire file.

### Step 6. Update progress checkbox if spec is complete

If there are no remaining unanswered "Questions from Claude" and the spec looks complete:
- Change `- [o] Spec` to `- [x] Spec` in `feature.md`

If questions remain unanswered, leave `- [o] Spec` as-is.

### Step 7. Output summary

```
Updated spec for: <feature-title>
Progress: Spec [o→x if completed, otherwise still o]
Location: .claude/_todos/<feature-slug>/spec.md

Answered (user → spec):
- <Question Claude asked that user answered, and what changed>

Answered (Claude → user):
- Q: <Question user asked>
  A: <Summary of Claude's answer>
```

---

## CREATE MODE

Use this mode when the user provides a feature description.

### Step 1. Parse the arguments

From `$ARGUMENTS`, extract:

1. `feature_title` — short, human readable, Title Case
2. `feature_slug` — lowercase kebab-case, only `a-z 0-9 -`, max 40 chars
3. `branch_name` — format: `feature/<feature_slug>`

If you cannot infer a sensible title and slug, ask the user to clarify.

### Step 2. Create the feature folder

Create a new folder at `.claude/_todos/<feature_slug>` using the Bash tool with mkdir.

### Step 3. Create the feature.md (feature brief)

Create `.claude/_todos/<feature_slug>/feature.md` using the template at `.claude/_templates/feature.md`.

Set the Spec checkbox to in-progress:
```
- [o] Spec
- [ ] Plan
- [ ] Implement
- [ ] Review
- [ ] Done
```

### Step 4. Create the spec.md

Create `.claude/_todos/<feature_slug>/spec.md` with a detailed specification using the spec template at `.claude/_templates/spec.md`.

### Step 5. Remove from backlog (if applicable)

If this idea came from `.claude/_todos/todo.md`, remove that line from the file using the Edit tool.

### Step 6. Final output to the user

```
Feature folder created: .claude/_todos/<feature_slug>
Branch (not created yet): <branch_name>
Title: <feature_title>

Progress: [o] Spec  [ ] Plan  [ ] Implement  [ ] Review  [ ] Done

Files:
- feature.md (feature brief)
- spec.md (detailed specification)

Next: review the spec, answer any questions, then run /todo update <feature_slug> to mark Spec complete.
```

Do not repeat the full spec in the chat output unless the user explicitly asks to see it.
