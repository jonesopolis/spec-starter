---
description: Generate a technical blueprint from a completed brief
argument-hint: "<MM.DD-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
model: claude-opus-4-6
---

Generate `3-blueprint.md` — a detailed technical implementation plan — from a completed `2-brief.md`. Write the file and stop. Do not implement anything.

**Arguments:** $ARGUMENTS

## Progress Checkbox Format

- `[ ]` not started · `[?]` needs attention · `[o]` in progress · `[x]` complete · `[!]` blocked

A feature is **ready for blueprint** when: `- [x] Brief`

---

## Mode Detection

- If empty or blank → **BROWSE MODE**
- Otherwise → **GENERATE MODE**

---

## BROWSE MODE

### Step 1: Find ready features

Glob all `.claude/_features/*/1-feature.md`. Collect features where Progress shows `- [x] Brief` and `- [ ] Blueprint`.

If none:

```
No features are ready for blueprint.

Features need Brief complete before blueprinting.
Run /feature:review <slug> to complete a brief.
```

Then stop.

### Step 2: Display numbered list

```
Features ready for blueprint:

1. <feature-title> (<MM.DD-slug>)
2. <feature-title> (<MM.DD-slug>)

Run /feature:blueprint <MM.DD-slug> to generate a blueprint.
```

Then stop.

---

## GENERATE MODE

### Step 1: Read feature and brief

Read `.claude/_features/$ARGUMENTS/1-feature.md` and `.claude/_features/$ARGUMENTS/2-brief.md`.

If folder or brief doesn't exist, tell the user and stop.

**Progress check:**
- `[x] Brief` + `[ ] Blueprint` — proceed
- `[?] Brief` — warn: _"Brief still needs review. Run /feature:review $ARGUMENTS first."_ Stop.
- `[o] Brief` — warn: _"Brief still in progress."_ Stop.
- `[ ] Brief` — warn: _"Brief not started."_ Stop.
- `[x] Blueprint` — warn: _"Blueprint already exists. Re-running will overwrite 3-blueprint.md."_ Continue.

### Step 2: Update Blueprint to `[o]`

In `1-feature.md`, change `- [ ] Blueprint` to `- [o] Blueprint`.

**State update:** Always do this before starting work.

### Step 3: Explore the codebase

Before writing the blueprint, understand the existing codebase:
1. Root structure and folder layout
2. Existing patterns similar to this feature
3. Entry points this feature hooks into
4. Available dependencies (package.json, etc.)
5. Test setup — read one existing test file for framework/conventions

Take notes on exact file paths — the blueprint must reference them precisely.

### Step 4: Write blueprint.md

Write `.claude/_features/$ARGUMENTS/3-blueprint.md` using `.claude/_templates/blueprint.md` as structure.

The blueprint must be:
- **Precise** — exact file paths, not "create a file for X"
- **Complete** — every task includes failing test, implementation, and commit
- **Ordered** — tasks build on each other sequentially
- **TDD throughout** — Red → Green → Commit for every functional task
- **Codebase-aware** — match existing naming, import styles, test patterns
- **Self-contained** — a fresh Claude session with only this file should be able to implement the feature

### Step 5: Update Blueprint to `[x]`

In `1-feature.md`, change `- [o] Blueprint` to `- [x] Blueprint`.

**State update:** Do this immediately after blueprint.md is written.

### Step 6: Generate Mermaid diagram and update 1-feature.md

Based on the blueprint you just wrote, generate a Mermaid architecture diagram that shows the key components or layers and data flow between them. Use `graph TD` orientation (top-down) unless the feature is a linear pipeline, in which case `graph LR` (left-right) is clearer.

Guidelines:
- 5 to 12 nodes is ideal — keep it concise
- Label edges with the action or data being passed: `-->|user input|`, `-->|SQL query|`, etc.
- Use subgraphs only if there are clearly distinct tiers (e.g. Frontend / Backend)
- No commentary inside the `## Diagram` section — only the fenced code block

Open `1-feature.md` for this feature. Find the `## Diagram` section. If the section is not present (feature created before this template update), append the `## Diagram` section to the end of the file instead. Replace from `## Diagram` to the end of the file with:

````markdown
## Diagram

```mermaid
<your generated diagram here>
```
````

Use the Edit tool to make this replacement.

Output:

```
Blueprint written:  .claude/_features/$ARGUMENTS/3-blueprint.md
Diagram updated:    .claude/_features/$ARGUMENTS/1-feature.md (## Diagram)

Progress: [x] Brief  [x] Blueprint  [ ] Implement  [ ] Review  [ ] Done
```

**STOP. Do not implement the feature. Do not suggest next steps. Do not take any further action.**
