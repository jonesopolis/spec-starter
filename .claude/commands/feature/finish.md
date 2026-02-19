---
description: Finish a reviewed feature — create PR into dev, optionally merge, mark Done
argument-hint: "<MM.DD-slug>"
allowed-tools: Read, Edit, Glob, Bash
---

Finish a feature that has been manually reviewed. Creates a PR into `dev`, asks whether to merge, and marks the feature complete.

**Arguments:** $ARGUMENTS

## Progress Checkbox Format

- `[ ]` not started · `[?]` needs attention · `[o]` in progress · `[x]` complete · `[!]` blocked

A feature is **ready to finish** when: `- [o] Review`

---

## Mode Detection

- If empty or blank → **BROWSE MODE**
- Otherwise → **FINISH MODE**

---

## BROWSE MODE

### Step 1: Find features in review

Glob all `.claude/_features/*/1-feature.md`. Collect features where Progress shows `- [o] Review`.

If none:
```
No features are in review.

Features must be implemented before finishing.
Run /feature:implement <slug> to implement one, or /feature:status to see all features.
```
Then stop.

### Step 2: Display numbered list

```
Features ready to finish:

1. <feature-title> (<MM.DD-slug>)
2. <feature-title> (<MM.DD-slug>)

Run /feature:finish <MM.DD-slug> to create a PR and mark complete.
```

Then stop.

---

## FINISH MODE

### Step 1: Read feature

Read `.claude/_features/$ARGUMENTS/1-feature.md`.

If the folder doesn't exist:
```
No feature found: $ARGUMENTS
```
Then stop.

Extract:
- `branch_name` from the `**Branch:**` line
- `feature_title` from the `#` heading

**Progress check:**
- `[o] Review` — proceed
- `[ ] Review` or `[ ] Implement` — warn: _"Feature hasn't been implemented yet. Run /feature:implement $ARGUMENTS first."_ Stop.
- `[x] Done` — warn: _"Feature is already marked Done."_ Stop.
- `[x] Review` — warn: _"Review already marked complete but feature isn't Done. Continuing."_ Continue.

### Step 2: Push the branch

Push the feature branch to remote:

```bash
git push -u origin <branch_name>
```

If the push fails (e.g. no remote configured), warn the user and stop.

### Step 3: Create the PR

Create a PR from `<branch_name>` into `dev` using the `gh` CLI:

```bash
gh pr create --base dev --head <branch_name> --title "<feature_title>" --body "$(cat <<'EOF'
## Summary

Implements: <feature_title>

Feature folder: `.claude/_features/$ARGUMENTS/`

## Review checklist

See `.claude/_features/$ARGUMENTS/4-e2e-checklist.md` for manual testing scenarios.
EOF
)"
```

If a PR already exists for this branch, retrieve its URL instead:

```bash
gh pr view <branch_name> --json url --jq '.url'
```

Output the PR URL to the user.

### Step 4: Ask whether to merge

Ask the user:
```
PR created: <pr-url>

Merge this PR into dev now? (yes/no)
```

Wait for the user's response.

### Step 5a: Merge if yes

If the user says yes (or y):

```bash
gh pr merge <branch_name> --squash --delete-branch
```

Then switch to `dev` and fetch:

```bash
git checkout dev
git fetch origin
git pull origin dev
```

Output:
```
Merged and branch deleted. Switched to dev and pulled latest.
```

Then continue to Step 6.

### Step 5b: Skip merge if no

If the user says no:

Output:
```
PR left open. Merge manually when ready.
```

Then continue to Step 6.

### Step 6: Mark feature complete

In `.claude/_features/$ARGUMENTS/1-feature.md`:
- Change `- [o] Review` to `- [x] Review` (if not already `[x]`)
- Change `- [ ] Done` to `- [x] Done`

**State update:** Always update 1-feature.md regardless of whether the PR was merged.

### Step 7: Output summary

```
Feature complete: <feature_title>

Progress: [x] Brief  [x] Blueprint  [x] Implement  [x] Review  [x] Done

PR: <pr-url>
Branch: <merged/open>
```
