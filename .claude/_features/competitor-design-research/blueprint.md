# Competitor Design Research — Blueprint

**Brief:** `.claude/_features/competitor-design-research/brief.md`
**Date:** 2026-02-22

**Goal:** Crawl 6 competitor health/wellness sites with Firecrawl and produce a structured design reference document with colors, fonts, screenshots, and UX observations.

**Architecture:** This is a research task, not shipped code. Firecrawl MCP scrapes each competitor's marketing/landing page. Extracted design data is written into a shared `design-research.md`, then in the final review phase, 3 parallel design agents — each with a distinct, clashing personality and the `frontend-design` skill — independently review the research and write their own opinionated design-research file. Their outputs are then compared to surface disagreements and inform a final direction.

**Tech Stack:** Firecrawl MCP (scrape + screenshot), Markdown

---

## Prerequisites

- [ ] Verify Firecrawl MCP is connected and responding (test with a simple scrape)
- [ ] Confirm `.claude/_features/competitor-design-research/` folder exists

---

## Task 1: Noom (noom.com)

**What:** Scrape Noom's marketing site and extract design data.

**Files:**
- `.claude/_features/competitor-design-research/design-research.md`

**Steps:**
1. Use Firecrawl to scrape `https://www.noom.com/`
2. Take a screenshot of the landing page via Firecrawl
3. From the scraped HTML/content, extract:
   - Primary, secondary, and accent colors (hex values)
   - Font families and weights
   - 2–3 notable UX patterns (layout, CTAs, tone of imagery, whitespace usage)
4. Write the Noom section in `design-research.md` with screenshot link, color swatches, fonts, and observations
5. Verify: section has screenshot URL, at least 3 hex colors, font names, and 2+ UX observations

---

## Task 2: Found (joinfound.com)

**What:** Scrape Found's marketing site and extract design data.

**Files:**
- `.claude/_features/competitor-design-research/design-research.md`

**Steps:**
1. Use Firecrawl to scrape `https://www.joinfound.com/`
2. Take a screenshot of the landing page via Firecrawl
3. Extract: colors (hex), fonts, 2–3 UX patterns
4. Append the Found section to `design-research.md`
5. Verify: section is complete with all required data

---

## Task 3: Everlywell (everlywell.com)

**What:** Scrape Everlywell's marketing site and extract design data.

**Files:**
- `.claude/_features/competitor-design-research/design-research.md`

**Steps:**
1. Use Firecrawl to scrape `https://www.everlywell.com/`
2. Take a screenshot of the landing page via Firecrawl
3. Extract: colors (hex), fonts, 2–3 UX patterns
4. Append the Everlywell section to `design-research.md`
5. Verify: section is complete with all required data

---

## Task 4: Headspace (headspace.com)

**What:** Scrape Headspace's marketing site and extract design data.

**Files:**
- `.claude/_features/competitor-design-research/design-research.md`

**Steps:**
1. Use Firecrawl to scrape `https://www.headspace.com/`
2. Take a screenshot of the landing page via Firecrawl
3. Extract: colors (hex), fonts, 2–3 UX patterns
4. Append the Headspace section to `design-research.md`
5. Verify: section is complete with all required data

---

## Task 5: Ro (ro.co)

**What:** Scrape Ro's marketing site and extract design data.

**Files:**
- `.claude/_features/competitor-design-research/design-research.md`

**Steps:**
1. Use Firecrawl to scrape `https://ro.co/`
2. Take a screenshot of the landing page via Firecrawl
3. Extract: colors (hex), fonts, 2–3 UX patterns
4. Append the Ro section to `design-research.md`
5. Verify: section is complete with all required data

---

## Task 6: Hims/Hers (forhims.com)

**What:** Scrape Hims/Hers marketing site and extract design data.

**Files:**
- `.claude/_features/competitor-design-research/design-research.md`

**Steps:**
1. Use Firecrawl to scrape `https://www.forhims.com/`
2. Take a screenshot of the landing page via Firecrawl
3. Extract: colors (hex), fonts, 2–3 UX patterns
4. Append the Hims/Hers section to `design-research.md`
5. Verify: section is complete with all required data

---

## Task 7: Synthesis & Recommendations

**What:** Write the takeaways section with palette comparison and Journey recommendations.

**Files:**
- `.claude/_features/competitor-design-research/design-research.md`

**Steps:**
1. Re-read all 6 competitor sections
2. Build a side-by-side color palette comparison table (all 6 brands)
3. Write "Takeaways" section:
   - What to borrow (warm/approachable patterns that worked)
   - What to avoid (cold, clinical, or overly corporate patterns)
   - At least 3 actionable recommendations
4. Write "Recommended Direction for Journey" section:
   - Suggested primary/secondary/accent palette (hex)
   - Suggested font family + weights
   - Guiding UX principles (based on the research)
5. Verify: takeaways has 3+ recommendations, palette recommendation uses hex values

---

## Task 8: Final Review — Agent Design Debate

**What:** Spin up 3 parallel design agents with clashing personalities, each using the `frontend-design` skill, each independently reviewing the research and writing their own opinionated design-research file. Then reconcile their outputs.

**Files:**
- `.claude/_features/competitor-design-research/design-research.md` (shared input)
- `.claude/_features/competitor-design-research/design-research-minimalist.md` (Agent 1 output)
- `.claude/_features/competitor-design-research/design-research-maximalist.md` (Agent 2 output)
- `.claude/_features/competitor-design-research/design-research-empathy.md` (Agent 3 output)
- `.claude/_features/competitor-design-research/design-research-final.md` (reconciled output)

**The Agents:**

| Agent | Personality | File |
|---|---|---|
| **The Minimalist** | Despises clutter and excess. Will aggressively strip anything that isn't essential. Deeply suspicious of gradients, illustration, and rounded corners. Quotes Dieter Rams. Would delete your brand colors if given the chance. | `design-research-minimalist.md` |
| **The Maximalist** | Believes more is always more. Vibrant gradients, expressive typography, bold color drenching. Thinks "warm and approachable" means joy, energy, and personality — not beige. Gets personally offended by neutral palettes. | `design-research-maximalist.md` |
| **The Empathy Advocate** | Patient-first, accessibility-obsessed. Cares deeply about legibility, contrast ratios, emotional safety, and reducing cognitive load for unwell users. Finds the other two agents reckless and aesthetics-brained. WCAG is their love language. | `design-research-empathy.md` |

**Steps:**
1. Verify `design-research.md` is complete (all 6 competitors, screenshots, colors, fonts, observations)
2. Launch all 3 agents **in parallel** using the `Task` tool (subagent_type: `general-purpose`). Each agent:
   - Receives the full content of `design-research.md` as context
   - Is told to invoke the `frontend-design` skill before starting
   - Is given its personality as a strict system instruction
   - Must write a complete `design-research-<name>.md` with:
     - Their personality's opinionated critique of each competitor
     - Their own recommended palette (hex) for Journey
     - Their own font recommendation + weights
     - At least 3 "Journey design principles" from their perspective
     - A "Points of Contention" section explicitly calling out where the other two agents would disagree with them — and why those agents are wrong
3. Wait for all 3 agents to complete
4. Read all 3 output files
5. Write `design-research-final.md` that:
   - Summarizes each agent's core position in 2-3 sentences
   - Surfaces the top 3 genuine disagreements between them
   - Makes a final call on each disputed point (with reasoning)
   - States Journey's recommended palette, fonts, and top 5 design principles
6. Verify all 4 output files exist and are non-empty
7. Commit: `Add competitor design research: 6 site analyses + 3-agent design debate + final recommendations`

---

## Key Decisions

| Decision | Choice | Reason |
|---|---|---|
| No TDD | Research artifact | No code to test — verify by inspecting output |
| Sequential crawls | One at a time | Handle Firecrawl rate limits; each depends on previous doc state |
| Screenshot storage | URL references | Firecrawl returns URLs; avoids binary files in repo |
| Multiple output files | 4 files (3 agent + 1 final) | Each agent gets their own file to avoid write conflicts; final reconciles all |
| Crawl scope | Homepage/landing only | User specified marketing pages; avoids auth-gated content |

## Out of Scope

- Implementing any design changes to the app
- Downloading/storing screenshot image files locally
- Crawling sub-pages beyond the main landing page
- In-app screenshots or App Store listings
