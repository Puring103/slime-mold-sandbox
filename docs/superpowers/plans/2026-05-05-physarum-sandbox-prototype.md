# Physarum Sandbox Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first runnable browser prototype for the Physarum sandbox with a testable simulation core, Canvas rendering, and a minimal control UI.

**Architecture:** The simulation core is framework-independent TypeScript using typed arrays and an explicit tick pipeline. React owns only controls and canvas lifecycle, while Canvas 2D renders directly from the world state.

**Tech Stack:** TypeScript, Vite, React, Vitest, Canvas 2D.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/ui/App.tsx`
- Create: `src/styles.css`

- [x] Create a Vite React TypeScript scaffold that can run tests and build.
- [x] Add baseline app shell with a placeholder canvas area.
- [x] Run dependency installation.

### Task 2: Simulation Core

**Files:**
- Create: `src/sim/fields.ts`
- Create: `src/sim/materials.ts`
- Create: `src/sim/random.ts`
- Create: `src/sim/world.ts`
- Create: `src/sim/tick.ts`
- Create: `src/sim/growth.ts`
- Create: `src/sim/reinforce.ts`
- Create: `src/sim/decay.ts`
- Create: `src/sim/damage.ts`
- Create: `src/sim/dormancy.ts`
- Create: `src/sim/stats.ts`
- Create: `src/sim/sim.test.ts`

- [x] Write tests for grid indexing, neighbor iteration, material emission, growth toward food, obstacle avoidance, hazard damage, dormancy, and revival.
- [x] Run tests and verify they fail before implementation.
- [x] Implement typed-array world state, placement helpers, field updates, tick pipeline, and behavior rules.
- [x] Run tests and verify they pass.

### Task 3: Canvas Renderer and UI

**Files:**
- Create: `src/render/palette.ts`
- Create: `src/render/canvasRenderer.ts`
- Create: `src/ui/CanvasView.tsx`
- Create: `src/ui/Toolbar.tsx`
- Create: `src/ui/StatsPanel.tsx`
- Modify: `src/ui/App.tsx`
- Modify: `src/styles.css`

- [x] Render the dish, tissue states, materials, hazards, and obstacles to Canvas 2D.
- [x] Add minimal tools for sclerotium, food, hazard, obstacle, eraser, brush size, speed, reset, random scene, re-seed, and screenshot export.
- [x] Keep React out of per-cell simulation updates.

### Task 4: Verification

**Files:**
- Modify as needed based on verification failures.

- [x] Run `npm test -- --run`.
- [x] Run `npm run build`.
- [x] Start the dev server and report the local URL.
