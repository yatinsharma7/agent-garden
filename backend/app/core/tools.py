import sys
import os

# Add MCP supabase tools to path so we can import them directly
MCP_SUPABASE_PATH = os.path.join(os.path.dirname(__file__), "../../..", "mcp", "supabase")
sys.path.insert(0, os.path.abspath(MCP_SUPABASE_PATH))

import tools as supabase_tools


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
                    "description": "Filter agents by this team ID (optional)",
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
                    "description": "The ID of the agent to fetch",
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
                    "description": "The ID of the agent to update",
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
                "team_id": {"type": "string", "description": "ID of the team to assign the agent to"},
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
                "agent_id": {"type": "string", "description": "The ID of the agent to delete"},
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
                "team_id": {"type": "string", "description": "The ID of the team to delete"},
            },
            "required": ["team_id"],
        },
    },
]


def execute_tool(name: str, inputs: dict) -> str:
    """Execute a tool by name with given inputs, return result as string"""
    import json

    if name == "get_teams":
        result = supabase_tools.get_teams()
    elif name == "get_agents":
        result = supabase_tools.get_agents(inputs.get("team_id"))
    elif name == "get_agent":
        result = supabase_tools.get_agent(inputs["agent_id"])
    elif name == "update_agent_status":
        result = supabase_tools.update_agent_status(inputs["agent_id"], inputs["status"])
    elif name == "create_team":
        result = supabase_tools.create_team(inputs["name"], inputs["field"], inputs.get("color", "#22c55e"))
    elif name == "create_agent":
        result = supabase_tools.create_agent(inputs["name"], inputs["role"], inputs["team_id"], inputs.get("specialty", ""))
    elif name == "delete_agent":
        result = supabase_tools.delete_agent(inputs["agent_id"])
    elif name == "delete_team":
        result = supabase_tools.delete_team(inputs["team_id"])
    else:
        return f"Unknown tool: {name}"

    return json.dumps(result)
