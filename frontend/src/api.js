const API_URL = 'https://canvass-yw1q.onrender.com'

const TOKEN_KEY = 'live_poll_token'
const EMAIL_KEY = 'live_poll_email'
const USER_KEY = 'live_poll_user'
const VOTER_KEY = 'live_poll_voter'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function getEmail() {
  return localStorage.getItem(EMAIL_KEY) || ''
}

export function getUserId() {
  return localStorage.getItem(USER_KEY) || ''
}

export function setSession({ token, email, userId }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(EMAIL_KEY, email)
  localStorage.setItem(USER_KEY, userId)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EMAIL_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getVoterKey() {
  let key = localStorage.getItem(VOTER_KEY)

  if (!key) {
    key = crypto.randomUUID()
    localStorage.setItem(VOTER_KEY, key)
  }

  return key
}

function pollsKey() {
  const id = getUserId()
  return id ? `live_poll_mine_${id}` : ''
}

export function rememberPoll(poll) {
  const key = pollsKey()

  if (!key || !poll?.id) return

  const next = [
    summarizePoll(poll),
    ...listRememberedPolls().filter((p) => p.id !== poll.id),
  ]

  localStorage.setItem(key, JSON.stringify(next))
}

export function listRememberedPolls() {
  const key = pollsKey()

  if (!key) return []

  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function summarizePoll(poll) {
  const counts = poll.counts || {}

  const total = Object.values(counts).reduce(
    (sum, n) => sum + (Number(n) || 0),
    0
  )

  return {
    id: poll.id,
    question: poll.question,
    options: poll.options || [],
    counts,
    createdAt: poll.createdAt,
    totalVotes: total,
  }
}

async function request(
  path,
  { method = 'GET', body, auth } = {}
) {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (auth) {
    const token = getToken()

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

export const api = {
  signup: (email, password) =>
    request('/api/auth/signup', {
      method: 'POST',
      body: {
        email,
        password,
      },
    }),

  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: {
        email,
        password,
      },
    }),

  createPoll: (question, options) =>
    request('/api/polls', {
      method: 'POST',
      auth: true,
      body: {
        question,
        options,
      },
    }),

  getPoll: (id) =>
    request(`/api/polls/${id}`),

  vote: (id, optionId) =>
    request(`/api/polls/${id}/vote`, {
      method: 'POST',
      body: {
        optionId,
        voterKey: getUserId() || getVoterKey(),
      },
    }),
}