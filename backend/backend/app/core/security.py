from datetime import datetime, timedelta
from typing import Any, Dict, Optional
import bcrypt
from jose import jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    """Hashes a password using bcrypt directly with explicit 72-byte truncation."""
    # Convert string to bytes and truncate to maximum 72 bytes
    pwd_bytes = str(password).encode("utf-8")[:72]
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against a bcrypt hash."""
    if not plain_password or not hashed_password:
        return False
    try:
        pwd_bytes = str(plain_password).encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    """Creates a JWT access token."""
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
    """Decodes a JWT access token."""
    try:
        return jwt.decode(
            token,
            getattr(settings, "SECRET_KEY", "secret"),
            algorithms=[getattr(settings, "ALGORITHM", "HS256")],
        )
    except Exception:
        return None