from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from anthropic import AsyncAnthropic
from app.schemas import ChatRequest, ChatResponse, ChatMessage, MessageRole
from app.core.supabase import get_supabase
from app.core.config import settings
import json

router = APIRouter()
anthropic = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)


def build_system_prompt(agent: dict, team: dict) -> str:
    return f"""You are {agent['name']}, an enterprise AI agent with the role of {agent['role']}{', specializing in ' + agent['specialty'] if agent.get('specialty') else ''}. You work in the "{team.get('name', 'General')}" team (field: {team.get('field', 'General')}).

You are precise, technical, and direct. You help your team with engineering tasks, analysis, code review, architecture decisions, and technical guidance. Respond in character as a specialized technical agent. Keep responses concise and actionable. Use markdown for code or structured output when appropriate.

You have awareness that you are part of a larger Agent Garden — a network of specialized AI agents organized into teams. You may collaborate with other agents in the future."""


@router.get("/{agent_id}/history")
async def get_history(agent_id: str):
    sb = get_supabase()
    res = sb.table("messages") \
        .select("*") \
        .eq("agent_id", agent_id) \
        .order("created_at") \
        .execute()
    return res.data


@router.post("/", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    sb = get_supabase()

    # Fetch agent
    agent_res = sb.table("agents").select("*").eq("id", str(payload.agent_id)).single().execute()
    if not agent_res.data:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent = agent_res.data

    # Fetch team
    team_res = sb.table("teams").select("*").eq("id", agent["team_id"]).single().execute()
    team = team_res.data or {}

    # Fetch message history
    history_res = sb.table("messages") \
        .select("role, content") \
        .eq("agent_id", str(payload.agent_id)) \
        .order("created_at") \
        .execute()
    history = history_res.data or []

    # Store user message
    sb.table("messages").insert({
        "agent_id": str(payload.agent_id),
        "role": "user",
        "content": payload.message,
    }).execute()

    # Update agent status
    sb.table("agents").update({"status": "thinking"}).eq("id", str(payload.agent_id)).execute()

    # Build messages for Claude
    messages = [{"role": m["role"], "content": m["content"]} for m in history]
    messages.append({"role": "user", "content": payload.message})

    try:
        response = await anthropic.messages.create(
            model=settings.CLAUDE_MODEL,
            max_tokens=1024,
            system=build_system_prompt(agent, team),
            messages=messages,
        )
        reply = response.content[0].text
        usage = {"input_tokens": response.usage.input_tokens, "output_tokens": response.usage.output_tokens}

        # Store assistant reply
        sb.table("messages").insert({
            "agent_id": str(payload.agent_id),
            "role": "assistant",
            "content": reply,
        }).execute()

        # Update agent status
        sb.table("agents").update({"status": "done"}).eq("id", str(payload.agent_id)).execute()

        return ChatResponse(
            agent_id=payload.agent_id,
            message=ChatMessage(role=MessageRole.assistant, content=reply),
            usage=usage,
        )

    except Exception as e:
        sb.table("agents").update({"status": "error"}).eq("id", str(payload.agent_id)).execute()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{agent_id}/history", status_code=204)
async def clear_history(agent_id: str):
    sb = get_supabase()
    sb.table("messages").delete().eq("agent_id", agent_id).execute()
    sb.table("agents").update({"status": "idle"}).eq("id", agent_id).execute()
