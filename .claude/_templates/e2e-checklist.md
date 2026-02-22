# <feature_title> — E2E Checklist

Generated after implementation. UI scenarios with a URL will run automatically via Playwright MCP if available; others require manual confirmation.

---

## Happy Path

- [ ] **<Scenario 1 title>**
  - **URL:** `/<path>`
  - **Steps:**
    1. <action using visible label or element description>
    2. <action>
  - **Expected:** <what should be visible or true when done>

- [ ] **<Scenario 2 title>**
  - **URL:** `/<path>`
  - **Steps:**
    1. <action>
  - **Expected:** <outcome>

## Edge Cases

- [ ] **<Edge case 1 title>**
  - **URL:** `/<path>`
  - **Steps:**
    1. <how to trigger the edge case>
  - **Expected:** <what the user should see>

- [ ] **<Non-browser check title>**
  - <Describe what to run or check — no URL needed for non-browser scenarios>

## Error States

- [ ] **<Error scenario title>**
  - **URL:** `/<path>`
  - **Steps:**
    1. <how to trigger the error>
  - **Expected:** <error message or fallback the user should see>

## Integration Points

- [ ] **<Cross-feature or external dependency check>**
  - **URL:** `/<path>`
  - **Steps:**
    1. <check to perform>
  - **Expected:** <expected integration behavior>

---

## Sign-off

- [ ] All scenarios above pass
- [ ] No regressions in adjacent features

Update `1-feature.md`: change `- [o] Review` to `- [x] Review` when complete.
