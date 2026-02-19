#!/bin/bash
# log-decisions.sh
# Runs on Stop events during implementation. Detects new git commits for the
# active feature build and uses claude -p to extract key decisions into
# implementation-decisions.md in the feature folder.

set -euo pipefail

# Read the Stop hook payload from stdin
PAYLOAD=$(cat)

# Prevent recursive triggering — exit if this Stop was caused by a hook
HOOK_ACTIVE=$(echo "$PAYLOAD" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print('true' if d.get('stop_hook_active', False) else 'false')
except:
    print('false')
" 2>/dev/null)

[[ "$HOOK_ACTIVE" == "true" ]] && exit 0

# Find a feature currently being built ([o] Build checkbox)
FEATURE_FILE=$(grep -rl "\[o\] Build" .claude/_todos/*/feature.md 2>/dev/null | head -1)
[[ -z "$FEATURE_FILE" ]] && exit 0

FEATURE_DIR=$(dirname "$FEATURE_FILE")
FEATURE_SLUG=$(basename "$FEATURE_DIR")
DECISIONS_FILE="$FEATURE_DIR/implementation-decisions.md"

# Get commits made since the decisions file was last updated
# (or last 20 commits if the file doesn't exist yet)
if [[ -f "$DECISIONS_FILE" ]]; then
  LOG_MTIME=$(python3 -c "import os; print(int(os.path.getmtime('$DECISIONS_FILE')))" 2>/dev/null || echo 0)
  NEW_COMMITS=$(git log --oneline --after="@${LOG_MTIME}" 2>/dev/null || true)
else
  NEW_COMMITS=$(git log --oneline -20 2>/dev/null || true)
fi

# Nothing new to log
[[ -z "$NEW_COMMITS" ]] && exit 0

# Gather context for decision extraction
DATE=$(date "+%Y-%m-%d %H:%M")
PLAN_CONTEXT=$(head -80 "$FEATURE_DIR/plan.md" 2>/dev/null || echo "(no plan file)")
SPEC_CONTEXT=$(head -60 "$FEATURE_DIR/spec.md" 2>/dev/null || echo "(no spec file)")

PROMPT="You are reviewing an implementation session for the feature: $FEATURE_SLUG

New commits made this session:
$NEW_COMMITS

Feature spec (excerpt):
$SPEC_CONTEXT

Implementation plan (excerpt):
$PLAN_CONTEXT

Based on the commits and context above, write 2-4 key implementation decision entries.

Format each as:
## [Short descriptive title] — $DATE
- **Decision:** what was built or decided
- **Reasoning:** why this approach was chosen
- **Alternatives:** what was considered but not used (or 'N/A')

Be specific and technical. Focus on real decisions (architecture, patterns, trade-offs), not routine steps.
Output only the markdown entries, no preamble or explanation."

ENTRY=$(echo "$PROMPT" | claude -p 2>/dev/null || true)
[[ -z "$ENTRY" ]] && exit 0

# Initialize decisions file if it doesn't exist yet
if [[ ! -f "$DECISIONS_FILE" ]]; then
  cat > "$DECISIONS_FILE" << EOF
# Implementation Decisions: $FEATURE_SLUG

Key technical decisions logged automatically during implementation sessions.

---

EOF
fi

# Append the new entries
printf "%s\n\n---\n\n" "$ENTRY" >> "$DECISIONS_FILE"
