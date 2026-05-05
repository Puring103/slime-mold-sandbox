import { FoodKind, HazardKind, ObstacleKind, TissueState } from "../sim/materials";
import type { WorldState } from "../sim/world";
import { palette } from "./palette";

function fillCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha = 1
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function tissueColor(state: number): string {
  switch (state) {
    case TissueState.Active:
      return palette.active;
    case TissueState.Stable:
      return palette.stable;
    case TissueState.Decaying:
      return palette.decaying;
    case TissueState.Dormant:
      return palette.dormant;
    default:
      return palette.active;
  }
}

function foodColor(food: number): string | null {
  switch (food) {
    case FoodKind.Stable:
      return palette.stableFood;
    case FoodKind.Burst:
      return palette.burstFood;
    case FoodKind.Diffuse:
      return palette.diffuseFood;
    default:
      return null;
  }
}

function hazardColor(hazard: number): string | null {
  switch (hazard) {
    case HazardKind.Salt:
      return palette.salt;
    case HazardKind.Bitter:
      return palette.bitter;
    case HazardKind.Light:
      return palette.light;
    case HazardKind.Contamination:
      return palette.contamination;
    default:
      return null;
  }
}

function obstacleColor(obstacle: number): string | null {
  switch (obstacle) {
    case ObstacleKind.Hard:
      return palette.hardObstacle;
    case ObstacleKind.Soft:
      return palette.softObstacle;
    default:
      return null;
  }
}

export function renderWorld(
  ctx: CanvasRenderingContext2D,
  world: WorldState,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.fillStyle = palette.dishInner;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.49, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(4, width * 0.01);
  ctx.strokeStyle = palette.dishOuter;
  ctx.stroke();
  ctx.clip();

  const cellSize = Math.min(width / world.width, height / world.height);
  for (let y = 0; y < world.height; y += 1) {
    for (let x = 0; x < world.width; x += 1) {
      const index = y * world.width + x;
      const px = x * cellSize + cellSize * 0.5;
      const py = y * cellSize + cellSize * 0.5;

      const food = foodColor(world.food[index]);
      if (food) {
        fillCircle(ctx, px, py, cellSize * 0.38, food, 0.9);
      }

      const hazard = hazardColor(world.hazard[index]);
      if (hazard) {
        fillCircle(ctx, px, py, cellSize * 0.4, hazard, 0.45);
      }

      const obstacle = obstacleColor(world.obstacle[index]);
      if (obstacle) {
        fillCircle(ctx, px, py, cellSize * 0.44, obstacle, 0.95);
      }

      if (world.tissue[index] !== TissueState.Empty) {
        const radius =
          cellSize *
          (0.18 + Math.min(0.42, world.thickness[index] * 0.16 + world.mass[index] * 0.12));
        const alpha =
          world.tissue[index] === TissueState.Dormant
            ? 0.88
            : Math.min(1, 0.28 + world.activity[index] * 0.7);
        fillCircle(ctx, px, py, radius, tissueColor(world.tissue[index]), alpha);
      }
    }
  }

  ctx.restore();
}
