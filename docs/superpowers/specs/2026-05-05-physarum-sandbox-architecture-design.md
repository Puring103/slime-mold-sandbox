# Physarum Sandbox Architecture Design

## Purpose

This document defines the first implementation architecture for the browser-based Physarum sandbox. The product priority is simulation correctness over polished UI. The first version should make slime mold behavior tunable, observable, and performant enough for interactive experimentation.

The architecture should support:

- Believable front growth, vein reinforcement, branch retraction, damage, dormancy, and revival
- Fast iteration on simulation parameters
- A simple Canvas-based UI
- A clear future path to Web Worker, WebGL, or WASM acceleration if needed

## Technology Stack

Use the following stack for the first implementation:

- TypeScript
- Vite
- React for a thin control shell
- HTML Canvas 2D for rendering
- Plain TypeScript modules for the simulation core

React should not own simulation rules. It should only host controls, statistics, and the canvas view. The simulation should be written as a framework-independent module so it can later run inside a Web Worker without major rewrites.

## Why This Stack

The first hard problem is not UI complexity. It is tuning the local rules until the organism behaves plausibly. TypeScript and Canvas 2D provide the best balance for this stage:

- Fast development feedback
- Easy debugging
- Enough performance for medium-sized grids
- No early GPU or WASM complexity
- Straightforward migration path if simulation cost grows

The first version should not start with Three.js, Rust/WASM, PixiJS, or backend-driven simulation. Those add complexity before the core behavior is proven.

## Target Performance Envelope

The initial implementation should target:

- Default grid size: `360x360`
- Expected usable range: `200x200` to `500x500`
- Display frame rate: `30-60fps`
- Speed modes: pause, `1x`, `5x`, `20x`
- Main-thread simulation for the first version
- No visible UI freezing during ordinary `5x` playback

At `20x`, the system may reduce render frequency while preserving simulation rules. Simulation speed should change by advancing more ticks, not by changing biological rules.

If `360x360` at `20x` becomes consistently sluggish, the first performance upgrade should be moving the simulation loop to a Web Worker.

## Module Boundaries

Use this initial source layout:

```text
src/
  sim/
    world.ts
    fields.ts
    materials.ts
    tick.ts
    growth.ts
    reinforce.ts
    decay.ts
    damage.ts
    dormancy.ts
    stats.ts
  render/
    canvasRenderer.ts
    palette.ts
  ui/
    App.tsx
    CanvasView.tsx
    Toolbar.tsx
    StatsPanel.tsx
```

### Simulation Modules

`world.ts` owns world creation, reset, dimensions, seeded initialization, and public world-level operations.

`fields.ts` owns grid allocation, indexing helpers, double buffers, and low-level field update helpers.

`materials.ts` defines food, hazard, obstacle, and tissue parameters.

`tick.ts` owns the ordered simulation pipeline. It should coordinate the step sequence but avoid embedding detailed rule logic.

`growth.ts` owns active-front sensing and expansion.

`reinforce.ts` owns route strengthening and food connection effects.

`decay.ts` owns low-value branch thinning and tissue retraction.

`damage.ts` owns hazard pressure, activity suppression, tissue damage, and local destruction.

`dormancy.ts` owns sclerotium formation and revival.

`stats.ts` owns derived metrics for the UI.

### Rendering Modules

`canvasRenderer.ts` should draw from a read-only snapshot or world reference. It should not mutate simulation state.

`palette.ts` should centralize colors for active front, stable vein, retreating tissue, sclerotium, food, hazards, and obstacles.

### UI Modules

The UI should remain intentionally simple. It needs tools for placing sclerotia, food, hazards, obstacles, and erasing; speed controls; reset controls; and basic stats. It should not become a heavy dashboard in the first version.

## Core Data Model

Represent the dish as a fixed-size 2D grid stored in one-dimensional typed arrays. Do not store a grid of object cells.

Use this shape as the starting point:

```ts
export type WorldState = {
  width: number;
  height: number;
  tick: number;

  attraction: Float32Array;
  attractionNext: Float32Array;
  repulsion: Float32Array;
  repulsionNext: Float32Array;
  toxicity: Float32Array;

  mass: Float32Array;
  activity: Float32Array;
  thickness: Float32Array;
  damage: Float32Array;
  dormancy: Float32Array;
  flow: Float32Array;

  obstacle: Uint8Array;
  material: Uint8Array;
  tissue: Uint8Array;

  activeFrontier: Int32Array;
  activeFrontierCount: number;
};
```

Typed arrays are required because they keep memory compact, reduce allocation pressure, and make future Worker or WASM migration easier.

## Grid Indexing

Use a single indexing convention everywhere:

```ts
const index = y * width + x;
```

Centralize helpers for:

- `toIndex(x, y, width)`
- `xOf(index, width)`
- `yOf(index, width)`
- bounds checks
- neighbor iteration

Neighbor iteration should support 4-neighbor and 8-neighbor modes. Growth should normally use 8-neighbor sampling to avoid overly square shapes.

## Tick Pipeline

Each simulation tick must keep this order:

1. Update environmental fields
2. Sense active-front neighborhoods
3. Grow into favorable cells
4. Reinforce useful routes
5. Decay low-value branches
6. Apply hazard damage
7. Update dormancy and revival
8. Collect or expose stats

This order matters. Growth should react to the current environment, reinforcement should follow successful contact, and decay/dormancy should lag behind growth to preserve the "explore first, consolidate later" feeling.

## Field Updates

Food and hazards should emit scalar fields. For the first version, use simple diffusion and decay rather than expensive global solvers.

Recommended first pass:

- Maintain `attraction` and `repulsion` as diffused fields
- Use double buffers for diffusion
- Apply per-cell decay after diffusion
- Re-emit food and hazard sources each tick
- Keep obstacle data separate from scalar fields

The diffusion kernel should be simple enough to run every tick on the target grid. If needed, field updates can run at a lower cadence than growth, but this should be a performance optimization, not a behavioral dependency.

## Growth Rules

Active fronts should evaluate nearby candidate cells using a score such as:

```text
score =
  attraction * attractionWeight
  - repulsion * repulsionWeight
  - toxicity * toxicityWeight
  - obstacleCost
  - overcrowdingCost
  + randomExploration
```

The exact formula is tunable, but it should preserve these behaviors:

- Move toward stronger or nearer food
- Avoid high-repulsion and high-toxicity regions
- Sometimes branch into imperfect routes
- Avoid immediate perfect shortest-path behavior
- Deposit mass and activity into newly occupied cells

The active-front list should be maintained explicitly. Do not scan the entire grid every tick just to find growing cells.

## Reinforcement and Decay

Route reinforcement should make successful food connections visually and behaviorally stronger:

- Increase `thickness`
- Increase `flow`
- Stabilize `activity`
- Slow future decay on useful paths

Branch decay should remove low-value exploration gradually:

- Reduce activity before mass
- Thin the branch before deleting it
- Preserve delay so the organism appears to judge routes over time
- Avoid instantly erasing every branch that is not currently connected to food

The first implementation can approximate route value locally. It does not need a perfect global transport solver.

## Damage, Dormancy, and Revival

Hazards should first create pressure and only later severe outcomes:

- Repulsion changes growth direction
- Toxicity suppresses activity
- Sustained exposure increases damage
- High damage causes tissue retreat or local destruction
- Prolonged stress can trigger dormancy

Dormancy should use inertia. A cell or region should become sclerotium only after sustained starvation, isolation, low flow, or damage.

Dormant tissue may revive when:

- A strong nutrient gradient appears nearby
- Living tissue reconnects to it

Revival should restore activity gradually rather than flipping instantly from dormant to fully active.

## Rendering Approach

Use Canvas 2D for the first version.

The renderer should:

- Draw the dish background
- Draw food, hazards, and obstacles
- Draw tissue using color and opacity based on state
- Use thickness to emphasize stable veins
- Prefer organic-looking cells or soft stamps over rigid square pixels where feasible

Rendering may be visually simple in the first prototype. Simulation legibility matters more than polish.

The renderer should not be coupled to React state updates per cell. Use `requestAnimationFrame` and direct canvas drawing.

## UI Scope

The first UI should include:

- Tool selection
- Brush size
- Material subtype selection
- Pause and speed controls
- Clear all
- Random scene
- Re-seed
- Basic stats
- Screenshot export

The UI should avoid heavy explanatory panels. The sandbox should start directly in the usable simulation view.

## Future Performance Path

Upgrade performance in this order only when needed:

1. Optimize typed-array loops and allocation patterns
2. Reduce render frequency at high simulation speed
3. Move simulation to a Web Worker
4. Move selected field operations or rendering to WebGL
5. Consider WASM only after the TypeScript rules are stable and real hotspots are measured

Do not start with WASM or WebGL before the behavior model is tuned.

## Testing Strategy

The simulation core should be testable without the browser.

Initial tests should cover:

- Grid indexing and neighbor iteration
- Field diffusion and decay
- Material emission
- Growth preference toward attraction
- Avoidance of hard obstacles
- Suppression in toxic regions
- Dormancy threshold behavior
- Revival near food gradient

Visual behavior will still need manual observation, but the deterministic pieces should be covered by unit tests.

## Implementation Sequence

Build in this order:

1. Scaffold Vite, TypeScript, React, and Canvas shell
2. Implement `WorldState`, grid helpers, and material definitions
3. Implement field emission, diffusion, and decay
4. Implement sclerotium placement and active-front growth toward stable food
5. Implement hard obstacles and simple avoidance
6. Implement route reinforcement and branch decay
7. Implement hazards and damage
8. Implement dormancy and revival
9. Add stats and simple controls
10. Add screenshot export

The first behavior milestone is not the full feature list. It is a visible loop where a sclerotium grows toward food, connects, thickens the useful path, and slowly retracts weak branches.

## Open Risks

The main risk is that local growth rules may produce either uniform blob expansion or overly mechanical paths. The mitigation is to tune against explicit visual behavior goals rather than against biological completeness.

The second risk is overbuilding the UI before the simulation is convincing. The implementation should keep UI minimal until the simulation can reliably show the core behaviors.

The third risk is premature optimization. The project should use performance-friendly data structures from the start, but deeper acceleration should wait for measured bottlenecks.
