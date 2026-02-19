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

1. <task>
2. <task>
...

Run /feature:start <number or idea> to turn one into a feature.
```

Then stop.

---

## ADD MODE

### Step 1: Append to backlog

Extract the idea: if `$ARGUMENTS` starts with `add ` (case-insensitive), strip that prefix. Otherwise use `$ARGUMENTS` as-is. Add the idea as a new line item to `.claude/tasks.md`.

### Step 2: Output confirmation

```
Added to backlog: <idea>

Run /task to see the full backlog.
```
