import { useEffect, useRef } from "react";
import { renderWorld } from "../render/canvasRenderer";
import type { WorldState } from "../sim/world";

type CanvasViewProps = {
  world: WorldState;
  onPointer: (clientX: number, clientY: number, rect: DOMRect) => void;
};

export function CanvasView({ world, onPointer }: CanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderWorld(ctx, world, rect.width, rect.height);
  }, [world.tick, world]);

  return (
    <canvas
      ref={canvasRef}
      className="dish-canvas"
      onPointerDown={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        onPointer(event.clientX, event.clientY, rect);
      }}
      onPointerMove={(event) => {
        if ((event.buttons & 1) === 1) {
          const rect = event.currentTarget.getBoundingClientRect();
          onPointer(event.clientX, event.clientY, rect);
        }
      }}
    />
  );
}
