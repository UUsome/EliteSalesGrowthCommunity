from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.dependencies import get_current_user
from src.auth.models import User
from src.database import get_db
from src.experts import schemas, service

router = APIRouter(prefix="/api/experts", tags=["销售智库"])


@router.get("", response_model=list[schemas.ExpertListResponse])
async def list_experts(
    field: str | None = Query(None, description="按领域筛选"),
    price_min: float | None = Query(None, ge=0, description="最低价格"),
    price_max: float | None = Query(None, ge=0, description="最高价格"),
    rating_min: float | None = Query(None, ge=0, le=5.0, description="最低评分"),
    sort_by: str | None = Query(None, description="排序: recommended|rating|price_asc|price_desc|most_active"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """获取专家列表，支持筛选和排序"""
    expert_filter = schemas.ExpertFilter(
        field=field,
        price_min=price_min,
        price_max=price_max,
        rating_min=rating_min,
        sort_by=sort_by,
    )
    return await service.list_experts(db, expert_filter, skip, limit)


@router.get("/{expert_id}", response_model=schemas.ExpertResponse)
async def get_expert(expert_id: int, db: AsyncSession = Depends(get_db)):
    """获取专家详情，包含案例和可预约时间"""
    return await service.get_expert(db, expert_id)


@router.post("", response_model=schemas.ExpertListResponse, status_code=status.HTTP_201_CREATED)
async def create_expert(
    expert_in: schemas.ExpertCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """注册成为专家"""
    expert_in.user_id = current_user.id
    return await service.create_expert(db, expert_in)


@router.put("/{expert_id}", response_model=schemas.ExpertListResponse)
async def update_expert(
    expert_id: int,
    expert_in: schemas.ExpertUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """更新专家信息"""
    expert = await service.get_expert(db, expert_id)
    if expert.user_id != current_user.id:
        from src.shared.exceptions import Forbidden
        raise Forbidden("只能修改自己的专家信息")

    for field, value in expert_in.model_dump(exclude_unset=True).items():
        setattr(expert, field, value)
    await db.commit()
    await db.refresh(expert)
    return expert


# --- Expert Cases ---
@router.post("/{expert_id}/cases", response_model=schemas.ExpertCaseResponse,
             status_code=status.HTTP_201_CREATED)
async def add_case(
    expert_id: int,
    case_in: schemas.ExpertCaseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """添加代表案例"""
    expert = await service.get_expert(db, expert_id)
    if expert.user_id != current_user.id:
        from src.shared.exceptions import Forbidden
        raise Forbidden("只能为自己的专家账号添加案例")
    return await service.add_case(db, expert_id, case_in.title,
                                  case_in.description, case_in.images)


# --- Expert Availabilities ---
@router.post("/{expert_id}/availabilities", response_model=schemas.ExpertAvailabilityResponse,
             status_code=status.HTTP_201_CREATED)
async def add_availability(
    expert_id: int,
    av_in: schemas.ExpertAvailabilityCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """添加可预约时间"""
    expert = await service.get_expert(db, expert_id)
    if expert.user_id != current_user.id:
        from src.shared.exceptions import Forbidden
        raise Forbidden("只能为自己的专家账号添加可预约时间")
    return await service.add_availability(db, expert_id, av_in.day_of_week,
                                          av_in.start_time, av_in.end_time)
