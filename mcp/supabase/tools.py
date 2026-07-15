from supabase import create_client, Client
import os

def get_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_KEY"]
    return create_client(url, key)


def get_teams() -> list:
    """Get all teams in the garden"""
    sb = get_client()
    return sb.table("teams").select("*").order("created_at").execute().data


def get_agents(team_id: str = None) -> list:
    """Get all agents, optionally filtered by team"""
    sb = get_client()
    query = sb.table("agents").select("*")
    if team_id:
        query = query.eq("team_id", team_id)
    return query.execute().data


def get_agent(agent_id: str) -> dict:
    """Get a single agent by ID"""
    sb = get_client()
    res = sb.table("agents").select("*").eq("id", agent_id).single().execute()
    return res.data


def update_agent_status(agent_id: str, status: str) -> dict:
    """Update an agent's status. Valid values: idle, thinking, active"""
    sb = get_client()
    return sb.table("agents").update({"status": status}).eq("id", agent_id).execute().data


def create_team(name: str, field: str, color: str = "#22c55e") -> dict:
    """Create a new team"""
    sb = get_client()
    return sb.table("teams").insert({"name": name, "field": field, "color": color}).execute().data


def create_agent(name: str, role: str, team_id: str, specialty: str = "") -> dict:
    """Create a new agent and assign it to a team"""
    sb = get_client()
    return sb.table("agents").insert({
        "name": name,
        "role": role,
        "team_id": team_id,
        "specialty": specialty,
        "status": "idle"
    }).execute().data


def delete_agent(agent_id: str) -> dict:
    """Delete an agent by ID"""
    sb = get_client()
    return sb.table("agents").delete().eq("id", agent_id).execute().data


def delete_team(team_id: str) -> dict:
    """Delete a team and all its agents"""
    sb = get_client()
    sb.table("agents").delete().eq("team_id", team_id).execute()
    return sb.table("teams").delete().eq("id", team_id).execute().data
