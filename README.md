**CANVASS**

**Ask a question. Watch the room answer live.**

CANVASS is a real-time live polling application that allows users to create polls, share them through a public link, and view voting results instantly without refreshing the page.

It is designed for classrooms, meetings, events, presentations, surveys, and real-time audience interaction.

---

## Features

- User authentication
- Create polls with multiple options
- Share polls through a public link
- Public voting without requiring audience accounts
- Real-time results without page refresh
- Server-side validation
- Duplicate-vote prevention
- Responsive and mobile-friendly interface
- Clear and interactive poll results

---



## Technology Stack

| Component | Technology |

| Frontend | React + Vite |

| Backend | Go + Gin |

| Database | MongoDB |

| Real-Time Layer | Redis |

| Real-Time Communication | Server-Sent Events (SSE) |

| Styling | CSS |

| Authentication | JWT + Password Hashing |

---



## Architecture

```text

                    ┌─────────────────────┐

                    │    React + Vite     │

                    │      Frontend       │

                    └──────────┬──────────┘

                               │

                         REST API + SSE

                               │

                    ┌──────────▼──────────┐

                    │       Go + Gin      │

                    │       Backend       │

                    └──────┬───────┬──────┘

                           │       │

                    ┌──────▼───┐ ┌─▼────────┐

                    │ MongoDB  │ │  Redis   │

                    │          │ │          │

                    │ Persistent│ │ Real-Time│

                    │   Data   │ │  Counts  │

                    └──────────┘ └────┬─────┘

                                      │

                                   Pub|Sub

                                      │

                                ┌─────▼─────┐

                                │    SSE    │

                                │ Live Feed │

                                └─────┬─────┘

                                      │

                                ┌─────▼─────┐

                                │   React   │

                                │  Results  │

                                └───────────┘
```

## How Real-Time Polling Works

1. A user creates a poll.
2. The poll is stored in MongoDB.
3. A public poll link is generated.
4. Audience members open the link and vote.
5. The Go/Gin backend validates the vote.
6. The vote is stored in MongoDB.
7. Redis updates the live vote count.
8. Redis publishes an update event.
9. Connected clients receive the update through Server-Sent Events.
10. The React frontend updates the results automatically.

**No page refresh is required.**

## Project Structure

```
CANVASS/
│
├── backend/
│   ├── main.go
│   ├── auth.go
│   ├── config.go
│   ├── mongo.go
│   ├── polls.go
│   ├── redis.go
│   ├── sse.go
│   ├── go.mod
│   └── go.sum
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── README.md
└── package.json
```

## Getting Started

### Prerequisites

Install the following before running CANVASS:

- Node.js
- Go
- MongoDB
- Redis-compatible server

For Windows development, Memurai can be used as a Redis-compatible server.

## 1. Clone the Repository

```
git clone https://github.com/Thssnni66/CANVASS.git
cd CANVASS
```

---

## 2. Configure the Backend

Create a local environment file:

```
backend/.env
```

Use the following file as a reference:

```
backend/.env.example
```

Configure the required MongoDB, Redis, JWT, and application settings.

---

## 3. Start the Backend

Open a terminal:

```
cd backend
go mod tidy
go run .
```

The backend runs on:

```
http://localhost:8080
```

---

## 4. Start the Frontend

Open another terminal:

```
cd frontend
npm install
npm run dev
```

The frontend runs on:

```
http://localhost:5173
```

Open the frontend URL in your browser.

## Application Flow

```
User
  │
  ▼
Sign Up / Login
  │
  ▼
Create Poll
  │
  ▼
Generate Public Poll Link
  │
  ▼
Audience Opens Poll
  │
  ▼
Audience Votes
  │
  ▼
Go + Gin Validates Vote
  │
  ├──────────────► MongoDB
  │                  Stores Vote
  │
  └──────────────► Redis
                     Updates Count
                        │
                        ▼
                     Pub/Sub
                        │
                        ▼
                       SSE
                        │
                        ▼
                  React Frontend
                        │
                        ▼
               Live Results Update
```

---

## Security and Validation

CANVASS performs validation on the backend instead of relying only on client-side validation.

- Authentication for poll creation 
-  Server-side poll validation
-  Server-side vote validation 
- Duplicate-vote prevention 
- Environment variables for sensitive configuration
- `.env` files excluded from Git version control 

---

## User Experience

CANVASS focuses on a simple and accessible polling experience.

### User Friendly

Simple and intuitive interface for creating and participating in polls.

### Mobile Optimized

Responsive interface designed for phones, tablets, and desktops.

### Shareable

Polls can be shared using a simple public URL.

### Secure

Authentication and server-side validation help protect poll creation and voting.

### Beautiful Results

Clear result bars and real-time updates make voting activity easy to understand.

### Fully Customizable

Poll creators can define their own questions and answer options.

---

## Use Cases

CANVASS can be used for:

-  Classroom polls 
-  Team meetings 
-  Events and presentations 
-  Quick surveys 
-  Audience interaction 
-  Real-time feedback 

---

## Testing

The application was tested through the complete end-to-end flow:

-  User signup 
-  User login 
-  Poll creation 
-  Public poll access 
-  Voting 
-  Duplicate-vote validation 
-  Real-time result updates 
-  Multiple browser/tab testing 
-  Frontend and backend communication 

Real-time results were verified to update without manually refreshing the page.

---

## AI Usage

AI tools were used during the development of CANVASS.

### Tool Used

**Cursor AI**

Cursor was used for:

-  Implementation assistance 
-  Frontend component development 
-  UI improvements 
-  Debugging 
-  Troubleshooting configuration issues 
-  Understanding and resolving development errors 

The application was manually tested to verify the complete end-to-end functionality, including authentication, poll creation, voting, duplicate-vote handling, and real-time result updates.

---

## Project Status

CANVASS currently provides:

- User authentication
- Poll creation
- Public poll sharing
- Public voting
- Server-side validation
- Duplicate-vote prevention
- MongoDB data storage
- Redis real-time processing
- Server-Sent Events
- Live result updates
- Responsive interface

## Author

**Fathima Thasneem V**

M.Sc. Applied Data Science  
SRM Institute of Science and Technology

## Repository

GitHub:

[https://github.com/Thssnni66/CANVASS](https://github.com/Thssnni66/CANVASS)

## License

This project was developed as part of a developer internship assignment.



