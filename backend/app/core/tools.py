from app.core.supabase import get_supabase


def get_teams() -> list:
    return get_supabase().table("teams").select("*").order("created_at").execute().data

def get_agents(team_id: str = None) -> list:
    q = get_supabase().table("agents").select("*")
    if team_id:
        q = q.eq("team_id", team_id)
    return q.execute().data

def get_agent(agent_id: str) -> dict:
    return get_supabase().table("agents").select("*").eq("id", agent_id).single().execute().data

def update_agent_status(agent_id: str, status: str) -> dict:
    return get_supabase().table("agents").update({"status": status}).eq("id", agent_id).execute().data

def create_team(name: str, field: str, color: str = "#22c55e") -> dict:
    return get_supabase().table("teams").insert({"name": name, "field": field, "color": color}).execute().data

def create_agent(name: str, role: str, team_id: str, specialty: str = "") -> dict:
    return get_supabase().table("agents").insert({"name": name, "role": role, "team_id": team_id, "specialty": specialty, "status": "idle"}).execute().data

def delete_agent(agent_id: str) -> dict:
    return get_supabase().table("agents").delete().eq("id", agent_id).execute().data

def delete_team(team_id: str) -> dict:
    sb = get_supabase()
    sb.table("agents").delete().eq("team_id", team_id).execute()
    return sb.table("teams").delete().eq("id", team_id).execute().data




# Tool definitions — Claude reads these to know what tools exist and when to call them
TOOL_DEFINITIONS = [
    {
        "name": "get_teams",
        "description": "Get all teams in the Agent Garden",
        "input_schema": {
            "type": "object",
            "properties": {},
        },
    },
    {
        "name": "get_agents",
        "description": "Get all agents in the Agent Garden, optionally filtered by team",
        "input_schema": {
            "type": "object",
            "properties": {
                "team_id": {
                    "type": "string",
                    "description": "Filter agents by this team ID (optional). Always use the full UUID, never truncate.",
                }
            },
        },
    },
    {
        "name": "get_agent",
        "description": "Get a single agent by their ID",
        "input_schema": {
            "type": "object",
            "properties": {
                "agent_id": {
                    "type": "string",
                    "description": "The full UUID of the agent e.g. ef04f553-d881-4d1c-922f-b7e9c1737a10. Always use the complete UUID, never truncate.",
                }
            },
            "required": ["agent_id"],
        },
    },
    {
        "name": "update_agent_status",
        "description": "Update an agent's status. Valid values: idle, thinking, active",
        "input_schema": {
            "type": "object",
            "properties": {
                "agent_id": {
                    "type": "string",
                    "description": "The full UUID of the agent to update. Always use the complete UUID, never truncate.",
                },
                "status": {
                    "type": "string",
                    "description": "New status: idle, thinking, or active",
                },
            },
            "required": ["agent_id", "status"],
        },
    },
    {
        "name": "create_team",
        "description": "Create a new team in the Agent Garden",
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Team name"},
                "field": {"type": "string", "description": "Team domain or field"},
                "color": {"type": "string", "description": "Hex color code (optional)"},
            },
            "required": ["name", "field"],
        },
    },
    {
        "name": "create_agent",
        "description": "Create a new agent and assign it to a team",
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Agent name"},
                "role": {"type": "string", "description": "Agent role e.g. Engineer, Architect, Lead"},
                "team_id": {"type": "string", "description": "The full UUID of the team to assign the agent to. Always use the complete UUID, never truncate."},
                "specialty": {"type": "string", "description": "Agent specialty or focus area (optional)"},
            },
            "required": ["name", "role", "team_id"],
        },
    },
    {
        "name": "delete_agent",
        "description": "Delete an agent by ID",
        "input_schema": {
            "type": "object",
            "properties": {
                "agent_id": {"type": "string", "description": "The full UUID of the agent to delete. Always use the complete UUID, never truncate."},
            },
            "required": ["agent_id"],
        },
    },
    {
        "name": "delete_team",
        "description": "Delete a team and all its agents",
        "input_schema": {
            "type": "object",
            "properties": {
                "team_id": {"type": "string", "description": "The full UUID of the team to delete. Always use the complete UUID, never truncate."},
            },
            "required": ["team_id"],
        },
    },
]


def execute_tool(name: str, inputs: dict) -> str:
    """Execute a tool by name with given inputs, return result as string"""
    import json

    if name == "get_teams":
        result = get_teams()
    elif name == "get_agents":
        result = get_agents(inputs.get("team_id"))
    elif name == "get_agent":
        result = get_agent(inputs["agent_id"])
    elif name == "update_agent_status":
        result = update_agent_status(inputs["agent_id"], inputs["status"])
    elif name == "create_team":
        result = create_team(inputs["name"], inputs["field"], inputs.get("color", "#22c55e"))
    elif name == "create_agent":
        result = create_agent(inputs["name"], inputs["role"], inputs["team_id"], inputs.get("specialty", ""))
    elif name == "delete_agent":
        result = delete_agent(inputs["agent_id"])
    elif name == "delete_team":
        result = delete_team(inputs["team_id"])
    else:
        return f"Unknown tool: {name}"

    return json.dumps(result)
