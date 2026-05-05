import { neighborsOf } from "./fields";
import { HAZARD_PARAMS, type HazardKind, ObstacleKind, TissueState } from "./materials";
import type { WorldState } from "./world";

function obstacleCost(kind: number): number {
  if (kind === ObstacleKind.Hard) {
    return Number.POSITIVE_INFINITY;
  }
  if (kind === ObstacleKind.Soft) {
    return 0.24;
  }
  return 0;
}

export function growFrontier(world: WorldState): void {
  const frontierCount = world.activeFrontierCount;
  for (let i = 0; i < frontierCount; i += 1) {
    const index = world.activeFrontier[i];
    const neighbors = neighborsOf(index, world.width, world.height, 8);
    let bestIndex = -1;
    let bestScore = -1e9;

    for (const neighbor of neighbors) {
      if (world.obstacle[neighbor] === ObstacleKind.Hard) {
        continue;
      }
      const occupiedPenalty = world.tissue[neighbor] === TissueState.Empty ? 0 : 0.35;
      const score =
        world.attraction[neighbor] * 1.6 -
        world.repulsion[neighbor] * 1.2 -
        world.toxicity[neighbor] * 1.5 -
        obstacleCost(world.obstacle[neighbor]) -
        occupiedPenalty +
        world.rng.next() * 0.14;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = neighbor;
      }
    }

    world.activity[index] *= 0.972;
    world.mass[index] *= 0.992;
    world.flow[index] *= 0.982;

    if (bestIndex >= 0 && bestScore > 0.05) {
      world.mass[bestIndex] = Math.min(1.6, world.mass[bestIndex] + 0.44);
      world.activity[bestIndex] = Math.min(1.35, world.activity[bestIndex] + 0.52);
      world.thickness[bestIndex] = Math.min(1.25, world.thickness[bestIndex] + 0.2);
      world.flow[bestIndex] = Math.min(1.4, world.flow[bestIndex] + 0.16);
      world.dormancy[bestIndex] = Math.max(0, world.dormancy[bestIndex] - 0.1);
      world.damage[bestIndex] = Math.max(0, world.damage[bestIndex] - 0.03);
      world.tissue[bestIndex] = TissueState.Active;
      world.activity[index] = Math.max(world.activity[index], 0.2);
      world.mass[index] = Math.max(world.mass[index], 0.1);

      if (world.tissue[index] !== TissueState.Dormant) {
        world.tissue[index] =
          world.thickness[index] > 0.62 ? TissueState.Stable : TissueState.Active;
      }
    }

    const hazardKind = world.hazard[index] as HazardKind;
    if (hazardKind !== 0) {
      world.activity[index] *= 1 - HAZARD_PARAMS[hazardKind].toxicity * 0.15;
    }
  }
}
