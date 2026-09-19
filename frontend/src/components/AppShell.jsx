import { useState } from 'react'
import Icon from './Icon.jsx'
import { clearSession, getEmail, getToken } from '../api.js'

export default function AppShell({ children, path, navigate, onLogout, wide = false }) {
  const [open, setOpen] = useState(false)
  const loggedIn = Boolean(getToken())
  const email = getEmail()
  const onPoll = path.startsWith('/poll/')

  function go(to) {
    setOpen(false)
    navigate(to)
  }

  function logout() {
    clearSession()
    onLogout()
    go('/')
  }

  return (
    <div className={`app ${loggedIn && !onPoll ? 'app-with-nav' : ''}`}>
      <header className="topbar">
        <button className="brand" type="button" onClick={() => go(loggedIn ? '/dashboard' : '/')}>
          <span className="brand-mark" />
          CANVASS
        </button>
        {loggedIn && !onPoll ? (
          <button
            className="icon-btn menu-toggle"
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        ) : null}
        <nav className={`top-links ${open ? 'open' : ''}`}>
          {loggedIn ? (
            <>
              <span className="user-chip" title={email}>
                {email}
              </span>
              {onPoll ? (
                <button type="button" className="btn ghost" onClick={() => go('/dashboard')}>
                  Dashboard
                </button>
              ) : null}
              <button type="button" className="btn ghost" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn ghost" onClick={() => go('/login')}>
                Log in
              </button>
              <button type="button" className="btn primary" onClick={() => go('/signup')}>
                Get started
              </button>
            </>
          )}
        </nav>
      </header>

      <div className="shell">
        {loggedIn && !onPoll ? (
          <aside className={`sidebar ${open ? 'open' : ''}`}>
            <p className="sidebar-label">Workspace</p>
            <button className={path === '/dashboard' ? 'side-link active' : 'side-link'} type="button" onClick={() => go('/dashboard')}>
              My polls
            </button>
            <button className={path === '/create' ? 'side-link active' : 'side-link'} type="button" onClick={() => go('/create')}>
              Create poll
            </button>
            <button className="btn primary side-cta" type="button" onClick={() => go('/create')}>
              + New poll
            </button>
          </aside>
        ) : null}
        <main className={`main ${wide ? 'wide' : ''}`}>{children}</main>
      </div>
    </div>
  )
}
