from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.jobs.models import Job
from src.jobs.schemas import JobFilter
from src.shared.exceptions import NotFound


def compute_salary_display(job: Job) -> str | None:
    if job.salary_min and job.salary_max:
        return f"{job.salary_min // 1000}K-{job.salary_max // 1000}K"
    elif job.salary_min:
        return f"{job.salary_min // 1000}K起"
    elif job.salary_max:
        return f"最高{job.salary_max // 1000}K"
    return None


async def list_jobs(
    db: AsyncSession,
    filters: JobFilter | None = None,
    skip: int = 0,
    limit: int = 20,
) -> list[Job]:
    query = select(Job).where(Job.is_active == True)

    if filters:
        if filters.job_type:
            query = query.where(Job.job_type == filters.job_type)
        if filters.industry:
            query = query.where(Job.industry == filters.industry)
        if filters.city:
            query = query.where(Job.location.contains(filters.city))
        if filters.is_urgent is not None:
            query = query.where(Job.is_urgent == filters.is_urgent)
        if filters.is_referral is not None:
            query = query.where(Job.is_referral == filters.is_referral)

    query = query.order_by(
        Job.is_urgent.desc(),
        Job.created_at.desc(),
    ).offset(skip).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()


async def get_job(db: AsyncSession, job_id: int) -> Job:
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.is_active == True)
    )
    job = result.scalar_one_or_none()
    if not job:
        raise NotFound("职位不存在")
    return job


async def create_job(db: AsyncSession, job_in) -> Job:
    job = Job(**job_in.model_dump())
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job


async def update_job(db: AsyncSession, job_id: int, job_in) -> Job:
    job = await get_job(db, job_id)
    for field, value in job_in.model_dump(exclude_unset=True).items():
        setattr(job, field, value)
    await db.commit()
    await db.refresh(job)
    return job
