from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.schemas import Agent, AgentCreate, AgentUpdate
from app.core.supabase import get_supabase

router = APIRouter()


@router.get("/", response_model=List[Agent])
async def list_agents(team_id: Optional[str] = None):
    sb = get_supabase()
    query = sb.table("agents").select("*").order("created_at")
    if team_id:
        query = query.eq("team_id", team_id)
    res = query.execute()
    return res.data


@router.post("/", response_model=Agent, status_code=201)
async def create_agent(payload: AgentCreate):
    sb = get_supabase()
    data = payload.model_dump()
    data["team_id"] = str(data["team_id"])
    res = sb.table("agents").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create agent")
    return res.data[0]


@router.get("/{agent_id}", response_model=Agent)
async def get_agent(agent_id: str):
    sb = get_supabase()
    res = sb.table("agents").select("*").eq("id", agent_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Agent not found")
    return res.data


@router.patch("/{agent_id}", response_model=Agent)
async def update_agent(agent_id: str, payload: AgentUpdate):
    sb = get_supabase()
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "team_id" in data:
        data["team_id"] = str(data["team_id"])
    res = sb.table("agents").update(data).eq("id", agent_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Agent not found")
    return res.data[0]


@router.delete("/{agent_id}", status_code=204)
async def delete_agent(agent_id: str):
    sb = get_supabase()
    sb.table("agents").delete().eq("id", agent_id).execute()
