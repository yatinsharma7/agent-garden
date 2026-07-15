from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from anthropic import AsyncAnthropic
from app.schemas import ChatRequest, ChatResponse, ChatMessage, MessageRole
from app.core.supabase import get_supabase
from app.core.config import settings
from app.core.tools import TOOL_DEFINITIONS, execute_tool
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
        total_usage = {"input_tokens": 0, "output_tokens": 0}
        tools_used = []
        reply = None

        # Agentic loop — keep calling Claude until it gives a final text response
        while True:
            response = await anthropic.messages.create(
                model=settings.CLAUDE_MODEL,
                max_tokens=1024,
                system=build_system_prompt(agent, team),
                messages=messages,
                tools=TOOL_DEFINITIONS,
            )

            total_usage["input_tokens"] += response.usage.input_tokens
            total_usage["output_tokens"] += response.usage.output_tokens

            # Claude finished with a text response — done
            if response.stop_reason == "end_turn":
                reply = next(b.text for b in response.content if hasattr(b, "text"))
                break

            # Claude wants to call a tool
            if response.stop_reason == "tool_use":
                # Add Claude's response to messages
                messages.append({"role": "assistant", "content": response.content})

                # Execute each tool Claude requested and collect results
                tool_results = []
                for block in response.content:
                    if block.type == "tool_use":
                        tools_used.append(block.name)
                        result = execute_tool(block.name, block.input)
                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": result,
                        })

                # Send tool results back to Claude
                messages.append({"role": "user", "content": tool_results})
                continue

            # Unexpected stop reason
            break

        usage = total_usage

        # Only store reply and update status if agent still exists
        agent_still_exists = sb.table("agents").select("id").eq("id", str(payload.agent_id)).execute().data
        if agent_still_exists:
            sb.table("messages").insert({
                "agent_id": str(payload.agent_id),
                "role": "assistant",
                "content": reply,
            }).execute()
            sb.table("agents").update({"status": "done"}).eq("id", str(payload.agent_id)).execute()

        return ChatResponse(
            agent_id=payload.agent_id,
            message=ChatMessage(role=MessageRole.assistant, content=reply),
            usage=usage,
            tools_used=tools_used,
        )

    except Exception as e:
        sb.table("agents").update({"status": "error"}).eq("id", str(payload.agent_id)).execute()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{agent_id}/history", status_code=204)
async def clear_history(agent_id: str):
    sb = get_supabase()
    sb.table("messages").delete().eq("agent_id", agent_id).execute()
    sb.table("agents").update({"status": "idle"}).eq("id", agent_id).execute()
