from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from authlib.integrations.httpx_client import AsyncOAuth2Client
from itsdangerous import URLSafeTimedSerializer, BadSignature
from app.core.config import settings
from app.core.supabase import get_supabase
import time

router = APIRouter()

ADOBE_AUTH_URL = "https://ims-na1.adobelogin.com/ims/authorize/v2"
ADOBE_TOKEN_URL = "https://ims-na1.adobelogin.com/ims/token/v3"
ADOBE_SCOPES = "openid,AdobeID,read_organizations,additional_info.projectedProductContext"

signer = URLSafeTimedSerializer(settings.ADOBE_CLIENT_SECRET or "dev-secret-placeholder")


def _oauth_client() -> AsyncOAuth2Client:
    return AsyncOAuth2Client(
        client_id=settings.ADOBE_CLIENT_ID,
        client_secret=settings.ADOBE_CLIENT_SECRET,
        redirect_uri=settings.ADOBE_REDIRECT_URI,
        scope=ADOBE_SCOPES,
    )


@router.get("/connect/adobe")
async def connect_adobe():
    """Start Adobe OAuth flow — redirect user to Adobe login."""
    if settings.ADOBE_MOCK:
        # Mock mode: skip real OAuth, store fake tokens directly
        sb = get_supabase()
        sb.table("user_connections").upsert({
            "provider": "adobe",
            "access_token": "mock_access_token",
            "refresh_token": "mock_refresh_token",
            "expires_at": int(time.time()) + 3600,
            "scope": ADOBE_SCOPES,
        }, on_conflict="provider").execute()
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/integrations?connected=adobe")

    client = _oauth_client()
    state = signer.dumps("adobe-oauth")
    uri, _ = client.create_authorization_url(ADOBE_AUTH_URL, state=state)
    return RedirectResponse(url=uri)


@router.get("/callback/adobe")
async def callback_adobe(code: str = "", state: str = "", error: str = ""):
    """Handle Adobe OAuth callback — exchange code for tokens and store."""
    if error:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/integrations?error={error}")

    # Verify state to prevent CSRF
    try:
        signer.loads(state, max_age=300)
    except BadSignature:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    client = _oauth_client()
    try:
        tokens = await client.fetch_token(ADOBE_TOKEN_URL, code=code)
    except Exception as e:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/integrations?error=token_exchange_failed")

    sb = get_supabase()
    sb.table("user_connections").upsert({
        "provider": "adobe",
        "access_token": tokens["access_token"],
        "refresh_token": tokens.get("refresh_token", ""),
        "expires_at": int(time.time()) + tokens.get("expires_in", 3600),
        "scope": tokens.get("scope", ADOBE_SCOPES),
    }, on_conflict="provider").execute()

    return RedirectResponse(url=f"{settings.FRONTEND_URL}/integrations?connected=adobe")


@router.get("/connections")
async def list_connections():
    """Return which providers are connected and their status."""
    sb = get_supabase()
    rows = sb.table("user_connections").select("provider,expires_at,scope,connected_at").execute().data
    result = {}
    for row in rows:
        expired = row["expires_at"] and int(time.time()) > row["expires_at"]
        result[row["provider"]] = {
            "connected": True,
            "expired": expired,
            "scope": row.get("scope"),
            "connected_at": row.get("connected_at"),
        }
    return result


@router.delete("/connections/{provider}")
async def disconnect(provider: str):
    """Remove a provider connection."""
    sb = get_supabase()
    sb.table("user_connections").delete().eq("provider", provider).execute()
    return {"disconnected": provider}
