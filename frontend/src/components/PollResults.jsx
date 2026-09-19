export const CHART_COLORS = ['#6366f1', '#8b5cf6', '#38bdf8', '#22c55e', '#f59e0b', '#f43f5e']

export function totalVotes(options, counts) {
  return options.reduce((sum, o) => sum + (Number(counts[o.id]) || 0), 0)
}

export function percentFor(count, total) {
  if (!total) return 0
  return Math.round((count / total) * 100)
}

export function formatDate(value) {
  if (!value) return 'Just now'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Just now'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PollResults({ options, counts, live = true }) {
  const total = totalVotes(options, counts)
  let acc = 0
  const stops = options.map((o, i) => {
    const n = Number(counts[o.id]) || 0
    const start = acc
    const slice = total ? (n / total) * 100 : 0
    acc += slice
    return `${CHART_COLORS[i % CHART_COLORS.length]} ${start}% ${acc}%`
  })
  const donut = total
    ? `conic-gradient(${stops.join(', ')})`
    : 'conic-gradient(#e5e7eb 0% 100%)'

  return (
    <div className="results-panel">
      <div className="results-head">
        <div>
          <h2>Live results</h2>
          <p className="muted">
            {total} {total === 1 ? 'vote' : 'votes'} so far
          </p>
        </div>
        {live ? (
          <span className="live-pill" aria-live="polite">
            <span className="live-dot" />
            Updating live
          </span>
        ) : null}
      </div>

      <div className="results-grid">
        <div className="donut-wrap" aria-hidden="true">
          <div className="donut" style={{ background: donut }}>
            <div className="donut-hole">
              <strong>{total}</strong>
              <span>votes</span>
            </div>
          </div>
        </div>

        <ul className="results">
          {options.map((o, i) => {
            const n = Number(counts[o.id]) || 0
            const pct = percentFor(n, total)
            return (
              <li key={o.id}>
                <div className="result-row">
                  <span className="swatch" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="result-label">{o.text}</span>
                  <span className="result-meta">
                    {n} · {pct}%
                  </span>
                </div>
                <div className="bar" role="img" aria-label={`${o.text}: ${pct} percent`}>
                  <div className="bar-fill" style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
