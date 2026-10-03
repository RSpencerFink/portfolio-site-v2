# Architecture and track seams

Next.js App Router with `output: 'export'`, `trailingSlash: true` and unoptimized images. Every route is static HTML in `out/`. The spec (`design-spec.md`) is the source of truth for look and motion. This file says who owns which files.

## Panels without intercepting routes

Static export does not support intercepting routes or parallel-slot interception, so this build replaces the `app/@panel/(.)work/[slug]` plan in spec §2 with these steps.

1. The root layout (`src/app/layout.tsx`) always renders `<SkyHost/>` and `<Journey/>` behind `{children}`.
2. Every entity is a plain static route built with `generateStaticParams` and `dynamicParams = false`. That covers `/work/[slug]`, `/projects/[slug]`, `/about`, `/visual-arts/analog/[slug]`, `/visual-arts/digital/[slug]`.
3. A star link (`<SkyLink>`) records the target path in a small client store (`softNav`) before the soft navigation.
4. `<PanelFrame>` wraps each entity page. If the current path equals the recorded path, it renders a panel over the sky. Direct loads, reloads, no-JS visits and crawlers get the full page. Server HTML is always the full page.

URLs and SEO are the same in both modes.

## Content

`src/content/*.ts` is the single source of truth: `site.ts` (person, socials, résumé, tech, education), `work.ts`, `projects.ts`, `paintings.ts`, `films.ts`, and `sky.ts` (derived `stars` and `constellations` with spec §5 coordinates). Pages, sitemap, JSON-LD and `/llms.txt` all read from these files. Copy is verbatim from `assets/content-reference.md`. Film credits keep the line breaks from the old `src/data`, which content-reference.md flattened.

## Seams

| Area | Owner track | Files | Contract |
|------|-------------|-------|----------|
| Sky | R3F | `src/components/sky/*` | `SkyHost` mounts once, `aria-hidden`, `pointer-events: none`. Types `Star`, `Constellation`, `SpectralClass`, `ChartPoint`, `HALO` in `types.ts`. `cameraRig` (`cameraRig.ts`): `setTarget(starId \| 'overview' \| { position, lookAt })`, `setProgress(0–1)`, `setDim(0–1)`, `getState()`, `subscribe()`. The sky reads this state in its frame loop. It never creates scroll listeners. |
| Journey | Scroll | `src/components/journey/*` | `Journey` owns Lenis and GSAP ScrollTrigger, built only inside `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`. It publishes `journeyProgress` (`get`, `set`, `subscribe`, `useJourneyProgress()`). The home page wraps the pinned sequences in `#journey`, with `#work` and `#projects` anchors inside. `SkyHost` forwards progress to `cameraRig.setProgress`. |
| Panels | Panels | `src/components/panels/*` | `PanelFrame({ slug, title, kicker })`, `SkyLink`, `softNav` and `useArrivedFromSky(pathname)`. The header dot is wrapped in `<ViewTransition name={`star-${slug}`}>`. The StarMarker for the same star must use the same name. Other names follow spec §7: `panel-body`, `va-toggle`, `va-title`, `film-still-<slug>`. Focus trap, Esc, ←/→ keys, close animation and the Vimeo player belong to this track. `Stepper` (prev/next) uses plain links for now, so stepping from a panel lands on the full page. Replace it with a link that sets `softNav` only when the visitor is already in panel mode. |

Shared and owned by the foundation: `src/app/**` routes, `src/content/**`, `src/lib/seo.ts`, `src/components/{SiteChrome,Insignia,Stepper,JsonLd,LegacyRedirect}.tsx`, `src/app/globals.css` (tokens, from spec §3 and §7).

## Static-export constraints

- Old CRA URLs (`/analog`, `/analog/<old_id>`, `/digital`, `/digital/<old_id>`) are `noindex` stubs with a meta refresh, a canonical link and a visible link to the new URL.
- `/visual-arts` is a small hub page. A server redirect is not available.
- Hosting (CloudFront) has to map `/path/` to `/path/index.html`, and the SPA-era 404→`index.html` rewrite has to be removed. That work belongs to the hardening track.

## No-JS and reduced motion

The HTML mirror is the page. Every word of content is in the server HTML. Under `prefers-reduced-motion: reduce`, `Journey` builds nothing (native scroll) and CSS transitions collapse. The sky track also has to follow the reduced-motion rules in spec §7.
