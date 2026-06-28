---
name: rigorous-explainer
description: >-
  Build a rigorous, figure-rich, self-contained HTML explainer/tutorial for any
  technical or mathematical topic — with step-by-step derivations and proofs,
  hand-drawn SVG diagrams, in-page animations, and every symbol defined before
  use. Use this whenever the user wants to derive, prove, explain, or teach
  something rigorously as a document or web page: "derive X", "prove Y
  step by step", "explain Z with figures", "turn these notes into a tutorial",
  "make an interactive math/physics/CS explainer", "MathJax HTML write-up",
  or wants a publishable lesson with diagrams and animations — even if they
  don't say the word "tutorial". Also covers hardening math-in-HTML (MathJax
  rendering bugs, broken section links) and shipping the result to GitHub Pages.
---

# rigorous-explainer

Produce a single **self-contained HTML** document (MathJax + inline SVG/SMIL, no
build step) that derives a result rigorously and *teaches* it. Optionally ship it
live to GitHub Pages.

This skill's folder contains everything you need:
- `assets/template.html` — the starting scaffold (MathJax config + CSS kit + pattern stubs).
- `scripts/*.py` — validation/fix tools; each takes the HTML path as `argv[1]`.
- `references/*.md` — load the relevant one when you reach that step (don't load all up front).

## Five pillars (non-negotiable — this is what "rigorous explainer" means)
1. **Define every symbol and term at first use, self-contained** (a forward link may be added, never substituted).
2. **One building spine** — each section uses the previous; demote off-path rigor to an Appendix.
3. **Extensive SVG + animation** — a symbol→geometry figure per proof; SMIL animation for anything hard to picture statically.
4. **Rigorous, step-by-step derivations and proofs** — show every step; box the headline result.
5. **Clickable section cross-references** — `id` on every heading; refs auto-linked.

Details and checklists: `references/pedagogy-checklist.md`.

## Workflow

### 1. Plan the spine
Outline the sections so section N needs N−1. Lead with a concrete **Section 0
motivation** (an everyday hook) before any abstraction. Decide what is mainline
vs. Appendix. Confirm scope/audience/depth with the user if unclear.

### 2. Scaffold
Copy `assets/template.html` to the output file and fill in the title/sub/TOC. It
already has the working MathJax config, the CSS kit (`.thm/.def/.lem/.prop/
.proof/.secref/.keyresult`), and stubs for a setup figure and a SMIL animation.

### 3. Derive rigorously
Write the math in `$…$` / `$$…$$`. Use the boxed environments for
definitions/theorems/lemmas/props and `.proof` for proofs (show every step; end
with `∎` via `<span class="qed">`). **Define each symbol and term the first time
it appears.**

### 4. Visualize
Give each proof a **setup SVG figure** mapping its symbols onto geometry. Compute
real geometry (Bézier tangents, radius of curvature) — don't eyeball. Add **SMIL**
animations for processes. **Every SVG marker/id must be unique across the page.**
Use **Remotion** only for a shareable MP4/GIF (e.g. a README clip). Patterns and
the exact geometry formulas: `references/figures-and-animation.md`.

### 5. Cross-link
Ensure every heading has an `id`, then:
```
python scripts/autolink_sections.py FILE.html      # wraps §N / §N.M / ranges; map auto-derived from headings
```

### 6. Harden — run after EVERY edit pass
```
python scripts/checktex.py   FILE.html     # $/$$ + brace/\left-right/\begin-end/\boxed balance
python scripts/checklt.py    FILE.html     # literal <,> inside math  (fix: escape_math_lt.py)
python scripts/check_links.py FILE.html    # every #id link resolves; flags unlinked § refs
python scripts/verify_dom.py FILE.html     # headless Chrome: 0 mjx-merror, 0 stray $, links OK
```
**Verify the DOM, never a screenshot** — MathJax is async and screenshots go blank
mid-typeset. If `checklt` fires, run `python scripts/escape_math_lt.py FILE.html`.
The *why* behind each check: `references/math-html-gotchas.md` (read it the first
time something "won't render"). Re-checking in a browser? cache-bust with `?v=N`.

### 7. Ship (only if the user asks — it publishes)
GitHub Pages + an `index.html` redirect; a README with a **clickable preview
screenshot → live page** (GitHub can't embed live HTML/MP4) plus a GIF for motion;
commit only deliverables. Full recipe (gh commands, .gitignore, screenshot via
`scripts/shoot.py`, Unicode-math-in-README rule): `references/shipping.md`.

## Scripts quick reference
| Script | Does | Fails (exit 1) when |
|---|---|---|
| `checktex.py` | MathJax delimiter/brace balance | any imbalance |
| `checklt.py` | literal `<`/`>` inside math | any found |
| `escape_math_lt.py` | fix: `<`→`\lt`, `>`→`\gt` in math (writes .bak) | delimiter imbalance |
| `check_links.py` | `#id` links resolve; warns on unlinked §refs | broken link |
| `autolink_sections.py` | wrap §refs in links, map from headings (.bak) | — |
| `verify_dom.py` | rendered-DOM checks via headless Chrome | mjx-merror or broken link |
| `shoot.py` | reliable headless screenshot → PNG | load failed |

## Reference output
The skill distills the build of a worked example (a physics derivation, "the ruck
in a rug"): live at https://az9713.github.io/ruck-in-a-rug/ — every instruction
here is satisfiable by, and consistent with, that document.
