---
name: project-init
description: Initialize a new project. Creates CLAUDE.md via /init, gathers context through dialogue, and writes an initial todo checklist.
---

# Project Init

Bootstrap a new project with context and an initial plan.

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

### 4. Customise `.claude/_templates/plan.md`

Update the plan template with project-specific values so every future `/plan` run has real commands to work from. Replace the placeholders:

- `<test command>` → the actual test command (e.g. `bun test`, `pytest -v`)
- `<full test suite command>` → full suite command (e.g. `bun test --coverage`)
- `<commit message>` → an example using this project's convention (e.g. `feat(scope): description` or `Add description`)
- Code block language hints → set to the primary language (e.g. `ts`, `py`, `go`)

Only replace what is known. Leave placeholders for anything still uncertain.

### 5. Write `.claude/_todos/_todo.md`


Create a simple checklist of the first things that need to get done based on the conversation:

```markdown
# Todo

- [ ] <first task>
- [ ] <second task>
- [ ] <third task>
```

Keep it short and actionable. These should be the next real steps, not a full roadmap.

### 6. Output

```
CLAUDE.md updated with project context.
Todo list created: .claude/_todos/_todo.md

Next: /todo <feature idea>  to start speccing individual features.
```
