import { FoodKind, HazardKind, ObstacleKind } from "../sim/materials";

export type ToolMode =
  | "sclerotium"
  | "food-stable"
  | "food-burst"
  | "food-diffuse"
  | "hazard-salt"
  | "hazard-light"
  | "hazard-contamination"
  | "obstacle-hard"
  | "obstacle-soft"
  | "erase";

type ToolbarProps = {
  tool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  paused: boolean;
  onPausedChange: (paused: boolean) => void;
  onClear: () => void;
  onRandomize: () => void;
  onReseed: () => void;
  onScreenshot: () => void;
};

const tools: Array<{ id: ToolMode; label: string }> = [
  { id: "sclerotium", label: "Seed" },
  { id: "food-stable", label: "Stable Food" },
  { id: "food-burst", label: "Burst Food" },
  { id: "food-diffuse", label: "Diffuse Food" },
  { id: "hazard-salt", label: "Salt" },
  { id: "hazard-light", label: "Light" },
  { id: "hazard-contamination", label: "Contamination" },
  { id: "obstacle-hard", label: "Hard Wall" },
  { id: "obstacle-soft", label: "Soft Barrier" },
  { id: "erase", label: "Erase" }
];

const speeds = [1, 5, 20];

export function toolToPlacement(tool: ToolMode):
  | { type: "sclerotium" }
  | { type: "food"; kind: FoodKind }
  | { type: "hazard"; kind: HazardKind }
  | { type: "obstacle"; kind: ObstacleKind }
  | { type: "erase" } {
  switch (tool) {
    case "food-stable":
      return { type: "food", kind: FoodKind.Stable };
    case "food-burst":
      return { type: "food", kind: FoodKind.Burst };
    case "food-diffuse":
      return { type: "food", kind: FoodKind.Diffuse };
    case "hazard-salt":
      return { type: "hazard", kind: HazardKind.Salt };
    case "hazard-light":
      return { type: "hazard", kind: HazardKind.Light };
    case "hazard-contamination":
      return { type: "hazard", kind: HazardKind.Contamination };
    case "obstacle-hard":
      return { type: "obstacle", kind: ObstacleKind.Hard };
    case "obstacle-soft":
      return { type: "obstacle", kind: ObstacleKind.Soft };
    case "erase":
      return { type: "erase" };
    default:
      return { type: "sclerotium" };
  }
}

export function Toolbar(props: ToolbarProps) {
  return (
    <section className="panel toolbar">
      <div className="toolbar-group">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={tool.id === props.tool ? "tool-button active" : "tool-button"}
            onClick={() => props.onToolChange(tool.id)}
            type="button"
          >
            {tool.label}
          </button>
        ))}
      </div>

      <div className="controls-row">
        <label className="control-field">
          <span>Brush</span>
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            value={props.brushSize}
            onChange={(event) => props.onBrushSizeChange(Number(event.target.value))}
          />
        </label>

        <div className="segmented">
          <button type="button" onClick={() => props.onPausedChange(!props.paused)}>
            {props.paused ? "Resume" : "Pause"}
          </button>
          {speeds.map((speed) => (
            <button
              key={speed}
              type="button"
              className={props.speed === speed ? "active" : ""}
              onClick={() => props.onSpeedChange(speed)}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      <div className="controls-row">
        <button type="button" onClick={props.onClear}>
          Clear
        </button>
        <button type="button" onClick={props.onRandomize}>
          Random
        </button>
        <button type="button" onClick={props.onReseed}>
          Re-seed
        </button>
        <button type="button" onClick={props.onScreenshot}>
          Screenshot
        </button>
      </div>
    </section>
  );
}
