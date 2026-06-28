# Figures and animation

Hand-authored inline SVG beats generative images for rigorous diagrams: you get
exact geometry, and every symbol in the math can be placed on the picture. The
goal of a figure here is **mapping symbols to geometry**, not decoration.

## The "setup figure" pattern (one per proof / key result)
Put a small SVG at the top of each proof whose caption maps each symbol in the
statement to a feature of the drawing. Structure:
```html
<div class="proof">
<figure><svg class="setupfig" viewBox="0 0 W H" width="100%" role="img" aria-label="...">
  <defs><marker id="UNIQUE" ...>...</marker></defs>
  ... lines / paths / text labels ...
</svg><figcaption><b>Setup.</b> "x is …, θ is the angle …, R = 1/κ is …".</figcaption></figure>
... derivation ...
</div>
```
- `viewBox` + `width="100%"` makes it responsive; the CSS caps width inside proofs.
- **Unique ids.** `<marker>`, gradients, clips share one global namespace across
  the whole page — prefix per figure (`t1ah`, `p2ah`). Colliding ids = missing arrows.

## Get the geometry RIGHT (don't eyeball)
- **Tangent to a cubic Bézier** P0,P1,P2,P3 at parameter t: direction ∝
  B'(t) = 3(1−t)²(P1−P0) + 6(1−t)t(P2−P1) + 3t²(P3−P2). Draw the tangent line
  along that vector so it actually touches the curve.
- **Radius of curvature** of a plane curve: R = 1/κ,
  κ = |x'y'' − y'x''| / (x'² + y'²)^{3/2}. Size an osculating circle to the real R,
  not an arbitrary one.
- **de Casteljau split** lets you highlight an exact sub-arc of a Bézier.
- A small Python/JS calc for these points is cheaper than re-eyeballing.

## In-document animation: SVG SMIL (no JS, offline)
Use SMIL for processes that are hard to picture statically (a cycle, a wave, a
mechanism). It loops natively and needs no JavaScript.
- `<animateTransform attributeName="transform" type="translate" values="…" keyTimes="…" dur="5s" repeatCount="indefinite"/>` inside a `<g>` moves that group.
- Toggle phase labels with `<animate attributeName="opacity" values="1;1;0;0" keyTimes="…">`.
- **Sync** elements by giving them the same `dur` and `keyTimes`; encode the
  motion in each element's `values` list.
- Verify it animates by sampling: in the browser, `svg.pauseAnimations();
  svg.setCurrentTime(t); el.transform.animVal.getItem(0).matrix.e` at a few `t`.

Example (a patch that shoves then partly recovers — a ratchet):
```html
<g>
  <rect x="60" y="104" width="34" height="14" fill="#7a1f1f" fill-opacity="0.55"/>
  <animateTransform attributeName="transform" type="translate"
    values="0 0; 0 0; 120 0; 120 0; 60 0; 60 0" keyTimes="0;0.2;0.4;0.6;0.8;1"
    dur="5s" repeatCount="indefinite"/>
</g>
```

## Shareable video: Remotion (when you want an MP4/GIF, not in-doc)
Remotion (React + TypeScript) renders a composition to MP4/GIF — good for READMEs
and talks. Minimal `package.json` scripts:
```json
"scripts": {
  "studio":  "remotion studio",
  "render":  "remotion render <CompId> out/clip.mp4",
  "gif":     "remotion render <CompId> out/clip.gif --codec=gif"
}
```
- Downscale GIFs for READMEs: `--codec=gif --scale=0.5 --frames=0-179` (smaller file).
- The composition is a normal React component animated by `useCurrentFrame()`.
- Rule of thumb: **SMIL for in-page animation, Remotion for a shareable clip.**
  GitHub READMEs can't embed live HTML or an MP4 player — embed the **GIF** inline
  and link the MP4.
