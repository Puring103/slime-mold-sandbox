export type RandomSource = {
  next(): number;
};

export function createRandom(seed: number): RandomSource {
  let state = seed >>> 0;

  return {
    next() {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0x100000000;
    }
  };
}
