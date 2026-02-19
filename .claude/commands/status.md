---
description: List all features and their current states
allowed-tools: Glob, Read
---

List all features in `.claude/_todos/` and their current states.

## Step 1 — Find all feature folders

Use Glob to find all `.claude/_todos/*/feature.md` files.

If none exist, output:
```
No features found. Run /todo to create one.
```

## Step 2 — Read each feature.md

For each feature.md found, extract:
- The feature title (first `#` heading)
- The `**Branch:**` value
- The Progress checkboxes (the 5 lines: Spec, Plan, Implement, Review, Done)

## Step 3 — Determine active stage

For each feature, the active stage is:
- The checkbox marked `[o]` (in progress) or `[!]` (blocked)
- If all are `[x]`, the feature is done
- If all are `[ ]`, it hasn't started

## Step 4 — Output the list

Group features by active stage in lifecycle order. Show the inline progress for each feature.

```
Feature Status
──────────────────────────────────────────────────

[o] Spec
  • <feature-title> (<feature-slug>)
    [o]Spec  [ ]Plan  [ ]Implement  [ ]Review  [ ]Done

[x] Spec / ready to plan
  • <feature-title> (<feature-slug>)
    [x]Spec  [ ]Plan  [ ]Implement  [ ]Review  [ ]Done

[o] Plan
  • <feature-title> (<feature-slug>)
    [x]Spec  [o]Plan  [ ]Implement  [ ]Review  [ ]Done

[x] Plan / ready to build
  • ...

[o] Implement
  • ...

[o] Review
  • ...

Done
  • ...

Blocked
  • <feature-title> (<feature-slug>) — blocked at <stage>
    [x]Spec  [x]Plan  [!]Implement  [ ]Review  [ ]Done

──────────────────────────────────────────────────
<N> features total
```

Omit groups with no features. Show the feature slug in parentheses so the user knows what to pass to `/todo update`, `/plan`, or `/implement`.
