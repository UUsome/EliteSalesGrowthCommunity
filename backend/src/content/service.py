from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.content.models import SalesContent
from src.shared.exceptions import NotFound


async def list_content(
    db: AsyncSession,
    content_type: str | None = None,
    skip: int = 0,
    limit: int = 20,
) -> list[SalesContent]:
    query = select(SalesContent).where(SalesContent.is_active == True)

    if content_type:
        query = query.where(SalesContent.content_type == content_type)

    query = query.order_by(SalesContent.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def get_content(db: AsyncSession, content_id: int) -> SalesContent:
    result = await db.execute(
        select(SalesContent).where(
            SalesContent.id == content_id, SalesContent.is_active == True
        )
    )
    content = result.scalar_one_or_none()
    if not content:
        raise NotFound("内容不存在")

    content.view_count = (content.view_count or 0) + 1
    await db.commit()
    await db.refresh(content)
    return content


async def create_content(db: AsyncSession, content_in) -> SalesContent:
    content = SalesContent(**content_in.model_dump())
    db.add(content)
    await db.commit()
    await db.refresh(content)
    return content


async def like_content(db: AsyncSession, content_id: int) -> SalesContent:
    content = await get_content(db, content_id)
    content.like_count = (content.like_count or 0) + 1
    await db.commit()
    await db.refresh(content)
    return content
