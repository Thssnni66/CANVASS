import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { api, setSession } from '../api.js'

export default function AuthForm({ mode, onDone, navigate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isSignup = mode === 'signup'

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Use at least 6 characters for your password.')
      return
    }
    setBusy(true)
    try {
      const data = isSignup
        ? await api.signup(email, password)
        : await api.login(email, password)
      setSession(data)
      onDone()
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <p className="eyebrow">{isSignup ? 'Create account' : 'Welcome back'}</p>
        <h1>{isSignup ? 'Sign up' : 'Log in'}</h1>
        <p className="muted">
          {isSignup
            ? 'Use your email to start creating live polls.'
            : 'Sign in to create polls and share live links.'}
        </p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <label htmlFor="password">Password</label>
        <div className="password-field">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            placeholder="At least 6 characters"
            required
          />
          <button
            type="button"
            className="icon-btn inside"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((v) => !v)}
          >
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
          </button>
        </div>

        {error ? (
          <p className="alert error" role="alert">
            {error}
          </p>
        ) : null}

        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
        </button>

        <p className="switch">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <button type="button" className="text-link" onClick={() => navigate('/login')}>
                Log in
              </button>
            </>
          ) : (
            <>
              Need an account?{' '}
              <button type="button" className="text-link" onClick={() => navigate('/signup')}>
                Sign up
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  )
}
