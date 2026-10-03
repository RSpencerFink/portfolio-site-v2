# R. Spencer Fink, Star Chart portfolio: design spec (Round 3, revised in Round 5)

Source of truth for engineering. Frames referenced by their Paper names on page "Round 3 — Refined" (`R3 · <id> · <name>`), file "Portfolio Refresh — RSF". Copy is verbatim from `/tmp/rsf-content.md` (the later "EXPERIENCE UPDATE", "FINAL DATES", "Company icons" and "Brava description" sections win over earlier ones).

Implementation target: Next.js App Router, statically generated pages on Vercel. Sky in React Three Fiber. Scroll with Lenis + GSAP ScrollTrigger. Discrete state changes with React `<ViewTransition>` inside `startTransition`. Every entity has a URL. Clicking a star and loading the URL directly both open the same centred, camera-led panel over the dimmed sky (§6 `StarPanel`); only visitors without JS and crawlers get the full page (the same column on a calm sky). Round 5 changes are listed in §12a; where an older line below conflicts with §12a, §12a wins.

---

## 1. Purpose and flow map

The site is one continuous night sky. The visitor enters through the RSF mark, flies through the S, travels star to star through the Constellation of Work (one gesture, one stop), stops at the featured build (Section-8-Scout), and pulls back to the full chart. The chart is home base. Everything else is a star that opens.

| # | Frame | Route | What the visitor sees | Trigger to next |
|---|-------|-------|-----------------------|-----------------|
| 1 | R3 · H1 · Sky through the mark | `/` (scroll 0) | Night sky visible only through the RSF letterforms. Centred menu "Work · Projects · Visual Arts · About". "Scroll to enter ↓" bottom right. | Scroll (MO-2) or menu click |
| 2 | R3 · H2 · Flying in through the S | `/` (scroll 60–220 vh) | Mask scales to 6.4×; the S counters become soft black corners, then dissolve. Chart HUD fades in. | Scroll continues; pin releases |
| 3 | R3 · W1 · Work scroll — Arriving at Brava | `/#work` (W pin, star 1 of 5) | Brava star with reticle, insignia, "Now", title, role line, description. Rail on the right. | Scroll 100 vh per star |
| 4 | R3 · W2 · Work scroll — At Meta | W pin, star 3 of 5 | Dense two-column content (Rights Manager / Horizon Creator Economy) on a scrim. | Scroll |
| 5 | R3 · W3 · Work scroll — Constellation complete | W pin, star 5 of 5 | All five stars joined, "Constellation of Work", Download Résumé. Origins (Emerson College, App Academy) dim, bottom left. | Scroll → pull 1 (MO-4) |
| 6 | R4 · P · Featured — Section-8-Scout | `/#projects` (one stop after Work) | Focal star with reticle top-left, "Featured build" kicker, title, "Chrome extension · Live", verbatim description, "Built with", white "Visit live site ↗" pill, framed browser-window preview of the live site. | Gesture → pull 2 (MO-4) |
| 8 | R3 · H3 · The sky chart (home) | `/` (after journey) | Full chart: five R4 constellation figures (§5) around the RSF pole mark, RA/Dec ticks, zoom, "Drag to explore · Click a star". | Click any star |
| 9 | R5 · Job panel (Meta) | `/work/meta` | The camera centres Meta's star in the upper middle; the sky dims and drops labels and lines; the content reads in a centred 680 px column below. Close ✕, "← Back to sky", Esc; ← → in a quiet footer row. | Close / Esc / step |
| 10 | R5 · Project panel (Section-8-Scout) | `/projects/section-8-scout` | The featured stop's content in the centred column, with a larger preview. | Close |
| 11 | R3 · AB · About panel (The Observer) | `/about` | Centred panel: headshot, name, "Software Engineer · Visual Artist", verbatim bio, Currently — CTO & Co-founder, Brava; Education (Georgia Tech in progress, App Academy, Emerson); Reach: LinkedIn, Github, Instagram, Download Résumé. | Close |
| 12 | R2 · B1 window, then R3 · A3 · The Painter (Analog) | `/visual-arts/analog` | Opens on the RSF letterforms as a window: Dr. Manhattan, Marilyn Monroe and Walter White through the R, S and F. A scroll or a 1.5 s dwell flies through the S into the constellation: paintings as stars; selected painting has corner-bracket reticle and white label; others at 50%. Analog/Digital toggle (also on the window). | Scroll / dwell / toggle (MO-6) / click painting |
| 13 | R2 · B1 window, then R3 · A4 · The Filmmaker (Digital) | `/visual-arts/digital` | The same window with three film stills, then film stills with timecode chips; hover shows description + Play on Vimeo. No index list. | Click still (MO-7) |
| 14 | R5 · Film selected (Nightshade) | `/visual-arts/digital/nightshade` | Centred cinema panel, media first: 16:9 player sized to the viewport, then title, roles, description, credits, then Up next. | ⤢ → theater |
| 15 | R3 · A6 · Theater mode (Spare Key) | `/visual-arts/digital/spare-key?theater=1` | 1000×563 player inset in the sky (never edge to edge), credits drawer beside it, scrub + title below. | Esc |
| 16 | R3 · RM · Reduced motion — Static sky + Work list | `/` with `prefers-reduced-motion` | Static sky, mark, "Constellation of Work" title, plain job list with insignia, Sky index. | Normal scrolling |

Mobile (390 × 844): `R3 · M-H1 · Hero`, `R3 · M-W2 · Work scroll — At Meta`, `R3 · M-H3 · Sky chart`, `R3 · M-A5 · Film selected`. Panels on mobile are the same centred view, full screen (the R3 bottom sheet is retired).

Motion storyboards: `R3 · MO-1` … `R3 · MO-10` (section 9).

---

## 2. Information architecture and URLs

```
/                                   sky (H1 → H2 → W → P → H3 on scroll; H3 on return)
/#work  /#projects                  scroll anchors into the pinned sequences
/work/brava                         Brava — CTO & Co-founder — 2026 — Present
/work/hypha                         Hypha — Engineering Manager, previously Member of the Technical Staff — 2025 — 2026
/work/meta                          Meta — Software Engineer — 2020 — 2025
/work/dbox                          DBOX — Full Stack Web Developer — 2018 — 2020
/work/prizm-imagery                 Prizm Imagery — Owner / Operator — 2016 — 2018
/projects/section-8-scout           the one featured build (Live Site)
/projects/freecast, /projects/react-dynamic-image, /projects/concord,
/projects/react-2048, /projects/brickbreaker
                                    retired: 308 → /projects/section-8-scout
/visual-arts                        308 → /visual-arts/analog
/visual-arts/analog                 The Painter (17)
/visual-arts/analog/<key>           lewis-hamilton, aaron-judge, andy-warhol, barack-obama, chance-the-rapper,
                                    dr-manhattan, rorschach, ozymandias, han-solo, james-bond, jon-snow,
                                    luke-skywalker, marilyn-monroe, princess-leia, rick-grimes, tinkerbell, walter-white
/visual-arts/digital                The Filmmaker (12)
/visual-arts/digital/<key>          montauk, spare-key, zero-suds-commercial, zero-suds-info, row-home, timeflies-epk,
                                    bayonet, nightshade, likuid, timeflies-live, tritonal, graffiti6
/visual-arts/digital/<key>?theater=1
/about                              The Observer
/resume.pdf                         Download Résumé (static asset)
```

Routing. Plain static routes, no intercepting routes (see ARCHITECTURE.md, "Panels without intercepting routes"): with JS every entity route renders as the centred panel, whether reached from a star or loaded directly; the server HTML is the full page for no-JS visitors and crawlers. Origins (Georgia Institute of Technology 2026 — Present, in progress; App Academy 2018; Emerson College 2009 — 2013) are labelled stars without routes; they open nothing.

Contact is LinkedIn, Github, Instagram and Download Résumé. No email. No form.

---

## 3. Design tokens

### Colour

| Token | Value | Use |
|-------|-------|-----|
| `--sky-ground` | `#04050A` | Page background, letterbox |
| `--sky-nebula` | `#2A2F6B` at 45%, blur 180 px, one ellipse | The single blue-violet nebula |
| `--sky-nebula-core` | `#2E3384` → `#1E2260` → `#0B0D24` | Radial gradient inside the mask (H1) |
| `--panel` | `#0A0C14` at 88% | Panels, sheets, drawers |
| `--line` | `#EDEFF5` at 10% | Hairlines, dividers |
| `--line-strong` | `#EDEFF5` at 18–20% | Pill borders, insignia hairline |
| `--grid` | `#EDEFF5` at 7% | Celestial grid |
| `--constellation-line` | `#EDEFF5` at 35% | Lines between stars |
| `--text-hi` | `#FFFFFF` | Active/selected labels, titles in W |
| `--text` | `#EDEFF5` | Default text |
| `--text-2` | `#C9CDD8` | Role lines, descriptions on the sky |
| `--text-3` | `#A3A9BA` | Panel body |
| `--text-dim` | `#8C93A8` | Dim labels, sub-lines, breadcrumbs |
| `--text-mute` | `#5A6075` | Non-essential ornament only (counters, class/RA flourish) |

Spectral halos (core is always `#FFFFFF`): B `#9BB0FF` / `#AABFFF`, A `#CAD7FF`, F `#F8F7FF`, G `#FFF4EA`, K `#FFD2A1`, M `#FFB56C`.

No accent hue anywhere. Active / current / selected = brightest star + thin white reticle + white label.

Contrast, measured against WCAG: `#8C93A8` is 6.65:1 on ground, 4.72:1 on nebula mid-tone `#1E2260`, 3.56:1 on nebula core `#2E3384`. Rule: text at 11 px or smaller in `#8C93A8` must not sit on the nebula core; where content lands there (W2, P2, mobile W2) use the legibility scrim `linear-gradient(90deg, #04050A 0%, #04050AB8 60%, transparent)` (desktop) or vertical (mobile). `#5A6075` (3.26:1 on ground) is reserved for ornament that carries no information. `#6B7186` is retired. Inside the mask gradient (H1 and H2, where the ground is the nebula core) sub-lines use `--text-3` (`#A3A9BA`, 4.65:1), not `--text-dim`.

### Type

Inter Tight (display, body) and JetBrains Mono (labels). No italics anywhere.

| Style | Family / weight | Size / line | Tracking | Use |
|-------|-----------------|-------------|----------|-----|
| display-xl | Inter Tight 300 | 96 / 96 | −0.03em | W star title (Brava, Meta); long names drop to 72 / 76 (Section-8-Scout) |
| display-l | Inter Tight 300 | 64 / 64 | −0.03em | W3 "Constellation of Work", mobile star title |
| display-m | Inter Tight 300 | 56 / 56 | −0.03em | Panel titles (A2, PP) |
| display-s | Inter Tight 300 | 44–46 / 46 | −0.03em | A3/A4 section titles, About name, film title |
| heading | Inter Tight 300 | 24 / 28 | −0.03em | Panel sections ("Rights Manager", "Built with") |
| constellation | Inter Tight 300 | 26 / 28 | −0.03em | Constellation names on H3 (22 / 26 dim variant in W3) |
| body-l | Inter Tight 400 | 17 / 26 | 0 | Descriptions on the sky, bio |
| body | Inter Tight 400 | 13 / 19 | 0 | Panel body |
| body-strong | Inter Tight 600 | 14 / 20 | 0 | Item titles in panels |
| label | JetBrains Mono 400 uppercase | 11 / 14 | 0.12em | Star labels, HUD, buttons |
| label-s | JetBrains Mono 400 uppercase | 10 / 12 | 0.12em | Sub-lines (dates, media, size), rail ticks |
| mono-body | JetBrains Mono 400 | 11–12 / 16 | 0.04–0.06em | Catalogue, tech lists, chips |

Mobile sizes: label 10 / 12, label-s 9 / 12, display-l 64, display-s 44, body 14 / 20.

### Spacing

4 px base. Scale: 4, 8, 12, 16, 22, 28, 32, 48, 64, 96. Page margin 32 px desktop (HUD at 32 / 28), 24 px mobile. Panel padding 32 px, panel header/footer 20 / 18 px vertical. Keyframe gap in storyboards 24 px.

### Radii

Insignia 22% of size (28 → 6 px, 36 → 8 px, 44 → 10 px, 56 → 12 px, 64 → 14 px). Panel 6 px. Pills 999 px. Chips 6 px. Sheet 18 px top corners. Keyframe cards 4 px.

### Opacity

Dim star 0.5–0.7, unselected painting/still 0.5, sky behind a panel 0.55 (0.45 behind cinema), label dim 1.0 (colour, not opacity, does the dimming), scrim 0.72–0.85.

### Z-layers

0 ground · 1 nebula · 2 starfield (far, mid, near) · 3 celestial grid · 4 constellation lines · 5 content stars + glows · 6 reticles · 7 labels + insignia · 8 scrims · 9 content / titles · 10 HUD · 20 panels and sheets · 30 theater · 40 cursor ring.

---

## 4. Star rendering

### Background stars

Count 1 200 desktop, 500 mobile, instanced points in R3F. Magnitude `m = random()^0.3` (power law: mostly faint). Core size `1.1 + (1 − m) × 2.6` px (0.8 – 3.4 px, scaled by DPR). Opacity `0.5 + (1 − m) × 0.5`. Stars with `m > 0.75` are tinted pinpricks with no halo. Others: three-layer halo `0 0 1.2c 0.4c white@op · 0 0 3c 1.2c tint@0.75op · 0 0 7c 2.5c tint@0.28op` (c = core size). The brightest (`m < 0.12`) get a 4-point glint: two 1 px gradient lines of length `10 + (0.12 − m) × 160` px. Class weights: B 20, A 20, F 15, G 15, K 22, M 8. Depth layers: far 40% of stars, mid 35%, near 25% (parallax 0.2 / 0.5 / 1.0). Reference generator: `/tmp/rsf-stars/gen.py`.

### Content (labelled) stars

Core 5–7 px white (constellation name star 6 px, current/selected 7–8 px, secondary 5 px). Halo `0 0 6px 2px #FFFFFF, 0 0 16px 6px <tint>@0.8, 0 0 40px 14px <tint>@0.3`. In W/P focal state the star is 14 px with an added 240–300 px radial glow `<tint>@0.3 → 0`.

### Reticle

Thin white ring: 1 px `rgba(255,255,255,0.7)`, radius 34 px around a focal star (W/P), 22 px dashed outer ring at 25%, four 10 px ticks at N/E/S/W. On H3 the current star carries `outline: 1px solid rgba(255,255,255,0.7); outline-offset: 4px`. Paintings and stills use corner brackets (24 px legs, 1 px, 80%) with two centre ticks. The Observer star uses a 28 px dashed ring (45%) instead of a reticle: it marks a place, not a selection.

### Spectral assignment

| Entity | Class | Halo |
|--------|-------|------|
| Brava | A | `#CAD7FF` |
| Hypha | F | `#F8F7FF` |
| Meta | B | `#9BB0FF` |
| DBOX | K | `#FFD2A1` |
| Prizm Imagery | M | `#FFB56C` |
| Section-8-Scout | A, drawn as the lodestar: core 8.5 px (vs 5.5), halo ×1.3, four-point glint | `#CAD7FF` |
| Paintings | alternate K / G in content-file order starting K (Lewis Hamilton K, Aaron Judge G, Andy Warhol K … Walter White K) | |
| Films | alternate B / A in content-file order starting B (Montauk B, Spare Key A, Zero Suds Commercial B … Graffiti6 A) | |
| Emerson College, App Academy | G | `#FFF4EA` |
| Georgia Institute of Technology | B | `#9BB0FF` |
| Helper stars (unlabelled, complete a figure) | F, core 2.6 px, halo ×0.45 | `#F8F7FF` |
| The Observer (About) | G (Sun-class, "you are here". A decision, not in the README) | `#FFF4EA` |

### Insignia

Rounded square, 22% radius, 1 px hairline `rgba(255,255,255,0.14)`, no shadow. 28 px beside H3/W3 labels, 22–24 px for behind/ahead labels in W, 56–64 px for the focal star in W1/W2, 44 px in panels, 36 px in RM rows. Brava mark on `#0E1F18`; Hypha tile as is; Meta on `#FFFFFF`; DBOX as is with `rgba(255,255,255,.18)` hairline; Prizm as is. Projects have no insignia.

---

## 5. H3 constellation layout (normalised 0–1, origin top-left, 1440 × 900 artboard)

Round 4 shapes (Paper "Round 4 — Constellations", the client's picks from the Options sheet). The source of truth is `src/content/sky.ts`; the tables below are a snapshot. Helper stars (h) are unlabelled and dimmer. Label side is in `StarLabels.tsx` (`LEFT`).

Constellation of Work — option C "Arrow": the shaft runs through the past roles and the head lands on Brava. Name at 0.0556, 0.4667.
| Star | x | y |
|------|---|---|
| Prizm Imagery | 0.0764 | 0.4111 |
| DBOX | 0.1497 | 0.3431 |
| Meta (label left) | 0.2180 | 0.2653 |
| Hypha (label left) | 0.2942 | 0.1952 |
| Brava | 0.3875 | 0.0982 |
| h · barb low / high | 0.3497, 0.2031 / 0.3164, 0.1089 | |

Lines: Prizm → DBOX → Meta → Hypha → Brava; Brava → each barb.

Featured Build — option B "Lodestar": Section-8-Scout alone at 0.7569, 0.1889, extra bright with a four-point glint, no lines. Name "Featured Build / Projects" at 0.7181, 0.26.

Origins — option A "Telescope": the Observer at the eyepiece, the schools along the tube (newest nearest the objective), a flared objective end and a two-leg mount. Name at 0.0417, 0.8333.
| Star | x | y |
|------|---|---|
| The Observer ("R. Spencer Fink / You are here · About") | 0.0583 | 0.7111 |
| Emerson College (label left) | 0.1088 | 0.6696 |
| App Academy | 0.1592 | 0.6302 |
| Georgia Institute of Technology (label left) | 0.2096 | 0.5864 |
| h · objective top / low | 0.2539, 0.5180 / 0.2707, 0.5644 | |
| h · leg left / right | 0.1419, 0.7453 / 0.1939, 0.7502 | |

Lines: Observer → Emerson → App Academy → Georgia Tech; Georgia Tech → both objective stars, which join; App Academy → both legs.

The Painter — option C "Brush": a handle through three paintings, a bristle tip ending on Han Solo. Name at 0.6944, 0.5778.
| Star | x | y |
|------|---|---|
| Walter White | 0.6771 | 0.8889 |
| Dr. Manhattan (label left) | 0.7521 | 0.8049 |
| Marilyn Monroe (label left) | 0.8233 | 0.7299 |
| Han Solo | 0.9171 | 0.6296 |
| h · bristle low / high | 0.8693, 0.7392 / 0.8505, 0.6942 | |

Lines: Walter White → Dr. Manhattan → Marilyn Monroe → each bristle → Han Solo.

The Filmmaker — option C "Clapperboard": the slate, its arm hinged open from Nightshade. Name inside the slate at 0.3542, 0.7444.
| Star | x | y |
|------|---|---|
| Nightshade (label left) | 0.3125 | 0.7222 |
| Timeflies EPK | 0.4594 | 0.6328 |
| The Republic of Wolves - Spare Key (label left) | 0.3157 | 0.8474 |
| American Gospel - Bayonet | 0.5071 | 0.8423 |
| Montauk | 0.5055 | 0.7188 |

Lines: Nightshade → Montauk → Bayonet → Spare Key → Nightshade; Nightshade → Timeflies EPK.

Pole star (plain white RSF mark with soft glow — decision: no painting collage on the home sky; the collage treatment is not used): centre 0.5, 0.4778, mark 324 × 156 px. No cartouche and no star catalogue (removed). While the pole mark shows, the header hides its own mark. Zoom + / − and "Drag to explore · Click a star" bottom-right. RA ticks at 12h (left), 00h (right), 18h (top), 06h (bottom); Dec +80°…+20° along the right half of the equator line.

Display order for paintings and films is the content-file order (Lewis Hamilton … Walter White is 17 / 17; Montauk … Graffiti6, Nightshade is 08 / 12). The five paintings and five films shown on H3 are the first-labelled subset; A3/A4 show all.

Label detail by zoom: on H3 Work stars show name + dates only; in a panel-zoomed sky (A2, PP, AB) the current star may show the full role line ("CTO & Co-founder · 2026 — Present") because the camera is closer.

Mobile H3 stacks the same figures (Work top-left, Featured Build top-right, Origins mid-left, pole mark centre, Painter and Filmmaker below) with only constellation names, the Observer and the current star labelled at 1×; full labels appear at ≥ 1.6× zoom. Group boxes are `PORTRAIT_GROUPS` / `PORTRAIT_NAMES` in `chart.ts`.

---

## 6. Component inventory

| Component | Props / states |
|-----------|----------------|
| `Sky` (R3F canvas) | `camera` (position, fov, lookAt), `dim` 0–1, `motionLevel`, `focus` star id. Owns starfield, nebula, grid, constellation lines, content stars, glints, twinkle. |
| `StarMarker` (HTML mirror) | One per content star, absolutely positioned over the canvas star via projected coords. `<a href>` with the entity name; carries `view-transition-name: star-<slug>`; states idle / hover / focus-visible (2 px ring) / selected / dim. |
| `StarLabel` | `name`, `subline`, `side` (left/right), `level` full / dim / hidden, optional `Insignia`. Colour `#EDEFF5` (name) + `#8C93A8` (subline); selected `#FFFFFF` both. |
| `Insignia` | `company`, `size` 22–64. Tile colour rules in section 4. |
| `Reticle` | `variant` ring (W/P, H3), bracket (painting/still), observer (dashed). States draw / hold / undraw. |
| `ProgressRail` | `items[]`, `active`, `progress` 0–1. Desktop: right edge, labels left of a 1 px line, filled dot = active, 1 px dash = inactive. Mobile: dot row + "03 / 05" at the bottom. Keyboard: ↑ ↓ move, Enter opens the active star. |
| `StarPanel` (`PanelFrame`) | `variant` text / media / cinema, `slug`, `prev`, `next`. Camera-led and centred (R5): the star sits in the upper middle (y 20 % desktop, 15 % portrait), the sky dims (0.55, 0.45 for films) and drops labels, lines and other content stars. Bar under the header: "← Back to sky" left, Close ✕ right (44 px circle). Body: kicker, title, content in a 680 px column, starting 30 vh down (28 vh mobile); its top fades out so text never scrolls over the star; a ground scrim behind the column. Media variants (paintings, films) start at 128 px and lead with the work, sized to the viewport, title and caption below. Footer row: ← prev · counter · next →. Mobile: the same, full screen. |
| `CinemaPanel` | The cinema variant: player up to 1000 px wide (and short enough for the viewport), then title, roles, description, credits in the 680 px column, then Up next (six thumbnails). |
| `ArtWindow` | Paper B1: the RSF letterforms as a window over three works (panes 40 / 28 / 32 % for R, S, F; one CSS mask). Captions "R — Dr. Manhattan" etc., the Analog/Digital toggle and "Scroll to enter ↓" below. |
| `FeaturedBuild` (`ProjectFacts`, `ProjectPreview`) | Kind line, verbatim description, "Built with", white "Visit live site ↗" pill; the live site in a browser window (three grey dots, hostname), caption "Live site · Captured Oct 2026". |
| `FilmPlayer` | Poster (still) until first play; Vimeo iframe lazy; custom scrub (1 px line, white progress), time, mute, Watch on Vimeo, ⤢ theater. |
| `CreditsDrawer` | 336 × 563, header "● Credits", description, credit pairs (mono label + Inter name), footer "Watch on Vimeo ↗ · 02 / 12". |
| `Toggle` (Analog / Digital) | `role="tablist"`, pill with sliding white thumb; the thumb carries `view-transition-name: va-toggle`. |
| `HUD` | Top: the RSF mark (left; hidden while another RSF mark is on screen) and Work · Projects · Visual Arts · About (right). At H3 the footer links (LinkedIn · Github · Instagram · Download Résumé) join it. Bottom: hint (left), counter or state (right). H1 uses the centred menu instead. The footer has no mark and no Visual Arts link, and sits at the bottom of the viewport on short pages. |
| `ScrollHint` | "Scroll to enter ↓" / "Scroll to travel ↓" / "Continue to the sky ↓"; pulses every 4 s. |
| `Scrim` | Horizontal (desktop content columns) or vertical (mobile) ground gradient; always behind text that would land on the nebula core. |
| `CursorRing` | 10 px ring, magnetises 6 px within 24 px of a star; hidden on touch and in reduced motion. |
| `MotionToggle` | Footer control to force reduced motion; persisted in localStorage; mirrors `prefers-reduced-motion`. |

---

## 7. Motion & interaction

### Principles

1. Physical. One camera, one sky. Nothing cuts. Sections hand the camera to each other: dolly in, travel sideways, dolly out.
2. Calm. The only overshoot in the system is the 200 ms star-core pop on arrival. Everything else eases out or in-out.
3. Camera, not UI. Text never flies across the screen. Content fades or rises 24 px at most. The sky does the travelling.
4. Interruptible. Every scrubbed timeline reads one progress value, and every discrete transition reverses from wherever it is.
5. Noticed only when it stops. Ambient motion is small and slow.

### Motion tokens

```
--dur-xs: 160ms     hover colour, halo, cursor magnet
--dur-s:  200ms     crossfades, reticle undraw, label LOD
--dur-m:  320ms     reticle draw, sheet snap, content rise
--dur-l:  480ms     panel open, theater, camera nudge
--dur-xl: 520ms     shared-element morphs (still → player, toggle)
--dur-intro: 2600ms

--ease-out:    cubic-bezier(0.2, 0.8, 0.2, 1)      (UI enter, panels, snaps)
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)      (camera, power2.inOut)
--ease-out-3:  cubic-bezier(0.22, 1, 0.36, 1)      (reticle draw, power3.out)
--ease-sine:   cubic-bezier(0.37, 0, 0.63, 1)      (sky reveal, breathing)
--ease-pop:    cubic-bezier(0.34, 1.2, 0.64, 1)    (star core on arrival only)

--stagger-content: 40ms    --stagger-panel: 30ms   --stagger-chrome: 60ms   --stagger-stars: 12ms
--rise: 16px   --exit: -24px   --panel-slide: 32px   --panel-exit: 24px   --drawer-slide: 24px
```

Lenis config: `{ lerp: 0.09, wheelMultiplier: 1, touchMultiplier: 1.4, smoothWheel: true, syncTouch: false }`; `lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.add(t => lenis.raf(t * 1000))`; `gsap.ticker.lagSmoothing(0)`. Disabled under reduced motion.

### Per-transition specs

| Id | Transition | Trigger | From → to | Duration / range | Easing | Library | Interruptible | Storyboard |
|----|------------|---------|-----------|------------------|--------|---------|---------------|------------|
| T1 | Intro draw | first paint (once per session) | one continuous timeline: R 0–750, S 300–1100, F 600–1350 ms stroke draw (stroke 0.9); fill 0 → 0.85 (850–1300); fill → 0, stroke → 0.35 and sky 0 → 1 cross-fade (1150–1900) | 1900 ms | sine.inOut | GSAP timeline | scroll / key / tap ramps timeScale to 2.5 over 300 ms: the same timeline, faster, never a jump | MO-1 |
| T2 | H1 → H2 mask fly-through | ScrollTrigger pin `#hero`, `start: top top`, `end: +=220vh`, `scrub: 0.6`, `snap: {snapTo:[0,1], duration:0.6}` | mask scale 1 → 2.2 (0–60 vh) → 6.4 (60–140 vh); mask opacity 1 → 0 (187–220 vh); camera z 0 → −18; menu opacity 1 → 0 (0–60 vh); chart HUD 0 → 1 (120–160 vh) | 0–220 vh | linear scrub, power2.inOut on mask | GSAP + R3F uniform | yes (scrub) | MO-2 |
| T3 | W star-to-star | pin `#work`, `end: +=500vh`, `scrub: 0.3`; one gesture = one stop (T21) instead of a snap | per 100 vh: content exit (0–20%), camera along CatmullRom (20–70%), arrive + reticle draw (70–90%), content enter (90–100%) | 100 vh per star | power2.inOut (camera), power3.out (reticle) | GSAP ScrollTrigger + R3F | yes | MO-3 |
| T4 | Featured build stop | pin `#projects`, `end: +=100vh`, one dwell at its middle | text fades in/out as in T3; camera holds on the lodestar | 100 vh | | | | MO-3 |
| T5 | W3 → P1 pull 1 | ScrollTrigger between pins, `scrub: 1` | camera pan right, fov 38 → 46; Work labels full → dim; title crossfade | 120 vh | power2.inOut | GSAP + R3F | yes | MO-4 |
| T6 | Featured → H3 pull 2 | scroll (no scrub timeline) | fov 46 → 62, lookAt → pole star; labels and pole mark fade in at the overview | 200 vh | power2.inOut | R3F | yes | MO-4 |
| T7 | Star → panel | click / Enter on StarMarker | sky dim 1 → 0.55; camera flies to the star and centres it in the upper middle (damped, ~500 ms); labels, lines and other content stars fade; panel column rises 12 px and fades in (120–480 ms). No shared-element morph. | 480 ms | ease-out | `<ViewTransition name="star-panel">` + startTransition(router.push) | yes | MO-5 |
| T8 | Panel close | Close ✕ / Back to sky / Esc / click on the sky | column fades and sinks 12 px (240 ms); sky 0.55 → 1; camera flies back | 240 ms + camera | ease-out | WAAPI | yes | MO-5 |
| T9 | Panel step ← → | keys / footer | the column cross-fades (`star-panel`); the camera flies to the sibling and centres it | 480 ms | ease-out / in-out | ViewTransition `star-panel` | yes | MO-5 |
| T10 | Analog ↔ Digital | toggle / arrow keys | thumb translate (180 ms); out: scale 1 → .96, opacity → 0, lines undraw (0–200); in: scale .96 → 1, opacity → 1, stagger 24, timecodes type (200–520); title crossfade `va-title` | 520 ms | ease-out | `<ViewTransition name="va-toggle">` + per-card names | yes | MO-6 |
| T11 | Still → cinema panel | click still | shared `film-still-<slug>` card → 840×473 player (0–520); chrome fade in from 200; sky dim → 0.45 | 520 ms | ease-out | ViewTransition | yes | MO-7 |
| T12 | Cinema → theater | ⤢ or `T` | chrome out (0–200); player → 1000×563 inset (0–480); drawer x +24 → 0 (160–480); twinkle amplitude × 0.3 | 480 ms | ease-out | ViewTransition `film-still-<slug>` + GSAP | Esc reverses | MO-7 |
| T13 | Hover star | pointer within 24 px / focus | halo 1 → 1.4, label → white (160); reticle draw (320); magnet 6 px | 160 / 320 ms | ease-out / power3.out | CSS + GSAP | leave undraws in 200 | MO-8 |
| T14 | Reticle draw | arrive / hover / select | stroke-dashoffset full → 0 clockwise | 320 ms | power3.out | GSAP | yes | MO-3, MO-8 |
| T15 | Label LOD | camera distance thresholds | full ↔ dim ↔ hidden: opacity crossfade only | 200 ms | sine | CSS | yes | MO-4 |
| T17 | Mobile star travel | one touch swipe = one stop (T21), no CSS scroll-snap | camera from the active slide; content enter 240 ms | 100 svh per star | in-out | ScrollTrigger (no pin) | yes | MO-9 |
| T18 | Sky pinch/drag (H3) | gestures / wheel / drag | zoom 1–2.5×, inertia decay 0.94, rubber band 40 px; double-tap constellation → zoom to it | 480 ms (programmatic) | in-out | @use-gesture + R3F | yes | MO-9 |
| T19 | Header link (any page or panel) | click Work / Projects / Visual Arts / About | one move: an open panel is dismissed instantly (no exit animation); the page jumps to the stop (Work → Brava, Projects → the featured build) and the camera flies there; About opens its panel; Visual Arts opens `/visual-arts/analog` | camera damping | in-out | — | yes | MO-2 |
| T20 | Direct load of a panel route | navigation | the same centred panel as T7: camera flies to the star, sky dims; the column fades and rises 12 px | 420 ms | ease-out | CSS | n/a | MO-5 |
| T21 | One gesture = one stop | wheel flick, trackpad swipe, touch swipe, ↑ ↓ PageUp PageDown Space, inside Work + the featured build | exactly one stop, then hold: further input is swallowed until the flight lands; a trackpad's inertia counts as the same gesture (new gesture after a 180 ms gap, or a 2.5× rise once landed). At the first/last stop the next gesture scrolls on natively (hero above, chart below). Free scroll is caught at the first stop it would cross. | 800 ms | in-out | Lenis `scrollTo` + `stepper.ts` | input held | MO-3 |
| T22 | Visual Arts fly-through | scroll down, ↓ / Space / Enter, swipe, or a 1.5 s dwell on the window | the windowed mark scales ×7 toward the S and fades into the constellation | 1000 ms | in-out | WAAPI | n/a | B1 |

ViewTransition names in use: `star-panel`, `va-toggle`, `va-title`, `va-works`, `film-still-<slug>`. ViewTransition classes: `vt-panel` (slide + fade), `vt-fade` (opacity only, used for everything in reduced motion).

### Ambient animation parameters

| Parameter | Desktop | Mobile / low power | Reduced motion |
|-----------|---------|--------------------|----------------|
| Twinkle (halo opacity, two summed sines, per-star phase) | B/A ±8% @ 2.5–4 s; F/G ±6% @ 3–5 s; K/M ±10% @ 4–6 s; top 30% of stars; content stars ±4% | ±4%, top 15% of stars | 0 |
| Glint rotation | 0.5°/s | 0 | 0 |
| Parallax (far / mid / near) | 0.2 / 0.5 / 1.0 × pointer, max ±8 px near, lerp 0.06 | device tilt ±4 px (opt-in) or none | 0 |
| Idle drift | Lissajous 0.4 px/s, 90 s period | 0.2 px/s | 0 |
| Nebula | scale 1 → 1.03 + opacity ±6% @ 14 s; centre drift 12 px @ 40 s; 0.35× camera parallax | opacity only @ 20 s | static |
| Scroll hint pulse | every 4 s, opacity 1 → 0.6 → 1 | same | none |
| Motion streaks during travel | opacity ≤ 0.35 at speed > 0.4 | off | off |

### Performance budget

- 60 fps target; ambient work ≤ 2 ms/frame; the frame loop runs `always` on desktop, caps at 30 fps when `navigator.getBattery().charging === false && level < 0.2` or when measured fps < 45 for 2 s (then also halve twinkle count).
- DPR cap 2 (1.5 on mobile when fps < 45). No post-processing. Nebula is one blurred sprite, not a shader pass.
- Star counts: 1 200 desktop ≥ 1024 px, 800 tablet, 500 mobile, 500 reduced motion (static).
- Pause everything (`frameloop="never"`) when `document.hidden` or when the canvas is fully offscreen (IntersectionObserver, 0 threshold). Resume on visibility.
- Vimeo iframe mounts on first play only. Paintings and stills: `next/image`, 800 px masters, blur placeholder from the dominant colour.
- GSAP: one ScrollTrigger per section (4 total), `ScrollTrigger.config({ ignoreMobileResize: true })`; all tweens target uniforms or transforms/opacity only.

### Reduced motion and low power

`useMotionLevel()` returns `"full" | "reduced"` from `matchMedia('(prefers-reduced-motion: reduce)')` OR the footer toggle. All GSAP/ScrollTrigger construction lives inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`. Reduced:

- No intro draw (T1): mark + sky fade in 300 ms.
- No stepping (T21): native scroll through the static layout. Visual Arts shows the window statically above the constellation (no T22).
- No pin, no mask scale (T2): H1 is a 100 vh section; the next section is the static sky with the Work list (R3 · RM); the mask crossfades away in 200 ms at the boundary.
- No camera travel (T3–T6): camera fixed; jobs/projects are plain lists; the related star brightens as its row enters the viewport.
- Panels, toggle, cinema, theater: 200 ms opacity crossfades in place (`vt-fade`); no slides, no shared-element flight, no stagger.
- Ambient: all off; `frameloop="demand"`; hover still colours the label and shows the reticle without drawing it; system cursor.
- Mobile sheet still follows the finger but snaps instantly; no inertia on pinch/drag.
- Low power (not reduced motion): mobile column of the table above.

---

## 8. Responsive rules

Breakpoints: `sm` < 640 (mobile), `md` 640–1023 (tablet, uses mobile layouts with 48 px margins and 800 stars), `lg` 1024–1439, `xl` ≥ 1440 (design size). The sky scales to the viewport; constellation positions are normalised (section 5) and clamped so labels keep ≥ 24 px from edges; at `lg` the Featured Build and Painter shift inward by 4% to avoid the HUD.

Mobile specifics (R3 · M-*). HUD at 24 / 64 under the status bar; the hero mask is 348 × 167 at y 340 with the name + "Software Engineer · Visual Artist" beneath (desktop has no name on H1; mobile needs it because the mark is small). Work and the featured build are 100 svh slides with a dot rail; one swipe moves one slide (T21). Panels are the same centred view, full screen; theater uses the native fullscreen API in landscape. Minimum tap target 44 px.

---

## 9. Accessibility

- The canvas is `aria-hidden`. Every content star has an HTML `StarMarker` (`<a>`), positioned over it, with the full label as text and `aria-describedby` to its sub-line; constellations are `<nav aria-label="Constellation of Work">` lists. Tab order: HUD → constellations in reading order (Work, Featured Build, Observer/Origins, Painter, Filmmaker) → controls. Arrow keys inside a constellation move between its stars; Enter opens; Esc closes.
- Focus ring: 2 px `#FFFFFF` at 2 px offset on labels, pills, toggle tabs and rail ticks; never removed.
- Panels are `role="dialog"` (non-modal since Round 5 so the header stays usable; nothing else on the page is interactive behind them), `aria-labelledby` the title, returning focus to the StarMarker on close. ← → are announced via the footer buttons (they are real buttons).
- Reduced motion as section 7. Also honour `prefers-contrast: more` by raising `--text-dim` to `#B7BDCB` and scrims to 90%.
- All text on the sky passes AA (section 3). Mono labels never below 10 px (9 px only on mobile sub-lines, uppercase, over scrims).
- Video: captions where the Vimeo source has them; no autoplay; the custom scrub is a `<input type="range">` under the hood.
- The RM layout is also the no-JS render: the HTML mirror is the page.

---

## 10. SEO / AEO

- Semantic mirror: every route renders real HTML (`<main>`, `<article>`, `<h1>`), not only the canvas. The full pages (direct loads) are what crawlers see; the intercepting routes reuse them.
- JSON-LD per page: `/` Person (name, jobTitle "CTO & Co-founder", sameAs LinkedIn/Github/Instagram, worksFor Organization Brava) + WebSite; `/work/<slug>` Organization + the Person's `hasOccupation`/role with `startDate`/`endDate`; `/projects/section-8-scout` SoftwareApplication (BrowserApplication, Chrome, url, image); Person `affiliation` for an education in progress (Georgia Tech), `alumniOf` only for completed schools; `/visual-arts/analog/<key>` VisualArtwork (artMedium "Acrylic on Canvas", width/height in inches, image); `/visual-arts/digital/<key>` VideoObject (name, description, embedUrl Vimeo, thumbnailUrl, creator); `/about` Person + ProfilePage.
- Metadata: unique title/description per route; OG image per painting/film (still) and a generated sky OG for the rest; canonical URLs; `robots` allow all.
- `sitemap.xml` from the data module (entity routes + 4 index routes: `/`, `/about`, `/visual-arts/analog`, `/visual-arts/digital`); `llms.txt` at root summarising the person, roles with dates, projects with links, and the two visual-arts lists in plain text; `humans.txt` optional.
- Headings: H1 is the entity name; the constellation names are H2 on `/`.
- Résumé served at `/resume.pdf` with a `<link rel="alternate">` from `/about`.

---

## 11. Assets

| Asset | Path | Note |
|-------|------|------|
| RSF logo | `public/logo/rsf.svg` (white; paths `#r`, `#f`, `#s`, S paints last) and `public/logo/rsf-mark.svg` (one merged path, for masks and icons). Source: `docs/redesign/assets/logo/rsf-letters-sf-overlap*.svg`, aspect 2.082:1 | Client-approved rebuild with the S overlapping the F. Favicons and the apple-touch icon are rendered from it. |
| Company icons | `docs/redesign/assets/company-icons/` (brava-mark.png, hypha-apple.png, meta.svg, dbox-512.png, prizm.png) | Prizm is a 52 px LinkedIn crop; request a vector or 256 px source. |
| Headshot | `src/assets/images/photos/about/rsf-headshot-2_800.jpg` | |
| Paintings (17) | `src/assets/images/photos/analog/<key>_800.jpg` | Captions verbatim from the content file. |
| Film stills (11) | `docs/redesign/assets/film-stills/<key>.jpg` | Montauk has none: typographic card. |
| Résumé PDF | `src/assets/documents/RSF Resume - 2024.pdf` | Out of date (2024). Needs a 2026 version with Brava and Hypha before launch. |
| Starfield generator | `docs/redesign/assets/starfield-gen.py` | Reference for magnitude, halo and glint math; production uses the same distribution in a shader. |
| Fonts | Inter Tight (300, 400, 600), JetBrains Mono (400) | Self-host, `font-display: swap`, subset Latin. |

---

## 12. Changes from the Round 2 baseline

1. H1: viewfinder/crosshair removed (locked).
2. H2 rebuilt: flat SVG star circles and streak layer deleted; mask zoomed to 6.4× so the S reads as soft corners; HUD unified with the W frames.
3. W1: Brava description added (verbatim); star title size unified at 96 px.
4. W3: Origins name moved out of the Emerson/Prizm lane; sub-label grey raised from `#6B7186` to `#8C93A8`.
5. H3: Builder's Cluster moved +20/+30 px and Brava sub-line shortened to "2026 — Present" to end the label collision; legend removed (catalogue only); The Observer star added near Origins with a dashed sightline from Emerson College.
6. A3: Observer card removed (About is a star now); selected-painting state added (corner brackets, white label, "Selected · 02 / 17 · Enter to open", others at 50%).
7. New frames: P1, P2, PP, AB, RM, five mobile frames, ten motion storyboards.
8. Panels: header dot is the shared element with the star; footers carry prev/counter/next consistently.
9. Contrast measured and a scrim rule written down.
10. All dates in the "2026 — Present" form with spaced em dashes.

---

## 12a. Round 5 changes (client live testing)

1. Panels are centred and camera-led everywhere (jobs, projects, About, paintings, films; from the sky and on direct loads): the star centred in the upper middle, a centred reading column below, no labels or lines behind it. The right-side panel, the mobile bottom sheet and the star → dot morph are retired.
2. Every panel has Close ✕ (44 px), "← Back to sky" and Esc; ← → in a quiet footer row.
3. Projects are Section-8-Scout only. One featured stop after Work (Paper R4 · P · Featured); retired project URLs 308 to it.
4. One gesture = one stop through Work and the featured build (T21).
5. Intro: one continuous eased timeline, fast-forwarded (never jumped) by input; the scroll-in flash is fixed (no-JS stand-ins no longer swap out mid-intro, no per-frame CSS mask on the H1 labels, no footer fade-out on journey start).
6. `/visual-arts` 308 → `/visual-arts/analog`; the Filmmaker's index list is gone; Visual Arts opens through the windowed RSF mark (Paper B1, T22).
7. Footer: no mark, no Visual Arts link, pinned to the viewport bottom on short pages. One RSF mark on screen at a time.
8. Header navigation is one move (T19).
9. Round 4 constellation shapes (§5) with helper stars; the chart is plain data in `src/content/sky.ts`.
10. Education adds Georgia Institute of Technology, MS Computer Science, Jan 2026 – Present, shown as in progress.
11. Removed: cartouche, star catalogue, the hero name block.

## 13. Decisions and open questions

Resolved (2026-10-03):
1. Brava: display "2026 — Present" (started Sep 2026); panels may show months from the LinkedIn dates in `assets/content-reference.md` (FINAL DATES).
2. Logo: approved. The rebuild with the S overlapping the F (`rsf-letters-sf-overlap.svg`) ships as `public/logo/rsf.svg`.
3. "Visual Arts Portfolio" link star: removed. The footer link went in Round 5 (the header's Visual Arts covers it).
4. H3 pole star: plain white RSF mark (no painting collage).
5. Project links and Vimeo IDs: in the repo's `src/data/development.js` and `src/data/digital.js`.
6. Verbatim copy source: `assets/content-reference.md` (later sections supersede earlier ones).

Still open:
1. Résumé PDF: the client supplies a 2026 version; until then "Download Résumé" links the existing file (flag in the PR).
2. Prizm Imagery icon: 52 px LinkedIn crop; replace if a better source turns up.
3. Origins stars (Emerson College, App Academy): unclickable as designed unless the client asks.
4. Analytics: none for now.
