import { TissueState } from "./materials";
import type { WorldState } from "./world";

export function decayWorld(world: WorldState): void {
  for (let index = 0; index < world.tissue.length; index += 1) {
    if (world.tissue[index] === TissueState.Empty || world.tissue[index] === TissueState.Dormant) {
      continue;
    }

    const nourishment = world.attraction[index] + world.flow[index] * 0.42;
    if (nourishment < 0.28) {
      world.activity[index] *= 0.92;
      world.thickness[index] *= 0.968;
      world.mass[index] *= 0.982;
      world.flow[index] *= 0.94;
      if (world.activity[index] < 0.34 || world.flow[index] < 0.2) {
        world.tissue[index] = TissueState.Decaying;
      }
    } else if (world.tissue[index] === TissueState.Decaying && world.attraction[index] > 0.34) {
      world.tissue[index] = world.thickness[index] > 0.62 ? TissueState.Stable : TissueState.Active;
    }

    if (world.mass[index] < 0.04 && world.dormancy[index] < 0.9) {
      world.tissue[index] = TissueState.Empty;
      world.activity[index] = 0;
      world.thickness[index] = 0;
      world.flow[index] = 0;
    }
  }
}
