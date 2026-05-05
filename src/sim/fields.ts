export type NeighborMode = 4 | 8;

export function toIndex(x: number, y: number, width: number): number {
  return y * width + x;
}

export function xOf(index: number, width: number): number {
  return index % width;
}

export function yOf(index: number, width: number): number {
  return Math.floor(index / width);
}

export function inBounds(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && y >= 0 && x < width && y < height;
}

export function neighborsOf(
  index: number,
  width: number,
  height: number,
  mode: NeighborMode
): number[] {
  const x = xOf(index, width);
  const y = yOf(index, width);
  const neighbors: number[] = [];

  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) {
        continue;
      }
      if (mode === 4 && Math.abs(dx) + Math.abs(dy) !== 1) {
        continue;
      }
      const nx = x + dx;
      const ny = y + dy;
      if (inBounds(nx, ny, width, height)) {
        neighbors.push(toIndex(nx, ny, width));
      }
    }
  }

  return neighbors;
}
