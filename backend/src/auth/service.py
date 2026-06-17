import random
from datetime import datetime, timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.models import SmsCode, User
from src.auth.schemas import UserCreate
from src.config import settings
from src.shared.exceptions import BadRequest

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except JWTError:
        return None


def generate_sms_code() -> str:
    return f"{random.randint(100000, 999999)}"


async def send_sms(phone: str, code: str) -> None:
    # TODO: Integrate with real SMS provider (e.g. Alibaba Cloud SMS, Tencent Cloud SMS)
    # For now, just log to console
    print(f"[SMS] Sent code {code} to {phone}")


async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    existing = await db.execute(
        select(User).where(
            (User.username == user_in.username) | (User.phone == user_in.phone)
        )
    )
    if existing.scalar_one_or_none():
        raise BadRequest("用户名或手机号已注册")

    user = User(
        username=user_in.username,
        phone=user_in.phone,
        hashed_password=hash_password(user_in.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def request_sms_code(db: AsyncSession, phone: str) -> str:
    # Rate limit: check last code sent within 60 seconds
    one_min_ago = datetime.utcnow() - timedelta(minutes=1)
    result = await db.execute(
        select(SmsCode).where(
            SmsCode.phone == phone,
            SmsCode.created_at > one_min_ago,
            SmsCode.is_used == False,
        )
    )
    recent = result.scalar_one_or_none()
    if recent:
        raise BadRequest("请60秒后再获取验证码")

    code = generate_sms_code()
    sms = SmsCode(
        phone=phone,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=5),
    )
    db.add(sms)
    await db.commit()

    await send_sms(phone, code)
    return code


async def verify_sms_code(db: AsyncSession, phone: str, code: str) -> bool:
    result = await db.execute(
        select(SmsCode).where(
            SmsCode.phone == phone,
            SmsCode.code == code,
            SmsCode.is_used == False,
            SmsCode.expires_at > datetime.utcnow(),
        ).order_by(SmsCode.created_at.desc())
    )
    sms = result.scalar_one_or_none()
    if not sms:
        return False
    sms.is_used = True
    await db.commit()
    return True


async def reset_password(db: AsyncSession, phone: str, new_password: str) -> User:
    result = await db.execute(select(User).where(User.phone == phone))
    user = result.scalar_one_or_none()
    if not user:
        raise BadRequest("用户不存在")

    user.hashed_password = hash_password(new_password)
    await db.commit()
    await db.refresh(user)
    return user
