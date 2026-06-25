# 🌱 Agent Garden

Enterprise AI agent management platform. Organize Claude-powered agents into teams by role and field. Chat with agents, assign tasks, and track status — with full persistence and a real backend.

## Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Vite + React + TypeScript + Tailwind |
| Backend   | FastAPI (Python)                    |
| Database  | Supabase (Postgres + Realtime)      |
| AI        | Anthropic Claude (claude-sonnet-4-6)|
| State     | Zustand                             |
| Infra     | Docker Compose                      |

## Project Structure

```
agent-garden/
├── frontend/                  # Vite + React app
│   └── src/
│       ├── components/
│       │   ├── agents/        # AgentCard
│       │   ├── garden/        # TeamCluster
│       │   ├── chat/          # ChatPanel
│       │   └── layout/        # TopBar, Sidebar
│       ├── lib/
│       │   ├── api.ts         # Axios API client
│       │   ├── store.ts       # Zustand global store
│       │   └── constants.ts   # Roles, colors, emojis
│       └── types/             # Shared TypeScript types
├── backend/                   # FastAPI app
│   └── app/
│       ├── api/routes/        # teams.py, agents.py, chat.py
│       ├── core/              # config.py, supabase.py
│       └── schemas/           # Pydantic models
├── supabase/
│   └── migrations/            # SQL schema
└── docker-compose.yml
```

## Getting Started

### 1. Clone & configure environment

```bash
cp .env.example .env
# Fill in your Supabase and Anthropic keys
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/migrations/001_initial_schema.sql`
3. Copy your **Project URL**, **anon key**, and **service role key** into `.env`

### 3. Get your Anthropic API key

Get one at [console.anthropic.com](https://console.anthropic.com) and add to `.env`

### 4. Run with Docker

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 5. Run without Docker (local dev)

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env  # fill in values
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
cp ../.env.example .env.local  # fill in VITE_ vars
npm run dev
```

## API Endpoints

```
GET    /api/teams/              List all teams
POST   /api/teams/              Create team
PATCH  /api/teams/{id}          Update team
DELETE /api/teams/{id}          Delete team (cascades agents)

GET    /api/agents/             List agents (optional ?team_id=)
POST   /api/agents/             Deploy agent
PATCH  /api/agents/{id}         Update agent
DELETE /api/agents/{id}         Remove agent

POST   /api/chat/               Send message to agent (Claude responds)
GET    /api/chat/{agent_id}/history   Get message history
DELETE /api/chat/{agent_id}/history   Clear history
```

## Roadmap

- [ ] Auth (Supabase Auth + RLS per user/org)
- [ ] Agent-to-agent messaging (broadcast tasks across team)
- [ ] Task queue (Celery + Redis for async agent jobs)
- [ ] LangChain orchestration layer
- [ ] Tool use (agents can call APIs, search, run code)
- [ ] Streaming responses (SSE)
- [ ] Agent memory (long-term context via vector store)
- [ ] Multi-org support
