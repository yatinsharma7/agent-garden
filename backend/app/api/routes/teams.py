from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas import Team, TeamCreate, TeamUpdate
from app.core.supabase import get_supabase

router = APIRouter()


@router.get("/", response_model=List[Team])
async def list_teams():
    sb = get_supabase()
    res = sb.table("teams").select("*, agents(count)").order("created_at").execute()
    teams = []
    for row in res.data:
        count = row.pop("agents", [{}])
        row["agent_count"] = count[0].get("count", 0) if count else 0
        teams.append(row)
    return teams


@router.post("/", response_model=Team, status_code=201)
async def create_team(payload: TeamCreate):
    sb = get_supabase()
    res = sb.table("teams").insert(payload.model_dump()).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create team")
    row = res.data[0]
    row["agent_count"] = 0
    return row


@router.get("/{team_id}", response_model=Team)
async def get_team(team_id: str):
    sb = get_supabase()
    res = sb.table("teams").select("*, agents(count)").eq("id", team_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Team not found")
    row = res.data
    count = row.pop("agents", [{}])
    row["agent_count"] = count[0].get("count", 0) if count else 0
    return row


@router.patch("/{team_id}", response_model=Team)
async def update_team(team_id: str, payload: TeamUpdate):
    sb = get_supabase()
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    res = sb.table("teams").update(data).eq("id", team_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Team not found")
    return res.data[0]


@router.delete("/{team_id}", status_code=204)
async def delete_team(team_id: str):
    sb = get_supabase()
    sb.table("teams").delete().eq("id", team_id).execute()
