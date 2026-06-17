from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.content.models import SalesContent
from src.discovery.schemas import (
    DiscoveryResponse, HotDiscussionItem, ExpertCard,
    HotJobItem, ContentItem,
)
from src.experts.models import Expert
from src.jobs.models import Job
from src.jobs.service import compute_salary_display
from src.posts.models import Post
from src.database import get_db

router = APIRouter(prefix="/api/discovery", tags=["发现首页"])


@router.get("", response_model=DiscoveryResponse)
async def get_discovery(db: AsyncSession = Depends(get_db)):
    """获取发现首页聚合数据 — 热门销售问题替换为行业动态前排帖子"""

    # 1. Hot discussions from 行业动态 posts (replaces old hot questions)
    d_result = await db.execute(
        select(Post).where(Post.category == "行业动态")
        .order_by(Post.view_count.desc(), Post.like_count.desc())
        .limit(4)
    )
    hot_discussions = [
        HotDiscussionItem(
            id=p.id, title=p.title, category=p.category,
            like_count=p.like_count or 0, comment_count=p.comment_count or 0,
        )
        for p in d_result.scalars().all()
    ]

    # 2. Expert picks (top 6)
    e_result = await db.execute(
        select(Expert).where(Expert.is_active == True)
        .order_by(Expert.rating.desc(), Expert.consultation_count.desc())
        .limit(6)
    )
    expert_picks = [
        ExpertCard(
            id=e.id, name=e.name, avatar_url=e.avatar_url,
            field=e.field, one_liner=e.one_liner,
            rating=e.rating, price=e.price,
        )
        for e in e_result.scalars().all()
    ]

    # 3. Hot jobs (top 5)
    j_result = await db.execute(
        select(Job).where(Job.is_active == True)
        .order_by(Job.is_urgent.desc(), Job.created_at.desc())
        .limit(5)
    )
    hot_jobs = [
        HotJobItem(
            id=j.id, title=j.title, company_name=j.company_name,
            location=j.location, salary_display=compute_salary_display(j),
            is_referral=j.is_referral, is_urgent=j.is_urgent,
        )
        for j in j_result.scalars().all()
    ]

    # 4. Featured content (top 6)
    c_result = await db.execute(
        select(SalesContent).where(SalesContent.is_active == True)
        .order_by(SalesContent.created_at.desc())
        .limit(6)
    )
    featured_content = [
        ContentItem(
            id=c.id, title=c.title, content_type=c.content_type,
            summary=c.summary, cover_image=c.cover_image,
        )
        for c in c_result.scalars().all()
    ]

    # 5. Essence posts (top 3, replaces old hot discussions position)
    essence_result = await db.execute(
        select(Post).where(Post.is_essence == True)
        .order_by(Post.like_count.desc(), Post.comment_count.desc())
        .limit(3)
    )
    essence_discussions = [
        HotDiscussionItem(
            id=p.id, title=p.title, category=p.category,
            like_count=p.like_count or 0, comment_count=p.comment_count or 0,
        )
        for p in essence_result.scalars().all()
    ]

    return DiscoveryResponse(
        hot_discussions=hot_discussions,
        expert_picks=expert_picks,
        hot_jobs=hot_jobs,
        featured_content=featured_content,
        essence_discussions=essence_discussions,
    )
