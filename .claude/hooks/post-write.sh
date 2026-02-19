#!/bin/bash
# post-write.sh
# Auto-commits newly written files to git.

if git rev-parse --git-dir >/dev/null 2>&1 && [[ -n "$CLAUDE_TOOL_FILE_PATH" ]]; then
  git add "$CLAUDE_TOOL_FILE_PATH" 2>/dev/null
  FILENAME=$(basename "$CLAUDE_TOOL_FILE_PATH")
  git commit -m "Add new file: $FILENAME" "$CLAUDE_TOOL_FILE_PATH" 2>/dev/null || true
fi
