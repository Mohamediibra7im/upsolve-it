export interface ModeStats {
  mode: string;
  label: string;
  sessions: number;
  totalProblems: number;
  solved: number;
  averagePerformance: number;
  bestPerformance: number;
  solvingRate: number;
}

export default function ModeBreakdown({
  statsByMode,
}: {
  statsByMode: ModeStats[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="u-table">
        <thead>
          <tr>
            <th>Mode</th>
            <th className="num">Sessions</th>
            <th className="num">Average</th>
            <th className="num">Best</th>
            <th className="num">Solved</th>
          </tr>
        </thead>
        <tbody>
          {statsByMode.map((m) => (
            <tr key={m.mode}>
              <td>
                <b>{m.label}</b>
              </td>
              <td className="num">{m.sessions}</td>
              <td className="num">
                {m.solved > 0 ? m.averagePerformance : "—"}
              </td>
              <td className="num">{m.solved > 0 ? m.bestPerformance : "—"}</td>
              <td className="num">
                {m.solved}/{m.totalProblems}
                <br />
                <span className="t-sm t-muted">{m.solvingRate}%</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
