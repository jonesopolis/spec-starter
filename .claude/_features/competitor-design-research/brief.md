# Competitor Design Research — Brief

## Overview

Before committing to a visual design direction for Journey Health Navigator, we want to understand the design language of comparable health and wellness apps. Using Firecrawl, we'll scrape the marketing/landing pages of 5–6 recommended competitors, extract color palettes, typography, and UX patterns, and store those observations as a structured reference document. Journey's target vibe is **warm and approachable** — so the research will flag what competitors do well in that direction and what to avoid. This gives us real evidence to draw from when making design decisions for screens like onboarding, the home dashboard, and the intake wizard.

## Goals

- Build a concrete, referenced design mood board in Markdown so that future design work has a clear starting point
- Identify what makes competitor UIs feel warm and approachable — and what makes them feel cold or clinical
- Avoid inadvertently copying a competitor's palette or layout by knowing explicitly what others are doing

## Competitors (Recommended)

These were selected for their relevance to health/wellness and their "warm and approachable" design qualities:

| # | Product | URL | Why |
|---|---------|-----|-----|
| 1 | **Noom** | noom.com | Behavior-change nutrition app; famously warm, human, coaching-forward |
| 2 | **Found** | joinfound.com | Weight management; modern but personable, strong use of color |
| 3 | **Everlywell** | everlywell.com | At-home health testing; clean, friendly, very approachable |
| 4 | **Headspace** | headspace.com | Mental wellness; the gold standard for warm/friendly health UX |
| 5 | **Ro** | ro.co | Telehealth; modern, trustworthy, good typography choices |
| 6 | **Hims/Hers** | forhims.com | Telehealth; bold, contemporary, strong brand identity |

## Requirements

### Must Have

- Crawl the marketing/landing pages (not in-app screens) of all 6 competitors using Firecrawl
- For each: extract primary/secondary/accent colors (hex), font choices, and 2-3 notable UX patterns or layout observations
- Firecrawl-captured page screenshots for each competitor, referenced inline in the research doc
- Produce a single Markdown file `design-research.md` inside this feature folder with structured findings
- A short "takeaways" section synthesizing what to borrow vs. avoid for a warm-and-approachable direction
- Recommendations for Journey's own palette and type scale based on the research

### Nice to Have

- Side-by-side color palette comparison across all 6 competitors
- Specific font name + weight recommendations (e.g. "Inter 400/600" or "Nunito")

## User Experience

This is an internal research artifact, not a user-facing feature. The "user" is the development team. The output is a Markdown document they can open alongside a design tool or code editor when making UI decisions.

## Edge Cases

- Firecrawl may be rate-limited or blocked by some sites — fall back to manual notes or alternative URLs if a crawl fails
- Color extraction from screenshots may be imprecise — prefer named brand colors from CSS/design tokens when available in the crawled HTML
- If a competitor has significantly redesigned since this research, note the date so the team knows to re-check

## Out of Scope

- In-app screenshots or App Store listings (marketing/landing pages only)
- Implementing any design changes to the app (this is research only)
- Full accessibility audits of competitors
- Video or interactive flow recording
- Any automated ongoing monitoring of competitor sites

## Success Criteria

- `design-research.md` exists with findings for all 6 competitors
- Each entry includes: site URL, screenshot, primary palette (hex), fonts, and 2+ UX observations
- A "takeaways" section with at least 3 actionable recommendations for Journey's warm-and-approachable design direction
- Team can open the doc and immediately have useful context for any screen design decision
