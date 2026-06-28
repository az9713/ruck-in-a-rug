# Pedagogy checklist — the five pillars

A rigorous explainer is judged on whether a reader can follow it top to bottom
without jumping around. Enforce these:

## 1. Define every symbol AND term before first use, self-contained
- The first time a symbol appears, name it inline: "the bending stiffness $B$",
  "the curvature $\kappa=1/R$". Same for jargon: "*nucleation* (creating it from
  the flat state)".
- "Self-contained" means the definition is *here*, not only "see §7". A forward
  link is fine **in addition**, never **instead**.
- Audit: read the doc top-down; the first occurrence of any symbol/term must
  carry its meaning. Things introduced only in a later section are a bug.

## 2. One building spine — each section needs the previous
- Order sections so section N uses results from N−1. Add a one-line **bridge** at
  each section start ("With the equation of §2 in hand, we now solve it …").
- If a block is rigorous but off the main path (an exact/alternative treatment),
  **demote it to an Appendix** rather than interrupting the spine.
- Introduce a quantity where it is *earned* (e.g. a length scale right where the
  competition that produces it appears), not in an early standalone dump.

## 3. Motivation first
- Lead with a concrete, everyday hook (a "Section 0") that shows where the
  problem comes from and previews what each later section delivers. Then take the
  idealized object as given and analyze it.

## 4. Rigorous, step-by-step derivations and proofs
- Use boxed environments: `.def` (definition), `.thm` (theorem), `.lem` (lemma),
  `.prop` (proposition); proofs in `.proof` (auto-prefixed "Proof.", `∎` via `.qed`).
- Show **every** step. Box the headline result with `$$\boxed{…}$$`.
- Give each proof a setup figure (see `figures-and-animation.md`).

## 5. Section cross-references are clickable
- Put `id`s on every heading: `<h2 id="setup">1. …</h2>`. Reference as
  `<a class="secref" href="#setup">§1</a>`.
- Don't hand-maintain these: run `scripts/autolink_sections.py FILE.html` — it
  derives the number→id map from the headings and wraps every `§N` / `§N.M` /
  range. Re-run after edits; it skips already-linked refs.

## Restructuring safely (reorder / renumber)
Reordering a numbered document means sections, equation tags, the TOC, and every
cross-reference must stay consistent. Do it as a scripted **placeholder two-pass
remap**, never a chain of naive replaces (which double-map, e.g. 6→4 then 4→2):
1. Build the old→new maps (sections, `(eq.tags)`, `\tag{…}`).
2. **Pass 1:** replace every OLD token with a unique placeholder (`@E0@`, `@E1@`…).
3. **Pass 2:** replace placeholders with their NEW values.
4. Rebuild the TOC from the new headings; re-run `autolink_sections.py` so the
   visible `§N` text matches the new numbers.
5. Re-run all checkers (the renumber must not break delimiter balance or links).
After any restructure, equation/theorem labels may fall out of source order; renumber them too, or accept and note it.

## Always, after every edit pass
Run the hardening loop (see SKILL.md step 6). Cheap, and it catches the silent
failures in `math-html-gotchas.md` immediately rather than three edits later.
