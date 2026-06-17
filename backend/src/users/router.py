from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.dependencies import get_current_user
from src.auth.models import User
from src.database import get_db
from src.users import schemas, service

router = APIRouter(prefix="/api/users", tags=["个人中心"])


# --- Dashboard ---
@router.get("/dashboard", response_model=schemas.DashboardResponse)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取个人中心仪表盘数据"""
    return await service.get_dashboard(db, current_user.id)


# --- Questions (my questions) ---
@router.get("/questions", response_model=list[schemas.QuestionResponse])
async def list_my_questions(
    status: str | None = Query(None, description="筛选: pending/resolved"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取我的提问列表"""
    from src.users.models import Question
    query = select(Question).where(Question.user_id == current_user.id)
    if status:
        query = query.where(Question.status == status)
    query = query.order_by(Question.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/answers", response_model=list[schemas.AnswerResponse])
async def list_my_answers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取我的回答列表"""
    from src.users.models import Answer
    result = await db.execute(
        select(Answer).where(Answer.user_id == current_user.id)
        .order_by(Answer.created_at.desc())
    )
    return result.scalars().all()


# --- Favorites ---
@router.get("/favorites", response_model=list[schemas.FavoriteResponse])
async def list_favorites(
    target_type: str | None = Query(None, description="筛选: question/expert/post/content"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取我的收藏列表"""
    return await service.list_favorites(db, current_user.id, target_type, skip, limit)


@router.post("/favorites", response_model=schemas.FavoriteResponse | None)
async def toggle_favorite(
    fav_in: schemas.FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """切换收藏/取消收藏"""
    return await service.toggle_favorite(
        db, current_user.id, fav_in.target_type, fav_in.target_id
    )


# --- Notifications ---
@router.get("/notifications", response_model=list[schemas.NotificationResponse])
async def list_notifications(
    unread_only: bool = Query(False, description="仅未读"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取通知列表"""
    return await service.get_notifications(db, current_user.id, unread_only, skip, limit)


@router.put("/notifications/{notification_id}/read", response_model=schemas.NotificationResponse)
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """标记单个通知为已读"""
    return await service.mark_notification_read(db, notification_id, current_user.id)


@router.put("/notifications/read-all")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """标记所有通知为已读"""
    count = await service.mark_all_read(db, current_user.id)
    return {"message": f"已标记 {count} 条通知为已读"}
