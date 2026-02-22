# Competitor Design Research — Final Verdict
_Journey Health Navigator_
_Date: 2026-02-22_
_Resolved from: The Minimalist · The Maximalist · The Empathy Advocate_

---

## The Three Positions (Summary)

**The Minimalist** — Three colors, one font, nothing that cannot justify its existence. Argues that clarity is the only form of emotional safety that actually works, and that warm backgrounds are a designer's comfort blanket, not a patient's. Quotes Dieter Rams. Would delete gradients from the entire industry if given legal authority.

**The Maximalist** — Bold is generous, muted is cowardly. Proposes Vitality Ember (`#E8552A`), Golden Hour gradients, and Fraunces Black at 80px for achievement moments. Argues that a patient fighting a chronic condition deserves an app that fights back with equal energy, and that forgettable design is failed design.

**The Empathy Advocate** — WCAG AA is the floor, not the ceiling. Documents every color's contrast ratio, mandates 1.6 line height, requires `prefers-reduced-motion`, and reminds the other two that Journey's users are frequently frightened, fatigued, or in pain. The only agent who cited Miller's Law and vestibular disorder statistics in the same document.

---

## The Three Genuine Disagreements — and Final Calls

---

### Disagreement 1: Background Color

**Minimalist:** Pure white (`#FFFFFF`). Warmth is a copy and spacing problem, not a color problem. Cream backgrounds make apps look like scented candles.

**Maximalist:** Warm parchment (`#FFF8F0`), pushed amber-ward past Headspace's cream. The background is the first color a patient sees — make it feel like paper you want to write on.

**Empathy Advocate:** Warm oat (`#F7F3EE`). Agrees with the Maximalist's emotional reasoning, grounds it in evidence: off-white warm surfaces reduce perceived clinical severity and reduce eye strain in the low-light environments where patients frequently use health apps (hospital rooms, bedrooms at night).

### ✅ Final Call: Warm Oat — `#F7F3EE`

The Minimalist is functionally correct that white works. But Journey is not optimizing for function alone — it is optimizing for a patient opening the app at 11pm after a hard day, who should feel they have entered a personal space, not a spreadsheet. The research doc, the Maximalist, and the Empathy Advocate all independently converge on a warm off-white. The Minimalist is outvoted on evidence, not just aesthetics. `#F7F3EE` is the background.

---

### Disagreement 2: Palette Boldness

**Minimalist:** Three colors only. White, near-black (`#1A1A1A`), forest green (`#1B6B43`). Every additional color is a problem, not a solution.

**Maximalist:** Six colors plus three named gradients. Vitality Ember, Midnight Indigo, Golden Hour, Turquoise Vitality, Warm Parchment, Deep Night. Each color has emotional function. Gradients are not decoration — they are how light works.

**Empathy Advocate:** Five colors, every one with a verified WCAG contrast ratio. Forest green darkened to `#1E6B47` for guaranteed compliance, amber darkened to `#B85C00` for the same reason. No color used without an emotional safety rationale.

### ✅ Final Call: Empathy Advocate's palette — with one Maximalist amendment

The Minimalist's three-color system is elegant but produces an app with one emotional register. There is no visual way to distinguish "on track" from "celebration" from "alert" from "neutral" — everything that requires differentiation needs to be solved in copy and layout, which is too much structural weight on one lever.

The Maximalist's six-color-plus-gradients system is too complex for a daily-use mobile app and introduces real accessibility risk at the system's edges. The Ember orange (`#E8552A`) as a primary — while compelling — departs too far from the "warm and approachable health" register into "energetic consumer brand."

**The Empathy Advocate's palette wins** with the following amendment: the achievement/celebration state borrows the Maximalist's instinct. The Golden Hour amber (`#F5C842`) is permitted as a **surface color only** (behind dark text, never as text itself) for celebration states — streak banners, goal completions, progress milestones. This gives the Maximalist's emotional moments without the contrast risks.

**Final Palette:**

| Role | Hex | Source |
|------|-----|--------|
| Background | `#F7F3EE` | Warm oat — research doc + Empathy |
| Surface (cards) | `#FFFFFF` | White — all three agree |
| Primary text | `#2C2824` | Warm near-black — Empathy |
| Secondary text | `#5C564F` | Warm mid-gray — Empathy |
| Primary action / "on track" | `#1E6B47` | Forest green (contrast-verified) — Empathy |
| Encouraging accent | `#B85C00` | Warm amber (contrast-verified) — Empathy |
| Celebration surface | `#F5C842` | Golden hour as background only — Maximalist |
| Error / critical | `#B91C1C` | Accessible red — Empathy |

---

### Disagreement 3: Typography

**Minimalist:** One font family (Geist or DM Sans). Light weights for display. A second font is two competing voices and a font-loading budget that belongs to a different app.

**Maximalist:** Fraunces (variable, with `WONK` axis) + Cabinet Grotesk. The pairing is a high-low combination — maximum personality at display scale, clean utility at interface scale. "No health app in the competitive set is using this" is a feature.

**Empathy Advocate:** DM Serif Display + DM Sans. A designed family. 16px body minimum, non-negotiable. 1.6 line height for body text. No thin weights.

### ✅ Final Call: DM Serif Display + DM Sans, with Empathy's usage rules

The Minimalist's one-font argument loses on emotional range. When everything is the same typeface, achievement moments cannot feel different from instructional copy. The Maximalist's Fraunces + Cabinet Grotesk is genuinely compelling — but Cabinet Grotesk is not a standard React Native font, adding friction for engineers, and the Fraunces `WONK` axis animation (while delightful) runs directly into the Empathy Advocate's `prefers-reduced-motion` requirements for a patient app.

DM Serif Display + DM Sans wins because: it is a designed family (consistent personality), it is available via Expo Google Fonts, it has the exact serif/sans warmth contrast that three agents independently converged on, and the Empathy Advocate's sizing and spacing rules apply cleanly to it.

**Typography rules (Empathy Advocate's, adopted in full):**

| Context | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero headline | 28–40px | DM Serif Display Regular | 1.2 |
| Section heading | 22px | DM Serif Display Regular | 1.25 |
| Card title | 18px | DM Sans Semibold (600) | 1.3 |
| Body text | 16px minimum | DM Sans Regular (400) | 1.6 |
| Supporting text | 14px (only with AAA contrast) | DM Sans Regular | 1.5 |
| Labels / metadata | 13px (only for legal/disclaimer) | DM Sans Regular | 1.6 |

**Sentence case everywhere. No justified alignment. No italic as sole semantic signal. Max 65 characters per line.**

---

## Journey's Recommended Palette, Typography & Principles

### Palette

| Role | Hex | Notes |
|------|-----|-------|
| Background | `#F7F3EE` | Warm oat |
| Surface | `#FFFFFF` | Cards, modals |
| Primary text | `#2C2824` | Warm near-black (13.1:1 on background) |
| Secondary text | `#5C564F` | Warm mid-gray (5.2:1 on background) |
| Primary / on-track | `#1E6B47` | Forest green (5.9:1 on background) |
| Accent / encouraging | `#B85C00` | Warm amber (4.8:1 on background) |
| Celebration surface | `#F5C842` | Golden — background only, never text |
| Error / critical | `#B91C1C` | Accessible red (5.4:1 on background) |

### Typography

- **Heading:** DM Serif Display, Regular and Italic
- **Body:** DM Sans, Regular (400) and Semibold (600)
- **Body minimum:** 16px · Line height: 1.6 · Max line length: 65 chars

### Top 5 Design Principles for Journey

**1. Every screen should feel like a supportive conversation, not a form.**
Sentence case. First-person prompts. One action per screen on intake flows. Confirm actions warmly. Animate between steps (with `prefers-reduced-motion` support). _(Research doc + Empathy)_

**2. Warmth is structural, not decorative.**
The warm oat background, rounded card corners (`border-radius: 12–16px`), pill primary buttons (`border-radius: 9999px`), and DM Serif Display headings are not decoration applied over a clinical app — they are the foundation. Every component inherits this system. No sharp corners on interactive elements. _(Research doc + Minimalist's structural argument)_

**3. Contrast is care. Accessibility ships or nothing ships.**
WCAG 2.1 AA is the minimum for every text and interactive element. Touch targets: 44×44px mandatory. `prefers-reduced-motion` CSS is implemented in the base stylesheet. Color is never the sole carrier of information. VoiceOver testing before any feature is complete. _(Empathy Advocate, adopted without compromise)_

**4. Celebrate loudly, instruct quietly.**
Daily instructional UI (logging forms, dashboards, data views) should be calm and unobtrusive — DM Sans at comfortable sizes, oat background, green primary actions. Achievement moments (streak milestones, goal completions, health score improvements) should use the Golden celebration surface, DM Serif Display Italic, and can include animation when `prefers-reduced-motion` is not set. The contrast between quiet daily UI and expressive celebration moments makes the celebrations feel earned. _(Maximalist's emotional instinct + Empathy's constraints)_

**5. Trust is built in the quiet moments.**
Empty states: one line of copy + one CTA. No houseplant illustrations. Error messages: plain English + one action. Loading states: reassure with copy ("Pulling up your personalized plan..."). Never use red for anything the user cannot immediately resolve. Never use urgency language. Affirmations must be specific, not hollow. _(Research doc + Empathy's language tone rules)_

---

## Points Where All Three Agents Agreed (Without Prompting)

These are worth noting as high-confidence signals:

- **Headspace's cream background is the single best decision in the competitive set.** All three cited it.
- **Ro's acid yellow and 14px body text are wrong** for a patient health app. All three said so.
- **Found's insurance-first CTA is a patient-centered UX insight** worth borrowing. All three acknowledged it.
- **Generic health blue should not exist in Journey's palette.** All three ruled it out independently.
- **Plain-language copy matters as much as visual design.** All three made this point unprompted.

---

_Research completed 2026-02-22. Compiled from competitor crawl data (design-research.md) and three independent agent analyses (design-research-minimalist.md, design-research-maximalist.md, design-research-empathy.md)._
