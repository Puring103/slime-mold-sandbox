import { useEffect, useRef, useState } from "react";
import { CanvasView } from "./CanvasView";
import { StatsPanel } from "./StatsPanel";
import { Toolbar, toolToPlacement, type ToolMode } from "./Toolbar";
import { collectStats } from "../sim/stats";
import { tickWorld } from "../sim/tick";
import {
  createWorld,
  eraseAt,
  placeFood,
  placeHazard,
  placeObstacle,
  placeSclerotium,
  resetWorld,
  type WorldState
} from "../sim/world";

function createSeededWorld(): WorldState {
  const world = createWorld({ width: 120, height: 120, seed: Math.floor(Math.random() * 100000) + 1 });
  placeSclerotium(world, 24, 60);
  placeFood(world, 92, 34, 1, 3);
  placeFood(world, 95, 84, 3, 3);
  placeHazard(world, 56, 60, 1, 5);
  placeObstacle(world, 66, 34, 2, 8);
  return world;
}

export function App() {
  const worldRef = useRef<WorldState>(createSeededWorld());
  const [tool, setTool] = useState<ToolMode>("food-stable");
  const [brushSize, setBrushSize] = useState(1);
  const [speed, setSpeed] = useState(5);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let frame = 0;
    let raf = 0;

    const loop = () => {
      if (!paused) {
        tickWorld(worldRef.current, speed);
        frame += 1;
        if (speed >= 20 && frame % 2 !== 0) {
          raf = window.requestAnimationFrame(loop);
          return;
        }
        setTick(worldRef.current.tick);
      }
      raf = window.requestAnimationFrame(loop);
    };

    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [paused, speed]);

  const stats = collectStats(worldRef.current);

  const applyTool = (clientX: number, clientY: number, rect: DOMRect) => {
    const world = worldRef.current;
    const x = Math.max(0, Math.min(world.width - 1, Math.floor(((clientX - rect.left) / rect.width) * world.width)));
    const y = Math.max(
      0,
      Math.min(world.height - 1, Math.floor(((clientY - rect.top) / rect.height) * world.height))
    );
    const placement = toolToPlacement(tool);

    if (placement.type === "sclerotium") {
      placeSclerotium(world, x, y);
    } else if (placement.type === "food") {
      placeFood(world, x, y, placement.kind, brushSize);
    } else if (placement.type === "hazard") {
      placeHazard(world, x, y, placement.kind, brushSize);
    } else if (placement.type === "obstacle") {
      placeObstacle(world, x, y, placement.kind, brushSize);
    } else {
      eraseAt(world, x, y, brushSize);
    }

    setTick(world.tick);
  };

  return (
    <main className="app-shell">
      <header className="hero-band">
        <div>
          <p className="eyebrow">Physarum Sandbox</p>
          <h1>Grow, stress, starve, and wake the colony.</h1>
        </div>
      </header>

      <section className="workspace">
        <Toolbar
          tool={tool}
          onToolChange={setTool}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          speed={speed}
          onSpeedChange={setSpeed}
          paused={paused}
          onPausedChange={setPaused}
          onClear={() => {
            resetWorld(worldRef.current);
            setTick(worldRef.current.tick);
          }}
          onRandomize={() => {
            worldRef.current = createSeededWorld();
            setTick(worldRef.current.tick);
          }}
          onReseed={() => {
            placeSclerotium(worldRef.current, 24, 60);
            setTick(worldRef.current.tick);
          }}
          onScreenshot={() => {
            const canvas = document.querySelector<HTMLCanvasElement>(".dish-canvas");
            const dataUrl = canvas?.toDataURL("image/png");
            if (!dataUrl) {
              return;
            }
            const anchor = document.createElement("a");
            anchor.href = dataUrl;
            anchor.download = `physarum-${worldRef.current.tick}.png`;
            anchor.click();
          }}
        />

        <section className="dish-stage" aria-label="Physarum simulation dish">
          <CanvasView world={worldRef.current} onPointer={applyTool} />
        </section>

        <StatsPanel stats={stats} tick={tick} />
      </section>
    </main>
  );
}
