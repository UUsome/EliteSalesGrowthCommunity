from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth import service
from src.auth.models import User
from src.database import get_db
from src.shared.exceptions import Unauthorized

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = service.decode_token(token)
    if payload is None:
        raise Unauthorized("无效的认证凭证")

    user_id = payload.get("sub")
    if user_id is None:
        raise Unauthorized("无效的认证凭证")

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise Unauthorized("用户不存在或已禁用")

    return user


async def get_optional_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if token is None:
        return None
    try:
        return await get_current_user(token, db)
    except Unauthorized:
        return None
