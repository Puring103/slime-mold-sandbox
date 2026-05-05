import { TissueState } from "./materials";
import type { WorldState } from "./world";

export function updateDormancy(world: WorldState): void {
  for (let index = 0; index < world.tissue.length; index += 1) {
    if (world.tissue[index] === TissueState.Empty) {
      continue;
    }

    const pressure = world.damage[index] + Math.max(0, 0.2 - world.attraction[index]);
    const starvation = world.attraction[index] < 0.06 && world.flow[index] < 0.12;

    if (world.tissue[index] === TissueState.Dormant) {
      if (world.attraction[index] > 0.24) {
        world.dormancy[index] = Math.max(0, world.dormancy[index] - 0.18);
        world.activity[index] = Math.min(1, world.activity[index] + 0.15);
        if (world.dormancy[index] < 0.75) {
          world.tissue[index] = TissueState.Active;
        }
      } else {
        world.dormancy[index] = Math.min(1.25, world.dormancy[index] + 0.005);
      }
      continue;
    }

    if (starvation) {
      world.dormancy[index] = Math.min(1.2, world.dormancy[index] + 0.02 + pressure * 0.02);
    } else {
      world.dormancy[index] = Math.max(0, world.dormancy[index] - 0.03);
    }

    if (world.dormancy[index] > 0.9) {
      world.tissue[index] = TissueState.Dormant;
      world.activity[index] = Math.min(world.activity[index], 0.04);
      world.flow[index] *= 0.85;
      world.thickness[index] = Math.max(world.thickness[index], 0.18);
    }
  }
}
