from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.dependencies import get_optional_user
from src.content import schemas, service
from src.database import get_db

router = APIRouter(prefix="/api/content", tags=["内容精选"])


@router.get("", response_model=list[schemas.ContentResponse])
async def list_content(
    content_type: str | None = Query(None, description="类型: 销售资料/成功案例/产品更新"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """获取内容列表"""
    return await service.list_content(db, content_type, skip, limit)


@router.get("/{content_id}", response_model=schemas.ContentResponse)
async def get_content(
    content_id: int,
    db: AsyncSession = Depends(get_db),
):
    """获取内容详情"""
    return await service.get_content(db, content_id)


@router.post("", response_model=schemas.ContentResponse, status_code=status.HTTP_201_CREATED)
async def create_content(
    content_in: schemas.ContentCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建内容（管理端）"""
    return await service.create_content(db, content_in)


@router.post("/{content_id}/like", response_model=schemas.ContentResponse)
async def like_content(
    content_id: int,
    db: AsyncSession = Depends(get_db),
):
    """点赞内容"""
    return await service.like_content(db, content_id)
