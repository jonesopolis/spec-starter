---
name: project-init
description: Initialize a new project. Creates CLAUDE.md via /init, gathers context through dialogue, and seeds the task backlog.
---

# Project Init

Bootstrap a new project with context and an initial backlog.

## Steps

### 1. Run /init

Call the built-in `/init` command to scan the codebase and generate `CLAUDE.md` in the project root.

### 2. Ask brainstorming questions — one at a time

Ask questions one at a time to understand the project. Do not send multiple questions in one message.

Cover (skip if already clear from `/init` output):
- What is this project and what problem does it solve?
- Who are the users?
- What does a successful first version look like?
- Any technical constraints or integration points?
- What should NOT be in scope right now?

Also confirm from the codebase (check package.json, Makefile, README, etc.):
- Test command (e.g. `bun test`, `pytest`, `npm test`)
- Run/dev command
- Commit message convention (e.g. conventional commits, plain English)

Ask one question about manual/e2e testing setup:
- How do you manually test this app? (e.g. local dev server URL, staging URL, mobile device)
- Are there test accounts or credentials needed?
- Any browser or device requirements?
- Anything else needed to run through features manually?

### 3. Update CLAUDE.md

Append a `## Project Context` section to `CLAUDE.md` with a summary of what you learned:

```markdown
## Project Context

**Goal:** <one sentence>
**Users:** <who uses this>
**Stack:** <key tech>
**Constraints:** <anything important>
**Out of scope:** <what to avoid>
```

### 4. Write `.claude/testing.md`

Write `.claude/testing.md` with the manual testing setup gathered in Step 2. This file is read by `/feature:test` to inform how e2e scenarios are run.

```markdown
# Testing

## How to start the app
<dev server command and URL, or staging URL>

## Test accounts
<credentials or "none required">

## Browser / device
<any requirements, or "any">

## Other notes
<anything else needed to test manually>
```

Only include sections that are relevant. Omit or mark "none" for anything that doesn't apply.

### 5. Clear the README

Overwrite `README.md` with a minimal stub so the generic starter content is gone:

```markdown
# <project name>

<one sentence description>
```

### 6. Seed `.claude/tasks.md`

Write the first few backlog items based on the conversation — one idea per line, plain text, no checkboxes:

```
<first task>
<second task>
<third task>
```

Keep it short and actionable. These should be the next real steps, not a full roadmap.

### 7. Output

```
CLAUDE.md updated with project context.
Testing instructions written: .claude/testing.md
Backlog seeded: .claude/tasks.md

Next: /feature:start <idea> to turn a backlog item into a feature.
```
