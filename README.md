# Live Poll App (GUVI internship MVP)

Minimal live polling app:

- **Frontend:** React + Vite (JavaScript)
- **Backend:** Go + Gin
- **Database:** MongoDB
- **Live counts / Pub/Sub:** Redis
- **Realtime to the browser:** Server-Sent Events (SSE)

## Prerequisites

Install and start:

1. [Go](https://go.dev/dl/) 1.22+
2. [Node.js](https://nodejs.org/) 18+ (includes npm)
3. MongoDB on `localhost:27017`
4. Redis on `localhost:6379`

## Run

Backend:

```bash
cd backend
copy .env.example .env
go mod tidy
go run .
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

1. Sign up and log in.
2. Create a poll (2–6 options).
3. Open the shareable `/poll/:id` link in another browser (or a private window).
4. Vote. The first page updates live with no refresh.

## How the pieces work

- React is the UI (auth, create poll, vote, result bars).
- Gin serves REST + the SSE stream and validates votes.
- MongoDB stores users, polls, and votes.
- Redis stores live vote counts and publishes each vote.
- SSE (`EventSource`) pushes those updates to anyone watching the poll.
