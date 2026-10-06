# PIXAR: Scan it. Give it a second life.

A front-end-only prototype of an agentic AI assistant that gives old electronics a second life. Built for a college pitch (IBM SkillsBuild for Academia, Masterclass 5, SDG 12). Everything is simulated and runs offline: no backend, no API keys, no network requests at runtime.

## 🌐 Live Site

**[https://kingoooolooo.github.io/PIXAR/](https://kingoooolooo.github.io/PIXAR/)**

Deployed via GitHub Pages. The build is a single self-contained `index.html` with fonts, artwork, and all assets embedded — no CDN dependencies, works offline.

## 📄 Documents

| Document | Description |
|---|---|
| [`PIXAR_Pitch_Deck.pdf`](./PIXAR_Pitch_Deck.pdf) | 14-slide widescreen presentation — problem, solution, market, revenue, SDG 12 roadmap |
| [`PIXAR_Lean_Canvas.pdf`](./PIXAR_Lean_Canvas.pdf) | 1-page A4 Lean Business Model Canvas (IBM SkillsBuild Masterclass format) |
| [`PIXAR_Application_Walkthrough.pdf`](./PIXAR_Application_Walkthrough.pdf) | 10-page live app screenshot walkthrough with callouts for every screen |

## Quick start

```bash
npm install
npm run dev        # develop
npm run build      # static output in dist/ (base is relative, runs from any static host or a USB stick)
npm run preview    # serve dist/
npx vitest run     # unit tests for the engine and data integrity (tests/)
npx tsc --noEmit   # typecheck
```

## Presenter shortcuts

| Key | Action |
|---|---|
| Left, Right, Page Up, Page Down | Previous or next chapter. Inside the demo use Back and Continue. Value proposition and Unfair advantage use the arrows to step through their beats first |
| 1 to 9, 0 | Jump to chapter 1 to 9, and 10 |
| G | Chapter overview grid |
| N | Presenter notes |
| D | Jump to the live demo |
| A | Autoplay the demo (Space pauses, Esc stops) |
| R | Reset the demo |
| F | Fullscreen (chrome hides after 3 seconds) |
| ? | Shortcut help |
| Esc | Close an overlay or stop autoplay |

Hash routes: `#/hero` (default landing), `#/cover`, `#/problem`, `#/demo/scan`, `#/demo/route`, `#/demo/certificate`, `#/canvas`. Deep links hydrate sample A fast-forwarded to that step.

## Editing

| What | Where |
|---|---|
| Chapter order, names, notes, time budget | `src/content/pitch.ts` (`CHAPTERS`) |
| All deck copy (problems, gap matrix, segments, revenue, costs, roadmap, Lean Canvas) | `src/content/pitch.ts` |
| Demo city, team, college, presenters | `src/content/config.ts` (`DEMO_CONFIG`) |
| Verified figures with year and source | `src/content/stats.ts` |
| Devices and samples | `src/data/devices.ts` |
| Components, weights, values, hotspots | `src/data/components.ts` |
| Partners (all fictional) | `src/data/partners.ts` |
| Student projects | `src/data/projects.ts` |
| Pilot targets and dashboard | `src/data/dashboard.ts` |
| Status rules and Reuse Score | `src/engine/appraise.ts` |
| Route decision table | `src/engine/routes.ts` |
| Partner match score formula | `src/engine/match.ts` |
| Impact placeholders | `src/engine/impact.ts` |
| Agent console log lines | `src/agent/script.ts` |
| Hero landing page (canvas art + particle distortion) | `src/pages/HeroPage.tsx` |
| Hero artwork and companion illustrations | `src/assets/hero-art.jpg`, `src/assets/pixar-*.jpg` |

## Deploy

`npm run build`, then upload `dist/` to Vercel, Netlify or GitHub Pages, or open `dist/index.html` directly. The build is a single self-contained file with fonts embedded.

GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically builds and deploys to GitHub Pages on every push to `main`.

## Simulated today versus real in v1

| Capability | Prototype today | Real v1 |
|---|---|---|
| Scan and identify | Scripted per sample | Vision model on photos, with a human check |
| Reuse appraisal | Rules engine on mock data | Model plus partner price feedback |
| Partner search | Fictional partners, abstract map | Verified partner onboarding, maps API |
| Pickup booking | In-browser form | Partner scheduling and logistics |
| Certificate | Simulated, QR to a placeholder | Verifiable record tied to recycler documentation and India's EPR portal |
| Impact numbers | Illustrative factors | Sourced life-cycle values |

## Known limitations

- Verified figures come only from the UN Global E-waste Monitor 2024 and CPCB. The India figure (16.0 lakh tonnes, FY 2021 to 22) is flagged for re-checking against the latest CPCB publication.
- CO2e, rupee values, partner data and pilot targets are illustrative placeholders.
- Uploaded photos are only mapped to the nearest sample profile. There is no real vision.
- No Playwright end-to-end test is included. The engine and data are unit tested with Vitest.
- Stretch items not built: Hindi labels, camera capture, second-window presenter view, PWA install.
