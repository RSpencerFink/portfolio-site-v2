# RSF logo, per-letter paths

Files:

- `rsf-letters.svg`: white (`#FFFFFF`). Three `<path>` elements with ids `r`, `s`, `f`. viewBox `0 0 1519.3 729.6`, the same as the original.
- `rsf-letters-black.svg`: the same paths filled `#000000`.
- `compare.png`: the original and the rebuild side by side on `#04050A`, plus a tinted render (one color per letter) and a stroke-only render.

## What the original actually is

`rsf-FFFFFF.svg` is one closed contour (one `M`, one `z`, 104 cubic segments). It does not self-intersect: running skia-pathops `simplify()` on it leaves the area unchanged. The problem is that the letters are merged, not that they overlap:

- The R's bowl runs into the S's upper-left arm. There is no edge between them.
- The S's lower-right bowl runs into the F's stem between y ≈ 343 and y ≈ 648. There is no edge there either.
- Every other place where the letters meet already has a thin dark channel in the original: R leg / S tail, S top terminal / F notch. The R's counter also opens into its crotch through a slit.

Because it is one outline, a stroke-dash draw follows a single path around all three letters, and the S can't be addressed on its own.

## How the split was made

I parsed the path into absolute cubics and cut the contour at the four points where the merged regions start and end. Then I closed each piece with one new edge:

1. **R / S:** a new cubic from (547.5, 115.4), the notch where the R's top meets the S, to (567.4, 378.6), the notch under the S spine. It is tangent to the R's top curve at one end and to the R bowl's lower edge at the other, so it reads as the R bowl's right side. The R uses this curve and the S uses the same curve reversed.
2. **S / F:** a straight line from (1000, 341.6) to (999.3, 648.2), continuing the F stem's left edge above and below the merge. The S gets a straight right edge at this point, hidden against the F.

All other segments are the original Illustrator segments, unchanged, with coordinates rounded to one decimal like the source. Existing channels and the R's counter slit are kept exactly as they were.

Each output path is one closed contour that starts at a cut point, so `getTotalLength()` and stroke-dashoffset draw each letter as a single loop.

## Verification (skia-pathops)

- Pairwise intersection area of r/s, r/f, and s/f: 0.
- Union of r, s, and f compared with the original: XOR area 0, so the filled silhouette is identical.
- Pixel diff of rsvg renders at 1600 px: 383 pixels differ by more than 10%. All of them sit on the two new cut edges and are anti-aliasing seams.

## Deviations and caveats

- **The R / S edge is new geometry.** The original has nothing there to copy. The bulge was kept small so that the R bowl and the S arm both keep reasonable widths in the tinted view. Ask for a change if the client wants a different split.
- **The cuts are shared edges, not gaps.** A hairline gap would add dark lines through solid white areas that the original doesn't have. The cost: when the three paths are rendered separately, anti-aliasing can show a faint grey hairline along the two cuts. You can see it in the white rebuilt panel of `compare.png`, and a 6.4× mask zoom would make it more visible. Once the intro draw has finished, a consumer that needs a seamless mask (H1/H2) can render the original single path, or the three `d` strings joined into one `<path>`. They don't overlap, so nonzero fill gives the exact original silhouette with no seams. Keep `#s` separate only where the S itself has to be targeted.
- The two new edges sit inside what was solid white, so the filled logo looks the same. They show up only in stroke-only and tinted renders.

Tooling used: Python 3.13 with skia-pathops 0.9.2 in a venv under `/tmp` (only for verification), rsvg-convert, and ImageMagick. None of it is in the repo.

## Variant: S overlapping F (`rsf-letters-sf-overlap.svg`)

The client asked to see the S complete and in front of the F, with the hidden bowl taken from Arial Black, the typeface the logo was set in.

Files: `rsf-letters-sf-overlap.svg` (white), `rsf-letters-sf-overlap-black.svg`, `compare-sf.png` (v1 against v2, plus tinted and stroke-only renders, with the fitted Arial Black S overlaid in cyan), and `compare-sf-zoom.png` (the S/F junction at 3x, v1 against v2). The first version, with a hand-drawn bowl, is kept as `*-v1.svg` and `*-v1.png`.

**Fitting the glyph.** I extracted the "S" outline from `/System/Library/Fonts/Supplemental/Arial Black.ttf` with fontTools and fitted it to the logo's S edges with a robust least-squares fit (scale, Y flip and translation only).

- Fitted transform: x = 0.4706·u + 402.2, y = −0.4706·v + 713.6, where (u, v) are font units.
- Residuals against the logo edges next to the bowl are 0.6–2.4 units: the spine's right edge, the start of the bottom curve, and the right side of the lower counter.
- Across the whole S the residual RMS is 19 units. The logo's counters are smaller and its strokes heavier than Arial Black's (the top stroke is about 184 units against 128). The terminals were also recut by hand into the diagonal channel shapes.
- Non-uniform scale and skew didn't improve the fit near the bowl, so the logo doesn't look stretched. It is Arial Black with manual edits.

Following the brief, the logo's own geometry is kept everywhere except the hidden bowl.

**The S.** Everything from (997.3, 342.8) to (996.9, 650) is now the transformed Arial Black outer bowl: 4 cubics, reaching x ≈ 1061.5.

- The glyph passes 1.2 and 2.9 units from the two junction points.
- I closed that gap with a displacement blended smoothly along the bowl. My first try snapped only the end segment, which left a visible kink.
- At the joins, the tangents differ by 0.9° at the top and 0.5° at the bottom.

**The F.** The F keeps its full shape, minus a 9-unit knockout channel around the S. The width matches the original channels: the R-leg/S-tail slit is 8.8–9.4 units and the S-terminal/F channel is 9.1–9.8. The method is the same as v1: grow the S outward by 9 units with round joins, keep only the part below y = 300 so the original F notch stays untouched, and subtract it from the F. The F is still one closed contour.

**Paint order and overlaps.** Paths are written r, f, s so the S paints last. The pairwise intersection area of the paths is still 0.

**R/S.** Unchanged. Arial Black's R doesn't fit the logo's R:
- A bounding-box similarity fit matches the stem and outer top to within about 1 unit.
- But the counter is 20–55 units off, the leg 35–75 units off, and the glyph's bowl misses both R/S notches by about 20 units.
- With non-uniform scale the residuals drop to RMS 12, but only by stretching the R about 29% vertically.

So the glyph doesn't give a bowl edge that matches the logo, and I kept the existing R/S cut.

**Silhouette.** This variant deliberately changes the silhouette. The S bowl now shows inside the F stem, outlined by the channel.
