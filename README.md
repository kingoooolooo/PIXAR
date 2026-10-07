# 🌌 PIXAR

### **Scan it. Give it a second life.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Try_it_Now-blue?style=for-the-badge&logo=github)](https://kingoooolooo.github.io/PIXAR/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

**PIXAR** is a front-end-only prototype of an agentic AI assistant that gives old electronics a second life.

It was built as an interactive college pitch for **IBM SkillsBuild for Academia, Masterclass 5**, and is aligned with **UN SDG 12: Responsible Consumption and Production**.

The entire experience is simulated and runs fully offline:

- No backend
- No API keys
- No runtime network requests
- No external dependencies in the deployed build

---

## 🌐 Live Demo

Try the live prototype directly in your browser:

👉 **[https://kingoooolooo.github.io/PIXAR/](https://kingoooolooo.github.io/PIXAR/)**

The deployed version is generated as a single self-contained `index.html` file with fonts, artwork, JavaScript, and styles embedded. It can be hosted on GitHub Pages, opened locally, or even run from a USB stick.

---

## ✨ Features

### 🤖 Agentic E-Waste Assistant Simulation

PIXAR simulates an intelligent assistant that helps users responsibly reuse or recycle old electronics.

The demo walks through the full lifecycle:

1. Device scanning
2. AI appraisal
3. Reuse score calculation
4. Component harvesting
5. Routing decision
6. Partner matching
7. Pickup scheduling
8. Impact certificate generation

### 📊 Interactive Pitch Deck

The project is not just a UI prototype. It is also a complete interactive pitch deck containing:

- Problem framing
- Market gap analysis
- Target segments
- Value proposition
- Unfair advantage
- Revenue model
- Cost structure
- Roadmap
- Lean Canvas
- Pilot dashboard
- Impact metrics

### 🎨 Art Direction

PIXAR uses a strict visual identity:

- Ink Black: `#07090a`
- Warm Ivory: `#efe6cf`
- Generated linocut-style companion artwork
- Interactive celestial hero canvas
- Cursor particle distortion
- Parallax effects

### ⚡ Offline-First Build

The production build uses `vite-plugin-singlefile` to bundle the app into one portable HTML file.

This makes the prototype easy to present anywhere without internet access.

### ⌨️ Presenter Controls

The app includes keyboard shortcuts and deep-link routes for live presentations.

You can jump between chapters, open the demo, autoplay the flow, reset the simulation, and toggle presenter notes.

---

## 🏗️ Architecture

PIXAR uses a **client-side-only architecture**. All intelligence is simulated locally using deterministic TypeScript engines and static data.

### High-Level Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                         PIXAR Frontend                       │
│                                                              │
│  ┌────────────┐   ┌────────────┐   ┌────────────────────┐   │
│  │ Presentation│   │ Demo Flow  │   │ Agent Simulation   │   │
│  │ Deck       │   │ Experience │   │ Console            │   │
│  └─────┬──────┘   └─────┬──────┘   └─────────┬──────────┘   │
│        │                │                     │              │
│        ▼                ▼                     ▼              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Zustand App State                  │   │
│  └──────────────────────────┬───────────────────────────┘   │
│                             │                               │
│        ┌────────────────────┼────────────────────┐          │
│        ▼                    ▼                    ▼          │
│  ┌──────────┐        ┌──────────┐        ┌────────────┐    │
│  │ Content  │        │ Data     │        │ Engines    │    │
│  │ Config   │        │ Models   │        │ Rules      │    │
│  └──────────┘        └──────────┘        └────────────┘    │
│                                                              │
│        ┌──────────────────────────────────────────────┐      │
│        │            Static Assets & Artwork           │      │
│        └──────────────────────────────────────────────┘      │
│                                                              │
│        ┌──────────────────────────────────────────────┐      │
│        │     Single-File Production Build Output      │      │
│        └──────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

### Core Architectural Ideas

#### 1. No Backend

The prototype does not depend on servers, databases, or external APIs.

All demo behavior is generated from local data and deterministic logic.

#### 2. Simulated Agent Engine

Instead of calling a real AI model, PIXAR uses rule-based engines to simulate agentic decision-making.

These engines calculate:

- Device reuse scores
- Component value
- Harvesting priority
- Routing decisions
- Partner matching scores
- Environmental impact estimates

#### 3. Data-Driven Content

Most of the pitch deck content is stored in structured TypeScript files.

This makes it easy to edit:

- Chapter order
- Presenter notes
- Device samples
- Partner data
- Stats
- Business model content
- Demo configuration

#### 4. Presentation Shell

The app behaves like a hybrid between:

- A landing page
- A slide deck
- A product demo
- A dashboard prototype

Navigation is hash-based, allowing direct deep links into specific chapters or demo steps.

#### 5. Single-File Deployment

The build process outputs a single portable HTML file.

This is ideal for:

- College presentations
- Offline demos
- GitHub Pages deployment
- USB-based distribution
- Quick sharing

---

## 📂 Project Structure

```text
PIXAR/
├── .github/
│   └── workflows/              # GitHub Actions CI/CD deployment workflow
├── dist/                       # Production build output
├── public/                     # Public static assets
├── src/
│   ├── agent/
│   │   └── script.ts           # Simulated agent console log lines
│   │
│   ├── assets/
│   │   ├── hero-art.jpg        # Hero artwork
│   │   └── pixar-*.jpg         # Companion linocut-style illustrations
│   │
│   ├── chapters/
│   │   └── ...                 # Individual pitch deck chapter components
│   │
│   ├── components/
│   │   └── ...                 # Reusable UI components
│   │
│   ├── content/
│   │   ├── config.ts           # Demo config: city, team, college, presenters
│   │   ├── pitch.ts            # Chapter order, deck copy, notes, time budget
│   │   └── stats.ts            # Verified figures, years, and sources
│   │
│   ├── data/
│   │   ├── components.ts       # Components, weights, values, hotspots
│   │   ├── dashboard.ts        # Pilot targets and dashboard data
│   │   ├── devices.ts          # Devices and sample entries
│   │   ├── partners.ts         # Fictional partner data
│   │   └── projects.ts         # Student project data
│   │
│   ├── demo/
│   │   └── ...                 # Live demo steps and demo-specific UI
│   │
│   ├── engine/
│   │   ├── appraise.ts         # Status rules and reuse score logic
│   │   ├── impact.ts           # Impact placeholders and estimates
│   │   ├── match.ts            # Partner match score formula
│   │   └── routes.ts           # Route decision table
│   │
│   ├── illustration/
│   │   └── ...                 # Illustration and canvas artwork helpers
│   │
│   ├── lib/
│   │   └── ...                 # Shared helpers and small utilities
│   │
│   ├── pages/
│   │   ├── HeroPage.tsx        # Hero landing page with canvas art
│   │   └── ...                 # Other top-level pages
│   │
│   ├── shell/
│   │   └── ...                 # App shell, navigation, and layout wrappers
│   │
│   ├── state/
│   │   └── ...                 # Zustand stores and app state logic
│   │
│   ├── utils/
│   │   └── ...                 # Formatting, calculation, and general utilities
│   │
│   ├── App.tsx                 # Root app component
│   ├── index.css               # Global styles and Tailwind setup
│   └── main.tsx                # React entry point
│
├── tests/
│   └── ...                     # Vitest tests for engine and data integrity
│
├── index.html                  # HTML entry point
├── package.json                # Scripts and dependencies
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration
```

---

## 🧠 Key Modules

### Agent Simulation

Location:

```text
src/agent/
```

This module contains scripted console output that makes the prototype feel like an autonomous agent is processing the device.

It is used during the demo to display real-time-looking analysis steps.

---

### Content Layer

Location:

```text
src/content/
```

The content layer stores editable pitch material.

This includes:

- Chapter metadata
- Presentation notes
- Business model copy
- Stats
- Demo configuration

If you need to change the story, edit this layer first.

---

### Data Layer

Location:

```text
src/data/
```

The data layer contains structured demo data such as:

- Device samples
- Electronic components
- Component weights and values
- Partners
- Student projects
- Pilot dashboard metrics

This data feeds the engines and demo screens.

---

### Engine Layer

Location:

```text
src/engine/
```

The engine layer contains the core simulated intelligence.

Main engines:

| Engine | Purpose |
|---|---|
| `appraise.ts` | Calculates device status and reuse score |
| `routes.ts` | Decides where the device should go next |
| `match.ts` | Matches devices with suitable partners |
| `impact.ts` | Produces environmental impact estimates |

These modules are intentionally deterministic so the demo behaves predictably during presentations.

---

### Demo Layer

Location:

```text
src/demo/
```

The demo layer renders the interactive product demonstration.

It includes the main demo stages:

- Scan
- Route
- Certificate

These routes can be accessed directly using hash links.

---

### Presentation Layer

Location:

```text
src/chapters/
```

This layer contains the pitch deck chapters.

Each chapter is designed to be navigated using keyboard shortcuts or direct hash routes.

---

### Visual Layer

Location:

```text
src/assets/
src/illustration/
src/pages/HeroPage.tsx
```

The visual layer includes:

- Hero canvas animation
- Particle distortion
- Parallax behavior
- Linocut-style illustrations
- Landing page art

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| UI Framework | React 19 |
| Build Tool | Vite 7 |
| Language | TypeScript 5.9 |
| Styling | TailwindCSS 4 |
| State Management | Zustand |
| Animation | Motion |
| Testing | Vitest |
| Icons | Lucide React |
| QR Code Generation | qrcode |
| Image Export | html-to-image |
| Class Utilities | clsx, tailwind-merge |
| Single File Build | vite-plugin-singlefile |

---

## 🚀 Quick Start

### Prerequisites

Install Node.js LTS and npm.

Check versions:

```bash
node --version
npm --version
```

### Clone the Repository

```bash
git clone https://github.com/kingoooolooo/PIXAR.git
cd PIXAR
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Open the local URL shown in the terminal.

---

## 📦 Build Commands

### Development

```bash
npm run dev
```

Starts the local development server.

### Production Build

```bash
npm run build
```

Creates static output in `dist/`.

The build uses a relative base path, so it can run from:

- GitHub Pages
- Any static host
- A local file server
- A USB stick

### Preview Production Build

```bash
npm run preview
```

Serves the generated `dist/` folder locally.

### Run Tests

```bash
npx vitest run
```

Runs unit tests for the engine and data integrity.

### Type Check

```bash
npx tsc --noEmit
```

Checks TypeScript types without emitting files.

---

## 🎮 Presenter Shortcuts

Use these shortcuts during a live presentation.

| Key | Action |
|---|---|
| `Left` / `Right` | Previous or next chapter |
| `Page Up` / `Page Down` | Previous or next chapter |
| `1` to `9` | Jump to chapter 1 through 9 |
| `0` | Jump to chapter 10 |
| `G` | Open chapter overview grid |
| `N` | Toggle presenter notes |
| `D` | Jump to live demo |
| `A` | Autoplay the demo |
| `Space` | Pause autoplay |
| `R` | Reset demo |
| `F` | Toggle fullscreen |
| `?` | Show shortcut help |
| `Esc` | Close overlay or stop autoplay |

Inside the demo, use the visible **Back** and **Continue** buttons where available.

For some chapters, such as value proposition and unfair advantage, the arrow keys step through beats before moving to the next chapter.

---

## 🔗 Hash Routes

The app supports hash-based deep linking.

| Route | Purpose |
|---|---|
| `#/hero` | Default landing page |
| `#/cover` | Cover slide |
| `#/problem` | Problem chapter |
| `#/demo/scan` | Demo: scan stage |
| `#/demo/route` | Demo: routing stage |
| `#/demo/certificate` | Demo: certificate stage |
| `#/canvas` | Canvas / Lean Canvas view |

Deep links hydrate the sample device and fast-forward to the selected step.

---

## 🧩 Editing Guide

PIXAR is designed to be easy to edit without breaking the presentation.

### Change Chapter Order, Names, Notes, or Timing

Edit:

```text
src/content/pitch.ts
```

Look for the `CHAPTERS` array.

---

### Change Pitch Deck Copy

Edit:

```text
src/content/pitch.ts
```

This includes:

- Problem statement
- Gap matrix
- Segments
- Revenue model
- Cost structure
- Roadmap
- Lean Canvas

---

### Change Demo Identity

Edit:

```text
src/content/config.ts
```

Update:

```ts
DEMO_CONFIG
```

This can include:

- City
- Team name
- College name
- Presenter names

---

### Change Stats and Sources

Edit:

```text
src/content/stats.ts
```

Keep figures verified and include year/source where possible.

---

### Change Devices

Edit:

```text
src/data/devices.ts
```

This controls the device types and sample entries used in the demo.

---

### Change Components, Weights, Values, or Hotspots

Edit:

```text
src/data/components.ts
```

This affects appraisal, harvesting, and scoring logic.

---

### Change Partners

Edit:

```text
src/data/partners.ts
```

Partners are fictional in this prototype.

---

### Change Student Projects

Edit:

```text
src/data/projects.ts
```

---

### Change Pilot Dashboard Targets

Edit:

```text
src/data/dashboard.ts
```

---

### Change Reuse Score Logic

Edit:

```text
src/engine/appraise.ts
```

This contains status rules and reuse score behavior.

---

### Change Routing Logic

Edit:

```text
src/engine/routes.ts
```

This contains the route decision table.

---

### Change Partner Matching Formula

Edit:

```text
src/engine/match.ts
```

---

### Change Impact Estimates

Edit:

```text
src/engine/impact.ts
```

---

### Change Agent Console Lines

Edit:

```text
src/agent/script.ts
```

---

### Change Hero Landing Page

Edit:

```text
src/pages/HeroPage.tsx
```

This includes the canvas art and particle distortion behavior.

---

### Replace Artwork

Edit or replace files in:

```text
src/assets/
```

Key files include:

```text
hero-art.jpg
pixar-*.jpg
```

---

## 🧪 Testing

Tests are located in:

```text
tests/
```

Run them with:

```bash
npx vitest run
```

The tests focus on:

- Engine logic
- Data integrity
- Deterministic demo behavior

---

## 🚢 Deployment

The project is deployed using GitHub Pages.

The deployment pipeline builds the app and publishes the generated static output.

Because the final build is a self-contained HTML file, deployment is simple and reliable.

### Manual Build for Deployment

```bash
npm run build
```

Then deploy the contents of:

```text
dist/
```

to your static hosting provider.

---

## 🧱 Design Principles

### 1. Offline First

The demo must work without internet access.

### 2. Predictable Presentation

The demo must behave consistently during live pitches.

### 3. Data-Driven Editing

Content should be editable without touching complex UI code.

### 4. Strong Visual Identity

The prototype should feel polished, intentional, and memorable.

### 5. Single-File Portability

The final artifact should be easy to share and present anywhere.

---

## 🤝 Contributing

Contributions are welcome.

To contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a pull request

Example:

```bash
git checkout -b feature/amazing-update
git commit -m "Add amazing update"
git push origin feature/amazing-update
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

- **IBM SkillsBuild for Academia**
- **Masterclass 5**
- **UN Sustainable Development Goal 12: Responsible Consumption and Production**
- Built by [kingoooolooo](https://github.com/kingoooolooo)
