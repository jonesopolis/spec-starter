---
description: List backlog tasks, or add a new idea to the backlog
argument-hint: "[add] <idea>"
allowed-tools: Read, Edit, Write
---

Manage the task backlog in `.claude/tasks.md`.

**Arguments:** $ARGUMENTS

## Mode Detection

- If empty or blank → **LIST MODE**
- If starts with `add ` (case-insensitive) → **ADD MODE** (strip the `add ` prefix, use the rest as the idea)
- Otherwise → **ADD MODE** (use `$ARGUMENTS` as the idea directly)

---

## LIST MODE

### Step 1: Read the backlog

Read `.claude/tasks.md`.

If it doesn't exist or has no items, output:

```
No backlog items found.

Edit .claude/tasks.md to add ideas — one per line.
Or run /feature:start <idea> to create a feature directly.
```

Then stop.

### Step 2: Display numbered list

```
Backlog tasks:

1. <slug> - <description>
2. <slug> - <description>
...

Run /feature:start <slug or number> to turn one into a feature.
```

Then stop.

---

## ADD MODE

### Step 1: Derive a slug

Extract the idea: if `$ARGUMENTS` starts with `add ` (case-insensitive), strip that prefix. Otherwise use `$ARGUMENTS` as-is.

Pick a `slug` — **1–2 words max**, lowercase, hyphenated if two words, only `a-z 0-9 -`. Choose the most essential word(s) from the idea (e.g. `auth`, `dark-mode`, `search`). Claude decides this — do not ask the user.

### Step 2: Append to backlog

Add a new line to `.claude/tasks.md` in the format:

```
<slug> - <idea>
```

### Step 3: Output confirmation

```
Added to backlog: <slug> - <idea>

Run /task to see the full backlog.
Run /feature:start <slug> to begin immediately.
```
