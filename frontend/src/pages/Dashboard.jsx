import { useEffect, useState } from 'react'
import { CHART_COLORS, percentFor, totalVotes } from '../components/PollResults.jsx'
import { api, getToken, listRememberedPolls, rememberPoll, summarizePoll } from '../api.js'

function formatWhen(value) {
  if (!value) return 'Created recently'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Created recently'
  return `Created ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
}

export default function Dashboard({ navigate }) {
  const [polls, setPolls] = useState(listRememberedPolls)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      navigate('/login')
      return
    }
    let ignore = false
    const saved = listRememberedPolls()
    Promise.all(
      saved.map((p) =>
        api
          .getPoll(p.id)
          .then((fresh) => {
            rememberPoll(fresh)
            return summarizePoll(fresh)
          })
          .catch(() => p),
      ),
    ).then((rows) => {
      if (!ignore) {
        setPolls(rows)
        setLoading(false)
      }
    })
    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className="dashboard">
      <div className="page-head">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>My polls</h1>
          <p className="muted">Polls you create on this device stay here for quick access.</p>
        </div>
        <button type="button" className="btn primary" onClick={() => navigate('/create')}>
          Create Poll
        </button>
      </div>

      {loading ? <p className="muted">Loading your polls…</p> : null}

      {!loading && polls.length === 0 ? (
        <div className="empty card">
          <h2>No polls yet</h2>
          <p className="muted">Create your first question and share a live voting link.</p>
          <button type="button" className="btn primary" onClick={() => navigate('/create')}>
            Create a Poll
          </button>
        </div>
      ) : (
        <div className="poll-grid">
          {polls.map((poll) => {
            const options = poll.options || []
            const counts = poll.counts || {}
            const total = totalVotes(options, counts)
            return (
              <button
                key={poll.id}
                type="button"
                className="poll-card card"
                onClick={() => navigate(`/poll/${poll.id}`)}
              >
                <div className="poll-card-top">
                  <span className="live-pill compact">
                    <span className="live-dot" />
                    Live
                  </span>
                  <span className="muted">{formatWhen(poll.createdAt)}</span>
                </div>
                <h2>{poll.question}</h2>
                <p className="muted">
                  {options.length} options · {total} {total === 1 ? 'vote' : 'votes'}
                </p>
                <ul className="mini-bars" aria-hidden="true">
                  {options.slice(0, 3).map((o, i) => (
                    <li key={o.id}>
                      <div
                        className="bar-fill"
                        style={{
                          width: `${percentFor(Number(counts[o.id]) || 0, total) || 8}%`,
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
