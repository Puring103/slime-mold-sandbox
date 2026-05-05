import { TissueState } from "./materials";
import type { WorldState } from "./world";

export function reinforceWorld(world: WorldState): void {
  for (let index = 0; index < world.tissue.length; index += 1) {
    if (world.tissue[index] === TissueState.Empty || world.tissue[index] === TissueState.Dormant) {
      continue;
    }

    if (world.attraction[index] > 0.22) {
      world.thickness[index] = Math.min(1.4, world.thickness[index] + 0.04);
      world.flow[index] = Math.min(1.5, world.flow[index] + 0.03);
      world.activity[index] = Math.min(1.4, world.activity[index] + 0.01);
      if (world.thickness[index] > 0.66) {
        world.tissue[index] = TissueState.Stable;
      }
    } else {
      world.flow[index] *= 0.985;
    }
  }
}
