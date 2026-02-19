---
description: List all features and their current states
allowed-tools: Glob, Read
---

List all features in `.claude/_features/` with their current progress.

## Step 1: Find all feature folders

Glob all `.claude/_features/*/1-feature.md`.

If none:

```
No features found.

Run /feature:start <idea> to create one, or /task to browse the backlog.
```

Then stop.

## Step 2: Read each 1-feature.md

For each, extract:
- Feature title (first `#` heading)
- Folder name (the directory name from the path, e.g. `02.22-my-feature`)
- Branch (from `**Branch:**` line)
- Progress checkboxes (Brief, Blueprint, Implement, Review, Done lines)

## Step 3: Determine active stage

For each feature:
- Active stage = checkbox marked `[o]`, `[?]`, or `[!]`
- If all `[x]` → Done
- If all `[ ]` → Not started

## Step 4: Output

Group by active stage in lifecycle order. Omit empty groups.

```
Feature Status
──────────────────────────────────────────────────

[?] Brief — needs your attention
  1. <feature-title> (<MM.DD-slug>)
     [?]Brief  [ ]Blueprint  [ ]Implement  [ ]Review  [ ]Done

[x] Brief — ready to blueprint
  2. <feature-title> (<MM.DD-slug>)
     [x]Brief  [ ]Blueprint  [ ]Implement  [ ]Review  [ ]Done

[o] Blueprint
  3. <feature-title> (<MM.DD-slug>)
     [x]Brief  [o]Blueprint  [ ]Implement  [ ]Review  [ ]Done

[x] Blueprint — ready to implement
  ...

[o] Implement
  ...

[o] Review
  ...

Done
  ...

Blocked
  <feature-title> (<MM.DD-slug>) — blocked at <stage>

──────────────────────────────────────────────────
<N> features total
```

Show folder names (e.g. `02.22-my-feature`) in parentheses — that is what the user passes to all other commands.
