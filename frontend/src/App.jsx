import { useEffect, useState } from 'react'
import AppShell from './components/AppShell.jsx'
import { getEmail } from './api.js'
import AuthForm from './pages/AuthForm.jsx'
import CreatePoll from './pages/CreatePoll.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Home from './pages/Home.jsx'
import PollPage from './pages/PollPage.jsx'

function currentPath() {
  return window.location.pathname
}

export default function App() {
  const [path, setPath] = useState(currentPath)
  const [, setEmail] = useState(getEmail)

  useEffect(() => {
    const onPop = () => setPath(currentPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function navigate(to) {
    window.history.pushState({}, '', to)
    setPath(to)
    window.scrollTo(0, 0)
  }

  const pollMatch = path.match(/^\/poll\/([^/]+)$/)
  const wide = path === '/' || Boolean(pollMatch)

  let page = <Home navigate={navigate} />
  if (pollMatch) page = <PollPage pollId={pollMatch[1]} />
  else if (path === '/signup') page = <AuthForm mode="signup" navigate={navigate} onDone={() => setEmail(getEmail())} />
  else if (path === '/login') page = <AuthForm mode="login" navigate={navigate} onDone={() => setEmail(getEmail())} />
  else if (path === '/create') page = <CreatePoll navigate={navigate} />
  else if (path === '/dashboard') page = <Dashboard navigate={navigate} />

  return (
    <AppShell path={path} navigate={navigate} onLogout={() => setEmail('')} wide={wide}>
      {page}
    </AppShell>
  )
}
