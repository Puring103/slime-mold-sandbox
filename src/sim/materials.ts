export enum FoodKind {
  None = 0,
  Stable = 1,
  Burst = 2,
  Diffuse = 3
}

export enum HazardKind {
  None = 0,
  Salt = 1,
  Bitter = 2,
  Light = 3,
  Contamination = 4
}

export enum ObstacleKind {
  None = 0,
  Soft = 1,
  Hard = 2
}

export enum TissueState {
  Empty = 0,
  Active = 1,
  Stable = 2,
  Decaying = 3,
  Dormant = 4
}

export type FoodParams = {
  attraction: number;
  decay: number;
};

export type HazardParams = {
  repulsion: number;
  toxicity: number;
};

export const FOOD_PARAMS: Record<FoodKind, FoodParams> = {
  [FoodKind.None]: { attraction: 0, decay: 0 },
  [FoodKind.Stable]: { attraction: 1.25, decay: 0.003 },
  [FoodKind.Burst]: { attraction: 1.8, decay: 0.03 },
  [FoodKind.Diffuse]: { attraction: 0.85, decay: 0.001 }
};

export const HAZARD_PARAMS: Record<HazardKind, HazardParams> = {
  [HazardKind.None]: { repulsion: 0, toxicity: 0 },
  [HazardKind.Salt]: { repulsion: 1.45, toxicity: 0.06 },
  [HazardKind.Bitter]: { repulsion: 1.15, toxicity: 0.03 },
  [HazardKind.Light]: { repulsion: 0.85, toxicity: 0.08 },
  [HazardKind.Contamination]: { repulsion: 0.95, toxicity: 0.18 }
};
