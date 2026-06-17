from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from src.posts.models import Post, Comment
from src.shared.exceptions import NotFound, Forbidden


async def list_posts(
    db: AsyncSession,
    category: str | None = None,
    sort_by: str = "latest",
    skip: int = 0,
    limit: int = 20,
) -> list[Post]:
    query = select(Post)

    if category:
        query = query.where(Post.category == category)

    if sort_by == "hot":
        query = query.order_by(Post.view_count.desc(), Post.created_at.desc())
    elif sort_by == "essence":
        query = query.where(Post.is_essence == True).order_by(Post.created_at.desc())
    else:  # latest
        query = query.order_by(Post.created_at.desc())

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def get_post(db: AsyncSession, post_id: int) -> Post:
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise NotFound("帖子不存在")

    # Increment view count
    post.view_count = (post.view_count or 0) + 1
    await db.commit()
    await db.refresh(post)
    return post


async def create_post(db: AsyncSession, user_id: int, post_in) -> Post:
    post = Post(
        user_id=user_id,
        title=post_in.title,
        content=post_in.content,
        category=post_in.category,
        is_anonymous=post_in.is_anonymous,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post


async def update_post(db: AsyncSession, post_id: int, user_id: int, post_in) -> Post:
    post = await get_post_by_id(db, post_id)
    if post.user_id != user_id:
        raise Forbidden("只能编辑自己的帖子")

    for field, value in post_in.model_dump(exclude_unset=True).items():
        setattr(post, field, value)
    await db.commit()
    await db.refresh(post)
    return post


async def get_post_by_id(db: AsyncSession, post_id: int) -> Post:
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise NotFound("帖子不存在")
    return post


async def create_comment(
    db: AsyncSession, post_id: int, user_id: int, content: str, parent_id: int | None = None
) -> Comment:
    # Verify post exists
    await get_post_by_id(db, post_id)

    if parent_id:
        result = await db.execute(
            select(Comment).where(Comment.id == parent_id, Comment.post_id == post_id)
        )
        if not result.scalar_one_or_none():
            raise NotFound("父评论不存在")

    comment = Comment(
        post_id=post_id,
        user_id=user_id,
        content=content,
        parent_id=parent_id,
    )
    db.add(comment)

    # Update comment count
    post = await get_post_by_id(db, post_id)
    post.comment_count = (post.comment_count or 0) + 1

    await db.commit()
    await db.refresh(comment)
    return comment


async def like_post(db: AsyncSession, post_id: int) -> Post:
    post = await get_post_by_id(db, post_id)
    post.like_count = (post.like_count or 0) + 1
    await db.commit()
    await db.refresh(post)
    return post


async def get_comments(db: AsyncSession, post_id: int) -> list[Comment]:
    result = await db.execute(
        select(Comment).where(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
    )
    return result.scalars().all()
