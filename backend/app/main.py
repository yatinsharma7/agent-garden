from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.routes import teams, agents, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🌱 Agent Garden API starting [{settings.ENVIRONMENT}]")
    yield
    print("🌱 Agent Garden API shutting down")


app = FastAPI(
    title="Agent Garden API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(teams.router, prefix="/api/teams", tags=["teams"])
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
