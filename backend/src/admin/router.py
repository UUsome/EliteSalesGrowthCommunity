from datetime import datetime

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.auth.dependencies import get_current_user
from src.auth.models import User
from src.auth.service import hash_password
from src.admin.models import SiteSettings
from src.admin.schemas import SiteSettingResponse, SiteSettingUpdate
from src.admin.schemas_admin import (
    UserAdminResponse, UserAdminUpdate, UserAdminCreate,
)
from src.shared.exceptions import Unauthorized, NotFound, BadRequest
from src.experts.models import Expert, ExpertCase, ExpertAvailability
from src.jobs.models import Job, JobContact
from src.posts.models import Post, Comment
from src.content.models import SalesContent

router = APIRouter(prefix="/api/admin", tags=["后台管理"])


# ─── Admin Auth ───────────────────────────────────────
async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not getattr(current_user, "is_superuser", False):
        raise Unauthorized("需要管理员权限")
    return current_user


# ═══════════════════════════════════════════════════════
#  DASHBOARD
# ═══════════════════════════════════════════════════════
@router.get("/dashboard")
async def admin_dashboard(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    tables = [
        ("users", User), ("experts", Expert), ("jobs", Job),
        ("posts", Post), ("content", SalesContent),
    ]
    result = {}
    for name, model_cls in tables:
        cnt = await db.execute(select(func.count()).select_from(model_cls))
        result[name] = cnt.scalar() or 0
    return result


# ═══════════════════════════════════════════════════════
#  HELPERS
# ═══════════════════════════════════════════════════════

# async def _list_entities(db, model, skip, limit, order_field, search_config=None):
#     q = select(model)
#     if search_config and search_config.get("value"):
#         col = getattr(model, search_config["field"], None)
#         if col:
#             q = q.where(col.ilike(f"%{search_config['value']}%"))
#     q = q.order_by(order_field.desc()).offset(skip).limit(limit)
#     total_q = select(func.count()).select_from(model)
#     if search_config and search_config.get("value"):
#         col = getattr(model, search_config["field"], None)
#         if col:
#             total_q = total_q.where(col.ilike(f"%{search_config['value']}%"))
#     items_result = await db.execute(q)
#     total_result = await db.execute(total_q)
#     return items_result.scalars().all(), total_result.scalar() or 0

# 修复这个函数导致的admin/jobs没数据
async def _list_entities(db, model, skip, limit, order_field, search_config=None):
    q = select(model)
    if search_config and search_config.get("value"):
        col = getattr(model, search_config["field"], None)
        if col:
            q = q.where(col.ilike(f"%{search_config['value']}%"))
    q = q.order_by(order_field.desc()).offset(skip).limit(limit)

    total_q = select(func.count()).select_from(model)
    if search_config and search_config.get("value"):
        col = getattr(model, search_config["field"], None)
        if col:
            total_q = total_q.where(col.ilike(f"%{search_config['value']}%"))

    items_result = await db.execute(q)
    total_result = await db.execute(total_q)

    orm_items = items_result.scalars().all()

    # ✅ 核心修复：把 ORM 对象转为纯字典，切断 relationship 循环引用
    serialized = []
    for item in orm_items:
        d = {}
        for col in item.__table__.columns:
            val = getattr(item, col.name)
            # 处理 datetime → ISO 字符串
            if isinstance(val, datetime):
                val = val.isoformat()
            d[col.name] = val
        serialized.append(d)

    return serialized, total_result.scalar() or 0

async def _get_entity(db, model, entity_id, msg="记录不存在"):
    r = await db.execute(select(model).where(model.id == entity_id))
    obj = r.scalar_one_or_none()
    if not obj:
        raise NotFound(msg)
    return obj


async def _soft_delete(db, model, entity_id, msg="记录不存在"):
    """软删除：设置 is_active=0"""
    obj = await _get_entity(db, model, entity_id, msg)
    obj.is_active = False
    await db.commit()
    await db.refresh(obj)
    return obj


async def _toggle_active(db, model, entity_id, is_active: bool, msg="记录不存在"):
    """切换显示/隐藏"""
    obj = await _get_entity(db, model, entity_id, msg)
    obj.is_active = is_active
    await db.commit()
    await db.refresh(obj)
    return obj


async def _update_from_dict(db, obj, data: dict, allowed: set):
    for key, value in data.items():
        if key in allowed:
            setattr(obj, key, value)
    await db.commit()
    await db.refresh(obj)
    return obj


# ═══════════════════════════════════════════════════════
#  USERS
# ═══════════════════════════════════════════════════════
@router.get("/users", response_model=list[UserAdminResponse])
async def list_users(
    skip: int = Query(0, ge=0), limit: int = Query(20, le=200),
    search: str | None = None,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    q = select(User).order_by(User.id.desc())
    if search:
        q = q.where(User.username.ilike(f"%{search}%") | User.phone.ilike(f"%{search}%"))
    q = q.offset(skip).limit(limit)
    r = await db.execute(q)
    return r.scalars().all()


@router.get("/users/{user_id}", response_model=UserAdminResponse)
async def get_user(user_id: int, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    return await _get_entity(db, User, user_id, "用户不存在")


@router.post("/users", response_model=UserAdminResponse, status_code=201)
async def create_user(
    data: UserAdminCreate, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    r = await db.execute(select(User).where((User.username == data.username) | (User.phone == data.phone)))
    if r.scalar_one_or_none():
        raise BadRequest("用户名或手机号已存在")
    user = User(username=data.username, phone=data.phone,
                hashed_password=hash_password(data.password),
                is_active=data.is_active, is_superuser=data.is_superuser)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.put("/users/{user_id}", response_model=UserAdminResponse)
async def update_user(user_id: int, data: UserAdminUpdate,
                      admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    obj = await _get_entity(db, User, user_id, "用户不存在")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: int, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    obj = await _get_entity(db, User, user_id, "用户不存在")
    await db.delete(obj)
    await db.commit()


# ═══════════════════════════════════════════════════════
#  EXPERTS  —— 软删除 + 显示/隐藏
# ═══════════════════════════════════════════════════════
@router.get("/experts")
async def list_experts_admin(
    skip: int = Query(0, ge=0), limit: int = Query(20, le=200), search: str | None = None,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    items, total = await _list_entities(db, Expert, skip, limit, Expert.id,
                                        {"value": search, "field": "name"})
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.put("/experts/{entity_id}")
async def update_expert(
    entity_id: int, data: dict,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    allowed = {"name", "field", "one_liner", "description", "experience_years",
               "price", "rating", "response_rate", "is_active", "avatar_url"}
    return await _update_from_dict(db, await _get_entity(db, Expert, entity_id), data, allowed)


@router.put("/experts/{entity_id}/toggle")
async def toggle_expert_active(
    entity_id: int, data: dict,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    """切换专家显示/隐藏"""
    return await _toggle_active(db, Expert, entity_id, data.get("is_active", False))


@router.delete("/experts/{entity_id}", status_code=200)
async def soft_delete_expert(
    entity_id: int,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    """软删除：设置 is_active=0"""
    await _soft_delete(db, Expert, entity_id)
    return {"id": entity_id, "is_active": False}


# ═══════════════════════════════════════════════════════
#  JOBS  —— 全字段编辑 + 软删除 + contact_id
# ═══════════════════════════════════════════════════════
@router.get("/jobs")
async def list_jobs_admin(
    skip: int = Query(0, ge=0), limit: int = Query(20, le=200), search: str | None = None,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    items, total = await _list_entities(db, Job, skip, limit, Job.id,
                                        {"value": search, "field": "title"})
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("/jobs", status_code=201)
async def create_job(data: dict, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    allowed = {"title", "company_name", "company_logo", "location", "is_remote",
               "salary_min", "salary_max", "is_referral", "is_urgent",
               "special_requirements", "contact_name", "contact_title",
               "contact_id", "industry", "job_type", "description"}
    obj = Job(**{k: v for k, v in data.items() if k in allowed})
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.put("/jobs/{entity_id}")
async def update_job(
    entity_id: int, data: dict,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    allowed = {"title", "company_name", "company_logo", "location", "is_remote",
               "salary_min", "salary_max", "is_referral", "is_urgent",
               "special_requirements", "contact_name", "contact_title", "contact_id",
               "industry", "job_type", "description", "is_active"}
    return await _update_from_dict(db, await _get_entity(db, Job, entity_id), data, allowed)


@router.delete("/jobs/{entity_id}", status_code=200)
async def soft_delete_job(
    entity_id: int,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    """软删除：设置 is_active=0"""
    await _soft_delete(db, Job, entity_id)
    return {"id": entity_id, "is_active": False}


# ═══════════════════════════════════════════════════════
#  JOB CONTACTS
# ═══════════════════════════════════════════════════════
@router.get("/job-contacts")
async def list_job_contacts(
    skip: int = Query(0, ge=0), limit: int = Query(20, le=200), search: str | None = None,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    q = select(JobContact).order_by(JobContact.id.desc())
    if search:
        q = q.where(JobContact.name.ilike(f"%{search}%"))
    q = q.offset(skip).limit(limit)
    total_q = select(func.count()).select_from(JobContact)
    if search:
        total_q = total_q.where(JobContact.name.ilike(f"%{search}%"))
    # 下边三行错误，由最下替换
    # items = (await db.execute(q)).scalars().all()
    # total = (await db.execute(total_q)).scalar() or 0
    # return {"items": items, "total": total, "skip": skip, "limit": limit}
    orm_items = (await db.execute(q)).scalars().all()
    total = (await db.execute(total_q)).scalar() or 0
    serialized = []
    for item in orm_items:
        d = {}
        for col in item.__table__.columns:
            val = getattr(item, col.name)
            if isinstance(val, datetime):
                val = val.isoformat()
            d[col.name] = val
        serialized.append(d)

    return {"items": serialized, "total": total, "skip": skip, "limit": limit}


@router.post("/job-contacts", status_code=201)
async def create_job_contact(data: dict, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    allowed = {"name", "mobile", "wechat", "qq", "tags", "contact_type", "remark"}
    obj = JobContact(**{k: v for k, v in data.items() if k in allowed})
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.put("/job-contacts/{entity_id}")
async def update_job_contact(entity_id: int, data: dict,
                             admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    allowed = {"name", "mobile", "wechat", "qq", "tags", "contact_type", "remark", "is_active"}
    return await _update_from_dict(db, await _get_entity(db, JobContact, entity_id), data, allowed)

# ═══════════════════════════════════════════════════════
#  CONTACTS  —— 软删除 + 显示/隐藏
# ═══════════════════════════════════════════════════════
@router.get("/jobs_contacts")
async def list_contacts_admin(
    skip: int = Query(0, ge=0), limit: int = Query(20, le=200), search: str | None = None,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    items, total = await _list_entities(db, JobContact, skip, limit, JobContact.id,
                                        {"value": search, "field": "name"})
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.get("/jobs_contacts/{entity_id}")
async def get_contact(entity_id: int,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    return await _get_entity(db, JobContact, entity_id, "联系人不存在")


@router.post("/jobs_contacts", status_code=201)
async def create_contact(
    data: dict,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    allowed = {"name", "mobile", "wechat", "qq", "tags", "contact_type", "remark", "is_active"}
    obj = JobContact()
    for k, v in data.items():
        if k in allowed:
            setattr(obj, k, v)
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.put("/jobs_contacts/{entity_id}")
async def update_contact(entity_id: int, data: dict,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    obj = await _get_entity(db, JobContact, entity_id, "联系人不存在")
    allowed = {"name", "mobile", "wechat", "qq", "tags", "contact_type", "remark", "is_active"}
    await _update_from_dict(db, obj, data, allowed)
    return obj


@router.delete("/jobs_contacts/{entity_id}")
async def delete_contact(entity_id: int,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    await _soft_delete(db, JobContact, entity_id, "联系人不存在")
    return {"ok": True}

# ═══════════════════════════════════════════════════════
#  POSTS  —— 全字段编辑 + user_id 处理
# ═══════════════════════════════════════════════════════
@router.get("/posts")
async def list_posts_admin(
    skip: int = Query(0, ge=0), limit: int = Query(20, le=200), search: str | None = None,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    items, total = await _list_entities(db, Post, skip, limit, Post.id,
                                        {"value": search, "field": "title"})
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("/posts", status_code=201)
async def create_post(data: dict, current_admin: User = Depends(require_admin),
                      db: AsyncSession = Depends(get_db)):
    """新增帖子（自动设置 user_id 为管理员）"""
    allowed = {"title", "content", "category", "is_anonymous", "is_essence", "is_hot"}
    post_data = {k: v for k, v in data.items() if k in allowed}
    post_data["user_id"] = current_admin.id  # 自动赋值为当前管理员
    obj = Post(**post_data)
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.put("/posts/{entity_id}")
async def update_post(
    entity_id: int, data: dict,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    allowed = {"title", "content", "category", "is_anonymous", "is_essence",
               "is_hot", "view_count", "like_count", "favorite_count", "comment_count"}
    return await _update_from_dict(db, await _get_entity(db, Post, entity_id), data, allowed)


@router.delete("/posts/{entity_id}", status_code=204)
async def hard_delete_post(entity_id: int, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    await db.delete(await _get_entity(db, Post, entity_id))
    await db.commit()


# ═══════════════════════════════════════════════════════
#  CONTENT  —— 软删除 + 全字段编辑 + author 默认
# ═══════════════════════════════════════════════════════
@router.get("/content")
async def list_content_admin(
    skip: int = Query(0, ge=0), limit: int = Query(20, le=200), search: str | None = None,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    items, total = await _list_entities(db, SalesContent, skip, limit, SalesContent.id,
                                        {"value": search, "field": "title"})
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("/content", status_code=201)
async def create_content(data: dict, current_admin: User = Depends(require_admin),
                         db: AsyncSession = Depends(get_db)):
    """新增内容（author 默认 admin 用户名）"""
    allowed = {"title", "content_type", "content", "summary", "cover_image", "author"}
    post_data = {k: v for k, v in data.items() if k in allowed}
    if not post_data.get("author"):
        post_data["author"] = current_admin.username
    obj = SalesContent(**post_data)
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.put("/content/{entity_id}")
async def update_content(
    entity_id: int, data: dict,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    allowed = {"title", "content_type", "content", "summary", "cover_image",
               "author", "like_count", "favorite_count", "view_count", "is_active"}
    return await _update_from_dict(db, await _get_entity(db, SalesContent, entity_id), data, allowed)


@router.delete("/content/{entity_id}", status_code=200)
async def soft_delete_content(
    entity_id: int,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    """软删除：设置 is_active=0"""
    await _soft_delete(db, SalesContent, entity_id)
    return {"id": entity_id, "is_active": False}


# ═══════════════════════════════════════════════════════
#  SITE SETTINGS
# ═══════════════════════════════════════════════════════
@router.get("/settings", response_model=list[SiteSettingResponse])
async def list_settings(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(SiteSettings).order_by(SiteSettings.key))
    return r.scalars().all()


@router.put("/settings/{key}", response_model=SiteSettingResponse)
async def update_setting(
    key: str, data: SiteSettingUpdate,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    r = await db.execute(select(SiteSettings).where(SiteSettings.key == key))
    setting = r.scalar_one_or_none()
    if not setting:
        setting = SiteSettings(key=key, value=data.value)
        db.add(setting)
    else:
        setting.value = data.value
    await db.commit()
    await db.refresh(setting)
    return setting


@router.get("/settings/public/{key}", response_model=SiteSettingResponse)
async def get_public_setting(key: str, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(SiteSettings).where(SiteSettings.key == key))
    setting = r.scalar_one_or_none()
    if not setting:
        return SiteSettingResponse(id=0, key=key, value=None, updated_at=datetime.utcnow())
    return setting
