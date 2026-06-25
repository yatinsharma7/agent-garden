from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import datetime
from enum import Enum


# ── ENUMS ──

class AgentRole(str, Enum):
    engineer = "Engineer"
    data_engineer = "Data Engineer"
    architect = "Architect"
    lead = "Lead"
    devops_engineer = "DevOps Engineer"
    ml_engineer = "ML Engineer"
    backend_engineer = "Backend Engineer"
    frontend_engineer = "Frontend Engineer"
    security_engineer = "Security Engineer"
    data_scientist = "Data Scientist"
    analytics_engineer = "Analytics Engineer"

class AgentStatus(str, Enum):
    idle = "idle"
    thinking = "thinking"
    done = "done"
    error = "error"

class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


# ── TEAMS ──

class TeamBase(BaseModel):
    name: str
    field: str
    color: str = "#4ade80"

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    field: Optional[str] = None
    color: Optional[str] = None

class Team(TeamBase):
    id: UUID4
    created_at: datetime
    agent_count: Optional[int] = 0

    class Config:
        from_attributes = True


# ── AGENTS ──

class AgentBase(BaseModel):
    name: str
    role: AgentRole
    team_id: UUID4
    specialty: Optional[str] = None

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[AgentRole] = None
    team_id: Optional[UUID4] = None
    specialty: Optional[str] = None
    status: Optional[AgentStatus] = None

class Agent(AgentBase):
    id: UUID4
    status: AgentStatus = AgentStatus.idle
    created_at: datetime

    class Config:
        from_attributes = True


# ── CHAT ──

class ChatMessage(BaseModel):
    role: MessageRole
    content: str

class ChatRequest(BaseModel):
    agent_id: UUID4
    message: str

class ChatResponse(BaseModel):
    agent_id: UUID4
    message: ChatMessage
    usage: Optional[dict] = None


# ── MESSAGES (history) ──

class MessageRecord(BaseModel):
    id: UUID4
    agent_id: UUID4
    role: MessageRole
    content: str
    created_at: datetime
