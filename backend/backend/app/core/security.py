from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

# Initialize CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _truncate_password(password: str) -> str:
    """Safely truncate password to maximum 72 bytes for bcrypt compatibility."""
    if not password:
        return ""
    # Encode string to UTF-8, slice first 72 bytes, and decode safely back
    password_bytes = str(password).encode("utf-8")[:72]
    return password_bytes.decode("utf-8", errors="ignore")


def hash_password(password: str) -> str:
    """Hashes a plain text password safely with bcrypt truncation."""
    safe_pwd = _truncate_password(password)
    return pwd_context.hash(safe_pwd)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against a hashed password safely."""
    if not plain_password or not hashed_password:
        return False
    safe_pwd = _truncate_password(plain_password)
    try:
        return pwd_context.verify(safe_pwd, hashed_password)
    except Exception:
        return False


def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    """Generates a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 60)
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        getattr(settings, "SECRET_KEY", "secret"),
        algorithm=getattr(settings, "ALGORITHM", "HS256"),
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT access token."""
    try:
        payload = jwt.decode(
            token,
            getattr(settings, "SECRET_KEY", "secret"),
            algorithms=[getattr(settings, "ALGORITHM", "HS256")],
        )
        return payload
    except Exception:
        return None