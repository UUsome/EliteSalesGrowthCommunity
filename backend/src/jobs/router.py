from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.dependencies import get_current_user
from src.auth.models import User
from src.database import get_db
from src.jobs import schemas, service

router = APIRouter(prefix="/api/jobs", tags=["人才集市"])


@router.get("", response_model=list[schemas.JobResponse])
async def list_jobs(
    job_type: str | None = Query(None, description="职位类型"),
    industry: str | None = Query(None, description="行业"),
    city: str | None = Query(None, description="城市"),
    is_urgent: bool | None = Query(None, description="是否急招"),
    is_referral: bool | None = Query(None, description="是否内推"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """获取职位列表，支持筛选"""
    job_filter = schemas.JobFilter(
        job_type=job_type,
        industry=industry,
        city=city,
        is_urgent=is_urgent,
        is_referral=is_referral,
    )
    jobs = await service.list_jobs(db, job_filter, skip, limit)
    # Add salary_display
    result = []
    for job in jobs:
        resp = schemas.JobResponse.model_validate(job)
        resp.salary_display = service.compute_salary_display(job)
        result.append(resp)
    return result


@router.get("/{job_id}", response_model=schemas.JobResponse)
async def get_job(job_id: int, db: AsyncSession = Depends(get_db)):
    """获取职位详情"""
    job = await service.get_job(db, job_id)
    resp = schemas.JobResponse.model_validate(job)
    resp.salary_display = service.compute_salary_display(job)
    return resp


@router.post("", response_model=schemas.JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    job_in: schemas.JobCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """发布招聘职位"""
    return await service.create_job(db, job_in)


@router.put("/{job_id}", response_model=schemas.JobResponse)
async def update_job(
    job_id: int,
    job_in: schemas.JobUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """更新职位信息"""
    return await service.update_job(db, job_id, job_in)
