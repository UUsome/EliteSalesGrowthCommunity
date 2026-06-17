from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.experts.models import Expert, ExpertCase, ExpertAvailability
from src.experts.schemas import ExpertCreate, ExpertFilter
from src.shared.exceptions import NotFound, BadRequest


async def list_experts(
    db: AsyncSession,
    filters: ExpertFilter | None = None,
    skip: int = 0,
    limit: int = 20,
) -> list[Expert]:
    query = select(Expert).where(Expert.is_active == True)

    if filters:
        if filters.field:
            query = query.where(Expert.field == filters.field)
        if filters.price_min is not None:
            query = query.where(Expert.price >= filters.price_min)
        if filters.price_max is not None:
            query = query.where(Expert.price <= filters.price_max)
        if filters.rating_min is not None:
            query = query.where(Expert.rating >= filters.rating_min)

        if filters.sort_by == "rating":
            query = query.order_by(Expert.rating.desc())
        elif filters.sort_by == "price_asc":
            query = query.order_by(Expert.price.asc())
        elif filters.sort_by == "price_desc":
            query = query.order_by(Expert.price.desc())
        elif filters.sort_by == "most_active":
            query = query.order_by(Expert.consultation_count.desc())
        else:
            query = query.order_by(Expert.rating.desc(), Expert.consultation_count.desc())
    else:
        query = query.order_by(Expert.rating.desc(), Expert.consultation_count.desc())

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def get_expert(db: AsyncSession, expert_id: int) -> Expert:
    result = await db.execute(
        select(Expert).where(Expert.id == expert_id, Expert.is_active == True)
    )
    expert = result.scalar_one_or_none()
    if not expert:
        raise NotFound("专家不存在")
    return expert


async def create_expert(db: AsyncSession, expert_in: ExpertCreate) -> Expert:
    existing = await db.execute(
        select(Expert).where(Expert.user_id == expert_in.user_id)
    )
    if existing.scalar_one_or_none():
        raise BadRequest("该用户已经是专家")

    expert = Expert(**expert_in.model_dump())
    db.add(expert)
    await db.commit()
    await db.refresh(expert)
    return expert


async def add_case(db: AsyncSession, expert_id: int, title: str,
                   description: str | None, images: list[str]) -> ExpertCase:
    await get_expert(db, expert_id)  # verify expert exists
    case = ExpertCase(
        expert_id=expert_id,
        title=title,
        description=description,
        images=images,
    )
    db.add(case)
    await db.commit()
    await db.refresh(case)
    return case


async def add_availability(
    db: AsyncSession, expert_id: int, day_of_week: int,
    start_time: str, end_time: str,
) -> ExpertAvailability:
    await get_expert(db, expert_id)  # verify expert exists
    av = ExpertAvailability(
        expert_id=expert_id,
        day_of_week=day_of_week,
        start_time=start_time,
        end_time=end_time,
    )
    db.add(av)
    await db.commit()
    await db.refresh(av)
    return av
