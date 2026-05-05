import { HAZARD_PARAMS, type HazardKind, TissueState } from "./materials";
import type { WorldState } from "./world";

export function applyDamage(world: WorldState): void {
  for (let index = 0; index < world.tissue.length; index += 1) {
    const hazard = world.hazard[index] as HazardKind;
    if (hazard !== 0 && world.tissue[index] !== TissueState.Empty) {
      const toxicity = HAZARD_PARAMS[hazard].toxicity;
      world.damage[index] = Math.min(1.5, world.damage[index] + toxicity * 0.26);
      world.activity[index] = Math.max(0, world.activity[index] - toxicity * 0.24);
      world.mass[index] = Math.max(0, world.mass[index] - toxicity * 0.12);
      world.thickness[index] = Math.max(0, world.thickness[index] - toxicity * 0.06);
    } else {
      world.damage[index] = Math.max(0, world.damage[index] - 0.01);
    }
  }
}
