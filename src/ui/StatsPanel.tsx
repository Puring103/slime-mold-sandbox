import type { WorldStats } from "../sim/stats";

type StatsPanelProps = {
  stats: WorldStats;
  tick: number;
};

export function StatsPanel({ stats, tick }: StatsPanelProps) {
  return (
    <aside className="panel stats-panel">
      <h2>Colony State</h2>
      <dl>
        <div>
          <dt>Tick</dt>
          <dd>{tick}</dd>
        </div>
        <div>
          <dt>Occupied</dt>
          <dd>{stats.occupiedArea}</dd>
        </div>
        <div>
          <dt>Frontier</dt>
          <dd>{stats.activeFrontierCount}</dd>
        </div>
        <div>
          <dt>Dormant</dt>
          <dd>{stats.dormantCount}</dd>
        </div>
        <div>
          <dt>Food Connected</dt>
          <dd>{stats.connectedFoodCount}</dd>
        </div>
        <div>
          <dt>Center X</dt>
          <dd>{stats.centerOfMassX.toFixed(2)}</dd>
        </div>
      </dl>
    </aside>
  );
}
