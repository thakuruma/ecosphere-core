# EcoSphere — ESG Management Platform

A scoped-down ESG (Environmental, Social, Governance) management platform built for
[hackathon name] in 6 hours. Tracks carbon emissions, CSR participation, employee
gamification (XP/badges/leaderboard), and governance compliance issues.

## Project structure

```
ecosphere-esg/
├── client/                  # React (Vite) + Tailwind frontend
├── server/                  # Node.js + Express + PostgreSQL backend
├── ecosphere_schema.sql     # Database schema — run this first
├── ecosphere_api_contract.md # API endpoint reference for the whole team
└── README.md                # You are here
```

## Tech stack
- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express, PostgreSQL (`pg`), JWT auth, bcrypt
- **No Firebase/Supabase/MongoDB** — everything is our own backend + relational DB, by design.

## Getting started (first time setup)

### 1. Install PostgreSQL
If you don't have it locally, use a free hosted option like [Neon](https://neon.tech) or
[Railway](https://railway.app) — copy the connection string they give you.

### 2. Set up the database
```bash
psql "your_connection_string" -f ecosphere_schema.sql
```
This creates all tables and inserts a bit of seed data (departments, emission factors, badges).

### 3. Set up the backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env: paste your DATABASE_URL and set any random string as JWT_SECRET
npm run dev
```
Server runs on `http://localhost:5000`. Test it: `curl http://localhost:5000/api/health`

### 4. Set up the frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`. Open it in your browser — you should see the login page.

### 5. Try it end-to-end
- Go to `/signup`, create an account
- You'll be logged in and redirected to `/dashboard`

## Team workflow

Everyone builds their module by adding:
- A controller in `server/controllers/`
- A routes file in `server/routes/`
- One line in `server/server.js` to mount it
- Matching pages/components in `client/src/pages/`

Follow `ecosphere_api_contract.md` exactly for request/response shapes so nobody's work breaks
anyone else's. See `server/README.md` for a step-by-step on adding a new module.

## Git workflow (everyone commits their own code)
See `GIT_GUIDE.md` for exact commands — written for beginners, one line at a time.
