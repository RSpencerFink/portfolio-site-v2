# Architecture and track seams

Next.js App Router, hosted on Vercel. Every page is statically generated at build time (`generateStaticParams`, `dynamicParams = false`, no runtime data), so Vercel serves it as static HTML. URLs have no trailing slash (Next's default); canonicals, the sitemap, `/llms.txt` and internal links all follow that form. Images go through `next/image`. The spec (`design-spec.md`) is the source of truth for look and motion. This file says who owns which files.

## Panels without intercepting routes

This build replaces the `app/@panel/(.)work/[slug]` plan in spec §2 with the steps below. The client chose to keep this pattern after the move to Vercel, where intercepting routes would also work.

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
| Sky | R3F | `src/components/sky/*` | `SkyHost` mounts once as a direct child of `<body>` with `aria-hidden="true"` (theater mode keeps only that element visible), `pointer-events: none`. Types `Star`, `Constellation`, `SpectralClass`, `ChartPoint`, `HALO` in `types.ts`. `cameraRig` (`cameraRig.ts`): `setTarget(starId \| 'overview' \| { position, lookAt })`, `setProgress(0–1)`, `setDim(0–1)`, `setAmbient(0–1)` (twinkle multiplier: 1 normally, 0.3 in theater mode. The panels track added it, and the sky should read it in its frame loop), `getState()`, `subscribe()`. The sky reads this state in its frame loop. It never creates scroll listeners. |
| Journey | Scroll | `src/components/journey/*` | `Journey` owns Lenis and GSAP ScrollTrigger, built only inside `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`. It publishes `journeyProgress` (`get`, `set`, `subscribe`, `useJourneyProgress()`). The home page wraps the pinned sequences in `#journey`, with `#work` and `#projects` anchors inside. `SkyHost` forwards progress to `cameraRig.setProgress`. |
| Panels | Panels | `src/components/panels/*` | `PanelFrame({ slug, title, kicker, lead, subline, prev, next, counter, variant })`, `StepLink`, `SkyLink`, `softNav`, `useArrivedFromSky(pathname)` (read once per mount), `FilmView`, `VisualArtsToggle`, and `transitions.css` (the global view-transition rules). Panel mode is a native modal `<dialog>`. Close, Esc and a backdrop click animate the panel out and go back in history to the page the star was on. The `SkyLink` for the panel's path then takes focus, so the StarMarker must render a `SkyLink`. Prev/next (footer, ← →, "Nearby", "Up next") replace history while in panel mode and push on a full page. The header dot is wrapped in `<ViewTransition name={`star-${slug}`} share="vt-morph" default="none">`. The StarMarker for the same star must use the same name and `share`. Other names: `star-panel` (the dialog), `va-toggle`, `va-title`, `va-works`, `film-still-<slug>`. While a panel is open, `<html data-panel>` hides the site header and footer. In theater mode, `<html data-theater>` hides everything except the sky host and the theater layer. PanelFrame calls `cameraRig.setTarget(slug)` and `setDim(0.55)`, or `0.45` for films, in both modes, and resets both on unmount. Theater calls `cameraRig.setAmbient(0.3)`. |

Shared and owned by the foundation: `src/app/**` routes, `src/content/**`, `src/lib/seo.ts`, `src/components/{SiteChrome,Insignia,JsonLd}.tsx`, `public/logo/*` and the favicons, `src/app/globals.css` (tokens, from spec §3 and §7).

## Hosting

- Old CRA URLs (`/analog`, `/analog/<old_id>`, `/digital`, `/digital/<old_id>`) get permanent (308) redirects to the new slugs. They are defined in `next.config.ts` `redirects()` and built from the `legacyId` fields in `src/content`.
- `/visual-arts` is a small hub page.
- No `vercel.json`. Creating and linking the Vercel project, the first deploy, and DNS wait for the client's approval. The AWS pipeline (`buildspec.yml`, S3, CloudFront) is retired.

## No-JS and reduced motion

The HTML mirror is the page. Every word of content is in the server HTML. Under `prefers-reduced-motion: reduce`, `Journey` builds nothing (native scroll) and CSS transitions collapse. The sky track also has to follow the reduced-motion rules in spec §7.
