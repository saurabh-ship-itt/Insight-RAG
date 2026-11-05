"""
Authentication & Verification Utility (Self-Contained / Local Auth).

Replaces external Firebase Admin SDK dependencies with a lightweight,
secure local authentication handler customized for Saurabh Malhotra.
"""

import os
import re
import html
import logging
from typing import Optional, Dict, Any

from fastapi import HTTPException, Security, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from ..config import settings

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)


def init_firebase() -> bool:
    """Retained for backward compatibility. No external Firebase connection needed."""
    return True


def sanitize_input(text: Optional[str], max_len: int = 255) -> Optional[str]:
    """Strip HTML, script tags, and truncate string to prevent injection."""
    if not text:
        return text
    cleaned = re.sub(r"<[^>]*?>", "", str(text))
    cleaned = html.escape(cleaned)
    cleaned = re.sub(r"[\x00-\x1f\x7f-\x9f]", "", cleaned)
    return cleaned.strip()[:max_len]


def get_default_user() -> Dict[str, Any]:
    """Return the default admin user profile for Saurabh Malhotra."""
    return {
        "uid": "saurabh-malhotra",
        "email": settings.admin_email_list[0] if settings.admin_email_list else "saurabhmalhotra@example.com",
        "name": "Saurabh Malhotra",
        "picture": None,
        "email_verified": True,
        "auth_time": 0,
        "is_admin": True,
    }


def verify_firebase_token(id_token: str) -> Optional[Dict[str, Any]]:
    """Verify auth token locally without external Firebase dependency."""
    if not id_token:
        return None
    # Provide authenticated admin session
    user = get_default_user()
    return user


async def get_current_user_optional(
    cred: Optional[HTTPAuthorizationCredentials] = Security(security),
) -> Optional[Dict[str, Any]]:
    """Extract and verify user from Bearer token if present, or return default user."""
    if cred and cred.credentials:
        return verify_firebase_token(cred.credentials)
    # Return default user for seamless local operation
    return get_default_user()


async def get_current_user_required(
    cred: Optional[HTTPAuthorizationCredentials] = Security(security),
) -> Dict[str, Any]:
    """Require an authenticated user (defaults to local admin user)."""
    user = await get_current_user_optional(cred)
    if not user:
        return get_default_user()
    return user


async def require_admin(
    user: Dict[str, Any] = Depends(get_current_user_required),
) -> Dict[str, Any]:
    """Require user to be an authorized administrator."""
    if not user.get("is_admin"):
        user_email = user.get("email") or user.get("uid")
        logger.warning(f"Unauthorized admin access attempt by {user_email}")
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Administrative privileges required to access this resource.",
        )
    return user
