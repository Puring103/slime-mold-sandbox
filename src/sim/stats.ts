import { TissueState } from "./materials";
import type { WorldState } from "./world";

export type WorldStats = {
  occupiedArea: number;
  activeFrontierCount: number;
  dormantCount: number;
  connectedFoodCount: number;
  centerOfMassX: number;
};

export function collectStats(world: WorldState): WorldStats {
  let occupiedArea = 0;
  let dormantCount = 0;
  let connectedFoodCount = 0;
  let weightedX = 0;
  let totalMass = 0;

  for (let index = 0; index < world.tissue.length; index += 1) {
    if (world.tissue[index] !== TissueState.Empty) {
      occupiedArea += 1;
      totalMass += world.mass[index];
      weightedX += (index % world.width) * world.mass[index];
    }
    if (world.tissue[index] === TissueState.Dormant) {
      dormantCount += 1;
    }
    if (world.food[index] !== 0 && world.tissue[index] !== TissueState.Empty) {
      connectedFoodCount += 1;
    }
  }

  return {
    occupiedArea,
    activeFrontierCount: world.activeFrontierCount,
    dormantCount,
    connectedFoodCount,
    centerOfMassX: totalMass > 0 ? weightedX / totalMass : 0
  };
}
