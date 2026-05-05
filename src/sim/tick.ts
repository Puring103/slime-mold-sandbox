import { neighborsOf } from "./fields";
import { FOOD_PARAMS, HAZARD_PARAMS, type FoodKind, type HazardKind } from "./materials";
import { decayWorld } from "./decay";
import { updateDormancy } from "./dormancy";
import { applyDamage } from "./damage";
import { growFrontier } from "./growth";
import { reinforceWorld } from "./reinforce";
import { rebuildFrontier, type WorldState } from "./world";

function emitFields(world: WorldState): void {
  world.attractionNext.fill(0);
  world.repulsionNext.fill(0);
  world.toxicity.fill(0);

  for (let index = 0; index < world.attraction.length; index += 1) {
    const neighbors = neighborsOf(index, world.width, world.height, 4);
    let attractionSum = world.attraction[index] * 0.52;
    let repulsionSum = world.repulsion[index] * 0.52;

    for (const neighbor of neighbors) {
      attractionSum += world.attraction[neighbor] * 0.12;
      repulsionSum += world.repulsion[neighbor] * 0.12;
    }

    const foodKind = world.food[index] as FoodKind;
    const hazardKind = world.hazard[index] as HazardKind;
    const food = FOOD_PARAMS[foodKind];
    const hazard = HAZARD_PARAMS[hazardKind];

    world.attractionNext[index] = attractionSum * 0.95 + food.attraction;
    world.repulsionNext[index] = repulsionSum * 0.93 + hazard.repulsion;
    world.toxicity[index] = hazard.toxicity + world.repulsionNext[index] * 0.035;
  }

  const attraction = world.attraction;
  world.attraction = world.attractionNext;
  world.attractionNext = attraction;

  const repulsion = world.repulsion;
  world.repulsion = world.repulsionNext;
  world.repulsionNext = repulsion;
}

export function tickWorld(world: WorldState, steps = 1): void {
  for (let step = 0; step < steps; step += 1) {
    world.tick += 1;
    emitFields(world);
    rebuildFrontier(world);
    growFrontier(world);
    reinforceWorld(world);
    decayWorld(world);
    applyDamage(world);
    updateDormancy(world);
    rebuildFrontier(world);
  }
}
