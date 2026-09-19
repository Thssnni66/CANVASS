import Icon from '../components/Icon.jsx'
import { getToken } from '../api.js'

const preview = [
  { label: 'A. Python', pct: 62, color: '#6366f1' },
  { label: 'B. Java', pct: 24, color: '#8b5cf6' },
  { label: 'C. C++', pct: 14, color: '#38bdf8' },
]

const highlights = [
  { icon: 'smile', title: 'User Friendly', text: 'Simple and intuitive for everyone' },
  { icon: 'devices', title: 'Mobile Optimized', text: 'Works smoothly on phones, tablets, and desktops' },
  { icon: 'link', title: 'Shareable', text: 'Create a poll and share it with a simple link' },
  { icon: 'shield', title: 'Secure', text: 'Protected authentication and validated voting' },
  { icon: 'chart', title: 'Beautiful Results', text: 'Clear charts and real-time results' },
  { icon: 'sliders', title: 'Fully Customizable', text: 'Create polls with your own questions and options' },
]

export default function Home({ navigate }) {
  const loggedIn = Boolean(getToken())

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Live Polling · Real-Time Results</p>
          <h1>Ask a question. Watch the room answer live.</h1>
          <p className="lede">
            Create polls, share them with your audience, and monitor responses in real time with seamless updates.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn primary lg"
              onClick={() => navigate(loggedIn ? '/create' : '/signup')}
            >
              Create a Poll
            </button>
            <button
              type="button"
              className="btn ghost lg"
              onClick={() => navigate(loggedIn ? '/dashboard' : '/signup')}
            >
              Get Started
            </button>
          </div>
        </div>

        <aside className="hero-preview card" aria-hidden="true">
          <div className="preview-top">
            <span className="live-pill compact">
              <span className="live-dot" />
              Live
            </span>
            <span className="muted">124 votes</span>
          </div>
          <h2>What is your favorite programming language?</h2>
          <ul className="preview-bars">
            {preview.map((row) => (
              <li key={row.label}>
                <div className="result-row">
                  <span>{row.label}</span>
                  <span>{row.pct}%</span>
                </div>
                <div className="bar">
                  <div className="bar-fill" style={{ width: `${row.pct}%`, background: row.color }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="preview-status">
            Results update instantly
          </p>
        </aside>
      </section>

      <section className="features">
        <article className="feature-card card">
          <div className="feature-icon">
            <Icon name="bolt" />
          </div>
          <h3>Real-time Results</h3>
          <p>Counts update the moment someone votes, so hosts and voters stay in sync.</p>
        </article>
        <article className="feature-card card">
          <div className="feature-icon">
            <Icon name="users" />
          </div>
          <h3>Anonymous Voting</h3>
          <p>Anyone with the link can vote. No account required for the audience.</p>
        </article>
        <article className="feature-card card">
          <div className="feature-icon">
            <Icon name="share" />
          </div>
          <h3>Easy Sharing</h3>
          <p>Copy a public poll URL and drop it in chat, email, or a classroom slide.</p>
        </article>
      </section>

      <section className="highlights" aria-labelledby="highlights-heading">
        <div className="highlights-head">
          <p className="eyebrow">Built for better polls</p>
          <h2 id="highlights-heading">Everything You Need to Create Better Polls</h2>
        </div>
        <div className="highlights-grid">
          {highlights.map((item) => (
            <article key={item.title} className="feature-card card highlight-card">
              <div className="feature-icon">
                <Icon name={item.icon} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
