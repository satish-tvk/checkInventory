"""
Password hashing and JWT token utilities.
"""
from datetime import datetime, timedelta

from jose import jwt
from passlib.context import CryptContext

SECRET_KEY = "onestopsmb-secret-key-change-in-production"
ALGORITHM  = "HS256"
EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(user_id: int, username: str) -> str:
    expire  = datetime.utcnow() + timedelta(days=EXPIRE_DAYS)
    payload = {"sub": str(user_id), "username": username, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
