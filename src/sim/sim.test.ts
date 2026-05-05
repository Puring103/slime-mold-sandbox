import { describe, expect, test } from "vitest";
import { toIndex, xOf, yOf, neighborsOf } from "./fields";
import { FoodKind, HazardKind, ObstacleKind, TissueState } from "./materials";
import {
  createWorld,
  eraseAt,
  placeFood,
  placeHazard,
  placeObstacle,
  placeSclerotium
} from "./world";
import { tickWorld } from "./tick";
import { collectStats } from "./stats";

describe("grid helpers", () => {
  test("converts between 2D coordinates and 1D indexes", () => {
    const index = toIndex(3, 2, 10);

    expect(index).toBe(23);
    expect(xOf(index, 10)).toBe(3);
    expect(yOf(index, 10)).toBe(2);
  });

  test("returns bounded 8-neighbor indexes", () => {
    const neighbors = neighborsOf(toIndex(0, 0, 4), 4, 4, 8);

    expect(neighbors.sort((a, b) => a - b)).toEqual([1, 4, 5]);
  });
});

describe("field emission", () => {
  test("food emits an attraction field that diffuses outward", () => {
    const world = createWorld({ width: 9, height: 9, seed: 7 });
    placeFood(world, 4, 4, FoodKind.Stable);

    tickWorld(world, 3);

    const center = toIndex(4, 4, world.width);
    const near = toIndex(5, 4, world.width);
    const far = toIndex(8, 8, world.width);
    expect(world.attraction[center]).toBeGreaterThan(world.attraction[near]);
    expect(world.attraction[near]).toBeGreaterThan(world.attraction[far]);
  });
});

describe("front growth", () => {
  test("active front grows toward a stable food gradient", () => {
    const world = createWorld({ width: 16, height: 7, seed: 2 });
    placeSclerotium(world, 2, 3);
    placeFood(world, 13, 3, FoodKind.Stable);

    tickWorld(world, 24);

    const stats = collectStats(world);
    expect(stats.occupiedArea).toBeGreaterThan(4);
    expect(stats.centerOfMassX).toBeGreaterThan(2.7);
  });

  test("hard obstacles are not occupied by growth", () => {
    const world = createWorld({ width: 12, height: 7, seed: 3 });
    placeSclerotium(world, 2, 3);
    placeFood(world, 10, 3, FoodKind.Stable);
    placeObstacle(world, 5, 3, ObstacleKind.Hard, 1);

    tickWorld(world, 30);

    const blocked = toIndex(5, 3, world.width);
    expect(world.obstacle[blocked]).toBe(ObstacleKind.Hard);
    expect(world.tissue[blocked]).toBe(TissueState.Empty);
  });

  test("low-value side branches decay after their attraction disappears", () => {
    const world = createWorld({ width: 20, height: 11, seed: 8 });
    placeSclerotium(world, 2, 5);
    placeFood(world, 15, 3, FoodKind.Stable, 1);
    placeFood(world, 15, 7, FoodKind.Burst, 1);

    tickWorld(world, 28);
    eraseAt(world, 15, 7, 1);
    tickWorld(world, 36);

    let decayingCells = 0;
    for (let index = 0; index < world.tissue.length; index += 1) {
      if (world.tissue[index] === TissueState.Decaying) {
        decayingCells += 1;
      }
    }

    expect(decayingCells).toBeGreaterThan(0);
  });
});

describe("hazards and dormancy", () => {
  test("toxic hazards increase damage and suppress activity", () => {
    const world = createWorld({ width: 9, height: 9, seed: 4 });
    placeSclerotium(world, 4, 4);
    placeHazard(world, 4, 4, HazardKind.Contamination, 1);

    tickWorld(world, 8);

    const center = toIndex(4, 4, world.width);
    expect(world.damage[center]).toBeGreaterThan(0.2);
    expect(world.activity[center]).toBeLessThan(1);
  });

  test("sustained starvation turns isolated tissue dormant", () => {
    const world = createWorld({ width: 9, height: 9, seed: 5 });
    placeSclerotium(world, 4, 4);

    tickWorld(world, 80);

    const stats = collectStats(world);
    expect(stats.dormantCount).toBeGreaterThan(0);
  });

  test("nearby food revives dormant tissue into an active frontier", () => {
    const world = createWorld({ width: 9, height: 9, seed: 6 });
    placeSclerotium(world, 4, 4);
    tickWorld(world, 80);
    placeFood(world, 5, 4, FoodKind.Stable);

    tickWorld(world, 10);

    const center = toIndex(4, 4, world.width);
    expect(world.dormancy[center]).toBeLessThan(0.85);
    expect(world.activeFrontierCount).toBeGreaterThan(0);
  });
});
