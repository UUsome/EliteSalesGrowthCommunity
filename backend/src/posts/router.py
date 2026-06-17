from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.dependencies import get_current_user, get_optional_user
from src.auth.models import User
from src.database import get_db
from src.posts import schemas, service

router = APIRouter(prefix="/api/posts", tags=["同行交流"])


@router.get("", response_model=list[schemas.PostResponse])
async def list_posts(
    category: str | None = Query(None, description="分类: 经验分享/求助提问/行业动态"),
    sort_by: str = Query("latest", description="排序: latest/hot/essence"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """获取帖子列表"""
    posts = await service.list_posts(db, category, sort_by, skip, limit)
    result = []
    for post in posts:
        resp = schemas.PostResponse.model_validate(post)
        if post.is_anonymous:
            resp.author_name = "匿名用户"
            resp.author_avatar = None
        else:
            resp.author_name = post.user.username
            resp.author_avatar = post.user.avatar_url
        result.append(resp)
    return result


@router.get("/{post_id}", response_model=schemas.PostResponse)
async def get_post(post_id: int, db: AsyncSession = Depends(get_db)):
    """获取帖子详情（自动增加浏览量）"""
    post = await service.get_post(db, post_id)
    resp = schemas.PostResponse.model_validate(post)
    if post.is_anonymous:
        resp.author_name = "匿名用户"
        resp.author_avatar = None
    else:
        resp.author_name = post.user.username
        resp.author_avatar = post.user.avatar_url
    return resp


@router.post("", response_model=schemas.PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_in: schemas.PostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """发布帖子"""
    post = await service.create_post(db, current_user.id, post_in)
    resp = schemas.PostResponse.model_validate(post)
    resp.author_name = "匿名用户" if post.is_anonymous else current_user.username
    resp.author_avatar = None if post.is_anonymous else current_user.avatar_url
    return resp


@router.put("/{post_id}", response_model=schemas.PostResponse)
async def update_post(
    post_id: int,
    post_in: schemas.PostUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """编辑帖子"""
    post = await service.update_post(db, post_id, current_user.id, post_in)
    resp = schemas.PostResponse.model_validate(post)
    if post.is_anonymous:
        resp.author_name = "匿名用户"
        resp.author_avatar = None
    else:
        resp.author_name = current_user.username
        resp.author_avatar = current_user.avatar_url
    return resp


@router.post("/{post_id}/like", response_model=schemas.PostResponse)
async def like_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """点赞帖子"""
    post = await service.like_post(db, post_id)
    return schemas.PostResponse.model_validate(post)


# --- Comments ---
@router.get("/{post_id}/comments", response_model=list[schemas.CommentResponse])
async def list_comments(post_id: int, db: AsyncSession = Depends(get_db)):
    """获取帖子评论"""
    comments = await service.get_comments(db, post_id)
    result = []
    for comment in comments:
        resp = schemas.CommentResponse.model_validate(comment)
        resp.author_name = comment.user.username if comment.user else "已删除"
        resp.author_avatar = comment.user.avatar_url if comment.user else None
        result.append(resp)
    return result


@router.post("/{post_id}/comments", response_model=schemas.CommentResponse,
             status_code=status.HTTP_201_CREATED)
async def create_comment(
    post_id: int,
    comment_in: schemas.CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """发表评论"""
    comment = await service.create_comment(
        db, post_id, current_user.id, comment_in.content, comment_in.parent_id
    )
    resp = schemas.CommentResponse.model_validate(comment)
    resp.author_name = current_user.username
    resp.author_avatar = current_user.avatar_url
    return resp
