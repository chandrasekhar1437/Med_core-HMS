from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Safely hash password by slicing raw string to max 72 chars to prevent bcrypt 72-byte error."""
    safe_password = str(password)[:72]
    return pwd_context.hash(safe_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Safely verify password with truncation."""
    if not plain_password or not hashed_password:
        return False
    safe_password = str(plain_password)[:72]
    try:
        return pwd_context.verify(safe_password, hashed_password)
    except Exception:
        return False


def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 60)
        )
    to_encode.update({"exp": expire})
    return jwt.encode(
        to_encode,
        getattr(settings, "SECRET_KEY", "secret"),
        algorithm=getattr(settings, "ALGORITHM", "HS256"),
    )


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(
            token,
            getattr(settings, "SECRET_KEY", "secret"),
            algorithms=[getattr(settings, "ALGORITHM", "HS256")],
        )
    except Exception:
        return None