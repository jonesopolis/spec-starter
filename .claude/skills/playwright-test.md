---
name: playwright-test
description: Run UI scenarios automatically using Playwright MCP browser automation tools.
---

# Playwright Test

Automate UI e2e scenario execution using Playwright MCP browser tools.

## Availability check

Before using this skill, confirm that Playwright MCP tools are present in your tool list (look for tools prefixed with `mcp__playwright__` or similar browser automation tools). If they are available, proceed with this skill. If they are not available, stop immediately and report to the caller: "Playwright MCP not available." Do not execute any scenarios. The caller is responsible for handling unavailability (typically by asking the user to confirm each scenario manually).

## Scenario structure

Each UI scenario in `4-e2e-checklist.md` follows this format:

```
- [ ] **<Scenario title>**
  - **URL:** `/<path>`
  - **Steps:** numbered list of actions
  - **Expected:** what should be visible/true when done
```

Scenarios that have a URL, Steps, and Expected field are in scope for this skill. Scenarios without a URL (CLI checks, API checks, or manual-only verifications) are out of scope — the caller handles those via Bash or manual confirmation.

## Building full URLs

The `## Base URL` section in `.claude/testing.md` provides the origin. If a scenario URL is relative (starts with `/`), prepend the base URL.

Example: base URL `http://localhost:3000` + scenario URL `/dashboard` = `http://localhost:3000/dashboard`.

If `testing.md` has no base URL, ask the user to provide it before proceeding.

## Test accounts

If `.claude/testing.md` defines test credentials under `## Test accounts`, use them for any login flow before navigating to a protected route. Log in once at the start of the test run and reuse the session for subsequent scenarios where possible.

## Running a scenario

For each in-scope scenario:

### 1. Navigate

Navigate to the full URL using the Playwright navigation tool.

### 2. Execute steps

Work through the numbered steps in order:

- **Clicks:** locate the element by its visible label, text, or ARIA role — not by CSS selector. Then click it.
- **Form inputs:** use fill tools to enter values into fields, identified by their visible label or placeholder text.
- **Keyboard actions** (Enter, Tab, Escape, etc.): use key press tools.

After all steps are complete, take a screenshot to capture the final state.

### 3. Verify expected outcome

Use page content reading tools (accessibility tree or page text) to check whether the expected text or elements are present.

- If the expected outcome is present: **PASS**.
- If the expected outcome is absent or an error is visible: **FAIL**.

## Result reporting format

After each scenario, report the result in this format:

```
Scenario: <title>
Result: PASS
Evidence: <what was observed>
```

or

```
Scenario: <title>
Result: FAIL
Evidence: <what was observed>
```

Include specific observed text, element presence, or error messages as evidence. Do not report vague evidence like "page loaded correctly."

This skill reports results to the conversation only. It does not modify `4-e2e-checklist.md`. The caller is responsible for marking scenarios `[x]` (pass) or `[!]` (fail) based on this skill's reported outcomes.

## Error handling

If navigation fails or an element cannot be found, try once more using an alternate approach (e.g. a different locator strategy or a short wait before retrying).

If the scenario still cannot be completed after the second attempt, mark it with `[!]`, report the specific error and evidence, and continue to the next scenario. Never hang or retry infinitely.

```
Scenario: <title>
Result: [!] ERROR
Evidence: <specific error message or what was observed>
```

## Output summary

After all scenarios are complete, output a summary table:

```
## E2E Results

| Scenario | Result |
|----------|--------|
| <title>  | PASS   |
| <title>  | FAIL   |
| <title>  | [!] ERROR |
```

Then list any FAIL or ERROR scenarios with their full evidence for follow-up.
