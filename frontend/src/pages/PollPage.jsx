import { useEffect, useState } from 'react'
import PollResults from '../components/PollResults.jsx'
import { api } from '../api.js'

export default function PollPage({ pollId }) {
  const [poll, setPoll] = useState(null)
  const [counts, setCounts] = useState({})
  const [selected, setSelected] = useState('')
  const [error, setError] = useState('')
  const [voted, setVoted] = useState(() => localStorage.getItem(`voted_${pollId}`) === '1')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let ignore = false
    api
      .getPoll(pollId)
      .then((data) => {
        if (ignore) return
        setPoll(data)
        setCounts(data.counts || {})
      })
      .catch((err) => {
        if (!ignore) setError(err.message)
      })
    return () => {
      ignore = true
    }
  }, [pollId])

  useEffect(() => {
    const base = import.meta.env.VITE_API_ORIGIN || ''
    const es = new EventSource(`${base}/api/polls/${pollId}/stream`)
    es.addEventListener('vote', (ev) => {
      try {
        const data = JSON.parse(ev.data)
        if (data.counts) setCounts(data.counts)
      } catch {
        /* ignore bad payloads */
      }
    })
    es.onerror = () => {}
    return () => es.close()
  }, [pollId])

  async function submitVote(e) {
    e.preventDefault()
    if (!selected) {
      setError('Select an option to vote.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const data = await api.vote(pollId, selected)
      setCounts(data.counts || counts)
      setVoted(true)
      setSuccess(true)
      localStorage.setItem(`voted_${pollId}`, '1')
    } catch (err) {
      setError(err.message)
      if (err.message === 'already voted') {
        setVoted(true)
        localStorage.setItem(`voted_${pollId}`, '1')
      }
    } finally {
      setBusy(false)
    }
  }

  async function copyLink() {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: poll?.question || 'Live poll', url })
        return
      } catch {
        /* user cancelled or unsupported */
      }
    }
    copyLink()
  }

  if (error && !poll) {
    return (
      <div className="card form-card">
        <p className="alert error">{error}</p>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="card form-card">
        <p className="muted">Loading poll…</p>
        <div className="skeleton" />
      </div>
    )
  }

  return (
    <div className="poll-layout">
      <section className="card vote-card">
        <div className="poll-meta">
          <span className="live-pill">
            <span className="live-dot" />
            Live
          </span>
          <span className="chip">Anonymous voting allowed</span>
        </div>
        <h1>{poll.question}</h1>
        <p className="muted">Pick one option. You can vote once from this browser.</p>

        {!voted ? (
          <form onSubmit={submitVote}>
            <div className="choice-list" role="radiogroup" aria-label="Poll options">
              {poll.options.map((o) => (
                <label key={o.id} className={`choice-card ${selected === o.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="option"
                    value={o.id}
                    checked={selected === o.id}
                    onChange={() => setSelected(o.id)}
                  />
                  <span>{o.text}</span>
                </label>
              ))}
            </div>
            {error ? (
              <p className="alert error" role="alert">
                {error}
              </p>
            ) : null}
            <button className="btn primary" type="submit" disabled={busy}>
              {busy ? 'Submitting…' : 'Vote'}
            </button>
          </form>
        ) : (
          <p className={`alert ${success ? 'ok' : 'info'}`}>
            {success ? 'Thanks — your vote is in. Watch results update live.' : 'You have already voted. Results update live.'}
          </p>
        )}

        <div className="share-actions">
          <button type="button" className="btn ghost" onClick={copyLink}>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button type="button" className="btn ghost" onClick={share}>
            Share
          </button>
        </div>
      </section>

      <PollResults options={poll.options} counts={counts} live />
    </div>
  )
}
