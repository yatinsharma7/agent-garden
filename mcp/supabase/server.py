from dotenv import load_dotenv
load_dotenv()

from mcp.server.fastmcp import FastMCP
import tools

mcp = FastMCP("agent-garden-supabase")


@mcp.tool()
def get_teams() -> list:
    """Get all teams in the Agent Garden"""
    return tools.get_teams()


@mcp.tool()
def get_agents(team_id: str = None) -> list:
    """Get all agents in the Agent Garden, optionally filtered by team_id"""
    return tools.get_agents(team_id)


@mcp.tool()
def get_agent(agent_id: str) -> dict:
    """Get a single agent by their ID"""
    return tools.get_agent(agent_id)


@mcp.tool()
def update_agent_status(agent_id: str, status: str) -> dict:
    """Update an agent's status. Valid values: idle, thinking, active"""
    return tools.update_agent_status(agent_id, status)


@mcp.tool()
def create_team(name: str, field: str, color: str = "#22c55e") -> dict:
    """Create a new team in the Agent Garden"""
    return tools.create_team(name, field, color)


@mcp.tool()
def create_agent(name: str, role: str, team_id: str, specialty: str = "") -> dict:
    """Create a new agent and assign it to a team"""
    return tools.create_agent(name, role, team_id, specialty)


@mcp.tool()
def delete_agent(agent_id: str) -> dict:
    """Delete an agent by ID"""
    return tools.delete_agent(agent_id)


@mcp.tool()
def delete_team(team_id: str) -> dict:
    """Delete a team and all its agents"""
    return tools.delete_team(team_id)


if __name__ == "__main__":
    mcp.run()
