# Implementation Decisions: competitor-design-research

Key technical decisions made during implementation.

---

## Firecrawl branding format for color extraction — 2026-02-22
- **Decision:** Used Firecrawl's `branding` format alongside `markdown` and `screenshot` to extract CSS-level color and font data rather than manually parsing HTML
- **Reasoning:** The branding extraction surfaces computed CSS values (primary colors, font families) that are more reliable than inferring colors from screenshots or marketing copy
- **Alternatives:** Manual HTML parsing for `color` / `background-color` CSS properties; rejected because Firecrawl's branding output is structured and faster to process

---

## Sequential crawls, single document — 2026-02-22
- **Decision:** Tasks 1–7 were handled by a single research agent writing sequentially to `design-research.md` rather than parallel agents appending to the same file
- **Reasoning:** Parallel writes to the same Markdown file would cause race conditions and interleaved sections; the document's coherence (including the synthesis section) requires a single agent holding the full context
- **Alternatives:** Parallel per-competitor agents each writing their own file, then a merge step; rejected as unnecessary complexity given Firecrawl rate limits already enforce sequencing

---

## Three debate agents writing separate files — 2026-02-22
- **Decision:** The three design-personality agents (Minimalist, Maximalist, Empathy Advocate) each write to separate files (`design-research-<name>.md`) rather than appending to one document
- **Reasoning:** Parallel writes require isolated output paths; separate files also make each agent's position independently readable, which is more useful for the team than a merged document
- **Alternatives:** Sequential agents appending sections to one file; rejected because it would prevent true parallel execution and reduce each agent's freedom to structure their argument

---

## Empathy Advocate's palette adopted with Maximalist amendment — 2026-02-22
- **Decision:** The final palette uses the Empathy Advocate's contrast-verified colors as the base, with the Maximalist's Golden Hour (`#F5C842`) added as a celebration surface color only (never text)
- **Reasoning:** The Empathy Advocate's palette is the only one with verified WCAG contrast ratios; the Minimalist's 3-color system lacks emotional range; the Maximalist's 6-color system introduces unaudited contrast combinations at system edges. The one Maximalist amendment adds emotional differentiation for achievement moments without accessibility risk.
- **Alternatives:** Pure Minimalist palette (too austere, single emotional register); pure Maximalist palette (too complex, mixed accessibility); original research doc palette (solid but unverified contrast ratios)

---

## DM Serif Display + DM Sans adopted over Fraunces + Cabinet Grotesk — 2026-02-22
- **Decision:** Final typography is DM Serif Display (headings) + DM Sans (body), not the Maximalist's Fraunces + Cabinet Grotesk pairing
- **Reasoning:** DM Serif Display and DM Sans are a designed family available via Expo Google Fonts; Cabinet Grotesk requires manual bundling in React Native; Fraunces `WONK` axis animation conflicts with `prefers-reduced-motion` accessibility requirements for a patient app
- **Alternatives:** Single-family DM Sans (Minimalist) — loses typographic warmth and emotional range for headline moments; Fraunces + Cabinet Grotesk (Maximalist) — compelling but impractical for Expo ecosystem
