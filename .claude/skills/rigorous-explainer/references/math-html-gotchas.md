# Math-in-HTML gotchas (read before debugging "why won't this render")

These five traps cost real time on the project this skill came from. Each has a
detector and/or a fix in `scripts/`.

## 1. `$…$$` delimiter mismatch silently scrambles everything downstream
A region opened with a single `$` but closed with `$$` (or vice-versa) flips
MathJax's inline/display state for the **rest of the file**: following prose gets
eaten into "math", equations render as garbage. It is invisible in the source.
**Detect:** `python scripts/checktex.py FILE.html` (also checks `{}`,
`\left/\right`, `\begin/\end`, `\boxed{`).

## 2. A literal `<` inside `$…$` becomes a phantom HTML tag
The HTML parser runs *before* MathJax. `$0<s<L$` is read as text `0` then a
start-tag `<s …>` (strikethrough!) that swallows everything up to the next `>`
— producing **blank regions, unrendered equations, and broken layout**. Same for
`<x`, `</`, etc.
**Detect:** `python scripts/checklt.py FILE.html`
**Fix:** `python scripts/escape_math_lt.py FILE.html` (turns `<`→`\lt`, `>`→`\gt`
inside math only; MathJax renders these identically).

## 3. GitHub README `$…$` math is unreliable
GitHub does support `$…$` in Markdown, but it fails quietly inside `**bold**` /
`*italic*` spans and other contexts — showing raw LaTeX. **For README/Markdown,
write math in Unicode** (Δ, π, θ, ℓ_eg, ½, ·, ², ∼, ≪, →, ∫). Save real MathJax
for the HTML and link to the live page. (HTML files are fine with `$…$`.)

## 4. MathJax renders asynchronously → screenshots lie
A screenshot taken before MathJax finishes shows blank/half-rendered math, and
the browser-extension capture often returns an all-white frame mid-typeset.
**Never verify rendering by eyeballing a screenshot.** Verify the DOM:
`python scripts/verify_dom.py URL_OR_FILE` (asserts 0 `mjx-merror` nodes, 0 stray
`$`, all `#id` links resolve), using headless Chrome with a virtual-time budget.
For preview images use `scripts/shoot.py` (also virtual-time-budgeted).

## 5. Two smaller traps
- **Fragment-only navigation doesn't reload.** Going from `page.html#a` to
  `page.html#b` (or re-opening the same `?`-less URL) may serve a cached DOM.
  Append a cache-buster `?v=2`, `?v=3`, … when re-checking after edits.
- **SVG `<marker>`/`id`s are GLOBAL across the page.** Two figures that both
  define `<marker id="ah">` collide — arrows vanish or point wrong. Give every
  marker/gradient/clip a figure-unique id (`t1ah`, `p2ah`, `eg1g`, …).

## Subresource Integrity (the security hook)
Tools may warn that the MathJax `<script>` lacks `integrity="sha384-…"`. Do not
fabricate a hash (a wrong one blocks the script and nothing renders). Either
leave it off for a local/teaching doc, or fetch the real SRI hash for a pinned
MathJax version, or vendor `tex-mml-svg.js` locally to drop the CDN entirely.

## The MathJax config that works (in `assets/template.html`)
```html
<script>
window.MathJax = {
  tex: { inlineMath: [['$','$'],['\\(','\\)']], displayMath: [['$$','$$'],['\\[','\\]']], tags: 'ams' },
  svg: { fontCache: 'global' }
};
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-svg.js" async></script>
```
SVG output (not CHTML) keeps the doc self-contained and prints/exports cleanly.
