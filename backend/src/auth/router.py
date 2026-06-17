from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth import schemas, service
from src.auth.dependencies import get_current_user
from src.auth.models import User
from src.database import get_db
from src.shared.exceptions import BadRequest

router = APIRouter(prefix="/api/auth", tags=["认证"])


@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    """用户注册"""
    return await service.create_user(db, user_in)


@router.post("/login", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """用户登录，返回 JWT Token"""
    result = await db.execute(
        select(User).where(
            (User.username == form_data.username) | (User.phone == form_data.username)
        )
    )
    user = result.scalar_one_or_none()

    if not user or not service.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名/手机号或密码错误",
        )

    access_token = service.create_access_token(data={"sub": str(user.id)})
    return schemas.Token(access_token=access_token)


@router.get("/me", response_model=schemas.UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """获取当前登录用户信息"""
    return current_user


@router.put("/me", response_model=schemas.UserResponse)
async def update_profile(
    profile: schemas.UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """更新个人信息"""
    if profile.username is not None:
        existing = await db.execute(
            select(User).where(
                User.username == profile.username, User.id != current_user.id
            )
        )
        if existing.scalar_one_or_none():
            raise BadRequest("用户名已被使用")
        current_user.username = profile.username

    if profile.phone is not None:
        existing = await db.execute(
            select(User).where(
                User.phone == profile.phone, User.id != current_user.id
            )
        )
        if existing.scalar_one_or_none():
            raise BadRequest("手机号已被使用")
        current_user.phone = profile.phone

    if profile.avatar_url is not None:
        current_user.avatar_url = profile.avatar_url

    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/sms/send")
async def send_sms(
    req: schemas.PasswordResetRequest,
    db: AsyncSession = Depends(get_db),
):
    """发送短信验证码"""
    code = await service.request_sms_code(db, req.phone)
    return {"message": "验证码已发送", "debug_code": code}


@router.post("/password/reset", response_model=schemas.UserResponse)
async def reset_password(
    req: schemas.PasswordReset,
    db: AsyncSession = Depends(get_db),
):
    """通过短信验证码重置密码"""
    valid = await service.verify_sms_code(db, req.phone, req.sms_code)
    if not valid:
        raise BadRequest("验证码无效或已过期")
    return await service.reset_password(db, req.phone, req.new_password)
