import { useEffect, useState } from 'react'
import { api, getToken, rememberPoll } from '../api.js'

export default function CreatePoll({ navigate }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [created, setCreated] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!getToken()) navigate('/login')
  }, [])

  function setOption(i, value) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)))
  }

  function addOption() {
    if (options.length >= 6) return
    setOptions((prev) => [...prev, ''])
  }

  function removeOption(i) {
    if (options.length <= 2) return
    setOptions((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    const cleaned = options.map((o) => o.trim()).filter(Boolean)
    if (!question.trim() || cleaned.length < 2) {
      setError('Add a question and at least two options.')
      return
    }
    if (cleaned.length > 6) {
      setError('You can add up to 6 options.')
      return
    }
    setBusy(true)
    try {
      const poll = await api.createPoll(question.trim(), options)
      rememberPoll(poll)
      const url = `${window.location.origin}/poll/${poll.id}`
      setCreated({ poll, url })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function copyLink() {
    if (!created) return
    try {
      await navigator.clipboard.writeText(created.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  if (created) {
    return (
      <div className="card form-card success-card">
        <p className="eyebrow">Ready to share</p>
        <h1>Your poll is live</h1>
        <p className="lead-q">{created.poll.question}</p>
        <p className="muted">Anyone with this link can vote anonymously. Results update in real time.</p>
        <div className="share-row">
          <input readOnly value={created.url} aria-label="Shareable poll link" />
          <button type="button" className="btn primary" onClick={copyLink}>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
        <div className="hero-actions">
          <button type="button" className="btn primary" onClick={() => navigate(`/poll/${created.poll.id}`)}>
            Open poll
          </button>
          <button type="button" className="btn ghost" onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="card form-card" onSubmit={submit}>
      <p className="eyebrow">New poll</p>
      <h1>Create a New Poll</h1>
      <p className="muted">Ask one question with 2–6 options. Voters use a public link — no login required.</p>

      <label htmlFor="question">Question</label>
      <input
        id="question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="What should we order for lunch?"
        required
      />

      {options.map((opt, i) => (
        <div key={i} className="option-block">
          <label htmlFor={`opt-${i}`}>Option {i + 1}</label>
          <div className="option-row">
            <input
              id={`opt-${i}`}
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={`Choice ${i + 1}`}
              required
            />
            {options.length > 2 ? (
              <button type="button" className="btn ghost danger" onClick={() => removeOption(i)}>
                Remove
              </button>
            ) : null}
          </div>
        </div>
      ))}

      {options.length < 6 ? (
        <button type="button" className="btn ghost" onClick={addOption}>
          + Add option
        </button>
      ) : (
        <p className="muted">Maximum of 6 options.</p>
      )}

      <div className="info-note">Anonymous voting is on for every public link. Login is only needed to create polls.</div>

      {error ? (
        <p className="alert error" role="alert">
          {error}
        </p>
      ) : null}

      <button className="btn primary" type="submit" disabled={busy}>
        {busy ? 'Creating…' : 'Create Poll'}
      </button>
    </form>
  )
}
