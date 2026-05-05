import { toIndex } from "./fields";
import { FoodKind, HazardKind, ObstacleKind, TissueState } from "./materials";
import { createRandom, type RandomSource } from "./random";

export type WorldConfig = {
  width: number;
  height: number;
  seed?: number;
};

export type WorldState = {
  width: number;
  height: number;
  tick: number;
  seed: number;
  rng: RandomSource;
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
  tissue: Uint8Array;
  food: Uint8Array;
  hazard: Uint8Array;
  activeFrontier: Int32Array;
  activeFrontierCount: number;
};

function cellCount(width: number, height: number): number {
  return width * height;
}

export function createWorld(config: WorldConfig): WorldState {
  const seed = config.seed ?? 1;
  const size = cellCount(config.width, config.height);
  return {
    width: config.width,
    height: config.height,
    tick: 0,
    seed,
    rng: createRandom(seed),
    attraction: new Float32Array(size),
    attractionNext: new Float32Array(size),
    repulsion: new Float32Array(size),
    repulsionNext: new Float32Array(size),
    toxicity: new Float32Array(size),
    mass: new Float32Array(size),
    activity: new Float32Array(size),
    thickness: new Float32Array(size),
    damage: new Float32Array(size),
    dormancy: new Float32Array(size),
    flow: new Float32Array(size),
    obstacle: new Uint8Array(size),
    tissue: new Uint8Array(size),
    food: new Uint8Array(size),
    hazard: new Uint8Array(size),
    activeFrontier: new Int32Array(size),
    activeFrontierCount: 0
  };
}

export function resetWorld(world: WorldState): void {
  world.tick = 0;
  world.rng = createRandom(world.seed);
  world.attraction.fill(0);
  world.attractionNext.fill(0);
  world.repulsion.fill(0);
  world.repulsionNext.fill(0);
  world.toxicity.fill(0);
  world.mass.fill(0);
  world.activity.fill(0);
  world.thickness.fill(0);
  world.damage.fill(0);
  world.dormancy.fill(0);
  world.flow.fill(0);
  world.obstacle.fill(ObstacleKind.None);
  world.tissue.fill(TissueState.Empty);
  world.food.fill(FoodKind.None);
  world.hazard.fill(HazardKind.None);
  world.activeFrontier.fill(0);
  world.activeFrontierCount = 0;
}

export function placeSclerotium(world: WorldState, x: number, y: number): void {
  const index = toIndex(x, y, world.width);
  world.mass[index] = 1;
  world.activity[index] = 1;
  world.thickness[index] = 0.8;
  world.flow[index] = 0.5;
  world.damage[index] = 0;
  world.dormancy[index] = 0.15;
  world.tissue[index] = TissueState.Active;
  rebuildFrontier(world);
}

export function placeFood(world: WorldState, x: number, y: number, kind: FoodKind, radius = 0): void {
  paintDisk(world.width, world.height, x, y, radius, (index) => {
    world.food[index] = kind;
  });
}

export function placeHazard(
  world: WorldState,
  x: number,
  y: number,
  kind: HazardKind,
  radius = 0
): void {
  paintDisk(world.width, world.height, x, y, radius, (index) => {
    world.hazard[index] = kind;
  });
}

export function placeObstacle(
  world: WorldState,
  x: number,
  y: number,
  kind: ObstacleKind,
  radius = 0
): void {
  paintDisk(world.width, world.height, x, y, radius, (index) => {
    world.obstacle[index] = kind;
    if (kind === ObstacleKind.Hard) {
      world.tissue[index] = TissueState.Empty;
      world.mass[index] = 0;
      world.activity[index] = 0;
      world.thickness[index] = 0;
      world.flow[index] = 0;
    }
  });
  rebuildFrontier(world);
}

export function eraseAt(world: WorldState, x: number, y: number, radius = 0): void {
  paintDisk(world.width, world.height, x, y, radius, (index) => {
    world.food[index] = FoodKind.None;
    world.hazard[index] = HazardKind.None;
    world.obstacle[index] = ObstacleKind.None;
    world.tissue[index] = TissueState.Empty;
    world.mass[index] = 0;
    world.activity[index] = 0;
    world.thickness[index] = 0;
    world.flow[index] = 0;
    world.damage[index] = 0;
    world.dormancy[index] = 0;
  });
  rebuildFrontier(world);
}

export function paintDisk(
  width: number,
  height: number,
  cx: number,
  cy: number,
  radius: number,
  paint: (index: number) => void
): void {
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      if (x < 0 || y < 0 || x >= width || y >= height) {
        continue;
      }
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        paint(toIndex(x, y, width));
      }
    }
  }
}

export function rebuildFrontier(world: WorldState): void {
  let count = 0;
  for (let index = 0; index < world.tissue.length; index += 1) {
    if (
      world.tissue[index] !== TissueState.Empty &&
      world.tissue[index] !== TissueState.Dormant &&
      world.activity[index] > 0.08 &&
      world.mass[index] > 0.05
    ) {
      world.activeFrontier[count] = index;
      count += 1;
    }
  }
  world.activeFrontierCount = count;
}
