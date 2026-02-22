# Competitor Design Research — E2E Checklist

Generated after implementation. Work through each scenario manually.

---

## Happy Path

- [ ] Open `design-research.md` — confirm it contains entries for all 6 competitors: Noom, Found, Everlywell, Headspace, Ro, Hims/Hers
- [ ] Each competitor entry contains: site URL, inline screenshot image (or `[screenshot unavailable]` note), at least 3 hex color values, font family names, and 2+ UX observations
- [ ] The "Color Palette Comparison" table at the bottom of `design-research.md` shows all 6 brands with Primary / Secondary / Accent columns filled
- [ ] The "Takeaways" section lists items under "What to Borrow", "What to Avoid", and "Actionable Recommendations" (at least 3 recommendations)
- [ ] The "Recommended Direction for Journey" section contains a palette table with hex values, a typography recommendation with font names and weights, and "Top 5 Design Principles"
- [ ] Open `design-research-minimalist.md` — confirm it contains: Personality Statement, all 6 competitor critiques, a palette (3 colors with hex), a typography recommendation, at least 3 design principles, and the "Why The Other Two Agents Are Wrong" section
- [ ] Open `design-research-maximalist.md` — confirm it contains: Personality Statement, all 6 competitor critiques, a palette with at least 5 hex colors, gradient definitions, typography recommendation (Fraunces + Cabinet Grotesk), at least 3 design principles, and the "Why The Other Two Agents Are Playing It Safe" section
- [ ] Open `design-research-empathy.md` — confirm it contains: Personality Statement, all 6 competitor critiques with at least one contrast ratio or accessibility note per entry, a palette with WCAG contrast ratios for each color, minimum size table for typography, at least 3 design principles with specific WCAG references, and the "Why The Other Two Agents Would Harm Patients" section
- [ ] Open `design-research-final.md` — confirm it contains: summaries of all 3 agent positions, the 3 disagreements with final calls, the final palette table (8 colors with hex), the final typography table, the 5 design principles, and the "Points Where All Three Agreed" section
- [ ] The final palette in `design-research-final.md` includes exactly these roles: Background, Surface, Primary text, Secondary text, Primary/on-track, Accent/encouraging, Celebration surface, Error/critical

## Edge Cases

- [ ] For any competitor where Firecrawl returned no screenshot, the entry notes `_[screenshot unavailable]_` rather than a broken image reference — verify no `![Name]()` with empty URLs exist in `design-research.md`
- [ ] The `design-research-final.md` reconciliation makes a clear final call on all 3 disagreements (background color, palette boldness, typography) — confirm each section ends with a "✅ Final Call:" statement
- [ ] The Golden Hour (`#F5C842`) is described in the final palette as "background only, never text" — verify this constraint is stated clearly

## Error States

- [ ] If any of the 5 output files is missing, it represents an incomplete implementation — check all 5 exist: `design-research.md`, `design-research-minimalist.md`, `design-research-maximalist.md`, `design-research-empathy.md`, `design-research-final.md`
- [ ] If a competitor section in `design-research.md` is missing font information, the crawl failed to extract CSS — acceptable if noted, not acceptable if silently omitted

## Integration Points

- [ ] The final palette in `design-research-final.md` is consistent with the palette in `design-research.md`'s "Recommended Direction" section (they should align, since the final refined the original)
- [ ] The 5 design principles in `design-research-final.md` are actionable enough that a developer implementing a new screen could check their work against them — read each principle and confirm it contains a specific, verifiable constraint (not just a vibe)
- [ ] The `implementation-decisions.md` file documents at least 4 decisions made during this research process

---

## Sign-off

- [ ] All scenarios above pass
- [ ] The research is useful: a team member unfamiliar with this work could open `design-research-final.md` and have clear, specific direction for Journey's color palette, typography, and top design principles within 5 minutes

Update `feature.md`: change `- [o] Review` to `- [x] Review` when complete.
